import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../services/auth.service';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { FirebaseApp } from '@angular/fire/app';
import * as XLSX from 'xlsx';
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
  pacientes: Paciente[] = [];
  admins: Admin[] = [];
  turnos : any[] = [];
  especialistaSet: Set<string> = new Set();
  pacienteSet: Set<string> = new Set();
  adminSet: Set<string> = new Set();
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  fotos: any[] = [];
  step = 1;
  EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  EXCEL_EXTENSION = '.xlsx';

  constructor(private fire: Firestore, private firebase: FirebaseApp)
  {
    this.llenarArrayEspecialistas();
    this.llenarArrayPacientes();
    this.llenarArrayAdmins();
    this.getTurnos().subscribe(turno =>{
      this.turnos = turno;
    })
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
    this.step--;
  }
}
