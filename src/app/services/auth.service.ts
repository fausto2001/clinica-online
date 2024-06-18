import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import Swal from 'sweetalert2';

export interface Usuario{
  email: string;
  dni: string;
  contraseña: string;
  validado: boolean;
  nombre: string;
  apellido: string;
  perfil?: string|undefined;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario>;
  public currentUser;

  constructor(private router: Router, private fire : Firestore) {
    const storedUserString = localStorage.getItem('currentUser');
    const storedUser = storedUserString ? JSON.parse(storedUserString) : null;
    this.currentUserSubject = new BehaviorSubject<Usuario>(storedUser || { user: '', pass: '' });
    this.currentUser = this.currentUserSubject.asObservable();
  }

  getPacientes() : Observable<Usuario[]>
  {
    const usrRef = collection(this.fire, 'pacientes');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Usuario[]>;
  }

  getEspecialistas() : Observable<Usuario[]>
  {
    const usrRef = collection(this.fire, 'especialistas');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Usuario[]>;
  }

  getAdmins(): Observable<Usuario[]>{
    const usrRef = collection(this.fire, 'admin');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Usuario[]>;
  }

  login(dni:string, contraseña:string)
  {
    this.getAdmins().subscribe(admins =>{
      const admin = admins.find(admin => admin.dni == dni && admin.contraseña == contraseña);
      if(admin){
        admin.perfil = "admin";
        this.currentUserSubject.next(admin);
        console.log(admin);
        localStorage.setItem('currentUser', JSON.stringify(admin));
        Swal.fire({
          title: "admin",
          text: "En unos segundos serás redirigido",
          icon: "success"
        })
        this.router.navigateByUrl('/usuarios');
      }
      else
      {
        this.getPacientes().subscribe(pacientes =>{
          const paciente = pacientes.find(paciente => paciente.dni == dni && paciente.contraseña == contraseña);
          if(paciente){
            if(paciente.validado)
            {
              paciente.perfil = 'paciente';
              this.currentUserSubject.next(paciente);
              localStorage.setItem('currentUser', JSON.stringify(paciente));
              Swal.fire({
                title: "Paciente encontrado!",
                text: "En unos segundos serás redirigido",
                icon: "success"
              })
              this.router.navigateByUrl('/mi-perfil')
            }
            else
            {
              Swal.fire({
                title: "Tu mail no fue validado aún!",
                text: "Debes validar tu mail primero.",
                icon: "warning"
              })
            }
          }
          else
          {
            console.log("test");
            this.getEspecialistas().subscribe(especialistas =>{
              const especialista = especialistas.find(especialista => especialista.dni == dni && especialista.contraseña == contraseña);
              if(especialista)
                {
                  if(especialista.validado)
                  {
                    this.currentUserSubject.next(especialista);
                    especialista.perfil = 'especialista';
                    localStorage.setItem('currentUser', JSON.stringify(especialista));
                    console.log(this.currentUser);
                    Swal.fire({
                      title: "Especialista encontrado!",
                      text: "En unos segundos serás redirigido",
                      icon: "success"
                    })
                    this.router.navigateByUrl('/mi-perfil');
                  }
                  else
                  {
                    Swal.fire({
                      title: "Todavía no fuiste validado por el administrador!",
                      text: "Debes esperar a validación del administrador.",
                      icon: "warning"
                    })
                  }
                }
                else
                {
                  Swal.fire({
                    title: "El usuario no fue encontrado!",
                    text: "Reescribí tu usuario o contraseña, por favor.",
                    icon: "error"
                  })
                }
            })
          }
        })
      }
    });
  }

  esAdmin(){
    const currentUser = this.currentUserSubject.value;
    return currentUser && currentUser.perfil == 'admin';
  }

  esEspecialista(){
    const currentUser = this.currentUserSubject.value;
    return currentUser && currentUser.perfil == 'especialista';
  }

  esPaciente(){
    const currentUser = this.currentUserSubject.value;
    return currentUser && currentUser.perfil == 'paciente';
  }
}
