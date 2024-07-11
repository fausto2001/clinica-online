import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', loadChildren: ()=> import('./modules/bienvenida/bienvenida.module').then(m => m.BienvenidaModule)},
  {path: 'login', loadChildren: ()=>import('./modules/login/login.module').then(m => m.LoginModule)},
  {path: 'registro', loadChildren: ()=>import('./modules/registro/registro.module').then(m => m.RegistroModule)},
  {path: 'usuarios', loadChildren: ()=>import('./modules/usuarios/usuarios.module').then(m => m.UsuariosModule)},
  {path: 'mail-activacion', loadChildren: ()=>import('./modules/mail-activacion/mail-activacion.module').then(m => m.MailActivacionModule)},
  {path: 'mi-perfil', loadChildren: ()=>import('./modules/mi-perfil/mi-perfil.module').then(m => m.MiPerfilModule)},
  {path: 'solicitar-turno', loadChildren: ()=>import('./modules/solicitar-turno/solicitar-turno.module').then(m => m.SolicitarTurnoModule)},
  {path: 'turnos', loadChildren: ()=>import('./modules/turnos/turnos.module').then(m => m.TurnosModule)},
  {path: 'mis-turnos', loadChildren: ()=>import('./modules/mis-turnos/mis-turnos.module').then(m => m.MisTurnosModule)},
  {path: 'pacientes', loadChildren: ()=>import('./modules/pacientes/pacientes.module').then(m => m.PacientesModule)},
  {path: 'grafico1', loadChildren: ()=>import('./modules/grafico1/grafico1.module').then(m => m.Grafico1Module)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
