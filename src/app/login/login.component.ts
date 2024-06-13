import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

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

  constructor(private fb: FormBuilder, private service: AuthService){}

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
      this.service.login(dni, contraseña);
    }
  }

  accesoRapido(dni:string, contraseña:string)
  {
    this.loginForm.value.dni = dni;
    this.loginForm.value.contraseña = contraseña;
    this.service.login(dni, contraseña);
  }
}
