import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { FirebaseApp } from '@angular/fire/app';
import { slideInAnimation } from 'src/app/animations/animations.component';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
  animations: [slideInAnimation]
})
export class MiPerfilComponent {

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  usuarioActual:any;
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  foto1:any = "";
  foto2:any = "";
  paciente:boolean=false;
  step = 1;
  pacientes: any[] = [];
  especialistas: any[] = [];
  turnos: any[] = [];
  currentEspecialistas: any[] = [];
  pacienteTurnos: any[] = [];
  
  constructor(private service:AuthService, private firebase: FirebaseApp, private fire:Firestore){
    this.usuarioActual = service.currentUser;
    this.usuarioActual = this.usuarioActual.source.value;
    if(this.usuarioActual.perfil == 'paciente')
    {this.paciente=true}
    console.info(this.usuarioActual);
    this.getFoto();
    this.getPacientes().subscribe(paciente =>{
      this.pacientes = paciente;
    })
    this.getTurnos().subscribe(turno => {
      this.turnos = turno;
    })
    this.getEspecialistas().subscribe(especialista =>{
      this.especialistas = especialista;
    })
  }

  async getFoto(){
    await(listAll(this.fotosRef)).then((res) =>{
      res.items.forEach((itemRef) =>{
        getDownloadURL(itemRef).then((url)=>{
          if(this.usuarioActual.perfil == 'paciente'){
            if(itemRef.fullPath.includes(this.usuarioActual.dni)){
              if(itemRef.fullPath.includes("perfil"))
              {
                this.foto1 = url;
              }
              else
              {
                this.foto2 = url;
              }
            }
          }
          else
          {
            if(itemRef.fullPath.includes(this.usuarioActual.dni))
            {
              this.foto1 = url;
            }
          }
        })
      })
    })
  }

  getEspecialistas(): Observable<any[]> {
    const usrRef = collection(this.fire, 'especialistas');
    return collectionData(usrRef, { idField: 'idDoc' }) as Observable<any[]>;
  }

  getPacientes(): Observable<any[]>{
    const pacRef = collection(this.fire, 'pacientes');
    return collectionData(pacRef, {idField: 'idDoc'}) as Observable<any[]>;
  }

  getTurnos() : Observable<any[]>{
    const turRef = collection(this.fire, 'turnos');
    return collectionData(turRef) as Observable<any[]>;
  }

  volver(){
    this.step--;
  }

  pdf(){
    this.step++;
    this.turnos.forEach(turno =>{
      if(turno.paciente == this.usuarioActual.dni){
        this.especialistas.forEach(especialista =>{
          if (turno.especialista == especialista.dni) {
            const exists = this.currentEspecialistas.some(e => e.dni == especialista.dni);
            if (!exists) {
              this.currentEspecialistas.push(especialista);
            }
          }
        })
      }
    })
    console.log(this.currentEspecialistas);
  }

  pdfDownload(especialista: any) {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = '../../assets/clinicaLogo.png';
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 50, 25);

      doc.setFontSize(18);
      doc.text(`Información turnos ${this.usuarioActual.nombre} ${this.usuarioActual.apellido} con especialista ${especialista.nombre} ${especialista.apellido}:`, 10, 50);

      const date = formatDate(new Date(), 'dd/MM/yyyy', 'en');
      doc.setFontSize(12);
      doc.text(`Fecha de emisión: ${date}`, 10, 60);

      let startY = 70;

      this.turnos.forEach(turno => {
        if (turno.paciente === this.usuarioActual.dni) {
          this.especialistas.forEach(esp => {
            if (turno.especialista === esp.dni && (turno.condicion === 'Aceptado' || turno.condicion === 'Finalizado')) {
              doc.setFontSize(12);
              doc.text(`Día: ${turno.dia}`, 10, startY);
              startY += 10;
              
              if (turno.historiaClinica) {
                const historiaClinica = turno.historiaClinica;
                doc.text(`Altura: ${historiaClinica.altura}`, 10, startY);
                startY += 10;
                doc.text(`Peso: ${historiaClinica.peso}`, 10, startY);
                startY += 10;
                doc.text(`Presión: ${historiaClinica.presion}`, 10, startY);
                startY += 10;
                doc.text(`Temperatura: ${historiaClinica.temperatura}`, 10, startY);
                startY += 10;

                if (historiaClinica.dynamicData && historiaClinica.dynamicData.length > 0) {
                  historiaClinica.dynamicData.forEach((data: { clave: any; valor: any; }, index: any) => {
                    doc.text(`${data.clave}: ${data.valor}`, 10, startY);
                    startY += 10;
                  });
                }
              }
              startY += 10;
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.5);
              doc.line(10, startY, 200, startY);
              startY += 10;
            }
          });
        }
      });

      // Save the PDF
      doc.save(`Informacion_Turnos_${this.usuarioActual.nombre}_${this.usuarioActual.apellido}.pdf`);
    };
  }
}
