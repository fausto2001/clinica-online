import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from 'src/app/usuarios/usuarios.component';
import { AdminService } from 'src/app/services/admin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistroAdminComponent } from 'src/app/usuarios/registro-admin/registro-admin.component';
import { BaseChartDirective } from 'ng2-charts';

const routes: Routes = [
  {path: '', component: UsuariosComponent, canActivate: [AdminService]},
  {path: 'registro-admin', component: RegistroAdminComponent, canActivate: [AdminService]}
]

@NgModule({
  declarations: [UsuariosComponent, RegistroAdminComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BaseChartDirective,
    RouterModule.forChild(routes)
  ],
  schemas:[
    NO_ERRORS_SCHEMA
  ]
})

export class UsuariosModule { }
