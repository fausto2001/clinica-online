import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from 'src/app/services/photo.service';
import { getAuth, createUserWithEmailAndPassword, sendSignInLinkToEmail } from '@angular/fire/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css']
})
export class PacienteComponent implements OnInit{

  pacienteForm!: FormGroup;
  pacienteAgregado: boolean = false;

  constructor(private fb: FormBuilder, private service:PhotoService, private fire:Firestore) {}

  ngOnInit() {
    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      edad: ['', [Validators.required, Validators.min(3), Validators.max(99)]],
      dni: ['', [Validators.required, Validators.min(100000), Validators.max(100000000)]],
      obraSocial: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContraseña: ['', [Validators.required, Validators.minLength(6)]],
      fotoPerfil: [null, Validators.required],
      fotoDNI: [null, Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });
  }

  onFileChange(event: any, type: string) {
    if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        if(type == 'dni')
        {
          this.pacienteForm.patchValue({
              fotoDNI: file
          });
        }
        else
        {
          this.pacienteForm.patchValue({
            fotoPerfil: file
          })
        }
    }
}

  async onSubmit(): Promise<void> {
    if (this.pacienteForm.valid) {
      const dni = this.pacienteForm.value.dni;
      const fotoDNI = this.pacienteForm.value.fotoDNI;
      const fotoPerfil = this.pacienteForm.value.fotoPerfil;
      const auth = getAuth();
      const actionCodeSettings = {
        url: 'http://localhost:4200/mail-activacion',
        handleCodeInApp: true
      }
        createUserWithEmailAndPassword(auth, this.pacienteForm.value.email, this.pacienteForm.value.contraseña).then((userCredential)=>
        {
          sendSignInLinkToEmail(auth, this.pacienteForm.value.email, actionCodeSettings).then(async () =>{
            window.localStorage.setItem('emailForSignIn', this.pacienteForm.value.email);
            const user = userCredential.user;
            console.log(user);
            this.pacienteAgregado = true;
            Swal.fire({
              title: "Paciente agregado!",
              text: "Ahora debe confirmar su mail!",
              icon: "success"
            });
            if(fotoDNI instanceof File && fotoPerfil instanceof File)
              {
                await this.service.subirFoto(fotoDNI, dni, "dni");
                await this.service.subirFoto(fotoPerfil, dni, "perfil");
                this.subirPacienteDB(this.pacienteForm.value);
              }
        
              console.log('Paciente agregado!', this.pacienteForm.value);
          })
          .catch((error) =>{
            Swal.fire({
              title: "Error!!!!!!!!!!!!!!",
              text: error.code + " - " + error.message,
              icon: "error"
            })
          })
        })
        .catch((error) =>
        {
          const errorCode = error.code;
          const errorMessage = error.message;
          if(error.code == "auth/email-already-in-use")
          {
            Swal.fire({
              title: "Error!",
              text: "Ese mail ya está en uso.",
              icon: "error"
            })
          }
          else
          {
            Swal.fire({
              title: "Error!",
              text: error.code + " - " + error.message,
              icon: "error"
            })
          }
        })
    } else {
      console.log("Error.");
      this.pacienteForm.markAllAsTouched();
    }
  }

  subirPacienteDB(paciente:any)
  {
    const col = collection(this.fire, 'pacientes');
    addDoc(col, {nombre: paciente.nombre, apellido: paciente.apellido, dni: paciente.dni, obraSocial: paciente.obraSocial, 
      mail: paciente.email, contraseña: paciente.contraseña, validado: false});
  }

  noNumbersValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const valid = /^[a-zA-Z]+$/.test(control.value);
    return valid ? null : { 'noNumbers': true };
  }

  emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value) && control.value.endsWith('.com');
    return valid ? null : { 'invalidEmail': true };
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('contraseña')?.value || '';
    const confirmPassword = group.get('confirmarContraseña')?.value || '';
    return password === confirmPassword ? null : { 'mismatch': true };
  }
}