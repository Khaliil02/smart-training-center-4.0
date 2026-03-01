import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CoursDto, InscriptionCoursDto } from '../../../core/models';

@Component({
  selector: 'app-cours-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatTableModule, MatDividerModule, MatSnackBarModule,
    MatTooltipModule, MatTabsModule
  ],
  template: `
    <div class="page-container">
      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div *ngIf="!loading && cours">
        <!-- Header -->
        <div class="page-header">
          <button mat-icon-button routerLink="/cours" matTooltip="Retour a la liste">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-info">
            <h2>{{ cours.titre }}</h2>
            <p class="subtitle">{{ cours.description }}</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="accent"
                    *ngIf="isResponsable && cours.statut === 'BROUILLON'"
                    (click)="approuverCours()">
              <mat-icon>check_circle</mat-icon>
              Approuver
            </button>
            <button mat-raised-button color="primary"
                    *ngIf="isEtudiant && !isEnrolled"
                    (click)="sInscrire()"
                    [disabled]="enrolling">
              <mat-icon>person_add</mat-icon>
              S'inscrire
            </button>
            <button mat-raised-button color="primary"
                    *ngIf="isEtudiant && isEnrolled"
                    [routerLink]="['/cours', cours.id, 'viewer']">
              <mat-icon>play_arrow</mat-icon>
              Acceder au cours
            </button>
          </div>
        </div>

        <!-- Course Info Card -->
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>school</mat-icon>
                <div>
                  <span class="info-label">Filiere</span>
                  <span class="info-value">{{ cours.filiere }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>layers</mat-icon>
                <div>
                  <span class="info-label">Niveau</span>
                  <span class="info-value">{{ cours.niveau }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>person</mat-icon>
                <div>
                  <span class="info-label">Enseignant</span>
                  <span class="info-value">{{ cours.enseignantNom }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>timer</mat-icon>
                <div>
                  <span class="info-label">Duree estimee</span>
                  <span class="info-value">{{ cours.dureeEstimee }} heures</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>people</mat-icon>
                <div>
                  <span class="info-label">Nombre d'inscrits</span>
                  <span class="info-value">{{ cours.nombreInscrits }}</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>info</mat-icon>
                <div>
                  <span class="info-label">Statut</span>
                  <span class="statut-badge" [ngClass]="getStatutClass(cours.statut)">
                    {{ cours.statut }}
                  </span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Student Progression -->
        <mat-card class="progression-card" *ngIf="isEtudiant && isEnrolled && myInscription">
          <mat-card-content>
            <h3>Ma progression</h3>
            <div class="progression-bar-container">
              <mat-progress-bar mode="determinate" [value]="myInscription.progression"></mat-progress-bar>
              <span class="progression-label">{{ myInscription.progression }}%</span>
            </div>
            <div class="progression-details">
              <span>Note finale: {{ myInscription.noteFinale ?? 'Non evaluee' }}</span>
              <span>Etat: {{ myInscription.etat }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Course Content -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>Contenu du cours</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="cours-contenu" [innerHTML]="cours.contenu"></div>
          </mat-card-content>
        </mat-card>

        <!-- Enrolled Students Table (ENSEIGNANT / ADMIN) -->
        <mat-card class="students-card" *ngIf="isEnseignantOrAdmin && inscriptions.length > 0">
          <mat-card-header>
            <mat-card-title>Etudiants inscrits ({{ inscriptions.length }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="inscriptions" class="students-table">

              <ng-container matColumnDef="etudiantNom">
                <th mat-header-cell *matHeaderCellDef>Etudiant</th>
                <td mat-cell *matCellDef="let insc">{{ insc.etudiantNom }}</td>
              </ng-container>

              <ng-container matColumnDef="etudiantMatricule">
                <th mat-header-cell *matHeaderCellDef>Matricule</th>
                <td mat-cell *matCellDef="let insc">{{ insc.etudiantMatricule }}</td>
              </ng-container>

              <ng-container matColumnDef="progression">
                <th mat-header-cell *matHeaderCellDef>Progression</th>
                <td mat-cell *matCellDef="let insc">
                  <div class="mini-progress">
                    <mat-progress-bar mode="determinate" [value]="insc.progression"></mat-progress-bar>
                    <span>{{ insc.progression }}%</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="noteFinale">
                <th mat-header-cell *matHeaderCellDef>Note</th>
                <td mat-cell *matCellDef="let insc">{{ insc.noteFinale ?? '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="etat">
                <th mat-header-cell *matHeaderCellDef>Etat</th>
                <td mat-cell *matCellDef="let insc">
                  <span class="etat-badge" [ngClass]="'etat-' + insc.etat?.toLowerCase()">
                    {{ insc.etat }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="inscriptionColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: inscriptionColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .page-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }
    .header-info {
      flex: 1;
    }
    .header-info h2 {
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
      flex-shrink: 0;
    }
    .info-card {
      margin-bottom: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
      padding: 8px 0;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .info-item mat-icon {
      color: #1a237e;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .info-label {
      display: block;
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      display: block;
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }
    .statut-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .statut-brouillon { background-color: #e0e0e0; color: #616161; }
    .statut-publie { background-color: #c8e6c9; color: #2e7d32; }
    .statut-archive { background-color: #ffe0b2; color: #e65100; }
    .progression-card {
      margin-bottom: 24px;
    }
    .progression-card h3 {
      color: #1a237e;
      margin: 0 0 12px 0;
    }
    .progression-bar-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .progression-bar-container mat-progress-bar {
      flex: 1;
    }
    .progression-label {
      font-weight: 600;
      color: #1a237e;
      min-width: 48px;
      text-align: right;
    }
    .progression-details {
      display: flex;
      gap: 24px;
      margin-top: 12px;
      color: #666;
      font-size: 14px;
    }
    .content-card {
      margin-bottom: 24px;
    }
    .cours-contenu {
      padding: 16px 0;
      line-height: 1.7;
      color: #333;
    }
    .students-card {
      margin-bottom: 24px;
    }
    .students-table {
      width: 100%;
    }
    .mini-progress {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mini-progress mat-progress-bar {
      width: 100px;
    }
    .mini-progress span {
      font-size: 13px;
      color: #666;
      min-width: 40px;
    }
    .etat-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .etat-en_cours { background-color: #e3f2fd; color: #1565c0; }
    .etat-termine { background-color: #c8e6c9; color: #2e7d32; }
    .etat-abandonne { background-color: #ffcdd2; color: #c62828; }
    th.mat-header-cell {
      font-weight: 600;
      color: #333;
    }
  `]
})
export class CoursDetailComponent implements OnInit {
  cours: CoursDto | null = null;
  inscriptions: InscriptionCoursDto[] = [];
  myInscription: InscriptionCoursDto | null = null;
  loading = true;
  enrolling = false;
  isEtudiant = false;
  isEnrolled = false;
  isEnseignantOrAdmin = false;
  isResponsable = false;
  coursId!: number;

