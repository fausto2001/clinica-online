import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MiPerfilComponent } from 'src/app/mi-perfil/mi-perfil.component';
import { MisHorariosComponent } from 'src/app/mi-perfil/mis-horarios/mis-horarios.component';
import { FormsModule } from '@angular/forms';
import { EspecialistaService } from 'src/app/services/especialista.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routes: Routes = [
  {path: '', component:MiPerfilComponent, data: {animation: 'HomePage'}},
  {path: 'mis-horarios', component:MisHorariosComponent, canActivate: [EspecialistaService]}
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
