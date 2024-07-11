import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../services/auth.service';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { FirebaseApp } from '@angular/fire/app';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';

export interface Especialista
{
  dni:string,
  nombre:string,
  apellido:string,
  mail:string,
  especialidad:string,
  segundaEspecialidad:string,
  terceraEspecialidad:string,
  validado:boolean,
  idDoc:string,
  foto:any
}

export interface Paciente
{
  dni:string,
  nombre:string,
  apellido:string,
  mail:string,
  obraSocial:string,
  validado:boolean,
  fotoPerfil:any,
  fotodni:any,
  idDoc:string
}

export interface Admin
{
  dni:string,
  nombre:string,
  apellido:string,
  mail:string,
  foto:string,
  idDoc:string
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  selected:string = "option1";
  especialistas: Especialista[] = [];
  especialidades: any[] = [];
  pacientes: Paciente[] = [];
  admins: Admin[] = [];
  turnos : any[] = [];
  logs : any[] = [];
  especialistaSet: Set<string> = new Set();
  pacienteSet: Set<string> = new Set();
  adminSet: Set<string> = new Set();
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  fotos: any[] = [];
  turnosPorMedico: any[] = [];
  turnosPorDia: any[] = [];
  turnosPorEspecialidad: any[] = [];
  turnosFinalizadosPorMedico: any[] = [];
  step = 1;
  EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  EXCEL_EXTENSION = '.xlsx';
  fechas: any[] = [];

  constructor(private fire: Firestore, private firebase: FirebaseApp)
  {
    this.llenarArrayEspecialistas();
    this.llenarArrayPacientes();
    this.llenarArrayAdmins();
    this.getTurnos().subscribe(turno =>{
      this.turnos = turno;
    })
    this.getLogs().subscribe(log =>{
      this.logs = log;
    })
    this.getEspecialidades().subscribe(especialidad =>{
      this.especialidades = especialidad;
    })
    this.fechas = this.getLast30Days();
  }

  llenarArrayAdmins()
  {
    this.getAdmins().subscribe(admins =>{
      admins.forEach(async admin =>
        {
          if(!this.adminSet.has(admin.idDoc))
          {
            await(listAll(this.fotosRef)).then((res) =>{
              res.items.forEach((itemRef) =>{
                getDownloadURL(itemRef).then((url)=>{
                  if(itemRef.fullPath.includes(admin.dni))
                  {
                    admin.foto = url;
                  }
                })
              })
            })
            this.admins.push(admin);
            this.adminSet.add(admin.idDoc);
          }
        }
      )
    })
  }

  llenarArrayEspecialistas()
  {
    this.getEspecialistas().subscribe(especialistas =>{
      especialistas.forEach(async especialista =>
        {
          if(!this.especialistaSet.has(especialista.idDoc))
          {
            await(listAll(this.fotosRef)).then((res) =>{
              res.items.forEach((itemRef) =>
              {
                getDownloadURL(itemRef).then((url) =>{
                  if(itemRef.fullPath.includes(especialista.dni))
                  {
                    especialista.foto = url;
                  }
                })
              })
            })
            this.especialistas.push(especialista);
            this.especialistaSet.add(especialista.idDoc);
          }
        }
      )
    })
  }

  llenarArrayPacientes()
  {
    this.getPacientes().subscribe(pacientes =>{
      pacientes.forEach(async paciente =>
        {
          if(!this.pacienteSet.has(paciente.idDoc))
          {
            await(listAll(this.fotosRef)).then((res) =>
            {
              res.items.forEach((itemRef) =>
              {
                getDownloadURL(itemRef).then((url) =>{
                  if(itemRef.fullPath.includes(paciente.dni))
                  {
                    if(itemRef.fullPath.includes("perfil"))
                    {
                      paciente.fotoPerfil = url;
                    }
                    else
                    {
                      paciente.fotodni = url;
                    }
                  }
                })
              })
            })
            this.pacientes.push(paciente);
            this.pacienteSet.add(paciente.idDoc);
          }
        }
      )
    })
  }

  getPacientes() : Observable<Paciente[]>
  {
    const usrRef = collection(this.fire, 'pacientes');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Paciente[]>;
  }

  getEspecialistas() : Observable<Especialista[]>
  {
    const usrRef = collection(this.fire, 'especialistas');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Especialista[]>;
  }

  getAdmins() : Observable<Admin[]>
  {
    const usrRef = collection(this.fire, 'admin');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Admin[]>;
  }

