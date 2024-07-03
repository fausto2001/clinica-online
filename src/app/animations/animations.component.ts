import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('300ms ease-in-out', style({ transform: 'translateX(0%)', opacity: 1 }))
    ])
  ]);

export const fadeInAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
      style({ opacity: 0 }),
      animate('500ms ease-in-out', style({ opacity: 1 }))
    ])
  ]);

@Component({
  selector: 'app-animations',
  templateUrl: './animations.component.html',
  styleUrls: ['./animations.component.css']
})
export class AnimationsComponent {

}
