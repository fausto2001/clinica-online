import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MiPerfilComponent } from 'src/app/mi-perfil/mi-perfil.component';
import { MisHorariosComponent } from 'src/app/mi-perfil/mis-horarios/mis-horarios.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {path: '', component:MiPerfilComponent},
  {path: 'mis-horarios', component:MisHorariosComponent}
]

@NgModule({
  declarations: [MiPerfilComponent, MisHorariosComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MiPerfilModule { }