  getTurnos() : Observable<any[]>{
    const turRef = collection(this.fire, 'turnos');
    return collectionData(turRef) as Observable<any[]>;
  }

  getLogs() : Observable<any[]>{
    const logRef = collection(this.fire, 'login');
    return collectionData(logRef) as Observable<any[]>;
  }

  getEspecialidades() : Observable<any[]>{
    const espRef = collection(this.fire, 'especialidades');
    return collectionData(espRef) as Observable<any[]>;
  }

  Activar(especialista:Especialista, flag:boolean)
  {
    const especialistaRef = doc(this.fire, 'especialistas', especialista.idDoc);
    if(flag)
    {
      updateDoc(especialistaRef, {
        validado: true
      })
    }
    else
    {
      updateDoc(especialistaRef, {
        validado: false
      })
    }
    this.especialistas = this.especialistas.map(e => e.idDoc === especialista.idDoc ? {...e, validado:flag} : e);
  }

  onOptionChange(event :any)
  {
    this.selected = event.target.value;
  }

  excel(){
    this.step++;
  }

  datos(){
    this.step = 3;
    this.llenarTurnosPorMedico();
    this.llenarTurnosFinalizadosPorMedico();
    this.llenarTurnosPorDia();
    console.log(this.turnosPorMedico);
  }

  llenarTurnosPorMedico() {
    this.turnosPorMedico = [];
    this.especialistas.forEach(especialista => {
        const turnosDelEspecialista = this.turnos.filter(turno => turno.especialista === especialista.dni);
        if (turnosDelEspecialista.length > 0) {
            this.turnosPorMedico.push({
                nombre: especialista.nombre,
                apellido: especialista.apellido,
                turnos: turnosDelEspecialista
            });
        }
    });
  }
  
  llenarTurnosPorDia(){
    this.turnosPorDia = [];
    this.turnos.forEach(turno =>{
      this.fechas.forEach(fecha =>{
        if(turno.dia == fecha){
          this.turnosPorDia.push({
            dia: fecha,
            hora: turno.start,
            especialista: turno.especialista,
            paciente: turno.paciente,
            condicion: turno.condicion
          })
        }
      })
    });
  }

  llenarTurnosFinalizadosPorMedico() {
    this.turnosFinalizadosPorMedico = [];
    this.especialistas.forEach(especialista => {
        const turnosDelEspecialista = this.turnos.filter(turno => turno.especialista === especialista.dni && turno.condicion == 'Finalizado');
        if (turnosDelEspecialista.length > 0) {
            this.turnosFinalizadosPorMedico.push({
                nombre: especialista.nombre,
                apellido: especialista.apellido,
                turnos: turnosDelEspecialista
            });
        }
    });
  }

  descargaExcel(paciente: any) {
    const rows: any[] = [];

    this.turnos.forEach(turno => {
      if (turno.paciente == paciente.dni) {
        this.especialistas.forEach(especialista => {
          if (turno.especialista == especialista.dni) {
            rows.push({
              Fecha: turno.dia,
              Hora: turno.start,
              NombreEspecialista: especialista.nombre,
              ApellidoEspecialista: especialista.apellido,
              Especialidad: turno.especialidad
            });
          }
        });
      }
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'turnos');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: this.EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + this.EXCEL_EXTENSION);
  }

  volver(){
    this.step = 1;
  }

  getLast30Days(): string[] {
    const today = new Date();
    const dates: string[] = [];

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }

