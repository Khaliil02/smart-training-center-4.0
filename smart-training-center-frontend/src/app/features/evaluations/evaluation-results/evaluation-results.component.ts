import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { QuizResultDto } from '../../../core/models';

@Component({
  selector: 'app-evaluation-results',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatTableModule, MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div *ngIf="!loading && result">
        <!-- Header -->
        <div class="result-header">
          <button mat-icon-button routerLink="/evaluations" matTooltip="Retour aux evaluations">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h2>Resultats : {{ result.quizTitre }}</h2>
        </div>

        <!-- Banner -->
        <div class="result-banner" [ngClass]="result.passed ? 'banner-success' : 'banner-fail'">
          <mat-icon>{{ result.passed ? 'emoji_events' : 'warning' }}</mat-icon>
          <div>
            <strong *ngIf="result.passed">Felicitations ! Module valide.</strong>
            <strong *ngIf="!result.passed">Score insuffisant. Minimum requis : {{ result.seuilValidation }}%.</strong>
          </div>
        </div>

        <!-- Score Summary -->
        <mat-card class="score-card">
          <mat-card-content>
            <div class="score-grid">
              <div class="score-item">
                <div class="score-circle" [ngClass]="result.passed ? 'circle-success' : 'circle-fail'">
                  {{ result.percentage | number:'1.0-0' }}%
                </div>
                <span class="score-desc">Pourcentage</span>
              </div>
              <div class="score-item">
                <div class="score-value">{{ result.correctAnswers }} / {{ result.totalQuestions }}</div>
                <span class="score-desc">Bonnes reponses</span>
              </div>
              <div class="score-item">
                <div class="score-value">{{ result.score | number:'1.1-1' }}</div>
                <span class="score-desc">Score</span>
              </div>
              <div class="score-item">
                <div class="score-value" [ngClass]="result.passed ? 'text-success' : 'text-fail'">
                  {{ result.passed ? 'Reussi' : 'Echoue' }}
                </div>
                <span class="score-desc">Resultat</span>
              </div>
            </div>

            <div class="progress-section">
              <mat-progress-bar mode="determinate"
                                [value]="result.percentage"
                                [color]="result.passed ? 'primary' : 'warn'">
              </mat-progress-bar>
              <div class="threshold-marker" [style.left.%]="result.seuilValidation">
                <div class="threshold-line"></div>
                <span class="threshold-label">Seuil : {{ result.seuilValidation }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Detail per question -->
        <mat-card class="details-card">
          <mat-card-header>
            <mat-card-title>Detail par question</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <table mat-table [dataSource]="result.details" class="details-table">

              <ng-container matColumnDef="numero">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let detail; let i = index">{{ i + 1 }}</td>
              </ng-container>

              <ng-container matColumnDef="enonce">
                <th mat-header-cell *matHeaderCellDef>Enonce</th>
                <td mat-cell *matCellDef="let detail">{{ detail.enonce }}</td>
              </ng-container>

              <ng-container matColumnDef="votreReponse">
                <th mat-header-cell *matHeaderCellDef>Votre reponse</th>
                <td mat-cell *matCellDef="let detail">
                  <span class="reponse-ids">{{ formatReponseIds(detail.selectedReponseIds) }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="bonneReponse">
                <th mat-header-cell *matHeaderCellDef>Bonne reponse</th>
                <td mat-cell *matCellDef="let detail">
                  <span class="reponse-ids">{{ formatReponseIds(detail.correctReponseIds) }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="resultat">
                <th mat-header-cell *matHeaderCellDef>Resultat</th>
                <td mat-cell *matCellDef="let detail">
                  <mat-icon [class]="detail.correct ? 'icon-correct' : 'icon-incorrect'">
                    {{ detail.correct ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="detailColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: detailColumns;"
                  [ngClass]="row.correct ? 'row-correct' : 'row-incorrect'"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- Actions -->
        <div class="result-actions">
          <button mat-stroked-button routerLink="/evaluations">
            <mat-icon>arrow_back</mat-icon>
            Retour aux evaluations
          </button>
        </div>
      </div>

      <!-- Error state -->
      <div *ngIf="!loading && !result" class="error-state">
        <mat-icon>error_outline</mat-icon>
        <p>Aucun resultat disponible pour cette evaluation.</p>
        <button mat-stroked-button routerLink="/evaluations">
          Retour aux evaluations
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .result-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .result-header h2 {
      color: #1a237e;
      margin: 0;
      font-size: 26px;
      font-weight: 600;
    }
    .result-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 16px;
    }
    .banner-success {
      background-color: #c8e6c9;
      color: #1b5e20;
    }
    .banner-success mat-icon {
      color: #2e7d32;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .banner-fail {
      background-color: #ffe0b2;
      color: #e65100;
    }
    .banner-fail mat-icon {
      color: #e65100;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .score-card {
      margin-bottom: 24px;
    }
    .score-grid {
      display: flex;
      justify-content: space-around;
      padding: 24px 0 16px;
      flex-wrap: wrap;
      gap: 24px;
    }
    .score-item {
      text-align: center;
    }
    .score-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
      margin: 0 auto 8px;
    }
    .circle-success {
      background-color: #c8e6c9;
      color: #2e7d32;
      border: 3px solid #2e7d32;
    }
    .circle-fail {
      background-color: #ffcdd2;
      color: #c62828;
      border: 3px solid #c62828;
    }
    .score-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a237e;
    }
    .score-desc {
      display: block;
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    .text-success { color: #2e7d32 !important; }
    .text-fail { color: #c62828 !important; }
    .progress-section {
      position: relative;
      padding: 16px 0;
    }
    .threshold-marker {
      position: absolute;
      top: 0;
      transform: translateX(-50%);
    }
    .threshold-line {
      width: 2px;
      height: 24px;
      background: #ff9800;
      margin: 0 auto;
    }
    .threshold-label {
      font-size: 11px;
      color: #ff9800;
      white-space: nowrap;
      font-weight: 500;
    }
    .details-card {
      margin-bottom: 24px;
    }
    .details-card mat-card-header {
      padding: 16px 16px 12px;
    }
    .details-table {
      width: 100%;
    }
    .row-correct {
      background-color: rgba(200, 230, 201, 0.15);
    }
    .row-incorrect {
      background-color: rgba(255, 205, 210, 0.15);
    }
    .icon-correct {
      color: #2e7d32;
      font-size: 24px;
    }
    .icon-incorrect {
      color: #c62828;
      font-size: 24px;
    }
    .reponse-ids {
      font-size: 13px;
      color: #555;
    }
    th.mat-header-cell {
      font-weight: 600;
      color: #333;
      font-size: 13px;
    }
    .result-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 8px;
      margin-bottom: 24px;
    }
    .error-state {
      text-align: center;
      padding: 48px;
      color: #999;
    }
    .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
    .error-state p {
      margin: 16px 0 24px;
      font-size: 16px;
    }
  `]
})
export class EvaluationResultsComponent implements OnInit {
  result: QuizResultDto | null = null;
  loading = true;
  evaluationId!: number;

  detailColumns: string[] = ['numero', 'enonce', 'votreReponse', 'bonneReponse', 'resultat'];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.evaluationId = +params['id'];
      this.loadResults();
    });
  }

  loadResults(): void {
    this.loading = true;

    // Try getting from navigation state first
    const navState = history.state as QuizResultDto;
    if (navState && navState.quizId) {
      this.result = navState;
      this.loading = false;
      return;
    }

    // Otherwise fetch from API
    this.api.get<QuizResultDto>('/evaluations/' + this.evaluationId + '/quiz/results').subscribe({
      next: (data) => {
        this.result = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des resultats', 'Fermer', { duration: 3000 });
      }
    });
  }

  formatReponseIds(ids: number[]): string {
    if (!ids || ids.length === 0) return 'Aucune';
    return ids.map(id => 'R' + id).join(', ');
  }
}
