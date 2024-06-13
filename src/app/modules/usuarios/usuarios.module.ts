import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from 'src/app/usuarios/usuarios.component';
import { AdminService } from 'src/app/services/admin.service';

const routes: Routes = [
  {path: '', component: UsuariosComponent, canActivate: [AdminService]}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})

export class UsuariosModule { }
