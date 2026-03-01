import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { BulletinDto, BulletinLigneDto } from '../../../core/models/bulletin.model';

@Component({
  selector: 'app-bulletin-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatDividerModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h2>Bulletin de Notes</h2>
          <p class="subtitle">Consultez le releve de notes de l'etudiant</p>
        </div>
        <div class="header-actions" *ngIf="bulletin">
          <button mat-raised-button (click)="printBulletin()">
            <mat-icon>print</mat-icon>
            Imprimer
          </button>
          <button mat-button disabled matTooltip="Fonctionnalite a venir">
            <mat-icon>picture_as_pdf</mat-icon>
            Exporter en PDF
          </button>
        </div>
      </div>

      <!-- Search for ADMIN -->
      <mat-card class="search-card" *ngIf="isAdmin">
        <mat-card-content>
          <div class="search-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>ID de l'etudiant</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput type="number" [(ngModel)]="searchId"
                     placeholder="Saisissez l'identifiant de l'etudiant"
                     (keyup.enter)="loadBulletin()">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="loadBulletin()"
                    [disabled]="!searchId">
              <mat-icon>search</mat-icon>
              Rechercher
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement du bulletin...</p>
      </div>

      <!-- Bulletin Content -->
      <div class="bulletin-content print-area" *ngIf="!loading && bulletin">
        <!-- Student Info Header -->
        <mat-card class="student-header-card">
          <mat-card-content>
            <div class="bulletin-title-section">
              <div class="institution-logo">
                <mat-icon class="institution-icon">school</mat-icon>
              </div>
              <div class="bulletin-title">
                <h1>Bulletin de Notes</h1>
                <p class="institution-name">Smart Training Center 4.0</p>
              </div>
            </div>
            <mat-divider></mat-divider>
            <div class="student-info-grid">
              <div class="student-info-item">
                <span class="label">Nom</span>
                <span class="value">{{ bulletin.etudiantNom }}</span>
              </div>
              <div class="student-info-item">
                <span class="label">Prenom</span>
                <span class="value">{{ bulletin.etudiantPrenom }}</span>
              </div>
              <div class="student-info-item">
                <span class="label">Matricule</span>
                <span class="value matricule">{{ bulletin.matricule }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Grades Table -->
        <mat-card class="grades-card">
          <mat-card-content>
            <table mat-table [dataSource]="bulletin.lignes" class="grades-table">

              <ng-container matColumnDef="coursTitre">
                <th mat-header-cell *matHeaderCellDef>Cours</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.coursTitre }}</td>
              </ng-container>

              <ng-container matColumnDef="filiere">
                <th mat-header-cell *matHeaderCellDef>Filiere</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.filiere }}</td>
              </ng-container>

              <ng-container matColumnDef="noteFinale">
                <th mat-header-cell *matHeaderCellDef>Note Finale</th>
                <td mat-cell *matCellDef="let ligne">
                  <span class="note" [ngClass]="getNoteClass(ligne.noteFinale)">
                    {{ ligne.noteFinale | number:'1.2-2' }} / 20
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="progression">
                <th mat-header-cell *matHeaderCellDef>Progression</th>
                <td mat-cell *matCellDef="let ligne">
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="ligne.progression"
                           [ngClass]="getProgressClass(ligne.progression)"></div>
                    </div>
                    <span class="progress-text">{{ ligne.progression | number:'1.0-0' }}%</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="coefficient">
                <th mat-header-cell *matHeaderCellDef>Coefficient</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.coefficient }}</td>
              </ng-container>

              <ng-container matColumnDef="notePonderee">
                <th mat-header-cell *matHeaderCellDef>Note Ponderee</th>
                <td mat-cell *matCellDef="let ligne">
                  {{ ligne.notePonderee | number:'1.2-2' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="etat">
                <th mat-header-cell *matHeaderCellDef>Etat</th>
                <td mat-cell *matCellDef="let ligne">
                  <span class="etat-badge" [ngClass]="getEtatClass(ligne.etat)">
                    {{ getEtatLabel(ligne.etat) }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- Average Footer -->
        <mat-card class="average-card" [ngClass]="getMoyenneCardClass()">
          <mat-card-content>
            <div class="average-display">
              <div class="average-label">
                <mat-icon>emoji_events</mat-icon>
                <span>Moyenne Generale</span>
              </div>
              <div class="average-value" [ngClass]="getMoyenneClass()">
                {{ bulletin.moyenneGenerale | number:'1.2-2' }} / 20
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Error / Empty State -->
      <div class="empty-state" *ngIf="!loading && !bulletin && hasSearched">
        <mat-icon>school</mat-icon>
        <p>Aucun bulletin trouve pour cet etudiant</p>
      </div>

      <div class="empty-state" *ngIf="!loading && !bulletin && !hasSearched && isAdmin">
        <mat-icon>search</mat-icon>
        <p>Saisissez un identifiant d'etudiant pour consulter son bulletin</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1100px;
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
    .header-actions {
      display: flex;
      gap: 8px;
    }
    .search-card {
      margin-bottom: 20px;
    }
    .search-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .search-field {
      flex: 1;
      max-width: 400px;
    }
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      p { color: #666; margin-top: 16px; }
    }

    /* Bulletin Styles */
    .bulletin-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .student-header-card {
      border-top: 4px solid #1a237e;
    }
    .bulletin-title-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      padding: 8px 0;
    }
    .institution-logo {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1565c0, #1a237e);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .institution-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }
    .bulletin-title h1 {
      margin: 0;
      font-size: 24px;
      color: #1a237e;
      font-weight: 700;
    }
    .bulletin-title .institution-name {
      margin: 4px 0 0;
      color: #666;
      font-size: 14px;
    }
    .student-info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 16px;
    }
    .student-info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .student-info-item .label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .student-info-item .value {
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }
    .student-info-item .matricule {
      font-family: 'Roboto Mono', monospace;
      background: #f5f5f5;
      padding: 4px 10px;
      border-radius: 4px;
      display: inline-block;
    }

    /* Grades Table */
    .grades-card {
      overflow: hidden;
    }
    .grades-table {
      width: 100%;
    }
    th.mat-header-cell {
      font-weight: 600;
      color: #333;
      font-size: 13px;
      background-color: #fafafa;
    }
    .note {
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .note-green {
      color: #2e7d32;
      background-color: #e8f5e9;
    }
    .note-orange {
      color: #e65100;
      background-color: #fff3e0;
    }
    .note-red {
      color: #c62828;
      background-color: #ffebee;
    }
    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      max-width: 100px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .progress-high { background-color: #4caf50; }
    .progress-medium { background-color: #ff9800; }
    .progress-low { background-color: #f44336; }
    .progress-text {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      min-width: 35px;
    }
    .etat-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .etat-en-cours {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    .etat-termine {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .etat-abandonne {
      background-color: #ffebee;
      color: #c62828;
    }
    .etat-default {
      background-color: #f5f5f5;
      color: #616161;
    }

    /* Average Card */
    .average-card {
      border-radius: 12px;
      overflow: hidden;
    }
    .moyenne-card-green {
      border-left: 5px solid #4caf50;
    }
    .moyenne-card-orange {
      border-left: 5px solid #ff9800;
    }
    .moyenne-card-red {
      border-left: 5px solid #f44336;
    }
    .average-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 8px;
    }
    .average-label {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #ffc107;
      }
    }
    .average-value {
      font-size: 36px;
      font-weight: 700;
    }
    .moyenne-green { color: #2e7d32; }
    .moyenne-orange { color: #e65100; }
    .moyenne-red { color: #c62828; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      color: #999;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
      p { font-size: 16px; }
    }

    /* Print Styles */
    @media print {
      .page-header, .search-card, .header-actions {
        display: none !important;
      }
      .page-container {
        padding: 0;
        max-width: 100%;
      }
      .bulletin-content {
        gap: 12px;
      }
      mat-card {
        box-shadow: none !important;
        border: 1px solid #ddd;
      }
      .progress-bar {
        border: 1px solid #ccc;
      }
    }
  `]
})
export class BulletinViewComponent implements OnInit {
  displayedColumns: string[] = [
    'coursTitre', 'filiere', 'noteFinale', 'progression',
    'coefficient', 'notePonderee', 'etat'
  ];
  bulletin: BulletinDto | null = null;
  loading = false;
  isAdmin = false;
  isEtudiant = false;
  hasSearched = false;
  searchId: number | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.hasAnyRole(['ADMINISTRATEUR', 'ENSEIGNANT']);
    this.isEtudiant = this.auth.hasRole('ETUDIANT');

    if (this.isEtudiant) {
      this.loadOwnBulletin();
    }
  }

  loadOwnBulletin(): void {
    this.loading = true;
    this.hasSearched = true;
    this.api.get<BulletinDto>('/etudiants/me/bulletin').subscribe({
      next: (data) => {
        this.bulletin = data;
        this.loading = false;
      },
      error: () => {
        this.bulletin = null;
        this.loading = false;
      }
    });
  }

  loadBulletin(): void {
    if (!this.searchId) return;
    this.loading = true;
    this.hasSearched = true;
    this.api.get<BulletinDto>('/etudiants/' + this.searchId + '/bulletin').subscribe({
      next: (data) => {
        this.bulletin = data;
        this.loading = false;
      },
      error: () => {
        this.bulletin = null;
        this.loading = false;
      }
    });
  }

  getNoteClass(note: number): string {
    if (note >= 14) return 'note-green';
    if (note >= 10) return 'note-orange';
    return 'note-red';
  }

  getProgressClass(progress: number): string {
    if (progress >= 70) return 'progress-high';
    if (progress >= 40) return 'progress-medium';
    return 'progress-low';
  }

  getEtatClass(etat: string): string {
    const classes: Record<string, string> = {
      'EN_COURS': 'etat-en-cours',
      'TERMINE': 'etat-termine',
      'ABANDONNE': 'etat-abandonne'
    };
    return classes[etat] || 'etat-default';
  }

  getEtatLabel(etat: string): string {
    const labels: Record<string, string> = {
      'EN_COURS': 'En cours',
      'TERMINE': 'Termine',
      'ABANDONNE': 'Abandonne'
    };
    return labels[etat] || etat;
  }

  getMoyenneClass(): string {
    if (!this.bulletin) return '';
    if (this.bulletin.moyenneGenerale >= 14) return 'moyenne-green';
    if (this.bulletin.moyenneGenerale >= 10) return 'moyenne-orange';
    return 'moyenne-red';
  }

  getMoyenneCardClass(): string {
    if (!this.bulletin) return '';
    if (this.bulletin.moyenneGenerale >= 14) return 'moyenne-card-green';
    if (this.bulletin.moyenneGenerale >= 10) return 'moyenne-card-orange';
    return 'moyenne-card-red';
  }

  printBulletin(): void {
    window.print();
  }
}
