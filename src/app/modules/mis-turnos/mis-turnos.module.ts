import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MisTurnosComponent } from 'src/app/mis-turnos/mis-turnos.component';
import { FormsModule } from '@angular/forms';

const routes:Routes = [
  {path: '', component:MisTurnosComponent}
]



@NgModule({
  declarations: [MisTurnosComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MisTurnosModule { }
