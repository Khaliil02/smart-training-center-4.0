import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { MatiereDto, MatiereRequest, SpecialiteDto } from '../../../core/models';

/* ─── Dialog Component ─── */
@Component({
  selector: 'app-matiere-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.matiere ? 'Modifier la matiere' : 'Ajouter une matiere' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="nom" />
          <mat-error *ngIf="form.get('nom')?.hasError('required')">Le nom est requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Coefficient</mat-label>
          <input matInput type="number" formControlName="coefficient" min="1" />
          <mat-error *ngIf="form.get('coefficient')?.hasError('required')">Le coefficient est requis</mat-error>
          <mat-error *ngIf="form.get('coefficient')?.hasError('min')">Le coefficient doit etre superieur a 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Specialite</mat-label>
          <mat-select formControlName="specialiteId">
            <mat-option *ngFor="let s of data.specialites" [value]="s.id">{{ s.nom }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('specialiteId')?.hasError('required')">La specialite est requise</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        {{ data.matiere ? 'Modifier' : 'Ajouter' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; min-width: 400px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class MatiereDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MatiereDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { matiere: MatiereDto | null; specialites: SpecialiteDto[] }
  ) {
    this.form = this.fb.group({
      nom: [data.matiere?.nom || '', Validators.required],
      coefficient: [data.matiere?.coefficient || 1, [Validators.required, Validators.min(1)]],
      specialiteId: [data.matiere?.specialiteId || '', Validators.required]
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value as MatiereRequest);
    }
  }
}

/* ─── Main Component ─── */
@Component({
  selector: 'app-matieres',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Gestion des matieres</h2>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Ajouter une matiere
        </button>
      </div>

      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="matieres" class="full-width-table">

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let row">{{ row.nom }}</td>
          </ng-container>

          <ng-container matColumnDef="coefficient">
            <th mat-header-cell *matHeaderCellDef>Coefficient</th>
            <td mat-cell *matCellDef="let row">{{ row.coefficient }}</td>
          </ng-container>

          <ng-container matColumnDef="specialite">
            <th mat-header-cell *matHeaderCellDef>Specialite</th>
            <td mat-cell *matCellDef="let row">{{ row.specialiteNom }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" matTooltip="Modifier" (click)="openDialog(row)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Supprimer" (click)="confirmDelete(row)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucune matiere trouvee
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h2 { color: #1a237e; margin: 0; font-size: 24px; }
    }
    .loading-shade {
      display: flex; justify-content: center; align-items: center; padding: 48px 0;
    }
    .table-container {
      background: white; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;
    }
    .full-width-table { width: 100%; }
    .no-data { text-align: center; padding: 24px; color: #999; }
    th.mat-header-cell { font-weight: 600; color: #333; }
  `]
})
export class MatieresComponent implements OnInit {
  matieres: MatiereDto[] = [];
  specialites: SpecialiteDto[] = [];
  displayedColumns = ['nom', 'coefficient', 'specialite', 'actions'];
  loading = false;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<MatiereDto[]>('/catalogue/matieres').subscribe({
      next: (data) => { this.matieres = data; this.loading = false; },
      error: () => { this.loading = false; this.showError('Erreur lors du chargement des matieres'); }
    });
  }

  loadSpecialites(): void {
    this.api.get<SpecialiteDto[]>('/catalogue/specialites').subscribe({
      next: (data) => this.specialites = data,
      error: () => this.showError('Erreur lors du chargement des specialites')
    });
  }

  openDialog(matiere?: MatiereDto): void {
    const dialogRef = this.dialog.open(MatiereDialogComponent, {
      width: '500px',
      data: { matiere: matiere || null, specialites: this.specialites }
    });

    dialogRef.afterClosed().subscribe((result: MatiereRequest | undefined) => {
      if (result) {
        if (matiere) {
          this.api.put<MatiereDto>('/catalogue/matieres/' + matiere.id, result).subscribe({
            next: () => { this.showSuccess('Matiere modifiee avec succes'); this.load(); },
            error: () => this.showError('Erreur lors de la modification')
          });
        } else {
          this.api.post<MatiereDto>('/catalogue/matieres', result).subscribe({
            next: () => { this.showSuccess('Matiere ajoutee avec succes'); this.load(); },
            error: () => this.showError('Erreur lors de l\'ajout')
          });
        }
      }
    });
  }

  confirmDelete(matiere: MatiereDto): void {
    if (confirm('Etes-vous sur de vouloir supprimer la matiere "' + matiere.nom + '" ?')) {
      this.api.delete('/catalogue/matieres/' + matiere.id).subscribe({
        next: () => { this.showSuccess('Matiere supprimee avec succes'); this.load(); },
        error: () => this.showError('Erreur lors de la suppression')
      });
    }
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Fermer', { duration: 3000, panelClass: 'snack-success' });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Fermer', { duration: 5000, panelClass: 'snack-error' });
  }
}
