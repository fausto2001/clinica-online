import { Component } from '@angular/core';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, validatePassword } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Usuario{
  idDoc:string;
  mail:string;
  validado: boolean;
}

@Component({
  selector: 'app-mail-activacion',
  templateUrl: './mail-activacion.component.html',
  styleUrls: ['./mail-activacion.component.css']
})
export class MailActivacionComponent {

  mail:string|null;

  constructor(private fire:Firestore)
  {
    this.mail = localStorage.getItem("emailForSignIn");
    console.log(localStorage.getItem("emailForSignIn"));
    const auth = getAuth();
    if(isSignInWithEmailLink(auth, window.location.href)){
      let email = this.mail;
      if(!email)
      {
        email = window.prompt('Por cuestiones de seguridad, necesitamos que nos proveas el mail de confirmación: ');
        this.mail = email;
      }
    }

    signInWithEmailLink(auth, this.mail!, window.location.href)
    .then((result) =>{
      this.getPacientes().subscribe(pacientes =>{
        const paciente = pacientes.find(paciente => paciente.mail == this.mail);
        if(paciente){
          console.info(paciente);
          const pacienteRef = doc(fire, 'pacientes', paciente.idDoc);
          updateDoc(pacienteRef, {
            validado: true
          })
        }
      })
      window.localStorage.removeItem('emailForSignIn');
    })
    .catch((error) =>{
      console.info("error");
    })
  }

  getPacientes() : Observable<Usuario[]>
  {
    const usrRef = collection(this.fire, 'pacientes');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Usuario[]>;
  }
  
}