  inscriptionColumns: string[] = ['etudiantNom', 'etudiantMatricule', 'progression', 'noteFinale', 'etat'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isEtudiant = this.auth.hasRole('ETUDIANT');
    this.isEnseignantOrAdmin = this.auth.hasAnyRole(['ENSEIGNANT', 'ADMINISTRATEUR']);
    this.isResponsable = this.auth.hasRole('RESPONSABLE_ACADEMIQUE');

    this.route.params.subscribe(params => {
      this.coursId = +params['id'];
      this.loadCours();
    });
  }

  loadCours(): void {
    this.loading = true;
    this.api.get<CoursDto>('/cours/' + this.coursId).subscribe({
      next: (cours) => {
        this.cours = cours;
        this.loading = false;

        if (this.isEnseignantOrAdmin || this.isResponsable) {
          this.loadInscriptions();
        }

        if (this.isEtudiant) {
          this.checkEnrollment();
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du cours', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadInscriptions(): void {
    this.api.get<InscriptionCoursDto[]>('/cours/' + this.coursId + '/inscriptions').subscribe({
      next: (data) => {
        this.inscriptions = data;
      }
    });
  }

  checkEnrollment(): void {
    this.api.get<InscriptionCoursDto[]>('/cours/' + this.coursId + '/inscriptions').subscribe({
      next: (data) => {
        const userEmail = this.auth.getUserEmail();
        this.myInscription = data.find(i => i.coursId === this.coursId) || null;
        this.isEnrolled = !!this.myInscription;
      }
    });
  }

  sInscrire(): void {
    this.enrolling = true;
    this.api.post('/inscriptions', { coursId: this.coursId }).subscribe({
      next: () => {
        this.enrolling = false;
        this.isEnrolled = true;
        this.snackBar.open('Inscription reussie !', 'Fermer', { duration: 3000 });
        this.loadCours();
      },
      error: () => {
        this.enrolling = false;
        this.snackBar.open('Erreur lors de l\'inscription', 'Fermer', { duration: 3000 });
      }
    });
  }

  approuverCours(): void {
    this.api.put('/cours/' + this.coursId + '/approve').subscribe({
      next: () => {
        this.snackBar.open('Cours approuve avec succes', 'Fermer', { duration: 3000 });
        this.loadCours();
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'approbation', 'Fermer', { duration: 3000 });
      }
    });
  }

  getStatutClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'BROUILLON': return 'statut-brouillon';
      case 'PUBLIE': return 'statut-publie';
      case 'ARCHIVE': return 'statut-archive';
      default: return 'statut-brouillon';
    }
  }
}
