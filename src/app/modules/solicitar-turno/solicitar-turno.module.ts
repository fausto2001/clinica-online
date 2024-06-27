import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SolicitarTurnoComponent } from 'src/app/solicitar-turno/solicitar-turno.component';
import { FormsModule } from '@angular/forms';

const routes:Routes = [
  {path: '', component:SolicitarTurnoComponent}
]

@NgModule({
  declarations: [SolicitarTurnoComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SolicitarTurnoModule { }
