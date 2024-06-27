import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TurnosComponent } from 'src/app/turnos/turnos.component';
import { FormsModule } from '@angular/forms';

const routes:Routes = [
  {path: '', component:TurnosComponent}
]

@NgModule({
  declarations: [TurnosComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class TurnosModule { }
