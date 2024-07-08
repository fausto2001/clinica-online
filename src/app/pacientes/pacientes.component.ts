import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire/app';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { Observable, forkJoin, from, switchMap, take } from 'rxjs';
import { collection } from '@firebase/firestore';
import { Especialidad } from '../solicitar-turno/solicitar-turno.component';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent {
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  loading:boolean=true;
  usuarioActual: any;
  especialistas: any[] = [];
  especialidades: any[] = [];
  pacientes: any[] = [];
  fotos: any[] = [];
  fotosEspecialistas: any[] = [];
  fotosPacientes: any[] = [];
  turnos: any[] = [];
  currentTurnos: any[] = [];
  step = 1;
  pacienteElegido: any = '';
  historiaClinicaTxt = '';

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
        turnos: this.getTurnos().pipe(take(1))
    }).pipe(
        switchMap(({ especialidades, especialistas, pacientes, turnos}) => {
            this.especialidades = especialidades;
            this.especialistas = especialistas;
            this.pacientes = pacientes;
            this.turnos = turnos;
            return this.getFotos().pipe(take(1));
        })
    ).subscribe({
        next: (fotos) => {
            this.fotos = fotos;
            this.loading = false;
            this.filterFotos();
            console.log(this.fotosPacientes);
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

  getTurnos(): Observable<any[]>{
    const turRef = collection(this.fire, 'turnos');
    return collectionData(turRef, {idField: 'idDoc'}) as Observable<any[]>;
  }

  filterFotos(){
    this.fotos.forEach(foto =>{
      this.turnos.forEach(turno =>{
        if(turno.especialista ==  this.usuarioActual.dni){
          this.pacientes.forEach(paciente =>{
            if(turno.paciente == paciente.dni){
              if(foto.includes(paciente.dni) && foto.includes('perfil')){
                let auxFoto = {
                  nombre: paciente.nombre,
                  apellido: paciente.apellido,
                  dni: paciente.dni,
                  foto: foto
                }
                if(!this.fotosPacientes.some(e => e.nombre == paciente.nombre)){
                  this.fotosPacientes.push(auxFoto);
                }
              }
            }
          })
        }
      });
    });
  }

  pacClick(paciente:any){
    this.currentTurnos = [];
    this.pacienteElegido = paciente;
    this.step = 2;
    console.log(this.pacienteElegido);

    this.turnos.forEach(turno =>{
      if(turno.especialista == this.usuarioActual.dni && turno.paciente == this.pacienteElegido.dni){
        this.currentTurnos.push(turno);
        console.log(turno);
      }
    })
  }

  histClinica(historiaClinica:any){
    console.log(historiaClinica);
    this.historiaClinicaTxt = "Altura: " + historiaClinica.altura + "\nPeso: " + historiaClinica.peso + 
    "\nPresión: " + historiaClinica.presion + "\nTemperatura: " + historiaClinica.temperatura;
    if(historiaClinica.dynamicData[0].clave){this.historiaClinicaTxt = this.historiaClinicaTxt 
      + "\n" + historiaClinica.dynamicData[0].clave + ": " + historiaClinica.dynamicData[0].valor}
    if(historiaClinica.dynamicData[1]){this.historiaClinicaTxt = this.historiaClinicaTxt  
      + "\n" + historiaClinica.dynamicData[1].clave + ": " + historiaClinica.dynamicData[1].valor}
    if(historiaClinica.dynamicData[2]){this.historiaClinicaTxt = this.historiaClinicaTxt 
      + "\n" + historiaClinica.dynamicData[2].clave + ": " + historiaClinica.dynamicData[2].valor}
    this.step = 3;
  }

  volver(){
    this.step--;
  }
}
