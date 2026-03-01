import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { SalleDto } from '../../../core/models/salle.model';
import { PresenceDto } from '../../../core/models/presence.model';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatInputModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatDividerModule, DatePipe
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <h2>Rapport de presence</h2>
        <p class="subtitle">Consultation et export des rapports de presence</p>
      </div>

      <!-- Filter Bar -->
      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Salle</mat-label>
              <mat-select formControlName="salleId">
                <mat-option [value]="null">Toutes les salles</mat-option>
                <mat-option *ngFor="let salle of salles" [value]="salle.id">
                  {{ salle.nomSalle }} ({{ salle.type }})
                </mat-option>
              </mat-select>
              <mat-icon matPrefix>meeting_room</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Date debut</mat-label>
              <input matInput [matDatepicker]="pickerDebut" formControlName="debut">
              <mat-datepicker-toggle matSuffix [for]="pickerDebut"></mat-datepicker-toggle>
              <mat-datepicker #pickerDebut></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Date fin</mat-label>
              <input matInput [matDatepicker]="pickerFin" formControlName="fin">
              <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
              <mat-datepicker #pickerFin></mat-datepicker>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="applyFilter()">
                <mat-icon>search</mat-icon>
                Filtrer
              </button>
              <button mat-button (click)="resetFilter()">
                <mat-icon>clear</mat-icon>
                Reinitialiser
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Summary Section -->
      <div class="summary-row" *ngIf="presences.length > 0">
        <mat-card class="summary-card">
          <div class="summary-icon total-icon">
            <mat-icon>checklist</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-label">Total presences</span>
            <span class="summary-value">{{ presences.length }}</span>
          </div>
        </mat-card>
        <mat-card class="summary-card">
          <div class="summary-icon unique-icon">
            <mat-icon>people</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-label">Nombre d'etudiants uniques</span>
            <span class="summary-value">{{ uniqueStudentCount }}</span>
          </div>
        </mat-card>
      </div>

      <!-- Data Table -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>table_chart</mat-icon>
            Resultats
          </mat-card-title>
          <span class="spacer"></span>
          <button mat-stroked-button color="primary" (click)="exportCsv()"
                  *ngIf="presences.length > 0">
            <mat-icon>download</mat-icon>
            Exporter en CSV
          </button>
        </mat-card-header>
        <mat-card-content>
          <div class="loading-container" *ngIf="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Chargement des donnees...</p>
          </div>

          <div class="table-responsive" *ngIf="!loading && presences.length > 0; else noData">
            <table mat-table [dataSource]="presences" class="full-width-table">
              <ng-container matColumnDef="etudiant">
                <th mat-header-cell *matHeaderCellDef>Etudiant</th>
                <td mat-cell *matCellDef="let p">{{ p.etudiantNom }}</td>
              </ng-container>
              <ng-container matColumnDef="matricule">
                <th mat-header-cell *matHeaderCellDef>Matricule</th>
                <td mat-cell *matCellDef="let p"><code>{{ p.etudiantMatricule }}</code></td>
              </ng-container>
              <ng-container matColumnDef="salle">
                <th mat-header-cell *matHeaderCellDef>Salle</th>
                <td mat-cell *matCellDef="let p">{{ p.salleNom }}</td>
              </ng-container>
              <ng-container matColumnDef="methode">
                <th mat-header-cell *matHeaderCellDef>Methode</th>
                <td mat-cell *matCellDef="let p">
                  <span class="method-badge">{{ p.methode }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="source">
                <th mat-header-cell *matHeaderCellDef>Source</th>
                <td mat-cell *matCellDef="let p">{{ p.source }}</td>
              </ng-container>
              <ng-container matColumnDef="dateHeure">
                <th mat-header-cell *matHeaderCellDef>Date / Heure</th>
                <td mat-cell *matCellDef="let p">{{ p.dateHeure | date:'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          <ng-template #noData>
            <p class="empty-text" *ngIf="!loading">
              {{ hasFiltered ? 'Aucun resultat pour les filtres selectionnes' : 'Selectionnez une salle et appliquez les filtres pour voir les resultats' }}
            </p>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; }
    .page-header {
      margin-bottom: 24px;
      h2 { color: #1a237e; margin: 0; font-size: 24px; }
      .subtitle { color: #666; margin: 4px 0 0; }
    }

    .filter-card {
      margin-bottom: 24px;
    }
    .filter-form {
      display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; padding-top: 8px;
    }
    .filter-field { flex: 1; min-width: 200px; }
    .filter-actions {
      display: flex; gap: 8px; align-items: center; padding-top: 4px;
    }

    .summary-row {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;
    }
    .summary-card {
      display: flex; align-items: center; gap: 16px; padding: 20px !important;
    }
    .summary-icon {
      display: flex; align-items: center; justify-content: center;
      width: 52px; height: 52px; border-radius: 50%; color: white;
    }
    .total-icon { background: #1565c0; }
    .unique-icon { background: #6a1b9a; }
    .summary-info { display: flex; flex-direction: column; }
    .summary-label { font-size: 13px; color: #888; text-transform: uppercase; }
    .summary-value { font-size: 28px; font-weight: 700; color: #333; }

    .section-card {
      margin-bottom: 20px;
      mat-card-header {
        display: flex; align-items: center;
        mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; margin: 0; }
      }
    }
    .spacer { flex: 1; }
    .loading-container {
      display: flex; flex-direction: column; align-items: center; padding: 48px;
      p { color: #666; margin-top: 16px; }
    }
    .table-responsive { overflow-x: auto; }
    .full-width-table { width: 100%; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .method-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      background: #e3f2fd; color: #1565c0; font-size: 12px; font-weight: 500;
    }
    .empty-text { color: #999; text-align: center; padding: 32px; }

    @media (max-width: 768px) {
      .filter-form { flex-direction: column; }
      .filter-field { min-width: 100%; }
      .summary-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AttendanceReportComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  filterForm!: FormGroup;
  salles: SalleDto[] = [];
  presences: PresenceDto[] = [];
  loading = false;
  hasFiltered = false;
  uniqueStudentCount = 0;

  displayedColumns = ['etudiant', 'matricule', 'salle', 'methode', 'source', 'dateHeure'];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      salleId: [null],
      debut: [null],
      fin: [null]
    });

    this.loadSalles();
  }

  private loadSalles(): void {
    this.api.get<SalleDto[]>('/salles').subscribe({
      next: (data) => { this.salles = data; }
    });
  }

  applyFilter(): void {
    const { salleId, debut, fin } = this.filterForm.value;
    if (!salleId) {
      this.snackBar.open('Veuillez selectionner une salle', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.hasFiltered = true;

    const params: any = {};
    if (debut) {
      params.debut = this.formatDate(debut);
    }
    if (fin) {
      params.fin = this.formatDate(fin);
    }

    this.api.get<PresenceDto[]>('/salles/' + salleId + '/presences', params).subscribe({
      next: (data) => {
        this.presences = data;
        this.computeStats();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des donnees', 'Fermer', { duration: 3000 });
      }
    });
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.presences = [];
    this.hasFiltered = false;
    this.uniqueStudentCount = 0;
  }

  private computeStats(): void {
    const uniqueIds = new Set(this.presences.map(p => p.etudiantId));
    this.uniqueStudentCount = uniqueIds.size;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  exportCsv(): void {
    if (this.presences.length === 0) return;

    const headers = ['Etudiant', 'Matricule', 'Salle', 'Methode', 'Source', 'Date/Heure'];
    const rows = this.presences.map(p => [
      p.etudiantNom,
      p.etudiantMatricule,
      p.salleNom,
      p.methode,
      p.source,
      p.dateHeure
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_presence_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    this.snackBar.open('Export CSV telecharge avec succes', 'Fermer', { duration: 3000 });
  }
}
