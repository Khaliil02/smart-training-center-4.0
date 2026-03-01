import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { SalleDto, CapteurIoTRequest } from '../../../core/models/salle.model';

@Component({
  selector: 'app-device-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour a la liste
        </button>
      </div>

      <mat-card class="form-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="header-icon">add_circle</mat-icon>
          <mat-card-title>Enregistrer un appareil</mat-card-title>
          <mat-card-subtitle>Ajouter un nouveau capteur IoT au systeme</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="device-form">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type d'appareil</mat-label>
              <mat-select formControlName="type">
                <mat-option value="TEMPERATURE">
                  <mat-icon>thermostat</mat-icon> Temperature
                </mat-option>
                <mat-option value="CO2">
                  <mat-icon>co2</mat-icon> CO2
                </mat-option>
                <mat-option value="PRESENCE">
                  <mat-icon>person_pin</mat-icon> Presence
                </mat-option>
                <mat-option value="RFID_READER">
                  <mat-icon>contactless</mat-icon> Lecteur RFID
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('type')?.hasError('required')">
                Le type est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse MAC</mat-label>
              <input matInput formControlName="adresseMac"
                     placeholder="XX:XX:XX:XX:XX:XX">
              <mat-hint>Format : XX:XX:XX:XX:XX:XX</mat-hint>
              <mat-error *ngIf="form.get('adresseMac')?.hasError('required')">
                L'adresse MAC est requise
              </mat-error>
              <mat-error *ngIf="form.get('adresseMac')?.hasError('pattern')">
                Format invalide (ex: AA:BB:CC:DD:EE:FF)
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Version du firmware</mat-label>
              <input matInput formControlName="firmwareVersion"
                     placeholder="Ex: 1.0.0">
              <mat-error *ngIf="form.get('firmwareVersion')?.hasError('required')">
                La version du firmware est requise
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Salle</mat-label>
              <mat-select formControlName="salleId">
                <mat-option *ngFor="let salle of salles" [value]="salle.id">
                  {{ salle.nomSalle }} ({{ salle.type }})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('salleId')?.hasError('required')">
                La salle est requise
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Annuler</button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="20" class="btn-spinner"></mat-spinner>
                {{ saving ? 'Enregistrement...' : 'Enregistrer l\'appareil' }}
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
      max-width: 700px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 16px;
    }
    .form-card {
      padding: 8px;
    }
    .header-icon {
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: 40px !important;
      height: 40px !important;
      border-radius: 50%;
      font-size: 24px;
      background-color: #1565c0;
      color: white;
    }
    .device-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 24px;
    }
    .full-width {
      width: 100%;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
    .btn-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class DeviceRegisterComponent implements OnInit {
  form!: FormGroup;
  salles: SalleDto[] = [];
  saving = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type: ['', Validators.required],
      adresseMac: ['', [Validators.required, Validators.pattern(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/)]],
      firmwareVersion: ['', Validators.required],
      salleId: [null, Validators.required]
    });

    this.api.get<SalleDto[]>('/salles').subscribe({
      next: (data) => this.salles = data,
      error: () => {
        this.snackBar.open('Erreur lors du chargement des salles', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const request: CapteurIoTRequest = {
      type: this.form.value.type,
      adresseMac: this.form.value.adresseMac,
      firmwareVersion: this.form.value.firmwareVersion,
      salleId: this.form.value.salleId
    };

    this.api.post('/iot/devices', request).subscribe({
      next: () => {
        this.snackBar.open('Appareil enregistre avec succes', 'Fermer', { duration: 3000 });
        this.router.navigate(['/devices']);
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'enregistrement de l\'appareil', 'Fermer', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/devices']);
  }
}
