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
import { FiliereDto, FiliereRequest } from '../../../core/models';

/* ─── Dialog Component ─── */
@Component({
  selector: 'app-filiere-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.filiere ? 'Modifier la filiere' : 'Ajouter une filiere' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="nom" />
          <mat-error *ngIf="form.get('nom')?.hasError('required')">Le nom est requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Niveau</mat-label>
          <mat-select formControlName="niveau">
            <mat-option value="Licence">Licence</mat-option>
            <mat-option value="Master">Master</mat-option>
            <mat-option value="Doctorat">Doctorat</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('niveau')?.hasError('required')">Le niveau est requis</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        {{ data.filiere ? 'Modifier' : 'Ajouter' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; min-width: 400px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class FiliereDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FiliereDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { filiere: FiliereDto | null }
  ) {
    this.form = this.fb.group({
      nom: [data.filiere?.nom || '', Validators.required],
      description: [data.filiere?.description || ''],
      niveau: [data.filiere?.niveau || '', Validators.required]
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value as FiliereRequest);
    }
  }
}

/* ─── Main Component ─── */
@Component({
  selector: 'app-filieres',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Gestion des filieres</h2>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Ajouter une filiere
        </button>
      </div>

      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="filieres" class="full-width-table">

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let row">{{ row.nom }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let row">{{ row.description }}</td>
          </ng-container>

          <ng-container matColumnDef="niveau">
            <th mat-header-cell *matHeaderCellDef>Niveau</th>
            <td mat-cell *matCellDef="let row">{{ row.niveau }}</td>
          </ng-container>

          <ng-container matColumnDef="nbSpecialites">
            <th mat-header-cell *matHeaderCellDef>Nb Specialites</th>
            <td mat-cell *matCellDef="let row">{{ row.specialites?.length || 0 }}</td>
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
              Aucune filiere trouvee
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
export class FilieresComponent implements OnInit {
  filieres: FiliereDto[] = [];
  displayedColumns = ['nom', 'description', 'niveau', 'nbSpecialites', 'actions'];
  loading = false;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<FiliereDto[]>('/catalogue/filieres').subscribe({
      next: (data) => { this.filieres = data; this.loading = false; },
      error: () => { this.loading = false; this.showError('Erreur lors du chargement des filieres'); }
    });
  }

  openDialog(filiere?: FiliereDto): void {
    const dialogRef = this.dialog.open(FiliereDialogComponent, {
      width: '500px',
      data: { filiere: filiere || null }
    });

    dialogRef.afterClosed().subscribe((result: FiliereRequest | undefined) => {
      if (result) {
        if (filiere) {
          this.api.put<FiliereDto>('/catalogue/filieres/' + filiere.id, result).subscribe({
            next: () => { this.showSuccess('Filiere modifiee avec succes'); this.load(); },
            error: () => this.showError('Erreur lors de la modification')
          });
        } else {
          this.api.post<FiliereDto>('/catalogue/filieres', result).subscribe({
            next: () => { this.showSuccess('Filiere ajoutee avec succes'); this.load(); },
            error: () => this.showError('Erreur lors de l\'ajout')
          });
        }
      }
    });
  }

  confirmDelete(filiere: FiliereDto): void {
    if (confirm('Etes-vous sur de vouloir supprimer la filiere "' + filiere.nom + '" ?')) {
      this.api.delete('/catalogue/filieres/' + filiere.id).subscribe({
        next: () => { this.showSuccess('Filiere supprimee avec succes'); this.load(); },
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
