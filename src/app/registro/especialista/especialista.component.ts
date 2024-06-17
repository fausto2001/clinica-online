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
  segundaEspecialidadAgregada: boolean = false;
  terceraEspecialidadAgregada: boolean = false;
  especialistaAgregado: boolean = false;
  

  constructor(private fb: FormBuilder, private service:PhotoService, private fire:Firestore) {
    if(this.especialidades === undefined || this.especialidades.length == 0)
    {
      this.getEspecialidades().subscribe(especialidadesBD =>{
        especialidadesBD.forEach(especialidad =>
          {
            if(!this.especialidades.includes(especialidad.especialidad))
            {
              this.especialidades.push(especialidad.especialidad);
            }
          }
        )
      })
    }
  }

  ngOnInit()
  {
    this.especialistaForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      edad: ['', [Validators.required, Validators.min(3), Validators.max(99)]],
      dni: ['', [Validators.required, Validators.min(100000), Validators.max(100000000)]],
      especialidad: ['', Validators.required],
      nuevaEspecialidad: [''],
      segundaEspecialidad: [''],
      segundaNuevaEspecialidad: [''],
      terceraEspecialidad: [''],
      terceraNuevaEspecialidad: [''],
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
      this.especialistaAgregado = true;
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
    if(!this.especialidadAgregada && !this.segundaEspecialidadAgregada && !this.terceraEspecialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.especialidad, 
      mail: especialista.email, contraseña: especialista.contraseña, validado: false, segundaEspecialidad: especialista.segundaEspecialidad});
    }
    else if(this.especialidadAgregada && !this.segundaEspecialidadAgregada && !this.terceraEspecialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.nuevaEspecialidad, 
      mail: especialista.email, contraseña: especialista.contraseña, validado: false, segundaEspecialidad: especialista.segundaEspecialidad,
      terceraEspecialidad: especialista.terceraEspecialidad});
    }
    else if(this.especialidadAgregada && this.segundaEspecialidadAgregada && !this.terceraEspecialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.nuevaEspecialidad, 
        mail: especialista.email, contraseña: especialista.contraseña, validado: false, segundaEspecialidad: especialista.segundaNuevaEspecialidad,
        terceraEspecialidad: especialista.terceraEspecialidad});
    }
    else if(this.especialidadAgregada && this.segundaEspecialidadAgregada && this.terceraEspecialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.nuevaEspecialidad, 
        mail: especialista.email, contraseña: especialista.contraseña, validado: false, segundaEspecialidad: especialista.segundaNuevaEspecialidad,
        terceraEspecialidad: especialista.terceraNuevaEspecialidad});
    }
    else if(!this.especialidadAgregada && this.segundaEspecialidadAgregada && !this.terceraEspecialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.especialidad, 
        mail: especialista.email, contraseña: especialista.contraseña, validado: false, segundaEspecialidad: especialista.segundaNuevaEspecialidad,
        terceraEspecialidad: especialista.terceraEspecialidad});
    }
    else if(!this.especialidadAgregada && this.segundaEspecialidadAgregada && this.terceraEspecialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.especialidad, 
        mail: especialista.email, contraseña: especialista.contraseña, validado: false, segundaEspecialidad: especialista.segundaNuevaEspecialidad,
        terceraEspecialidad: especialista.terceraNuevaEspecialidad});
    }
    else if(!this.especialidadAgregada && !this.segundaEspecialidadAgregada && this.terceraEspecialidadAgregada)
    {
      addDoc(col, {nombre: especialista.nombre, apellido: especialista.apellido, dni: especialista.dni, especialidad: especialista.especialidad, 
        mail: especialista.email, contraseña: especialista.contraseña, validado: false, segundaEspecialidad: especialista.segundaEspecialidad,
        terceraEspecialidad: especialista.terceraNuevaEspecialidad});
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

  agregarEspecialidad(especialidad:any, level:number)
  {
    const col = collection(this.fire, 'especialidades');
    addDoc(col, {especialidad:especialidad});
    switch(level)
    {
      case 1:
        this.especialidadAgregada = true;
        break;
      case 2:
        this.segundaEspecialidadAgregada = true;
        break;
      case 3:
        this.terceraEspecialidadAgregada = true;
        break;
    }
    this.especialidades = [];
  }
}
