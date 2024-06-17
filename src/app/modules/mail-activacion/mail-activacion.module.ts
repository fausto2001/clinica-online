import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MailActivacionComponent } from 'src/app/mail-activacion/mail-activacion.component';

const routes: Routes = [
  { path: '', component: MailActivacionComponent}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MailActivacionModule { }