    return dates;
  }

  /*** OPCIÓN 1 ***/

  logExcel(){
    const worksheet = XLSX.utils.json_to_sheet(this.logs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'logs');
  }

  logPDF(){
    const doc = new jsPDF();
        
    // Add clinic logo
    const logo = new Image();
    logo.src = '../../../assets/clinicaLogo.png';
    logo.onload = () => {
        doc.addImage(logo, 'PNG', 10, 10, 50, 50);
        doc.setFontSize(18);
        doc.text('Logs de Ingresos al Sistema', 70, 30);

        // Add logs as text
        doc.setFontSize(12);
        const logsArray = this.logs.map(log => [log.dia, log.dni, log.tiempo]);
        autoTable(doc, {
            head: [['Dia', 'DNI', 'Tiempo']],
            body: logsArray,
            startY: 70
        });

        // Save the PDF
        doc.save('logs.pdf');
    };
  }

  /*** FIN OPCIÓN 1 ***/

  /*** OPCIÓN 2 ***/

  turSolMedExcel() {
    const workbook = XLSX.utils.book_new();

    this.turnosPorMedico.forEach(especialista => {
        const worksheet = XLSX.utils.json_to_sheet(especialista.turnos);
        const sheetName = `${especialista.nombre} ${especialista.apellido}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'TurnosPorMedico');
}

async turSolMedPDF() {
    const doc = new jsPDF();

    // Add clinic logo
    const logo = new Image();
    logo.src = '../../../assets/clinicaLogo.png';
    logo.onload = () => {
        doc.addImage(logo, 'PNG', 10, 10, 50, 50);
        doc.setFontSize(18);
        doc.text('Turnos por Médico', 70, 30);
        let currentY = 60; // Initial Y position after the title

        this.turnosPorMedico.forEach(especialista => {
            if (currentY > 270) {  // Check if we need to add a new page
                doc.addPage();
                currentY = 10;  // Reset Y position for new page
            }

            // Add the especialista name
            doc.setFontSize(14);
            doc.text(`${especialista.nombre} ${especialista.apellido}`, 10, currentY);
            currentY += 10;

            // Prepare data for the table
            const tableData = especialista.turnos.map((turno: { dia: any; especialidad: any; start: any; paciente: any; condicion: any; }) => [turno.dia, turno.especialidad, turno.start, turno.paciente, turno.condicion]);

            // Add the table
            autoTable(doc, {
                head: [['Dia', 'Especialidad', 'Hora', 'Paciente', 'Condicion']],
                body: tableData,
                startY: currentY
            });

            // Update currentY position
            currentY = (doc as any).lastAutoTable.finalY + 10;
        });

        // Save the PDF
        doc.save('TurnosPorMedico.pdf');
    };
  }

  /*** FIN OPCIÓN 2 ***/

  /*** OPCIÓN 3 ***/

  turFinMedExcel() {
    const workbook = XLSX.utils.book_new();

    this.turnosFinalizadosPorMedico.forEach(especialista => {
        const worksheet = XLSX.utils.json_to_sheet(especialista.turnos);
        const sheetName = `${especialista.nombre} ${especialista.apellido}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'TurnosFinalizadosPorMedico');
  }

  turFinMedPDF(){
    const doc = new jsPDF();

    // Add clinic logo
    const logo = new Image();
    logo.src = '../../../assets/clinicaLogo.png';
    logo.onload = () => {
        doc.addImage(logo, 'PNG', 10, 10, 50, 50);
        doc.setFontSize(18);
        doc.text('Turnos por Médico', 70, 30);
        let currentY = 60; // Initial Y position after the title

        this.turnosFinalizadosPorMedico.forEach(especialista => {
            if (currentY > 270) {  // Check if we need to add a new page
                doc.addPage();
                currentY = 10;  // Reset Y position for new page
            }

            // Add the especialista name
            doc.setFontSize(14);
            doc.text(`${especialista.nombre} ${especialista.apellido}`, 10, currentY);
            currentY += 10;

            // Prepare data for the table
            const tableData = especialista.turnos.map((turno: { dia: any; especialidad: any; start: any; paciente: any; comentarioPac: any; }) => [turno.dia, turno.especialidad, turno.start, turno.paciente, turno.comentarioPac]);

            // Add the table
            autoTable(doc, {
                head: [['Dia', 'Especialidad', 'Hora', 'Paciente', 'Comentario']],
                body: tableData,
                startY: currentY
            });

            // Update currentY position
            currentY = (doc as any).lastAutoTable.finalY + 10;
        });

        // Save the PDF
        doc.save('TurnosPorMedico.pdf');
    };
  }

  /*** FIN OPCIÓN 3 **/

  /*** OPCIÓN 4 ***/

  turXDiaExcel() {
    const workbook = XLSX.utils.book_new();

    // Group turnos by dia
    const groupedTurnos = this.groupByDia();

    // Create sheets for each group
    Object.keys(groupedTurnos).forEach(dia => {
        const turnosForSheet = groupedTurnos[dia];

        if (turnosForSheet.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(turnosForSheet);
            const sheetName = `Turnos - ${dia}`;
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
    });

    // Save the workbook as Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'TurnosPorDia');
  }

  groupByDia() {
      const grouped: any = {};
      this.turnos.forEach(turno => {
          const { dia, ...rest } = turno;
          if (!grouped[dia]) {
              grouped[dia] = [];
          }
          grouped[dia].push(rest);
      });
      return grouped;
  }

  turXDiaPDF(){
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = '../../../assets/clinicaLogo.png';

    // Load clinic logo and create PDF after loading
    logo.onload = () => {
        let yOffset = 10; // Initial Y offset for content

        // Group turnos by dia
        const groupedTurnos = this.groupByDia();

        // Iterate through each dia in groupedTurnos
        Object.keys(groupedTurnos).forEach(dia => {
            // Add new page for each dia
            if (yOffset > 250) {  // Check if new page is needed (adjust as needed)
                doc.addPage();
                yOffset = 10;  // Reset Y offset for new page
            }

            // Add clinic logo
            doc.addImage(logo, 'PNG', 10, yOffset, 50, 50);

            // Format dia header
            doc.setFontSize(16);
            doc.text(`${dia}:`, 70, yOffset + 20);

            // Format turnos for current dia
            doc.setFontSize(12);
            yOffset += 30;  // Adjust Y offset for turnos content

            groupedTurnos[dia].forEach((turno: any) => {
                const text = ` - Hora: ${turno.start}\n   Especialista: ${turno.especialista}\n   Paciente: ${turno.paciente}`;
                doc.text(text, 70, yOffset);
                yOffset += 20;  // Adjust Y offset for next turno
            });

            // Add separator line between dias
            yOffset += 10;  // Adjust Y offset for separator
            if (yOffset > 250) {
                doc.addPage();
                yOffset = 10;  // Reset Y offset for new page
            } else {
                doc.line(10, yOffset, 200, yOffset);  // Separator line
                yOffset += 10;  // Adjust Y offset after separator
            }
        });

        // Save the PDF file
        doc.save('TurnosPorDia.pdf');
    };
  }

  /*** FIN OPCIÓN 4 ***/

  /*** OPCIÓN 5 ***/

  turXEspExcel(){
    const workbook = XLSX.utils.book_new();
    const groupedTurnos = this.groupByEspecialidad();
    Object.keys(groupedTurnos).forEach(especialidad => {
        const turnosForSheet = groupedTurnos[especialidad];

        if (turnosForSheet.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(turnosForSheet);
            XLSX.utils.book_append_sheet(workbook, worksheet, especialidad);
        }
    });
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'TurnosPorEspecialidad');
  }

  groupByEspecialidad() {
    const grouped: any = {};
    this.turnos.forEach(turno => {
        const { especialidad, ...rest } = turno;
        if (!grouped[especialidad]) {
            grouped[especialidad] = [];
        }
        grouped[especialidad].push(rest);
    });
    return grouped;
  }

  turXEspPDF(){
    const doc = new jsPDF();

    // Load clinic logo
    const logo = new Image();
    logo.src = '../../../assets/clinicaLogo.png';

    // Add logo at the start of the PDF
    doc.addImage(logo, 'PNG', 10, 10, 40, 40);

    // Define coordinates and variables for positioning
    let yPos = 60; // Start below the logo
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;

    // Track which especialidades have been processed
    const processedEspecialidades: string[] = [];

    // Iterate through turnos and generate PDF sections
    this.turnos.forEach(turno => {
        // Check if there is enough space for the current section
        if (yPos + 60 > pageHeight) {
            doc.addPage();
            yPos = margin;
        }

        // Add especialidad title if it's the first turno of that especialidad
        if (!processedEspecialidades.includes(turno.especialidad)) {
            doc.setFontSize(14);
            doc.text(`${turno.especialidad}:`, 60, yPos);
            processedEspecialidades.push(turno.especialidad);
            yPos += 10; // Adjust position after adding title
        }

        // Add turno details
        doc.setFontSize(12);
        doc.text(`- Dia: ${turno.dia}`, 60, yPos + 10);
        doc.text(`- Hora: ${turno.start}`, 60, yPos + 20);
        doc.text(`- Especialista: ${turno.especialista}`, 60, yPos + 30);
        doc.text(`- Paciente: ${turno.paciente}`, 60, yPos + 40);

        // Add separator line
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 50, 210 - margin, yPos + 50);

        // Increment yPos for the next section
        yPos += 60; // Increase spacing between sections
    });

    // Save the PDF file
    doc.save('TurnosPorEspecialidad.pdf');
  }
}
