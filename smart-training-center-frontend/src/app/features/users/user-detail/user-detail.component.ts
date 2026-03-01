import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatChipsModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>Detail de l'utilisateur</h2>
      </div>

      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <mat-card *ngIf="!loading && user" class="detail-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="user-avatar">account_circle</mat-icon>
          <mat-card-title>{{ user.prenom }} {{ user.nom }}</mat-card-title>
          <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" class="detail-form">
            <h3>Informations personnelles</h3>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom" />
                <mat-error *ngIf="form.get('nom')?.hasError('required')">Le nom est requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prenom</mat-label>
                <input matInput formControlName="prenom" />
                <mat-error *ngIf="form.get('prenom')?.hasError('required')">Le prenom est requis</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
              <mat-error *ngIf="form.get('email')?.hasError('required')">L'email est requis</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Format d'email invalide</mat-error>
            </mat-form-field>

            <mat-divider></mat-divider>

            <h3>Etat du compte</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Etat du compte</mat-label>
              <mat-select formControlName="etatCompte">
                <mat-option value="ACTIF">Actif</mat-option>
                <mat-option value="INACTIF">Inactif</mat-option>
                <mat-option value="SUSPENDU">Suspendu</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-divider></mat-divider>

            <h3>Roles</h3>
            <div class="roles-section">
              <mat-checkbox *ngFor="let role of availableRoles"
                [checked]="selectedRoles.includes(role.value)"
                (change)="toggleRole(role.value, $event.checked)">
                {{ role.label }}
              </mat-checkbox>
            </div>

            <mat-divider></mat-divider>

            <div class="info-section">
              <p><strong>Date d'inscription :</strong> {{ user.dateInscription | date:'dd/MM/yyyy HH:mm' }}</p>
              <p><strong>Identifiant :</strong> #{{ user.id }}</p>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button (click)="goBack()">Annuler</button>
          <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid || saving">
            <mat-spinner *ngIf="saving" diameter="20" class="inline-spinner"></mat-spinner>
            <span *ngIf="!saving">Enregistrer</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 24px;
      h2 { color: #1a237e; margin: 0; font-size: 24px; }
    }
    .loading-shade {
      display: flex; justify-content: center; align-items: center; padding: 48px 0;
    }
    .detail-card { margin-bottom: 24px; }
    .user-avatar { font-size: 40px; width: 40px; height: 40px; color: #1a237e; }
    .detail-form {
      padding-top: 16px;
      h3 { color: #1a237e; margin: 16px 0 12px; font-size: 16px; }
    }
    .form-row {
      display: flex; gap: 16px;
      mat-form-field { flex: 1; }
    }
    .full-width { width: 100%; }
    .roles-section {
      display: flex; flex-direction: column; gap: 8px; padding: 8px 0;
    }
    .info-section {
      padding: 16px 0;
      p { margin: 4px 0; color: #555; }
      strong { color: #333; }
    }
    mat-divider { margin: 16px 0; }
    .inline-spinner { display: inline-block; }
  `]
})
export class UserDetailComponent implements OnInit {
  user: Utilisateur | null = null;
  form!: FormGroup;
  loading = false;
  saving = false;
  selectedRoles: string[] = [];

  availableRoles = [
    { value: 'ROLE_ETUDIANT', label: 'Etudiant' },
    { value: 'ROLE_ENSEIGNANT', label: 'Enseignant' },
    { value: 'ROLE_ADMINISTRATEUR', label: 'Administrateur' },
    { value: 'ROLE_RESPONSABLE_ACADEMIQUE', label: 'Responsable Academique' }
  ];

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      etatCompte: ['ACTIF']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(+id);
    }
  }

  loadUser(id: number): void {
    this.loading = true;
    this.api.get<Utilisateur>('/utilisateurs/' + id).subscribe({
      next: (data) => {
        this.user = data;
        this.selectedRoles = [...data.roles];
        this.form.patchValue({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          etatCompte: data.etatCompte
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement de l\'utilisateur', 'Fermer', { duration: 5000 });
      }
    });
  }

  toggleRole(role: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedRoles.includes(role)) {
        this.selectedRoles.push(role);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  save(): void {
    if (this.form.invalid || !this.user) return;

    this.saving = true;
    const payload = {
      ...this.form.value,
      roles: this.selectedRoles
    };

    this.api.put<Utilisateur>('/utilisateurs/' + this.user.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Utilisateur mis a jour avec succes', 'Fermer', { duration: 3000 });
        this.loadUser(this.user!.id);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la mise a jour', 'Fermer', { duration: 5000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
