import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class EspecialistaService {
  constructor(private service:AuthService, private router: Router){}

  canActivate():boolean{
    if(this.service.esEspecialista())
    {
      return true;
    }
    else
    {
      Swal.fire({
        title: "No tiene acceso!",
        text: "Solo los especialistas tienen acceso a esta página.",
        icon: "error"
      })
      this.router.navigate(['/login']);
      return false;
    }
  }
}
