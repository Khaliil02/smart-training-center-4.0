import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../core/services/api.service';
import { AuditLog } from '../../../core/models/audit.model';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h2>Journal d'audit</h2>
          <p class="subtitle">Tracabilite des actions effectuees dans le systeme</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Action</mat-label>
          <mat-select [(ngModel)]="filterAction">
            <mat-option value="">(Toutes)</mat-option>
            <mat-option value="CREATE">CREATE</mat-option>
            <mat-option value="UPDATE">UPDATE</mat-option>
            <mat-option value="DELETE">DELETE</mat-option>
            <mat-option value="LOGIN">LOGIN</mat-option>
            <mat-option value="LOGOUT">LOGOUT</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Type d'entite</mat-label>
          <input matInput [(ngModel)]="filterEntityType" placeholder="Ex: User, Cours...">
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Date debut</mat-label>
          <input matInput [matDatepicker]="pickerStart" [(ngModel)]="filterDateStart">
          <mat-datepicker-toggle matIconSuffix [for]="pickerStart"></mat-datepicker-toggle>
          <mat-datepicker #pickerStart></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Date fin</mat-label>
          <input matInput [matDatepicker]="pickerEnd" [(ngModel)]="filterDateEnd">
          <mat-datepicker-toggle matIconSuffix [for]="pickerEnd"></mat-datepicker-toggle>
          <mat-datepicker #pickerEnd></mat-datepicker>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="applyFilters()" class="filter-btn">
          <mat-icon>filter_list</mat-icon>
          Filtrer
        </button>

        <button mat-button (click)="resetFilters()" class="filter-btn">
          <mat-icon>clear</mat-icon>
          Reinitialiser
        </button>
      </div>

      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement du journal d'audit...</p>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="dataSource" matSort class="audit-table">

          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let log">{{ log.id }}</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Action</th>
            <td mat-cell *matCellDef="let log">
              <span class="action-chip" [ngClass]="getActionClass(log.action)">
                {{ log.action }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="entityType">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type Entite</th>
            <td mat-cell *matCellDef="let log">{{ log.entityType }}</td>
          </ng-container>

          <ng-container matColumnDef="entityId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID Entite</th>
            <td mat-cell *matCellDef="let log">{{ log.entityId }}</td>
          </ng-container>

          <ng-container matColumnDef="userId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilisateur</th>
            <td mat-cell *matCellDef="let log">
              <div class="user-cell">
                <mat-icon class="user-icon">person</mat-icon>
                {{ log.userId }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef>Details</th>
            <td mat-cell *matCellDef="let log">
              <span class="details-text">{{ log.details || '—' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Horodatage</th>
            <td mat-cell *matCellDef="let log">
              {{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row no-data-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              Aucune entree d'audit trouvee
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]"
                       showFirstLastButtons
                       aria-label="Selectionner la page">
        </mat-paginator>
      </div>

      <div class="empty-state" *ngIf="!loading && allLogs.length === 0">
        <mat-icon>receipt_long</mat-icon>
        <p>Aucune entree dans le journal d'audit</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-left h2 {
      color: #1a237e;
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .subtitle {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 20px;
      padding: 16px 20px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .filter-field {
      flex: 1;
      min-width: 180px;
      max-width: 220px;
    }
    .filter-btn {
      margin-top: 4px;
      height: 56px;
    }
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      p { color: #666; margin-top: 16px; }
    }
    .table-container {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .audit-table {
      width: 100%;
    }
    .action-chip {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .action-create {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .action-update {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    .action-delete {
      background-color: #ffebee;
      color: #c62828;
    }
    .action-login {
      background-color: #e0f2f1;
      color: #00695c;
    }
    .action-logout {
      background-color: #fff3e0;
      color: #e65100;
    }
    .action-default {
      background-color: #f5f5f5;
      color: #616161;
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .user-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #888;
    }
    .details-text {
      max-width: 250px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #555;
      font-size: 13px;
    }
    .no-data-row td {
      text-align: center;
      padding: 48px 16px;
      color: #999;
      font-style: italic;
    }
    th.mat-header-cell {
      font-weight: 600;
      color: #333;
      font-size: 13px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      color: #999;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
      p { font-size: 16px; }
    }
  `]
})
export class AuditLogComponent implements OnInit {
  displayedColumns: string[] = ['id', 'action', 'entityType', 'entityId', 'userId', 'details', 'timestamp'];
  dataSource = new MatTableDataSource<AuditLog>([]);
  allLogs: AuditLog[] = [];
  loading = true;

  filterAction = '';
  filterEntityType = '';
  filterDateStart: Date | null = null;
  filterDateEnd: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.api.get<AuditLog[]>('/audit').subscribe({
      next: (data) => {
        this.allLogs = data.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.dataSource.data = this.allLogs;
        this.loading = false;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allLogs];

    if (this.filterAction) {
      filtered = filtered.filter(log => log.action === this.filterAction);
    }

    if (this.filterEntityType && this.filterEntityType.trim()) {
      const search = this.filterEntityType.trim().toLowerCase();
      filtered = filtered.filter(log =>
        log.entityType?.toLowerCase().includes(search)
      );
    }

    if (this.filterDateStart) {
      const start = new Date(this.filterDateStart);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => new Date(log.timestamp) >= start);
    }

    if (this.filterDateEnd) {
      const end = new Date(this.filterDateEnd);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= end);
    }

    this.dataSource.data = filtered;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.filterAction = '';
    this.filterEntityType = '';
    this.filterDateStart = null;
    this.filterDateEnd = null;
    this.dataSource.data = this.allLogs;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getActionClass(action: string): string {
    const classes: Record<string, string> = {
      'CREATE': 'action-create',
      'UPDATE': 'action-update',
      'DELETE': 'action-delete',
      'LOGIN': 'action-login',
      'LOGOUT': 'action-logout'
    };
    return classes[action] || 'action-default';
  }
}
