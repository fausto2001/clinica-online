import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PhotoService } from 'src/app/services/photo.service';

interface Especialidad
{
  especialidad:string
}

@Component({
  selector: 'app-especialista',
  templateUrl: './especialista.component.html',
  styleUrls: ['./especialista.component.css']
})
export class EspecialistaComponent implements OnInit{

  especialistaForm!: FormGroup;
  especialidades: string[] = [];
  especialidadActual: string | undefined = "test";
  nuevaEspecialidad: string | undefined;
  especialidadAgregada: boolean = false;

  constructor(private fb: FormBuilder, private service:PhotoService, private fire:Firestore) {
    this.getEspecialidades().subscribe(especialidadesBD =>{
      especialidadesBD.forEach(especialidad =>
        {
          this.especialidades.push(especialidad.especialidad);
        }
      )
    })
    
  }

  ngOnInit()
  {
    this.especialistaForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      edad: ['', [Validators.required, Validators.min(3), Validators.max(99)]],
      dni: ['', [Validators.required, Validators.min(100), Validators.max(100000000)]],
      especialidad: ['', Validators.required],
      nuevaEspecialidad: [''],
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
    if(!this.especialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.especialidad, 
      mail: especialista.email, contraseña: especialista.contraseña, validado: false});
    }
    else
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.nuevaEspecialidad, 
      mail: especialista.email, contraseña: especialista.contraseña, validado: false});
    }
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

  getEspecialidades(): Observable<Especialidad[]>
  {
    const usrRef = collection(this.fire, 'especialidades');
    return collectionData(usrRef, {idField: 'idDoc'}) as Observable<Especialidad[]>;
  }

  agregarEspecialidad(especialidad:any)
  {
    const col = collection(this.fire, 'especialidades');
    addDoc(col, {especialidad:especialidad});
    this.especialidadAgregada = true;
  }
}
