import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <h2 class="page-title">Mon profil</h2>

      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="profile-grid" *ngIf="!loading && user">
        <!-- Informations personnelles -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="profile-avatar">account_circle</mat-icon>
            <mat-card-title>{{ user.prenom }} {{ user.nom }}</mat-card-title>
            <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <mat-divider></mat-divider>

            <div class="info-list">
              <div class="info-item">
                <mat-icon>person</mat-icon>
                <div>
                  <span class="info-label">Nom complet</span>
                  <span class="info-value">{{ user.prenom }} {{ user.nom }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>email</mat-icon>
                <div>
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ user.email }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <span class="info-label">Date d'inscription</span>
                  <span class="info-value">{{ user.dateInscription | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>verified_user</mat-icon>
                <div>
                  <span class="info-label">Etat du compte</span>
                  <span class="status-badge" [ngClass]="{
                    'status-actif': user.etatCompte === 'ACTIF',
                    'status-inactif': user.etatCompte === 'INACTIF',
                    'status-suspendu': user.etatCompte === 'SUSPENDU'
                  }">{{ user.etatCompte }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>badge</mat-icon>
                <div>
                  <span class="info-label">Roles</span>
                  <mat-chip-set class="role-chips">
                    <mat-chip *ngFor="let role of user.roles">{{ formatRole(role) }}</mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Changement de mot de passe -->
        <mat-card class="password-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="password-icon">lock</mat-icon>
            <mat-card-title>Changer le mot de passe</mat-card-title>
            <mat-card-subtitle>Mettez a jour votre mot de passe</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="passwordForm" class="password-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Ancien mot de passe</mat-label>
                <input matInput [type]="hideOld ? 'password' : 'text'" formControlName="oldPassword" />
                <button mat-icon-button matSuffix type="button" (click)="hideOld = !hideOld">
                  <mat-icon>{{ hideOld ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="passwordForm.get('oldPassword')?.hasError('required')">L'ancien mot de passe est requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nouveau mot de passe</mat-label>
                <input matInput [type]="hideNew ? 'password' : 'text'" formControlName="newPassword" />
                <button mat-icon-button matSuffix type="button" (click)="hideNew = !hideNew">
                  <mat-icon>{{ hideNew ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">Le nouveau mot de passe est requis</mat-error>
                <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">6 caracteres minimum</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmation du mot de passe</mat-label>
                <input matInput [type]="hideConfirm ? 'password' : 'text'" formControlName="confirmPassword" />
                <button mat-icon-button matSuffix type="button" (click)="hideConfirm = !hideConfirm">
                  <mat-icon>{{ hideConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">La confirmation est requise</mat-error>
              </mat-form-field>

              <div class="password-mismatch" *ngIf="passwordMismatch">
                Les mots de passe ne correspondent pas
              </div>
            </form>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-flat-button color="primary"
              (click)="changePassword()"
              [disabled]="passwordForm.invalid || changingPassword || passwordMismatch">
              <mat-spinner *ngIf="changingPassword" diameter="20" class="inline-spinner"></mat-spinner>
              <span *ngIf="!changingPassword">Changer le mot de passe</span>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-title { color: #1a237e; margin: 0 0 24px; font-size: 24px; }
    .loading-shade {
      display: flex; justify-content: center; align-items: center; padding: 48px 0;
    }
    .profile-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    }
    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
    }
    .profile-avatar { font-size: 40px; width: 40px; height: 40px; color: #1a237e; }
    .password-icon { font-size: 40px; width: 40px; height: 40px; color: #e65100; }
    .info-list { padding-top: 16px; }
    .info-item {
      display: flex; align-items: flex-start; gap: 12px; padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      mat-icon { color: #666; margin-top: 2px; }
    }
    .info-item:last-child { border-bottom: none; }
    .info-label { display: block; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { display: block; font-size: 14px; color: #333; margin-top: 2px; }
    .status-badge {
      display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px;
      font-weight: 500; margin-top: 4px;
    }
    .status-actif { background-color: #e8f5e9; color: #2e7d32; }
    .status-inactif { background-color: #eeeeee; color: #616161; }
    .status-suspendu { background-color: #ffebee; color: #c62828; }
    .role-chips { margin-top: 4px; }
    mat-divider { margin: 12px 0; }
    .password-form {
      display: flex; flex-direction: column; padding-top: 16px;
    }
    .full-width { width: 100%; }
    .password-mismatch {
      color: #f44336; font-size: 12px; margin-top: -8px; margin-bottom: 8px;
    }
    .inline-spinner { display: inline-block; }
  `]
})
export class UserProfileComponent implements OnInit {
  user: Utilisateur | null = null;
  passwordForm!: FormGroup;
  loading = false;
  changingPassword = false;
  hideOld = true;
  hideNew = true;
  hideConfirm = true;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  get passwordMismatch(): boolean {
    const newPwd = this.passwordForm.get('newPassword')?.value;
    const confirm = this.passwordForm.get('confirmPassword')?.value;
    return confirm && newPwd !== confirm;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.api.get<Utilisateur>('/utilisateurs/me').subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', { duration: 5000 });
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.passwordMismatch) return;

    this.changingPassword = true;
    const payload = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.api.put('/utilisateurs/me/password', payload).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordForm.reset();
        this.snackBar.open('Mot de passe modifie avec succes', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.changingPassword = false;
        this.snackBar.open('Erreur lors du changement de mot de passe. Verifiez votre ancien mot de passe.', 'Fermer', { duration: 5000 });
      }
    });
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '').replace(/_/g, ' ');
  }
}
