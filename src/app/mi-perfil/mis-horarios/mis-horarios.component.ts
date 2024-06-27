import { Component } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Firestore, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

export interface Horario{
  dia: string;
  duracion: string;
  entrada: string;
  especialidad: string;
  especialista: string;
  salida: string;
  trabaja: boolean;
}

@Component({
  selector: 'app-mis-horarios',
  templateUrl: './mis-horarios.component.html',
  styleUrls: ['./mis-horarios.component.css']
})
export class MisHorariosComponent {
  usuarioActual: any;
  dias: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  duraciones: number[] = [30, 45, 60, 75, 90, 105, 120];
  duracionSesion: number = 30;
  horarios: { [key: string]: { trabaja: boolean, entrada: string, salida: string } } = {};
  selectedEspecialidad:string = '';
  horariosDB: any[] = [];
  loading: boolean = true;

  constructor(private service: AuthService, private fire:Firestore) {
    this.horariosDB = [];
    this.loading = true;
    this.usuarioActual = service.currentUser;
    this.usuarioActual = this.usuarioActual.source.value;
    this.selectedEspecialidad = this.usuarioActual.especialidad;
    this.initializeEmptyHorarios();
    this.getHorarios().subscribe(horario => {
      this.horariosDB.push(horario);
    
      setTimeout(() => {
        this.initializeHorarios();
        this.loading = false;
      }, 1500);
    });
  }

  initializeEmptyHorarios(){
    for(const dia of this.dias){
      this.horarios[dia] = {trabaja:false, entrada:'', salida:''};
    }
  }

  initializeHorarios() {
    let auxArray: any[] = [];
  
    this.horariosDB.forEach(element => {
      element.forEach((element2: { especialista: any; especialidad:string; segundaEspecialidad:string; terceraEspecialidad:string; }) => {
        if (element2.especialista == this.usuarioActual.dni && 
            (this.selectedEspecialidad == element2.especialidad || 
             this.selectedEspecialidad == element2.segundaEspecialidad ||
             this.selectedEspecialidad == element2.terceraEspecialidad)) {
          
          auxArray.push(element2);
        }
      });
    });
    if (auxArray.length != 0) {
      auxArray.forEach(element =>{
          if(!element.trabaja){
            this.horarios[element.dia] = {trabaja:false, entrada:'test', salida:''};
          }
          else
          {
            this.horarios[element.dia] = {trabaja:element.trabaja, entrada:element.entrada, salida:element.salida};
          }
          this.duracionSesion = element.duracion;
      })
    } else {
      for(const dia of this.dias){
        this.horarios[dia] = {trabaja:false, entrada:'', salida:''};
      }
    }
  }

  getHoras(dia: string): string[] {
    if (dia === 'Sábado') {
      return this.generateHoras(8, 14);
    } else {
      return this.generateHoras(8, 19);
    }
  }

  generateHoras(start: number, end: number): string[] {
    const horas = [];
    for (let i = start; i <= end; i++) {
      horas.push(`${i}:00`);
      if (i < end) {
        horas.push(`${i}:30`);
      }
    }
    return horas;
  }

  saveHorarios() {
    let flag = true; 
    console.log('Duración de la sesión de ' + this.selectedEspecialidad + ': ' + this.duracionSesion);

    Object.keys(this.horarios).forEach(dia =>{
      if(this.compareTimes(this.horarios[dia].entrada, this.horarios[dia].salida)){
        Swal.fire({
          title: 'Error al cargar los horarios',
          text:'Horario de entrada mayor a horario de salida el día ' + dia + ".",
          icon:'warning'
        });
        flag = false;
      }
      if(this.horarios[dia].trabaja && (this.horarios[dia].entrada == '' || this.horarios[dia].salida == '')){
        Swal.fire({
          title: 'Error al cargar los horarios',
          text:'No especifica horario de salida o entrada el día ' + dia + ".",
          icon:'warning'
        });
        flag = false;
      }
    })

    if(flag){
      Object.keys(this.horarios).forEach(async dia =>{
        let id = this.selectedEspecialidad + this.usuarioActual.idDoc + dia;
        await setDoc(doc(this.fire,"horarios", id),{
          dia: dia,
          duracion: this.duracionSesion,
          trabaja: this.horarios[dia].trabaja,
          entrada: this.horarios[dia].entrada,
          salida: this.horarios[dia].salida,
          especialidad: this.selectedEspecialidad,
          especialista: this.usuarioActual.dni
        });
      });
      Swal.fire({
        title: 'Horarios cargados.',
        text: 'Los horarios para la especialidad ' + this.selectedEspecialidad + ' han sido guardados con éxito.',
        icon: 'success'
      })
    }
  }

  convertToTimeObject(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  compareTimes(timeStr1: string, timeStr2: string): boolean {
    const time1 = this.convertToTimeObject(timeStr1);
    const time2 = this.convertToTimeObject(timeStr2);
  
    if (time1 > time2) {
      return true;
    } else if (time1 < time2) {
      return false;
    } else {
      return false;
    }
  }

  handleEspecialidadChange(){
    this.initializeHorarios();
  }

  getHorarios(): Observable<Horario[]>{
    const horRef = collection(this.fire, 'horarios');
    return collectionData(horRef) as Observable<Horario[]>;
  }
}
