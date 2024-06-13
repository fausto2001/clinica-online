import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BienvenidaComponent } from 'src/app/bienvenida/bienvenida.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: BienvenidaComponent}
]



@NgModule({
  declarations: [BienvenidaComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})

export class BienvenidaModule { }
