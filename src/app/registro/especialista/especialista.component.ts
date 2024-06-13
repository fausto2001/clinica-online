import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-especialista',
  templateUrl: './especialista.component.html',
  styleUrls: ['./especialista.component.css']
})
export class EspecialistaComponent implements OnInit{

  especialistaForm!: FormGroup;

  constructor(private fb: FormBuilder, private service:PhotoService, private fire:Firestore) {}

  ngOnInit()
  {
    this.especialistaForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      edad: ['', [Validators.required, Validators.min(3), Validators.max(99)]],
      dni: ['', [Validators.required, Validators.min(100), Validators.max(100000000)]],
      especialidad: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContraseña: ['', [Validators.required, Validators.minLength(6)]],
      fotoPerfil: [null, Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });
  }

  onFileChange(event: any, type: string) {
    if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        this.especialistaForm.patchValue({
          fotoPerfil: file
        })
    }
  }

  async onSubmit(): Promise<void> {
    if (this.especialistaForm.valid) {
      const dni = this.especialistaForm.value.dni;
      const fotoPerfil = this.especialistaForm.value.fotoPerfil;
      if(fotoPerfil instanceof File)
      {
        await this.service.subirFoto(fotoPerfil, dni, "perfil");
        this.subirEspecialistaDB(this.especialistaForm.value);
      }

      console.log('Paciente agregado!', this.especialistaForm.value);
    } else {
      console.log("Error.");
      this.especialistaForm.markAllAsTouched();
    }
  }

  subirEspecialistaDB(especialista:any)
  {
    const col = collection(this.fire, 'especialistas');
    addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.especialidad, 
      mail: especialista.email, contraseña: especialista.contraseña});
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
