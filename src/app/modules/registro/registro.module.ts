import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from 'src/app/registro/registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PacienteComponent } from 'src/app/registro/paciente/paciente.component';
import { EspecialistaComponent } from 'src/app/registro/especialista/especialista.component';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

const routes: Routes = [
  { path: '', component: RegistroComponent},
  { path: 'paciente', component: PacienteComponent},
  { path: 'especialista', component: EspecialistaComponent}
]

@NgModule({
  declarations: [RegistroComponent, PacienteComponent, EspecialistaComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RegistroModule { }