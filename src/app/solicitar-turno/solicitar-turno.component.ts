import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, arrayUnion, getDoc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Observable, forkJoin, from } from 'rxjs';
import { FirebaseApp } from '@angular/fire/app';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { map, switchMap, take } from 'rxjs/operators';

export interface Especialidad {
  especialidad: string;
}

export interface Horas{
  date: string;
  especialista: string;
  paciente: string;
  tiempos: string[];
}

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
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css']
})
export class SolicitarTurnoComponent implements OnInit{
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  especialidades: any[] = [];
  usuarioActual: any;
  loading: boolean = true;
  fotos: any[] = [];
  fotosEspecialistas: any[] = [];
  especialistas: any[] = [];
  especialistaElegido:any;
  step = 1;
  especialidadElegida:any;
  hoy = new Date();
  dd = String(this.hoy.getDate()).padStart(2, '0');
  mm = String(this.hoy.getMonth() + 1).padStart(2, '0');
  yyyy = this.hoy.getFullYear();
  diaSem:string = this.getDiaSem(this.hoy.getDay());
  diasSem:any = this.getDiasSem(this.diaSem);
  calendarData:any = this.generateCalendar(this.hoy, 14);
  sem1:any[] = [];
  sem2:any[] = [];
  fechaElegida:any;
  arrayHoras:any[] = [];
  horasOcupadas:any[] = [];
  fotosPacientes: any[] = [];
  pacientes: any[] = [];
  adminTurnoTiempo:any;

  constructor(private service: AuthService, private fire: Firestore, private firebase: FirebaseApp) {
    this.service.currentUser.subscribe(user =>{
      this.usuarioActual = user;
      console.log(this.usuarioActual);
    })
  }

  ngOnInit() {
    forkJoin({
        especialidades: this.getEspecialidades().pipe(take(1)),
        especialistas: this.getEspecialistas().pipe(take(1)),
        pacientes: this.getPacientes().pipe(take(1)),
        horasOcupadas: this.getHoras().pipe(take(1))
    }).pipe(
        switchMap(({ especialidades, especialistas, pacientes, horasOcupadas }) => {
            this.especialidades = especialidades;
            this.especialistas = especialistas;
            this.pacientes = pacientes;
            this.horasOcupadas = horasOcupadas;
            return this.getFotos().pipe(take(1));
        })
    ).subscribe({
        next: (fotos) => {
            this.fotos = fotos;
            this.loading = false;
            this.filterFotos();
        },
        error: () => {
            this.loading = false;
        }
    });
  }

  getEspecialistas(): Observable<any[]> {
    const usrRef = collection(this.fire, 'especialistas');
    return collectionData(usrRef, { idField: 'idDoc' }) as Observable<any[]>;
  }

  getPacientes(): Observable<any[]> {
    const usrRef = collection(this.fire, 'pacientes');
    return collectionData(usrRef, { idField: 'idDoc' }) as Observable<any[]>;
  }

  getEspecialidades(): Observable<Especialidad[]> {
    const espRef = collection(this.fire, 'especialidades');
    return collectionData(espRef) as Observable<Especialidad[]>;
  }

  getFotos(): Observable<string[]> {
    return from(listAll(this.fotosRef)).pipe(
        switchMap(res => {
            const urlPromises = res.items.map(itemRef => getDownloadURL(itemRef));
            return forkJoin(urlPromises);
        })
    );
  }

  filterFotos(){
    this.fotos.forEach(foto =>{
      this.especialistas.forEach(especialista =>{
        if(foto.includes(especialista.dni)){
          let auxFoto = {
            nombre: especialista.nombre,
            apellido: especialista.apellido,
            dni: especialista.dni,
            especialidad: especialista.especialidad,
            segundaEspecialidad: especialista.segundaEspecialidad,
            terceraEspecialidad: especialista.terceraEspecialidad,
            foto: foto};
          this.fotosEspecialistas.push(auxFoto);
        }
      });
      this.pacientes.forEach(paciente =>{
        if(foto.includes(paciente.dni) && foto.includes('perfil')){
          let auxFoto = {
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            dni: paciente.dni,
            foto: foto
          };
          this.fotosPacientes.push(auxFoto);
        }
      })
    });
  }

