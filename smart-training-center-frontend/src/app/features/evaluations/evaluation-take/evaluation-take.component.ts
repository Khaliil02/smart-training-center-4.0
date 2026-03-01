import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { QuizDto, QuestionDto, QuizSubmissionRequest, QuizResultDto } from '../../../core/models';

@Component({
  selector: 'app-evaluation-take',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatRadioModule, MatCheckboxModule, MatProgressSpinnerModule,
    MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Quiz Form -->
      <div *ngIf="!loading && quiz && !submitted">
        <div class="quiz-header">
          <button mat-icon-button routerLink="/evaluations" matTooltip="Retour aux evaluations">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h2>{{ quiz.titre }}</h2>
            <p class="subtitle">{{ quiz.description }}</p>
          </div>
        </div>

        <div class="quiz-info">
          <mat-icon>help_outline</mat-icon>
          <span>{{ quiz.questions.length }} questions - Repondez a toutes les questions puis soumettez vos reponses</span>
        </div>

        <div class="questions-container">
          <mat-card *ngFor="let question of quiz.questions; let i = index" class="question-card">
            <mat-card-content>
              <div class="question-number">Question {{ i + 1 }} / {{ quiz.questions.length }}</div>
              <p class="question-enonce">{{ question.enonce }}</p>

              <!-- Single choice (radio) -->
              <div *ngIf="question.type === 'CHOIX_UNIQUE'" class="reponses-list">
                <mat-radio-group (change)="onSingleSelect(question.id, $event.value)">
                  <mat-radio-button *ngFor="let reponse of question.reponses"
                                    [value]="reponse.id"
                                    class="reponse-option">
                    {{ reponse.texte }}
                  </mat-radio-button>
                </mat-radio-group>
              </div>

              <!-- Multiple choice (checkboxes) -->
              <div *ngIf="question.type !== 'CHOIX_UNIQUE'" class="reponses-list">
                <mat-checkbox *ngFor="let reponse of question.reponses"
                              (change)="onMultiSelect(question.id, reponse.id, $event.checked)"
                              class="reponse-option">
                  {{ reponse.texte }}
                </mat-checkbox>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="submit-container">
          <div class="submit-info">
            <mat-icon>info</mat-icon>
            <span>{{ getAnsweredCount() }} / {{ quiz.questions.length }} questions repondues</span>
          </div>
          <button mat-raised-button color="primary" class="submit-btn"
                  (click)="soumettre()"
                  [disabled]="submitting || getAnsweredCount() === 0">
            <mat-spinner *ngIf="submitting" diameter="20"></mat-spinner>
            <mat-icon *ngIf="!submitting">send</mat-icon>
            {{ submitting ? 'Soumission en cours...' : 'Soumettre les reponses' }}
          </button>
        </div>
      </div>

      <!-- Results after submission -->
      <div *ngIf="submitted && result" class="results-inline">
        <div class="result-header">
          <mat-icon [class]="result.passed ? 'icon-success' : 'icon-fail'">
            {{ result.passed ? 'check_circle' : 'cancel' }}
          </mat-icon>
          <h2>Resultats du quiz</h2>
        </div>

        <div class="result-banner" [ngClass]="result.passed ? 'banner-success' : 'banner-fail'">
          <div *ngIf="result.passed">
            <strong>Felicitations !</strong> Vous avez reussi l'evaluation.
          </div>
          <div *ngIf="!result.passed">
            <strong>Score insuffisant.</strong> Minimum requis : {{ result.seuilValidation }}%.
          </div>
        </div>

        <mat-card class="score-card">
          <mat-card-content>
            <div class="score-grid">
              <div class="score-item">
                <span class="score-number">{{ result.correctAnswers }}</span>
                <span class="score-label">/ {{ result.totalQuestions }}</span>
                <span class="score-desc">Bonnes reponses</span>
              </div>
              <div class="score-item">
                <span class="score-number">{{ result.percentage | number:'1.0-0' }}%</span>
                <span class="score-desc">Pourcentage</span>
              </div>
              <div class="score-item">
                <span class="score-number" [class]="result.passed ? 'text-success' : 'text-fail'">
                  {{ result.passed ? 'Reussi' : 'Echoue' }}
                </span>
                <span class="score-desc">Resultat</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="result-actions">
          <button mat-stroked-button routerLink="/evaluations">
            <mat-icon>list</mat-icon>
            Retour aux evaluations
          </button>
          <button mat-raised-button color="primary"
                  [routerLink]="['/evaluations', evaluationId, 'results']">
            <mat-icon>assessment</mat-icon>
            Voir le detail
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .quiz-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }
    .quiz-header h2 {
      color: #1a237e;
      margin: 0 0 4px 0;
      font-size: 26px;
      font-weight: 600;
    }
    .subtitle {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .quiz-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #e8eaf6;
      border-radius: 8px;
      margin-bottom: 24px;
      color: #1a237e;
      font-size: 14px;
    }
    .questions-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }
    .question-card {
      border-left: 4px solid #1a237e;
    }
    .question-number {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .question-enonce {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .reponses-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-left: 8px;
    }
    .reponse-option {
      font-size: 15px;
    }
    .submit-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      flex-wrap: wrap;
      gap: 16px;
    }
    .submit-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }
    .submit-btn {
      min-width: 220px;
    }
    .submit-btn mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
    .results-inline {
      text-align: center;
    }
    .result-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .result-header h2 {
      color: #1a237e;
      margin: 0;
      font-size: 26px;
    }
    .icon-success {
      color: #2e7d32;
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    .icon-fail {
      color: #c62828;
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    .result-banner {
      padding: 16px 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 16px;
    }
    .banner-success {
      background-color: #c8e6c9;
      color: #1b5e20;
    }
    .banner-fail {
      background-color: #ffe0b2;
      color: #e65100;
    }
    .score-card {
      margin-bottom: 24px;
    }
    .score-grid {
      display: flex;
      justify-content: center;
      gap: 48px;
      padding: 16px 0;
      flex-wrap: wrap;
    }
    .score-item {
      text-align: center;
    }
    .score-number {
      display: block;
      font-size: 32px;
      font-weight: 700;
      color: #1a237e;
    }
    .score-label {
      font-size: 20px;
      color: #999;
    }
    .score-desc {
      display: block;
      font-size: 13px;
      color: #999;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .text-success { color: #2e7d32 !important; }
    .text-fail { color: #c62828 !important; }
    .result-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  `]
})
export class EvaluationTakeComponent implements OnInit {
  quiz: QuizDto | null = null;
  result: QuizResultDto | null = null;
  loading = true;
  submitting = false;
  submitted = false;
  evaluationId!: number;

  selectedAnswers: { [questionId: number]: number[] } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.evaluationId = +params['id'];
      this.loadQuiz();
    });
  }

  loadQuiz(): void {
    this.loading = true;
    this.api.get<QuizDto>('/evaluations/' + this.evaluationId + '/quiz').subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.loading = false;
        // Initialize answer map
        quiz.questions.forEach(q => {
          this.selectedAnswers[q.id] = [];
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du quiz', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSingleSelect(questionId: number, reponseId: number): void {
    this.selectedAnswers[questionId] = [reponseId];
  }

  onMultiSelect(questionId: number, reponseId: number, checked: boolean): void {
    if (!this.selectedAnswers[questionId]) {
      this.selectedAnswers[questionId] = [];
    }
    if (checked) {
      this.selectedAnswers[questionId].push(reponseId);
    } else {
      this.selectedAnswers[questionId] = this.selectedAnswers[questionId].filter(id => id !== reponseId);
    }
  }

  getAnsweredCount(): number {
    return Object.values(this.selectedAnswers).filter(arr => arr.length > 0).length;
  }

  soumettre(): void {
    if (!this.quiz) return;

    this.submitting = true;
    const submission: QuizSubmissionRequest = {
      quizId: this.quiz.id,
      etudiantId: 0, // Server determines from auth context
      reponses: this.selectedAnswers
    };

    this.api.post<QuizResultDto>('/evaluations/' + this.evaluationId + '/quiz/submit', submission).subscribe({
      next: (result) => {
        this.result = result;
        this.submitted = true;
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Erreur lors de la soumission du quiz', 'Fermer', { duration: 3000 });
      }
    });
  }
}
