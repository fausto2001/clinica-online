
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private service:AuthService, private router: Router) { }

  canActivate(): boolean{
      if(this.service.esAdmin())
      {
        return true;
      }
      else
      {
        Swal.fire({
          title: "No tiene acceso!",
          text: "Solo los administradores tienen acceso a esta página.",
          icon: "error"
        })
        this.router.navigate(['/login']);
        return false;
      }
  }
}
