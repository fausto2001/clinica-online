import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from 'src/app/usuarios/usuarios.component';
import { AdminService } from 'src/app/services/admin.service';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {path: '', component: UsuariosComponent, canActivate: [AdminService]}
]

@NgModule({
  declarations: [UsuariosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule
  ],
  schemas:[
    NO_ERRORS_SCHEMA
  ]
})

export class UsuariosModule { }
