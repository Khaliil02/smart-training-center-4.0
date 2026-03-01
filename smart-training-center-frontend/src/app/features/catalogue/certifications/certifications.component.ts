import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { CertificationDto, CertificationRequest } from '../../../core/models';

/* ─── Dialog Component ─── */
@Component({
  selector: 'app-certification-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.certification ? 'Modifier la certification' : 'Ajouter une certification' }}</h2>
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
          <mat-label>Date d'expiration</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dateExpiration" />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="form.get('dateExpiration')?.hasError('required')">La date d'expiration est requise</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        {{ data.certification ? 'Modifier' : 'Ajouter' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; min-width: 400px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class CertificationDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CertificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { certification: CertificationDto | null }
  ) {
    this.form = this.fb.group({
      nom: [data.certification?.nom || '', Validators.required],
      description: [data.certification?.description || ''],
      dateExpiration: [data.certification?.dateExpiration ? new Date(data.certification.dateExpiration) : '', Validators.required]
    });
  }

  save(): void {
    if (this.form.valid) {
      const val = this.form.value;
      const request: CertificationRequest = {
        nom: val.nom,
        description: val.description,
        dateExpiration: val.dateExpiration instanceof Date
          ? val.dateExpiration.toISOString().split('T')[0]
          : val.dateExpiration
      };
      this.dialogRef.close(request);
    }
  }
}

/* ─── Main Component ─── */
@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Gestion des certifications</h2>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Ajouter une certification
        </button>
      </div>

      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="certifications" class="full-width-table">

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let row">{{ row.nom }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let row">{{ row.description }}</td>
          </ng-container>

          <ng-container matColumnDef="dateExpiration">
            <th mat-header-cell *matHeaderCellDef>Date Expiration</th>
            <td mat-cell *matCellDef="let row">{{ row.dateExpiration | date:'dd/MM/yyyy' }}</td>
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
              Aucune certification trouvee
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
export class CertificationsComponent implements OnInit {
  certifications: CertificationDto[] = [];
  displayedColumns = ['nom', 'description', 'dateExpiration', 'actions'];
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
    this.api.get<CertificationDto[]>('/catalogue/certifications').subscribe({
      next: (data) => { this.certifications = data; this.loading = false; },
      error: () => { this.loading = false; this.showError('Erreur lors du chargement des certifications'); }
    });
  }

  openDialog(certification?: CertificationDto): void {
    const dialogRef = this.dialog.open(CertificationDialogComponent, {
      width: '500px',
      data: { certification: certification || null }
    });

    dialogRef.afterClosed().subscribe((result: CertificationRequest | undefined) => {
      if (result) {
        if (certification) {
          this.api.put<CertificationDto>('/catalogue/certifications/' + certification.id, result).subscribe({
            next: () => { this.showSuccess('Certification modifiee avec succes'); this.load(); },
            error: () => this.showError('Erreur lors de la modification')
          });
        } else {
          this.api.post<CertificationDto>('/catalogue/certifications', result).subscribe({
            next: () => { this.showSuccess('Certification ajoutee avec succes'); this.load(); },
            error: () => this.showError('Erreur lors de l\'ajout')
          });
        }
      }
    });
  }

  confirmDelete(certification: CertificationDto): void {
    if (confirm('Etes-vous sur de vouloir supprimer la certification "' + certification.nom + '" ?')) {
      this.api.delete('/catalogue/certifications/' + certification.id).subscribe({
        next: () => { this.showSuccess('Certification supprimee avec succes'); this.load(); },
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
