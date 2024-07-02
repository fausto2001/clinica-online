import { Component } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { Observable, forkJoin, from, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css']
})
export class MisTurnosComponent {
  loading: boolean = true;
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  selected:string = 'option0';
  especialidades: any[] = [];
  especialistas: any[] = [];
  fotos: any[] = [];
  fotosEspecialistas: any[] = [];
  chosen:string = '0';
  turnos: any[] = [];
  currentTurnos: any[] = [];
  espElegido: any;
  pacientes: any[] = [];
  step = 1;
  turnoAEliminar: any;
  comentario:any="";
  usuarioActual:any;
  condicionAConvertir:any="";

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
        this.espChange();
      },
      error: () => {
        this.loading = false;
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

  constructor(private fire:Firestore, private firebase:FirebaseApp, private service:AuthService){
    this.usuarioActual = service.currentUser;
    this.usuarioActual = this.usuarioActual.source.value;
  }

  onOptionChange(event :any)
  {
    this.currentTurnos = [];
    this.selected = event.target.value;
    if(this.selected == 'option0'){
      this.espChange();
    }
  }

  espChange(){
    this.currentTurnos = [];
    if(this.selected != 'option0'){
      if(this.usuarioActual.perfil == 'paciente'){
        this.turnos.forEach(turno =>{
          if(turno.paciente == this.usuarioActual.dni && 
            (turno.especialista == this.espElegido.dni || turno.especialidad == this.espElegido.especialidad)){
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
      } else if(this.usuarioActual.perfil == 'especialista'){
        this.turnos.forEach(turno =>{
          if(turno.especialista == this.usuarioActual.dni &&
          (turno.paciente == this.espElegido.dni || turno.especialidad == this.espElegido.especialidad)){
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
    }
    else
    {
      this.turnos.forEach(turno =>{
        if(turno.paciente == this.usuarioActual.dni || turno.especialista == this.usuarioActual.dni){
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
  }

  volver(){
    this.espChange();
    if(this.step != 8 && this.step != 4){
    this.step--;}
    else
    {
      this.espChange();
      this.step = 1;
    }
  }

  cancelarTurno(paciente:any, especialista:any, especialidad:any, dia:any, start:any, cond:any){
    this.condicionAConvertir = cond;
    this.turnos.forEach(turno =>{
      if(turno.especialista == especialista && turno.paciente == paciente && turno.especialidad == especialidad && turno.dia == dia && turno.start == start){
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

  aceptarTurno(paciente:any, especialista:any, especialidad:any, dia:any, start:any, cond:any){
    this.condicionAConvertir = cond;
    this.turnos.forEach(turno =>{
      if(turno.especialista == especialista && turno.paciente == paciente && turno.especialidad == especialidad && turno.dia == dia && turno.start == start){
        this.pacientes.forEach(paciente =>{
          if(turno.paciente == paciente.dni){
            this.especialistas.forEach(especialista =>{
              if(turno.especialista == especialista.dni){
                this.turnoAEliminar = turno;
                this.cancTurno(this.turnoAEliminar, 'Aceptado');
                this.step = 4;
              }
            })
          }
        })
      }
    })
  }

  finalizarTurno(paciente:any, especialista:any, especialidad:any, dia:any, start:any, cond:any){
    this.condicionAConvertir = cond;
    this.turnos.forEach(turno =>{
      if(turno.especialista == especialista && turno.paciente == paciente && turno.especialidad == especialidad && turno.dia == dia && turno.start == start){
        this.pacientes.forEach(paciente =>{
          if(turno.paciente == paciente.dni){
            this.especialistas.forEach(especialista =>{
              if(turno.especialista == especialista.dni){
                this.turnoAEliminar = turno;
                //this.cancTurno(this.turnoAEliminar, 'Finalizado');
                this.step = 5;
              }
            })
          }
        })
      }
    })
  }

  resenia(paciente:any, especialista:any, especialidad:any, dia:any, start:any){
    this.turnos.forEach(turno =>{
      if(turno.especialista == especialista && turno.paciente == paciente && turno.especialidad == especialidad && turno.dia == dia && turno.start == start){
        this.pacientes.forEach(paciente =>{
          if(turno.paciente == paciente.dni){
            this.especialistas.forEach(especialista =>{
              if(turno.especialista == especialista.dni){
                this.turnoAEliminar = turno;
                this.comentario = turno.comentario;
                this.step = 8;
              }
            })
          }
        })
      }
    })
  }

  cancTurno(turnoElim:any, cond:any){
    const turnoRef = doc(this.fire, 'turnos', turnoElim.idDoc);
    updateDoc(turnoRef,{
      condicion: cond,
      comentario: this.comentario
    })
    this.step = 3;
  }

  finTurno(turnoElim:any, cond:any){
    const turnoRef = doc(this.fire, 'turnos', turnoElim.idDoc);
    updateDoc(turnoRef,{
      condicion: cond,
      comentario: this.comentario
    })
    this.step = 6;
  }
  
  cancTurnPac(paciente:any, especialista:any, especialidad:any, dia:any, start:any, cond:any){
    this.condicionAConvertir = cond;
    this.turnos.forEach(turno =>{
      if(turno.especialista == especialista && turno.paciente == paciente && turno.especialidad == especialidad && turno.dia == dia && turno.start == start){
        this.pacientes.forEach(paciente =>{
          if(turno.paciente == paciente.dni){
            this.especialistas.forEach(especialista =>{
              if(turno.especialista == especialista.dni){
                this.step = 2;
                this.turnoAEliminar = turno;
              }
            })
          }
        })
      }
    })
  }

  pacResenia(paciente:any, especialista:any, especialidad:any, dia:any, start:any){
    this.turnos.forEach(turno =>{
      if(turno.especialista == especialista && turno.paciente == paciente && turno.especialidad == especialidad && turno.dia == dia && turno.start == start){
        this.pacientes.forEach(paciente =>{
          if(turno.paciente == paciente.dni){
            this.especialistas.forEach(especialista =>{
              if(turno.especialista == especialista.dni){
                this.step = 11;
                this.turnoAEliminar = turno;
              }
            })
          }
        })
      }
    })
  }

  pacRec(turnoElim:any){
    const turnoRef = doc(this.fire, 'turnos', turnoElim.idDoc);
    updateDoc(turnoRef,{
      comentarioPac: this.comentario
    })
    this.step = 6;
  }
}