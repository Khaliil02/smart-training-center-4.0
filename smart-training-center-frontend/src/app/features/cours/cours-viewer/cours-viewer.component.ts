import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CoursDto, InscriptionCoursDto, EvaluationDto } from '../../../core/models';

@Component({
  selector: 'app-cours-viewer',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div *ngIf="!loading && cours">
        <!-- Header with back button -->
        <div class="viewer-header">
          <button mat-icon-button [routerLink]="['/cours', cours.id]" matTooltip="Retour au detail">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h2>{{ cours.titre }}</h2>
        </div>

        <!-- Progression Bar -->
        <mat-card class="progression-card" *ngIf="inscription">
          <mat-card-content>
            <div class="progression-header">
              <h3>Votre progression</h3>
              <span class="progression-percentage">{{ inscription.progression }}%</span>
            </div>
            <mat-progress-bar mode="determinate"
                              [value]="inscription.progression"
                              [color]="inscription.progression >= 80 ? 'primary' : 'accent'">
            </mat-progress-bar>

            <div class="progression-status">
              <!-- Module valide -->
              <div class="status-valid" *ngIf="inscription.progression >= 80">
                <mat-icon>check_circle</mat-icon>
                <span>Module valide</span>
              </div>
              <!-- Module verrouille -->
              <div class="status-locked" *ngIf="inscription.progression < 80">
                <mat-icon>lock</mat-icon>
                <span>Modules suivants verrouilles - Score requis : 80%</span>
              </div>
            </div>

            <div class="progression-actions">
              <button mat-raised-button color="primary"
                      *ngIf="inscription.progression < 100"
                      (click)="marquerTermine()"
                      [disabled]="completing">
                <mat-icon>done_all</mat-icon>
                Marquer comme termine
              </button>

              <button mat-raised-button color="accent"
                      *ngIf="evaluation"
                      [routerLink]="['/evaluations', evaluation.id, 'take']">
                <mat-icon>quiz</mat-icon>
                Passer l'evaluation
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Course Content -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>Contenu du cours</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="cours-contenu" [innerHTML]="cours.contenu"></div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .viewer-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .viewer-header h2 {
      color: #1a237e;
      margin: 0;
      font-size: 26px;
      font-weight: 600;
    }
    .progression-card {
      margin-bottom: 24px;
      border-left: 4px solid #1a237e;
    }
    .progression-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .progression-header h3 {
      margin: 0;
      color: #1a237e;
      font-size: 18px;
    }
    .progression-percentage {
      font-size: 24px;
      font-weight: 700;
      color: #1a237e;
    }
    .progression-status {
      margin-top: 16px;
    }
    .status-valid {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2e7d32;
      font-weight: 500;
      font-size: 15px;
    }
    .status-valid mat-icon {
      color: #2e7d32;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .status-locked {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #e65100;
      font-weight: 500;
      font-size: 15px;
    }
    .status-locked mat-icon {
      color: #e65100;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .progression-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .content-card {
      margin-bottom: 24px;
    }
    .content-card mat-card-header {
      padding: 16px 16px 12px;
    }
    .cours-contenu {
      padding: 20px 0;
      line-height: 1.8;
      color: #333;
      font-size: 15px;
    }
    .cours-contenu h1, .cours-contenu h2, .cours-contenu h3 {
      color: #1a237e;
    }
    .cours-contenu pre {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
    .cours-contenu code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class CoursViewerComponent implements OnInit {
  cours: CoursDto | null = null;
  inscription: InscriptionCoursDto | null = null;
  evaluation: EvaluationDto | null = null;
  loading = true;
  completing = false;
  coursId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.coursId = +params['id'];
      this.loadData();
    });
  }

  loadData(): void {
    this.loading = true;

    // Load course
    this.api.get<CoursDto>('/cours/' + this.coursId).subscribe({
      next: (cours) => {
        this.cours = cours;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du cours', 'Fermer', { duration: 3000 });
      }
    });

    // Load inscription
    this.api.get<InscriptionCoursDto[]>('/mes-inscriptions').subscribe({
      next: (inscriptions) => {
        this.inscription = inscriptions.find(i => i.coursId === this.coursId) || null;
      }
    });

    // Load evaluation if exists
    this.api.get<EvaluationDto[]>('/evaluations').subscribe({
      next: (evaluations) => {
        this.evaluation = evaluations.find(e => e.coursId === this.coursId) || null;
      }
    });
  }

  marquerTermine(): void {
    if (!this.inscription) return;

    this.completing = true;
    this.api.put('/inscriptions/' + this.inscription.id + '/progression', { progression: 100 }).subscribe({
      next: () => {
        this.completing = false;
        if (this.inscription) {
          this.inscription.progression = 100;
        }
        this.snackBar.open('Cours marque comme termine !', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.completing = false;
        this.snackBar.open('Erreur lors de la mise a jour', 'Fermer', { duration: 3000 });
      }
    });
  }
}
