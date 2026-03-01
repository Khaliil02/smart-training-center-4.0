import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { EvaluationDto } from '../../../core/models';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h2>Liste des evaluations</h2>
          <p class="subtitle">Consultez et gerez les evaluations des cours</p>
        </div>
        <button mat-raised-button color="primary"
                *ngIf="isEnseignant"
                routerLink="/evaluations/create">
          <mat-icon>add</mat-icon>
          Creer une evaluation
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher une evaluation</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (keyup)="applyFilter($event)" placeholder="Type, cours..." #filterInput>
      </mat-form-field>

      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="dataSource" matSort class="eval-table">

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let eval">{{ eval.type }}</td>
          </ng-container>

          <ng-container matColumnDef="coursTitre">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Cours</th>
            <td mat-cell *matCellDef="let eval">{{ eval.coursTitre }}</td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let eval">{{ eval.date | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="noteMaximale">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Note Max</th>
            <td mat-cell *matCellDef="let eval">{{ eval.noteMaximale }}</td>
          </ng-container>

          <ng-container matColumnDef="coefficient">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Coefficient</th>
            <td mat-cell *matCellDef="let eval">{{ eval.coefficient }}</td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let eval">
              <span class="statut-badge" [ngClass]="getStatutClass(eval.statut)">
                {{ eval.statut }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let eval">
              <div class="actions-cell">
                <button mat-stroked-button color="primary"
                        *ngIf="isEtudiant && eval.statut === 'PUBLIEE'"
                        [routerLink]="['/evaluations', eval.id, 'take']"
                        matTooltip="Passer l'evaluation">
                  <mat-icon>edit_note</mat-icon>
                  Passer
                </button>
                <button mat-stroked-button
                        [routerLink]="['/evaluations', eval.id, 'results']"
                        matTooltip="Voir les resultats">
                  <mat-icon>assessment</mat-icon>
                  Resultats
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row no-data-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              Aucune evaluation trouvee correspondant au filtre "{{ filterInput.value }}"
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
    .eval-table {
      width: 100%;
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
    .statut-publiee {
      background-color: #bbdefb;
      color: #1565c0;
    }
    .statut-terminee {
      background-color: #c8e6c9;
      color: #2e7d32;
    }
    .actions-cell {
      display: flex;
      gap: 8px;
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
export class EvaluationListComponent implements OnInit {
  displayedColumns: string[] = ['type', 'coursTitre', 'date', 'noteMaximale', 'coefficient', 'statut', 'actions'];
  dataSource = new MatTableDataSource<EvaluationDto>([]);
  loading = true;
  isEtudiant = false;
  isEnseignant = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isEtudiant = this.auth.hasRole('ETUDIANT');
    this.isEnseignant = this.auth.hasAnyRole(['ENSEIGNANT', 'ADMINISTRATEUR']);
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.loading = true;
    this.api.get<EvaluationDto[]>('/evaluations').subscribe({
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
      case 'PUBLIEE': return 'statut-publiee';
      case 'TERMINEE': return 'statut-terminee';
      default: return 'statut-brouillon';
    }
  }
}
