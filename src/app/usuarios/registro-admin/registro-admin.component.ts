import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.css']
})
export class RegistroAdminComponent {

  adminForm!: FormGroup;
  adminAgregado: boolean = false;

  constructor(private fb: FormBuilder, private service:PhotoService, private fire:Firestore) {}

  ngOnInit() {
    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      edad: ['', [Validators.required, Validators.min(3), Validators.max(99)]],
      dni: ['', [Validators.required, Validators.min(100000), Validators.max(100000000)]],
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
        {
          this.adminForm.patchValue({
            fotoPerfil: file
          })
        }
    }
}

  async onSubmit(): Promise<void> {
    if (this.adminForm.valid) {
      const dni = this.adminForm.value.dni;
      const fotoPerfil = this.adminForm.value.fotoPerfil;
      if(fotoPerfil instanceof File)
        {
          await this.service.subirFoto(fotoPerfil, dni);
          this.subirAdminDB(this.adminForm.value);
          this.adminAgregado = true;
        }
    } else {
      console.log("Error.");
      this.adminForm.markAllAsTouched();
    }
  }

  subirAdminDB(admin:any)
  {
    const col = collection(this.fire, 'admin');
    addDoc(col, {nombre: admin.nombre, apellido: admin.apellido, dni: admin.dni, 
      mail: admin.email, contraseña: admin.contraseña, edad: admin.edad});
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
