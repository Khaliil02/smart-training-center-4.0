import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatTooltipModule, MatDividerModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  userName = '';
  userInitials = '';
  userRole = '';

  constructor(public authService: AuthService) {}

  private allNavItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', roles: ['ENSEIGNANT', 'ADMINISTRATEUR', 'RESPONSABLE_ACADEMIQUE'] },
    { label: 'Cours', icon: 'school', route: '/cours' },
    { label: 'Evaluations', icon: 'quiz', route: '/evaluations' },
    { label: 'Catalogue', icon: 'category', route: '/catalogue', children: [
      { label: 'Filieres', icon: 'folder', route: '/catalogue/filieres' },
      { label: 'Specialites', icon: 'bookmark', route: '/catalogue/specialites' },
      { label: 'Matieres', icon: 'subject', route: '/catalogue/matieres' },
      { label: 'Certifications', icon: 'verified', route: '/catalogue/certifications' }
    ]},
    { label: 'Salles', icon: 'meeting_room', route: '/salles' },
    { label: 'Presence', icon: 'how_to_reg', route: '/presence' },
    { label: 'Utilisateurs', icon: 'people', route: '/users', roles: ['ADMINISTRATEUR'] },
    { label: 'Alertes', icon: 'notification_important', route: '/alerts', roles: ['ADMINISTRATEUR'] },
    { label: 'Appareils IoT', icon: 'devices', route: '/devices', roles: ['ADMINISTRATEUR'] },
    { label: 'Bulletins', icon: 'description', route: '/bulletins' },
    { label: 'Audit', icon: 'history', route: '/audit', roles: ['ADMINISTRATEUR'] }
  ];

  navItems: NavItem[] = [];

  ngOnInit(): void {
    this.navItems = this.allNavItems.filter(item => this.isVisible(item));
    this.userName = this.authService.getUserName();
    this.userInitials = this.authService.getUserInitials();
    this.userRole = this.authService.getPrimaryRole();
  }

  isVisible(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(role => this.authService.hasRole(role));
  }

  expandedItem: string | null = null;

  toggleExpand(label: string): void {
    this.expandedItem = this.expandedItem === label ? null : label;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
