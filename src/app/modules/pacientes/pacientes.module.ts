import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PacientesComponent } from 'src/app/pacientes/pacientes.component';
import { FormsModule } from '@angular/forms';

const routes:Routes = [
  {path: '', component:PacientesComponent}
]

@NgModule({
  declarations: [PacientesComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class PacientesModule { }
