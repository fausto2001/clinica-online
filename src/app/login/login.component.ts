import { Component } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

export interface Usuario
{
  dni: string,
  contraseña: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private fire:Firestore){}

  ngOnInit()
  {
    this.loginForm = this.fb.group({
      dni: ['', [Validators.required, Validators.min(100), Validators.max(100000000)]],
      contraseña: ['', [Validators.required]]
    })
  }

  onSubmit()
  {
    if(this.loginForm.valid){
      const dni = this.loginForm.value.dni;
      const contraseña = this.loginForm.value.contraseña;
      this.login(dni, contraseña);
    }
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

  login(dni:string, contraseña:string)
  {
    this.getPacientes().subscribe(pacientes =>{
      const paciente = pacientes.find(paciente => paciente.dni == dni && paciente.contraseña == contraseña);
      if(paciente){
        Swal.fire({
          title: "Paciente encontrado!",
          text: "En unos segundos serás redirigido",
          icon: "success"
        })
      }
      else
      {
        this.getEspecialistas().subscribe(especialistas =>{
          const especialista = especialistas.find(especialista => especialista.dni === dni && especialista.contraseña === contraseña);
          if(especialista)
            {
              Swal.fire({
                title: "Especialista encontrado!",
                text: "En unos segundos serás redirigido",
                icon: "success"
              })
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
}
