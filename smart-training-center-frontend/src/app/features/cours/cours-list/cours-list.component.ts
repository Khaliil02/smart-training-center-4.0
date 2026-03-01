import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CoursDto } from '../../../core/models';

@Component({
  selector: 'app-cours-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h2>Liste des cours</h2>
          <p class="subtitle">Gerez et consultez l'ensemble des cours disponibles</p>
        </div>
        <button mat-raised-button color="primary"
                *ngIf="canCreate"
                routerLink="/cours/create">
          <mat-icon>add</mat-icon>
          Creer un cours
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher un cours</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (keyup)="applyFilter($event)" placeholder="Titre, filiere, enseignant..." #filterInput>
      </mat-form-field>

      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="dataSource" matSort class="cours-table">

          <ng-container matColumnDef="titre">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Titre</th>
            <td mat-cell *matCellDef="let cours">{{ cours.titre }}</td>
          </ng-container>

          <ng-container matColumnDef="filiere">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Filiere</th>
            <td mat-cell *matCellDef="let cours">{{ cours.filiere }}</td>
          </ng-container>

          <ng-container matColumnDef="niveau">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Niveau</th>
            <td mat-cell *matCellDef="let cours">{{ cours.niveau }}</td>
          </ng-container>

          <ng-container matColumnDef="enseignantNom">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Enseignant</th>
            <td mat-cell *matCellDef="let cours">{{ cours.enseignantNom }}</td>
          </ng-container>

          <ng-container matColumnDef="dureeEstimee">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Duree (h)</th>
            <td mat-cell *matCellDef="let cours">{{ cours.dureeEstimee }}</td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let cours">
              <span class="statut-badge" [ngClass]="getStatutClass(cours.statut)">
                {{ cours.statut }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="nombreInscrits">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Inscrits</th>
            <td mat-cell *matCellDef="let cours">{{ cours.nombreInscrits }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let cours">
              <button mat-stroked-button color="primary"
                      (click)="voirCours(cours.id, $event)"
                      matTooltip="Voir les details">
                <mat-icon>visibility</mat-icon>
                Voir
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              (click)="navigateToCours(row.id)"
              class="clickable-row"></tr>

          <tr class="mat-row no-data-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              Aucun cours trouve correspondant au filtre "{{ filterInput.value }}"
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                       showFirstLastButtons
                       aria-label="Selectionner la page">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-left h2 {
      color: #1a237e;
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .subtitle {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .search-field {
      width: 100%;
      max-width: 500px;
      margin-bottom: 16px;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .table-container {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .cours-table {
      width: 100%;
    }
    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .clickable-row:hover {
      background-color: #f5f5f5;
    }
    .statut-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .statut-brouillon {
      background-color: #e0e0e0;
      color: #616161;
    }
    .statut-publie {
      background-color: #c8e6c9;
      color: #2e7d32;
    }
    .statut-archive {
      background-color: #ffe0b2;
      color: #e65100;
    }
    .no-data-row td {
      text-align: center;
      padding: 48px 16px;
      color: #999;
      font-style: italic;
    }
    th.mat-header-cell {
      font-weight: 600;
      color: #333;
      font-size: 13px;
    }
  `]
})
export class CoursListComponent implements OnInit {
  displayedColumns: string[] = ['titre', 'filiere', 'niveau', 'enseignantNom', 'dureeEstimee', 'statut', 'nombreInscrits', 'actions'];
  dataSource = new MatTableDataSource<CoursDto>([]);
  loading = true;
  canCreate = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canCreate = this.auth.hasAnyRole(['ENSEIGNANT', 'ADMINISTRATEUR']);
    this.loadCours();
  }

  loadCours(): void {
    this.loading = true;
    this.api.get<CoursDto[]>('/cours').subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatutClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'BROUILLON': return 'statut-brouillon';
      case 'PUBLIE': return 'statut-publie';
      case 'ARCHIVE': return 'statut-archive';
      default: return 'statut-brouillon';
    }
  }

  navigateToCours(id: number): void {
    this.router.navigate(['/cours', id]);
  }

  voirCours(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/cours', id]);
  }
}
