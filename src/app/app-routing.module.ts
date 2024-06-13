import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', loadChildren: ()=> import('./modules/bienvenida/bienvenida.module').then(m => m.BienvenidaModule)},
  {path: 'login', loadChildren: ()=>import('./modules/login/login.module').then(m => m.LoginModule)},
  {path: 'registro', loadChildren: ()=>import('./modules/registro/registro.module').then(m => m.RegistroModule)},
  {path: 'usuarios', loadChildren: ()=>import('./modules/usuarios/usuarios.module').then(m => m.UsuariosModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
