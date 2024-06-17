import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../services/auth.service';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { FirebaseApp } from '@angular/fire/app';

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

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {

  especialistas: Especialista[] = [];
  pacientes: Paciente[] = [];
  especialistaSet: Set<string> = new Set();
  pacienteSet: Set<string> = new Set();
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  fotos: any[] = [];

  constructor(private fire: Firestore, private firebase: FirebaseApp)
  {
    this.llenarArrayEspecialistas();
    this.llenarArrayPacientes();
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
}
