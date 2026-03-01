import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AlerteDto } from '../../../core/models/alerte.model';

@Component({
  selector: 'app-alert-panel',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
    MatIconModule, MatTableModule, MatBadgeModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, DatePipe
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h2>Panneau des alertes</h2>
          <p class="subtitle">Surveillance et gestion des alertes en temps reel</p>
        </div>
        <div class="header-actions">
          <span class="active-count" *ngIf="activeCount > 0" [matBadge]="activeCount" matBadgeColor="warn" matBadgeOverlap="false">
            Alertes actives
          </span>
        </div>
      </div>

      <!-- Toggle -->
      <div class="toggle-row">
        <mat-button-toggle-group [value]="viewMode" (change)="onViewModeChange($event.value)">
          <mat-button-toggle value="active">
            <mat-icon>warning</mat-icon>
            Alertes actives
            <span class="toggle-count" *ngIf="activeCount > 0">({{ activeCount }})</span>
          </mat-button-toggle>
          <mat-button-toggle value="all">
            <mat-icon>list</mat-icon>
            Toutes les alertes
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <!-- WebSocket indicator -->
      <div class="ws-indicator">
        <span class="ws-dot" [class.connected]="wsConnected"></span>
        {{ wsConnected ? 'Ecoute des alertes en temps reel' : 'Connexion en cours...' }}
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement des alertes...</p>
      </div>

      <!-- Alerts Table -->
      <mat-card class="table-card" *ngIf="!loading">
        <mat-card-content>
          <div class="table-responsive" *ngIf="alertes.length > 0; else noAlertes">
            <table mat-table [dataSource]="alertes" class="full-width-table">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let a">
                  <div class="type-cell">
                    <mat-icon [class]="'type-icon type-' + a.type?.toLowerCase()">{{ getTypeIcon(a.type) }}</mat-icon>
                    <span>{{ getTypeLabel(a.type) }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef>Message</th>
                <td mat-cell *matCellDef="let a">
                  <span class="message-text" [class.new-alert]="a._isNew">{{ a.message }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="salle">
                <th mat-header-cell *matHeaderCellDef>Salle</th>
                <td mat-cell *matCellDef="let a">{{ a.salleNom }}</td>
              </ng-container>

              <ng-container matColumnDef="dateHeure">
                <th mat-header-cell *matHeaderCellDef>Date / Heure</th>
                <td mat-cell *matCellDef="let a">{{ a.dateHeure | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              </ng-container>

              <ng-container matColumnDef="source">
                <th mat-header-cell *matHeaderCellDef>Source</th>
                <td mat-cell *matCellDef="let a">{{ a.source }}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let a">
                  <span class="statut-badge" [class.active]="a.statut === 'ACTIVE'" [class.resolved]="a.statut === 'RESOLUE'">
                    {{ a.statut === 'ACTIVE' ? 'Active' : 'Resolue' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let a">
                  <button mat-stroked-button color="primary" *ngIf="a.statut === 'ACTIVE'"
                          (click)="traiterAlerte(a)" [disabled]="a._processing"
                          matTooltip="Marquer comme traitee">
                    <mat-icon>{{ a._processing ? 'hourglass_empty' : 'check' }}</mat-icon>
                    {{ a._processing ? 'Traitement...' : 'Traiter' }}
                  </button>
                  <span *ngIf="a.statut === 'RESOLUE'" class="resolved-text">
                    <mat-icon class="resolved-icon">check_circle</mat-icon>
                    Traitee
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [class.new-row]="row._isNew"
                  [class.active-row]="row.statut === 'ACTIVE'"></tr>
            </table>
          </div>
          <ng-template #noAlertes>
            <div class="empty-state">
              <mat-icon>notifications_off</mat-icon>
              <p>{{ viewMode === 'active' ? 'Aucune alerte active' : 'Aucune alerte enregistree' }}</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { color: #1a237e; margin: 0; font-size: 24px; }
      .subtitle { color: #666; margin: 4px 0 0; }
    }
    .header-actions { display: flex; align-items: center; }
    .active-count {
      font-size: 14px; font-weight: 500; color: #c62828; padding: 8px 16px;
    }

    .toggle-row { margin-bottom: 16px; }
    .toggle-count { font-weight: 600; margin-left: 4px; }

    .ws-indicator {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: #888; margin-bottom: 16px;
    }
    .ws-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #ccc;
      display: inline-block;
    }
    .ws-dot.connected { background: #4caf50; animation: pulse 2s infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .loading-container {
      display: flex; flex-direction: column; align-items: center; padding: 48px;
      p { color: #666; margin-top: 16px; }
    }

    .table-card { margin-bottom: 20px; }
    .table-responsive { overflow-x: auto; }
    .full-width-table { width: 100%; }

    .type-cell {
      display: flex; align-items: center; gap: 8px;
    }
    .type-icon {
      font-size: 20px; width: 20px; height: 20px;
    }
    .type-temperature { color: #ef5350; }
    .type-co2 { color: #42a5f5; }
    .type-device_offline { color: #ff9800; }

    .message-text { font-size: 13px; }
    .message-text.new-alert {
      font-weight: 600; color: #c62828;
    }

    .statut-badge {
      display: inline-block; padding: 4px 12px; border-radius: 12px;
      font-size: 12px; font-weight: 500;
    }
    .statut-badge.active { background: #ffebee; color: #c62828; }
    .statut-badge.resolved { background: #e8f5e9; color: #2e7d32; }

    .resolved-text {
      display: inline-flex; align-items: center; gap: 4px;
      color: #2e7d32; font-size: 13px;
    }
    .resolved-icon {
      font-size: 18px !important; width: 18px !important; height: 18px !important;
    }

    .new-row {
      animation: highlight 3s ease-out;
    }
    .active-row {
      border-left: 3px solid #ef5350;
    }
    @keyframes highlight {
      0% { background-color: #fff3e0; }
      100% { background-color: transparent; }
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; padding: 64px; color: #999;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    }
  `]
})
export class AlertPanelComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private ws = inject(WebSocketService);
  private snackBar = inject(MatSnackBar);

  alertes: (AlerteDto & { _isNew?: boolean; _processing?: boolean })[] = [];
  viewMode: 'active' | 'all' = 'active';
  loading = true;
  wsConnected = false;
  activeCount = 0;

  displayedColumns = ['type', 'message', 'salle', 'dateHeure', 'source', 'statut', 'actions'];

  private wsSub?: Subscription;

  ngOnInit(): void {
    this.loadAlertes();
    this.subscribeRealtime();
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  private loadAlertes(): void {
    this.loading = true;
    const endpoint = this.viewMode === 'active' ? '/alertes' : '/alertes/all';
    this.api.get<AlerteDto[]>(endpoint).subscribe({
      next: (data) => {
        this.alertes = data;
        this.computeActiveCount();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private subscribeRealtime(): void {
    this.ws.connect();
    this.wsSub = this.ws.alerts$.subscribe({
      next: (alerte) => {
        this.wsConnected = true;
        const enriched = { ...alerte, _isNew: true };
        // Prepend new alert at the top
        this.alertes = [enriched, ...this.alertes];
        this.computeActiveCount();
        this.snackBar.open(
          'Nouvelle alerte : ' + alerte.message,
          'Fermer',
          { duration: 5000, panelClass: ['snackbar-warn'] }
        );
        // Remove new highlight after 5 seconds
        setTimeout(() => { enriched._isNew = false; }, 5000);
      }
    });
    setTimeout(() => { this.wsConnected = true; }, 2000);
  }

  onViewModeChange(mode: 'active' | 'all'): void {
    this.viewMode = mode;
    this.loadAlertes();
  }

  traiterAlerte(alerte: AlerteDto & { _processing?: boolean }): void {
    alerte._processing = true;
    this.api.put<AlerteDto>('/alertes/' + alerte.id + '/traiter').subscribe({
      next: (updated) => {
        // Update in the list
        const idx = this.alertes.findIndex(a => a.id === alerte.id);
        if (idx !== -1) {
          this.alertes[idx] = { ...this.alertes[idx], ...updated, _processing: false };
          this.alertes = [...this.alertes]; // trigger change detection
        }
        this.computeActiveCount();
        this.snackBar.open('Alerte traitee avec succes', 'Fermer', { duration: 3000 });
      },
      error: () => {
        alerte._processing = false;
        this.snackBar.open('Erreur lors du traitement de l\'alerte', 'Fermer', { duration: 3000 });
      }
    });
  }

  private computeActiveCount(): void {
    this.activeCount = this.alertes.filter(a => a.statut === 'ACTIVE').length;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'TEMPERATURE': 'thermostat',
      'CO2': 'air',
      'DEVICE_OFFLINE': 'wifi_off'
    };
    return icons[type] || 'warning';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'TEMPERATURE': 'Temperature',
      'CO2': 'CO2',
      'DEVICE_OFFLINE': 'Appareil hors ligne'
    };
    return labels[type] || type;
  }
}
