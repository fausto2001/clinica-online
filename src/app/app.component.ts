import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Usuario } from './services/auth.service';
import { fadeInAnimation, slideInAnimation } from './animations/animations.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [slideInAnimation]
})

export class AppComponent {

  prepareRoute(outlet: RouterOutlet) {
    const selectedAnimation = fadeInAnimation;
    //console.log('Selected Animation:', selectedAnimation);
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'] ? selectedAnimation : '';
  }
  

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
