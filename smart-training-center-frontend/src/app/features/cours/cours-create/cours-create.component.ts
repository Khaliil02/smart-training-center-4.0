import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { CoursDto, FiliereDto } from '../../../core/models';

@Component({
  selector: 'app-cours-create',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/cours" matTooltip="Retour">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>Creer un nouveau cours</h2>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titre</mat-label>
              <input matInput formControlName="titre" placeholder="Titre du cours">
              <mat-error *ngIf="form.get('titre')?.hasError('required')">Le titre est requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Description du cours"></textarea>
              <mat-error *ngIf="form.get('description')?.hasError('required')">La description est requise</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contenu</mat-label>
              <textarea matInput formControlName="contenu" rows="10" placeholder="Contenu detaille du cours (HTML supporte)"></textarea>
              <mat-error *ngIf="form.get('contenu')?.hasError('required')">Le contenu est requis</mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Filiere</mat-label>
                <mat-select formControlName="filiere">
                  <mat-option *ngFor="let f of filieres" [value]="f.nom">{{ f.nom }}</mat-option>
                </mat-select>
                <mat-error *ngIf="form.get('filiere')?.hasError('required')">La filiere est requise</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Niveau</mat-label>
                <mat-select formControlName="niveau">
                  <mat-option *ngFor="let n of niveaux" [value]="n">{{ n }}</mat-option>
                </mat-select>
                <mat-error *ngIf="form.get('niveau')?.hasError('required')">Le niveau est requis</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Duree estimee (heures)</mat-label>
              <input matInput type="number" formControlName="dureeEstimee" placeholder="Ex: 30" min="1">
              <mat-error *ngIf="form.get('dureeEstimee')?.hasError('required')">La duree est requise</mat-error>
              <mat-error *ngIf="form.get('dureeEstimee')?.hasError('min')">La duree doit etre positive</mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/cours">
                <mat-icon>close</mat-icon>
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || submitting">
                <mat-spinner *ngIf="submitting" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!submitting">save</mat-icon>
                {{ submitting ? 'Creation en cours...' : 'Creer le cours' }}
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .page-header h2 {
      color: #1a237e;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .form-card {
      padding: 8px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }
    .half-width {
      width: 100%;
      max-width: 400px;
      margin-bottom: 4px;
    }
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .form-row .half-width {
      flex: 1;
      min-width: 200px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    .form-actions button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class CoursCreateComponent implements OnInit {
  form!: FormGroup;
  filieres: FiliereDto[] = [];
  niveaux: string[] = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      contenu: ['', Validators.required],
      filiere: ['', Validators.required],
      niveau: ['', Validators.required],
      dureeEstimee: [null, [Validators.required, Validators.min(1)]]
    });

    this.loadFilieres();
  }

  loadFilieres(): void {
    this.api.get<FiliereDto[]>('/catalogue/filieres').subscribe({
      next: (data) => {
        this.filieres = data;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.api.post<CoursDto>('/cours', this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Cours cree avec succes !', 'Fermer', { duration: 3000 });
        this.router.navigate(['/cours']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Erreur lors de la creation du cours', 'Fermer', { duration: 3000 });
      }
    });
  }
}
