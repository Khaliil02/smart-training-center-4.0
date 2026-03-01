import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SalleDto, SalleRequest } from '../../../core/models/salle.model';

@Component({
  selector: 'app-salle-add-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Ajouter une salle</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom de la salle</mat-label>
          <input matInput formControlName="nomSalle" placeholder="Ex: Salle A101">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Capacite</mat-label>
          <input matInput type="number" formControlName="capacite" placeholder="Ex: 30">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="COURS">Cours</mat-option>
            <mat-option value="TP">TP</mat-option>
            <mat-option value="AMPHITHEATRE">Amphitheatre</mat-option>
            <mat-option value="LABO">Laboratoire</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || saving"
              (click)="onSubmit()">
        {{ saving ? 'Enregistrement...' : 'Ajouter' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 8px; min-width: 350px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class SalleAddDialogComponent {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  form: FormGroup;
  saving = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nomSalle: ['', Validators.required],
      capacite: [null, [Validators.required, Validators.min(1)]],
      type: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const request: SalleRequest = this.form.value;
    this.api.post<SalleDto>('/salles', request).subscribe({
      next: () => {
        this.snackBar.open('Salle ajoutee avec succes', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'ajout de la salle', 'Fermer', { duration: 3000 });
        this.saving = false;
      }
    });
  }
}

@Component({
  selector: 'app-salle-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h2>Liste des salles</h2>
          <p class="subtitle">Gestion des salles du centre de formation</p>
        </div>
        <button mat-raised-button color="primary" *ngIf="isAdmin" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Ajouter une salle
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement des salles...</p>
      </div>

      <div class="salles-grid" *ngIf="!loading">
        <mat-card *ngFor="let salle of salles" class="salle-card" (click)="goToDetail(salle.id)">
          <mat-card-header>
            <mat-icon mat-card-avatar class="type-icon" [class]="'type-' + salle.type.toLowerCase()">
              {{ getTypeIcon(salle.type) }}
            </mat-icon>
            <mat-card-title>{{ salle.nomSalle }}</mat-card-title>
            <mat-card-subtitle>{{ getTypeLabel(salle.type) }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="card-info">
              <div class="info-row">
                <mat-icon>groups</mat-icon>
                <span>Capacite : <strong>{{ salle.capacite }}</strong> places</span>
              </div>
              <div class="info-row">
                <mat-icon>sensors</mat-icon>
                <span>Capteurs : <strong>{{ salle.capteurs?.length || 0 }}</strong></span>
              </div>
            </div>
            <div class="chip-row">
              <span class="sensor-chip" [class.online]="getOnlineCount(salle) > 0" [class.offline]="getOnlineCount(salle) === 0">
                <mat-icon class="chip-icon">{{ getOnlineCount(salle) > 0 ? 'wifi' : 'wifi_off' }}</mat-icon>
                {{ getOnlineCount(salle) }} / {{ salle.capteurs?.length || 0 }} en ligne
              </span>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button color="primary">
              <mat-icon>visibility</mat-icon>
              Details
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="!loading && salles.length === 0">
        <mat-icon>meeting_room</mat-icon>
        <p>Aucune salle trouvee</p>
      </div>
    </div>
  `,
  styles: [`
    .page-shell {
      padding: 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      h2 { color: #1a237e; margin: 0; font-size: 24px; }
      .subtitle { color: #666; margin: 4px 0 0; }
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      p { color: #666; margin-top: 16px; }
    }
    .salles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .salle-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      }
    }
    .type-icon {
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: 40px !important;
      height: 40px !important;
      border-radius: 50%;
      font-size: 20px;
      color: white;
    }
    .type-cours { background-color: #1565c0; }
    .type-tp { background-color: #2e7d32; }
    .type-amphitheatre { background-color: #6a1b9a; }
    .type-labo { background-color: #e65100; }
    .card-info {
      margin-top: 12px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #555;
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: #888; }
    }
    .chip-row {
      margin-top: 12px;
    }
    .sensor-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }
    .sensor-chip.online {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .sensor-chip.offline {
      background-color: #fbe9e7;
      color: #c62828;
    }
    .chip-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      color: #999;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    }
  `]
})
export class SalleListComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  salles: SalleDto[] = [];
  loading = true;
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.auth.hasRole('ADMINISTRATEUR');
    this.loadSalles();
  }

  loadSalles(): void {
    this.loading = true;
    this.api.get<SalleDto[]>('/salles').subscribe({
      next: (data) => {
        this.salles = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'COURS': 'school',
      'TP': 'computer',
      'AMPHITHEATRE': 'stadium',
      'LABO': 'science'
    };
    return icons[type] || 'meeting_room';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'COURS': 'Salle de cours',
      'TP': 'Salle de TP',
      'AMPHITHEATRE': 'Amphitheatre',
      'LABO': 'Laboratoire'
    };
    return labels[type] || type;
  }

  getOnlineCount(salle: SalleDto): number {
    return salle.capteurs?.filter(c => c.estEnLigne).length || 0;
  }

  goToDetail(id: number): void {
    this.router.navigate(['/salles', id]);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SalleAddDialogComponent, {
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadSalles();
    });
  }
}
