import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Usuario } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'clinica-online';
  usuarioActivo: Usuario | undefined;

  constructor(private authService: AuthService){}

  ngOnInit()
  {
    this.authService.currentUser.subscribe(user =>{
      this.usuarioActivo = user;
      console.log(this.usuarioActivo);
    })
  }
}
