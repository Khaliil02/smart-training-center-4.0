import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>
            <h1 class="register-title">Smart Training Center</h1>
            <p class="register-subtitle">Creez votre compte</p>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            @if (errorMessage) {
              <div class="error-banner">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom" placeholder="Votre nom">
              <mat-icon matPrefix>person</mat-icon>
              @if (registerForm.get('nom')?.hasError('required') && registerForm.get('nom')?.touched) {
                <mat-error>Le nom est requis</mat-error>
              }
              @if (registerForm.get('nom')?.hasError('minlength') && registerForm.get('nom')?.touched) {
                <mat-error>Le nom doit contenir au moins 2 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Prenom</mat-label>
              <input matInput formControlName="prenom" placeholder="Votre prenom">
              <mat-icon matPrefix>person_outline</mat-icon>
              @if (registerForm.get('prenom')?.hasError('required') && registerForm.get('prenom')?.touched) {
                <mat-error>Le prenom est requis</mat-error>
              }
              @if (registerForm.get('prenom')?.hasError('minlength') && registerForm.get('prenom')?.touched) {
                <mat-error>Le prenom doit contenir au moins 2 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput formControlName="email" type="email" placeholder="exemple@stc.dz">
              <mat-icon matPrefix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>L'adresse e-mail est requise</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                <mat-error>Format d'e-mail invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput formControlName="motDePasse" [type]="hidePassword ? 'password' : 'text'" placeholder="Votre mot de passe">
              <mat-icon matPrefix>lock</mat-icon>
              <button type="button" mat-icon-button matSuffix (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('motDePasse')?.hasError('required') && registerForm.get('motDePasse')?.touched) {
                <mat-error>Le mot de passe est requis</mat-error>
              }
              @if (registerForm.get('motDePasse')?.hasError('minlength') && registerForm.get('motDePasse')?.touched) {
                <mat-error>Le mot de passe doit contenir au moins 6 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmation du mot de passe</mat-label>
              <input matInput formControlName="confirmMotDePasse" [type]="hideConfirmPassword ? 'password' : 'text'" placeholder="Confirmez votre mot de passe">
              <mat-icon matPrefix>lock_outline</mat-icon>
              <button type="button" mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('confirmMotDePasse')?.hasError('required') && registerForm.get('confirmMotDePasse')?.touched) {
                <mat-error>La confirmation du mot de passe est requise</mat-error>
              }
              @if (registerForm.get('confirmMotDePasse')?.hasError('passwordMismatch') && registerForm.get('confirmMotDePasse')?.touched) {
                <mat-error>Les mots de passe ne correspondent pas</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width register-btn" [disabled]="registerForm.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
              } @else {
                S'inscrire
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <a mat-button routerLink="/auth/login" color="primary">Deja inscrit ? Se connecter</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
    }
    .register-card {
      width: 100%;
      max-width: 420px;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    .register-title {
      font-size: 24px;
      font-weight: 700;
      color: #1a237e;
      margin: 0 0 4px 0;
      text-align: center;
    }
    .register-subtitle {
      font-size: 14px;
      color: #666;
      margin: 0 0 24px 0;
      text-align: center;
    }
    mat-card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .register-btn {
      margin-top: 16px;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
    }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      background-color: #fce4ec;
      color: #c62828;
      border-radius: 8px;
      font-size: 14px;
    }
    .error-banner mat-icon {
      font-size: 20px;
    }
    mat-card-actions {
      margin-top: 8px;
      text-align: center;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', [Validators.required]]
    });

    this.registerForm.get('confirmMotDePasse')?.addValidators(
      this.passwordMatchValidator.bind(this)
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.registerForm?.get('motDePasse')?.value;
    const confirmPassword = control.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { confirmMotDePasse, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez reessayer.';
      }
    });
  }
}
