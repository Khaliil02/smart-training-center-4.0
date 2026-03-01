import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertToastComponent } from './shared/components/alert-toast/alert-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-alert-toast></app-alert-toast>
  `
})
export class AppComponent {}
