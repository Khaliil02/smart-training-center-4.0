import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Liste des utilisateurs</h2>
        <button mat-flat-button color="primary" (click)="addUser()">
          <mat-icon>person_add</mat-icon>
          Ajouter un utilisateur
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher un utilisateur</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" placeholder="Nom, prenom ou email..." />
        <button mat-icon-button matSuffix *ngIf="searchTerm" (click)="searchTerm = ''; applyFilter()">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="filteredUsers" class="full-width-table">

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let row">{{ row.nom }}</td>
          </ng-container>

          <ng-container matColumnDef="prenom">
            <th mat-header-cell *matHeaderCellDef>Prenom</th>
            <td mat-cell *matCellDef="let row">{{ row.prenom }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let row">{{ row.email }}</td>
          </ng-container>

          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>Roles</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip-set>
                <mat-chip *ngFor="let role of row.roles" [class]="'role-chip'">
                  {{ formatRole(role) }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="etatCompte">
            <th mat-header-cell *matHeaderCellDef>Etat du compte</th>
            <td mat-cell *matCellDef="let row">
              <span class="status-badge" [ngClass]="{
                'status-actif': row.etatCompte === 'ACTIF',
                'status-inactif': row.etatCompte === 'INACTIF',
                'status-suspendu': row.etatCompte === 'SUSPENDU'
              }">{{ row.etatCompte }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="dateInscription">
            <th mat-header-cell *matHeaderCellDef>Date inscription</th>
            <td mat-cell *matCellDef="let row">{{ row.dateInscription | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" matTooltip="Voir le detail" (click)="viewUser(row)">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row" (click)="viewUser(row)"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucun utilisateur trouve
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h2 { color: #1a237e; margin: 0; font-size: 24px; }
    }
    .search-field { width: 100%; margin-bottom: 16px; }
    .loading-shade {
      display: flex; justify-content: center; align-items: center; padding: 48px 0;
    }
    .table-container {
      background: white; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;
    }
    .full-width-table { width: 100%; }
    .no-data { text-align: center; padding: 24px; color: #999; }
    th.mat-header-cell { font-weight: 600; color: #333; }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background-color: #f5f5f5; }
    .status-badge {
      padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;
      text-transform: uppercase;
    }
    .status-actif { background-color: #e8f5e9; color: #2e7d32; }
    .status-inactif { background-color: #eeeeee; color: #616161; }
    .status-suspendu { background-color: #ffebee; color: #c62828; }
    .role-chip { font-size: 11px; }
  `]
})
export class UserListComponent implements OnInit {
  users: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  displayedColumns = ['nom', 'prenom', 'email', 'roles', 'etatCompte', 'dateInscription', 'actions'];
  loading = false;
  searchTerm = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<Utilisateur[]>('/utilisateurs').subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', { duration: 5000 });
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(u =>
        u.nom.toLowerCase().includes(term) ||
        u.prenom.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }
  }

  viewUser(user: Utilisateur): void {
    this.router.navigate(['/users', user.id]);
  }

  addUser(): void {
    this.router.navigate(['/auth/register']);
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '').replace(/_/g, ' ');
  }
}
