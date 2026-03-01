import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { SalleDto } from '../../../core/models/salle.model';
import { PresenceDto, ScanRequest } from '../../../core/models/presence.model';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatRadioModule,
    MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule, DatePipe
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <h2>Scanner de presence</h2>
        <p class="subtitle">Enregistrer la presence des etudiants</p>
      </div>

      <!-- Scan Form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>qr_code_scanner</mat-icon>
            Nouveau scan
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="scanForm" (ngSubmit)="onSubmit()" class="scan-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Code badge</mat-label>
                <input matInput formControlName="badgeCode" placeholder="Scanner ou saisir le code badge"
                       #badgeInput>
                <mat-icon matPrefix>badge</mat-icon>
                <mat-hint>Scannez le badge ou saisissez le code manuellement</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Salle</mat-label>
                <mat-select formControlName="salleId">
                  <mat-option *ngFor="let salle of salles" [value]="salle.id">
                    {{ salle.nomSalle }} ({{ salle.type }})
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix>meeting_room</mat-icon>
              </mat-form-field>
            </div>

            <div class="method-section">
              <label class="method-label">Methode de scan :</label>
              <mat-radio-group formControlName="methode" class="method-group">
                <mat-radio-button value="RFID">
                  <mat-icon class="radio-icon">contactless</mat-icon>
                  RFID
                </mat-radio-button>
                <mat-radio-button value="QR_CODE">
                  <mat-icon class="radio-icon">qr_code</mat-icon>
                  QR Code
                </mat-radio-button>
                <mat-radio-button value="MANUEL">
                  <mat-icon class="radio-icon">edit</mat-icon>
                  Manuel
                </mat-radio-button>
              </mat-radio-group>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="scanForm.invalid || submitting">
                <mat-icon>{{ submitting ? 'hourglass_empty' : 'check_circle' }}</mat-icon>
                {{ submitting ? 'Enregistrement...' : 'Enregistrer la presence' }}
              </button>
              <button mat-button type="button" (click)="resetForm()">
                <mat-icon>refresh</mat-icon>
                Reinitialiser
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Result Card -->
      <mat-card class="result-card" *ngIf="lastResult">
        <mat-card-header>
          <mat-icon mat-card-avatar class="result-icon">check_circle</mat-icon>
          <mat-card-title>Presence enregistree</mat-card-title>
          <mat-card-subtitle>{{ lastResult.dateHeure | date:'dd/MM/yyyy HH:mm:ss' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="result-details">
            <div class="result-row">
              <span class="result-label">Etudiant</span>
              <span class="result-value">{{ lastResult.etudiantNom }}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Matricule</span>
              <span class="result-value"><code>{{ lastResult.etudiantMatricule }}</code></span>
            </div>
            <div class="result-row">
              <span class="result-label">Salle</span>
              <span class="result-value">{{ lastResult.salleNom }}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Methode</span>
              <span class="result-value">
                <span class="method-badge">{{ lastResult.methode }}</span>
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-divider class="section-divider"></mat-divider>

      <!-- Recent Scans Table -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Scans recents
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="loading-container" *ngIf="loadingRecent">
            <mat-spinner diameter="32"></mat-spinner>
          </div>
          <div class="table-responsive" *ngIf="!loadingRecent && recentScans.length > 0; else noScans">
            <table mat-table [dataSource]="recentScans" class="full-width-table">
              <ng-container matColumnDef="etudiant">
                <th mat-header-cell *matHeaderCellDef>Etudiant</th>
                <td mat-cell *matCellDef="let p">{{ p.etudiantNom }}</td>
              </ng-container>
              <ng-container matColumnDef="matricule">
                <th mat-header-cell *matHeaderCellDef>Matricule</th>
                <td mat-cell *matCellDef="let p"><code>{{ p.etudiantMatricule }}</code></td>
              </ng-container>
              <ng-container matColumnDef="salle">
                <th mat-header-cell *matHeaderCellDef>Salle</th>
                <td mat-cell *matCellDef="let p">{{ p.salleNom }}</td>
              </ng-container>
              <ng-container matColumnDef="methode">
                <th mat-header-cell *matHeaderCellDef>Methode</th>
                <td mat-cell *matCellDef="let p">
                  <span class="method-badge">{{ p.methode }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="dateHeure">
                <th mat-header-cell *matHeaderCellDef>Date / Heure</th>
                <td mat-cell *matCellDef="let p">{{ p.dateHeure | date:'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="scanColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: scanColumns;"></tr>
            </table>
          </div>
          <ng-template #noScans>
            <p class="empty-text" *ngIf="!loadingRecent">Aucun scan recent</p>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; }
    .page-header {
      margin-bottom: 24px;
      h2 { color: #1a237e; margin: 0; font-size: 24px; }
      .subtitle { color: #666; margin: 4px 0 0; }
    }
    .form-card {
      margin-bottom: 24px;
      mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
    }
    .scan-form {
      padding-top: 16px;
    }
    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    .form-field { width: 100%; }
    .method-section {
      margin: 8px 0 20px;
    }
    .method-label {
      font-size: 14px; color: #555; margin-bottom: 8px; display: block;
    }
    .method-group {
      display: flex; gap: 24px;
      mat-radio-button {
        display: flex; align-items: center;
      }
    }
    .radio-icon {
      font-size: 18px !important; width: 18px !important; height: 18px !important;
      margin-right: 4px; vertical-align: middle;
    }
    .form-actions {
      display: flex; gap: 12px; margin-top: 8px;
    }

    .result-card {
      margin-bottom: 24px; border-left: 4px solid #4caf50;
    }
    .result-icon {
      color: #4caf50 !important; font-size: 40px !important;
      width: 40px !important; height: 40px !important;
    }
    .result-details {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;
    }
    .result-row {
      display: flex; flex-direction: column;
    }
    .result-label { font-size: 12px; color: #888; text-transform: uppercase; }
    .result-value { font-size: 16px; font-weight: 500; color: #333; }

    .section-divider { margin: 8px 0 24px; }

    .section-card {
      margin-bottom: 20px;
      mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
    }
    .loading-container {
      display: flex; justify-content: center; padding: 24px;
    }
    .table-responsive { overflow-x: auto; }
    .full-width-table { width: 100%; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .method-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      background: #e3f2fd; color: #1565c0; font-size: 12px; font-weight: 500;
    }
    .empty-text { color: #999; text-align: center; padding: 24px; }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .result-details { grid-template-columns: 1fr; }
      .method-group { flex-direction: column; gap: 8px; }
    }
  `]
})
export class ScanComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  scanForm!: FormGroup;
  salles: SalleDto[] = [];
  recentScans: PresenceDto[] = [];
  lastResult: PresenceDto | null = null;
  submitting = false;
  loadingRecent = true;

  scanColumns = ['etudiant', 'matricule', 'salle', 'methode', 'dateHeure'];

  ngOnInit(): void {
    this.scanForm = this.fb.group({
      badgeCode: ['', Validators.required],
      salleId: [null, Validators.required],
      methode: ['RFID', Validators.required]
    });

    this.loadSalles();
    this.loadRecentScans();
  }

  private loadSalles(): void {
    this.api.get<SalleDto[]>('/salles').subscribe({
      next: (data) => { this.salles = data; }
    });
  }

  private loadRecentScans(): void {
    this.loadingRecent = true;
    this.api.get<PresenceDto[]>('/presence/recent').subscribe({
      next: (data) => {
        this.recentScans = data;
        this.loadingRecent = false;
      },
      error: () => { this.loadingRecent = false; }
    });
  }

  onSubmit(): void {
    if (this.scanForm.invalid) return;
    this.submitting = true;

    const request: ScanRequest = {
      badgeCode: this.scanForm.value.badgeCode,
      salleId: this.scanForm.value.salleId,
      methode: this.scanForm.value.methode,
      source: 'WEB'
    };

    this.api.post<PresenceDto>('/presence/scan', request).subscribe({
      next: (result) => {
        this.lastResult = result;
        this.snackBar.open('Presence enregistree avec succes', 'Fermer', {
          duration: 4000,
          panelClass: ['snackbar-success']
        });
        this.submitting = false;
        this.loadRecentScans();
        // Reset badge code but keep salle and method
        this.scanForm.patchValue({ badgeCode: '' });
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Erreur lors de l\'enregistrement de la presence',
          'Fermer',
          { duration: 4000 }
        );
        this.submitting = false;
      }
    });
  }

  resetForm(): void {
    this.scanForm.reset({ methode: 'RFID' });
    this.lastResult = null;
  }
}
