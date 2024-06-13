
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

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
        this.router.navigate(['/login']);
        return false;
      }
  }
}
