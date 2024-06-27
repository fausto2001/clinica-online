import { Component } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Firestore, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { collection } from '@firebase/firestore';
import { Observable, forkJoin, from, switchMap, take } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent {
  loading: boolean = true;
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  selected:string = 'option1';
  especialidades: any[] = [];
  especialistas: any[] = [];
  fotos: any[] = [];
  fotosEspecialistas: any[] = [];
  especialistaElegido : any;
  especialidadElegida : any;
  chosen:string = '0';
  turnos: any[] = [];
  currentTurnos: any[] = [];
  espElegido: any;
  pacientes: any[] = [];
  step = 1;
  turnoAEliminar: any;
  comentario:any="";

  ngOnInit(){
    forkJoin({
      especialidades: this.getEspecialidades().pipe(take(1)),
      especialistas: this.getEspecialistas().pipe(take(1)),
      turnos: this.getTurnos().pipe(take(1)),
      pacientes: this.getPacientes().pipe(take(1))
    }).pipe(
      switchMap(({especialidades, especialistas, turnos, pacientes}) =>{
        this.especialidades = especialidades;
        this.fixEsps();
        this.especialistas = especialistas;
        this.turnos = turnos;
        this.pacientes = pacientes;
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
    })
  }

  constructor(private fire:Firestore, private firebase:FirebaseApp){}

  volver(){
    this.step--;
  }

  onOptionChange(event :any)
  {
    this.currentTurnos = [];
    this.selected = event.target.value;
  }

  espChange(event :any){
    this.currentTurnos = [];
    this.turnos.forEach(turno =>{
      if(turno.especialista == this.espElegido.dni || turno.especialidad == this.espElegido.especialidad){
        this.pacientes.forEach(paciente =>{
          if(turno.paciente == paciente.dni){
            turno.pacienteNombre = paciente.nombre + " " + paciente.apellido;
          }
        });
        this.especialistas.forEach(especialista =>{
          if(turno.especialista == especialista.dni){
            turno.especialistaNombre = especialista.nombre + " " + especialista.apellido;
          }
        })
        this.currentTurnos.push(turno);
      }
    })
  }

  cancelarTurno(paciente:any, especialista:any, especialidad:any, dia:any, start:any){
    this.turnos.forEach(turno =>{
      if(turno.especialista == especialista && turno.paciente == paciente && turno.especialidad == especialidad){
        this.pacientes.forEach(paciente =>{
          if(turno.paciente == paciente.dni){
            this.especialistas.forEach(especialista =>{
              if(turno.especialista == especialista.dni){
                this.step++;
                this.turnoAEliminar = turno;
              }
            })
          }
        })
      }
    })
  }

  getEspecialidades(): Observable<any[]> {
    const espRef = collection(this.fire, 'especialidades');
    return collectionData(espRef) as Observable<any[]>;
  }

  getEspecialistas(): Observable<any[]> {
    const usrRef = collection(this.fire, 'especialistas');
    return collectionData(usrRef, { idField: 'idDoc' }) as Observable<any[]>;
  }

  getPacientes(): Observable<any[]>{
    const pacRef = collection(this.fire, 'pacientes');
    return collectionData(pacRef, {idField: 'idDoc'}) as Observable<any[]>;
  }

  getFotos(): Observable<string[]> {
    return from(listAll(this.fotosRef)).pipe(
        switchMap(res => {
            const urlPromises = res.items.map(itemRef => getDownloadURL(itemRef));
            return forkJoin(urlPromises);
        })
    );
  }

  getTurnos(): Observable<any[]>{
    const turRef = collection(this.fire, 'turnos');
    return collectionData(turRef, {idField: 'idDoc'}) as Observable<any[]>;
  }

  fixEsps(){
    this.especialidades.pop();
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
    });
  }

  cancTurno(turnoElim:any){
    const turnoRef = doc(this.fire, 'turnos', turnoElim.idDoc);
    updateDoc(turnoRef,{
      condicion: 'Rechazado',
      comentario: this.comentario
    })

    this.step++;
  }
}
