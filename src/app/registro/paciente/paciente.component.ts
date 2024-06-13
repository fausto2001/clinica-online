import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css']
})
export class PacienteComponent implements OnInit{

  pacienteForm!: FormGroup;

  constructor(private fb: FormBuilder, private service:PhotoService, private fire:Firestore) {}

  ngOnInit() {
    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      edad: ['', [Validators.required, Validators.min(3), Validators.max(99)]],
      dni: ['', [Validators.required, Validators.min(100), Validators.max(100000000)]],
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
      if(fotoDNI instanceof File && fotoPerfil instanceof File)
      {
        await this.service.subirFoto(fotoDNI, dni, "dni");
        await this.service.subirFoto(fotoPerfil, dni, "perfil");
        this.subirPacienteDB(this.pacienteForm.value);
      }

      console.log('Paciente agregado!', this.pacienteForm.value);
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