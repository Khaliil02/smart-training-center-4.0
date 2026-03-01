import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  get userEmail(): string {
    return this.authService.getUserEmail() || '';
  }

  get userRoles(): string[] {
    return this.authService.getRoles().map(r => r.replace('ROLE_', ''));
  }

  onLogout(): void {
    this.authService.logout();
  }
}
