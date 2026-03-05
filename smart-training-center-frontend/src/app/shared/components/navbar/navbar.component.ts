import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule, MatTooltipModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() menuToggle = new EventEmitter<void>();

  userName = '';
  userInitials = '';
  userEmail = '';
  userRole = '';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.updateUserInfo();
    this.authService.currentUser$.subscribe(() => this.updateUserInfo());
  }

  private updateUserInfo(): void {
    this.userName = this.authService.getUserName();
    this.userInitials = this.authService.getUserInitials();
    this.userEmail = this.authService.getUserEmail() || '';
    this.userRole = this.authService.getPrimaryRole();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
