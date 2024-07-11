import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Grafico1Component } from 'src/app/grafico1/grafico1.component';
import { FormsModule } from '@angular/forms';

const routes:Routes = [
  {path: '', component:Grafico1Component}
] 



@NgModule({
  declarations: [Grafico1Component],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class Grafico1Module { }