  espClick(especialista:any){
    this.especialistaElegido = especialista;
    this.step = 2;
  }

  volver(){
    this.step--;
  }

  calendario(especialidad:any){
    this.especialidadElegida = especialidad;
    this.sem1 = this.crearSem(1, this.calendarData);
    this.sem2 = this.crearSem(2, this.calendarData);
    this.step = 3;
  }

  getDiaSem(dayIndex:any): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex];
  }

  generateCalendar(startDate: Date, days: number): {date: string, times: string[]}[] {
    const calendar = [];
    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        const diaSemana = this.getDiaSem(currentDate.getDay());

        const date = `${year}-${month}-${day}`;

        const times = [];
        for (let h = 8; h <= 18; h++) {
            times.push(`${h}:00`);
            times.push(`${h}:30`);
        }

        calendar.push({ diaSemana, date, times });
    }
    return calendar;
  }

  getHorarios(): Observable<Horario[]>{
    const horRef = collection(this.fire, 'horarios');
    return collectionData(horRef) as Observable<Horario[]>;
  }
  
  getDiasSem(hoy:any){
    const dias = [];
    let diaSemana;
    const currentDate = new Date(this.hoy);
    for(let i = 0; i < 7; i++){
      currentDate.setDate(this.hoy.getDate() + i);
      diaSemana = this.getDiaSem(currentDate.getDay());
      if(diaSemana != 'Domingo'){
      dias.push(diaSemana);}
    }
    return dias;
  }

  crearSem(sem: number, calendarData: any[]): any[] {
    let a: any[] = [];
  
    if (sem == 1) {
      for (let i = 0; i < 7; i++) {
        this.getHorarios().subscribe(horario => {
          horario.forEach(element => {
            if (element.especialista == this.especialistaElegido.dni && 
                element.especialidad == this.especialidadElegida && 
                element.dia == calendarData[i].diaSemana) {
              const isAlreadyIncluded = a.some(item =>
                item.diaSemana === calendarData[i].diaSemana &&
                item.date === calendarData[i].date &&
                item.times === calendarData[i].times &&
                item.trabaja === element.trabaja
              );
              if (!isAlreadyIncluded) {
                a.push({
                  diaSemana: calendarData[i].diaSemana,
                  date: calendarData[i].date,
                  times: calendarData[i].times,
                  trabaja: element.trabaja,
                  entrada: element.entrada,
                  salida: element.salida,
                  duracion: element.duracion
                });
              }
            }
          });
        });
      }
    } else {
      for (let i = 7; i < 14; i++) {
        this.getHorarios().subscribe(horario => {
          horario.forEach(element => {
            if (element.especialista == this.especialistaElegido.dni && 
                element.especialidad == this.especialidadElegida && 
                element.dia == calendarData[i].diaSemana) {
              const isAlreadyIncluded = a.some(item =>
                item.diaSemana === calendarData[i].diaSemana &&
                item.date === calendarData[i].date &&
                item.times === calendarData[i].times &&
                item.trabaja === element.trabaja
              );
              if (!isAlreadyIncluded) {
                a.push({
                  diaSemana: calendarData[i].diaSemana,
                  date: calendarData[i].date,
                  times: calendarData[i].times,
                  trabaja: element.trabaja,
                  entrada: element.entrada,
                  salida: element.salida,
                  duracion: element.duracion
                });
              }
            }
          });
        });
      }
    }
  
    return a;
  }

  horarioFecha(fecha:any){
    this.arrayHoras = [];
    this.step = 4;
    this.fechaElegida = fecha;
    let tiempos = new Date();
    let newSalida = new Date();
    const [hoursEntrada, minutesEntrada] = this.fechaElegida.entrada.split(':').map(Number);
    const [hoursSalida, minutesSalida] = this.fechaElegida.salida.split(':').map(Number);
    tiempos.setHours(hoursEntrada, minutesEntrada, 0, 0);
    newSalida.setHours(hoursSalida, minutesSalida, 0, 0);
    let duracion = 0;
    duracion += parseInt(fecha.duracion);


    while(tiempos < newSalida){
      let min = tiempos.getMinutes().toString()
      if(min == '0'){
        min = '00';
      }
      this.arrayHoras.push({
        tiempo: tiempos.getHours().toString() + ":" + min,
        disponible: true});

      this.horasOcupadas.forEach(element =>{
        if(element.especialista == this.especialistaElegido.dni && element.date == this.fechaElegida.date){
          this.arrayHoras.forEach(hora =>{
            element.tiempos.forEach((tiempo: any) => {
              if(hora.tiempo == tiempo){
                hora.disponible = false;
              }
            });
          })
        }
      })
      console.log(this.arrayHoras);
      
      tiempos = this.addMinutes(tiempos, duracion);
    }
  }

  addMinutes(date: Date, minutes: number): Date {
    const newDate = new Date(date.getTime());
    const currentMinutes = newDate.getMinutes();
    const newMinutes = currentMinutes + minutes;
    newDate.setMinutes(newMinutes);
    return newDate;
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

    convertToTimeObject(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  async sacarTurno(tiempo:any, pacienteDni:any){
    this.loading = true;
    let turnoStart = this.convertToTimeObject(tiempo);
    let turnoOver = this.addMinutes(this.convertToTimeObject(tiempo), (parseInt(this.fechaElegida.duracion) - 1));
    let minutosStart = turnoStart.getMinutes().toString();
    let minutosOver = turnoOver.getMinutes().toString();
    if(minutosStart == '0'){
      minutosStart = '00';
    }
    if(minutosOver == '0'){
      minutosOver = '00';
    }
    let id = this.especialidadElegida + this.especialistaElegido.dni + this.fechaElegida.date + turnoStart.getHours().toString()
     + minutosStart + turnoOver.getHours().toString() + minutosOver;
    setDoc(doc(this.fire,"turnos",id),{
      dia: this.fechaElegida.date,
      start: turnoStart.getHours().toString()+":"+minutosStart,
      over: turnoOver.getHours().toString()+":"+minutosOver,
      especialista: this.especialistaElegido.dni,
      especialidad: this.especialidadElegida,
      paciente: pacienteDni,
      condicion: 'Pendiente'
    });

    let tiemposOcupados = [];
    let aux = turnoStart;
    let min;

    while(aux <= turnoOver){
      min = aux.getMinutes().toString();
      if(min == '0'){
        min = '00';
      }
      tiemposOcupados.push(aux.getHours().toString() + ":" + min);
      aux = this.addMinutes(aux, 5);
    }
    
    const horasOcupadasId = this.especialistaElegido.dni + this.fechaElegida.date;
    const horasOcupadasRef = doc(this.fire, "horasOcupadas", horasOcupadasId);
    const docSnapshot = await getDoc(horasOcupadasRef);
  
    if (docSnapshot.exists()) {
      await updateDoc(horasOcupadasRef, {
        tiempos: arrayUnion(...tiemposOcupados)
      });
    } else {
      await setDoc(horasOcupadasRef, {
        date: this.fechaElegida.date,
        especialista: this.especialistaElegido.dni,
        paciente: pacienteDni,
        tiempos: tiemposOcupados
      });
    }
    this.loading = false;
    this.step = 6;
  }

  getHoras() : Observable<Horas[]>{
    const horRef = collection(this.fire, 'horasOcupadas');
    return collectionData(horRef, {idField: 'idDoc'}) as Observable<Horas[]>;
  }

  sacarTurnoAdmin(tiempo:any){
    this.adminTurnoTiempo = tiempo;
    this.step = 5;
  }
}
