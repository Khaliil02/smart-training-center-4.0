import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { IoTDeviceDto } from '../../../core/models/device.model';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatSnackBarModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour a la liste
        </button>
      </div>

      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement des informations de l'appareil...</p>
      </div>

      <div class="detail-layout" *ngIf="!loading && device">
        <!-- Header Card -->
        <mat-card class="info-card header-card">
          <mat-card-content>
            <div class="device-header">
              <div class="device-icon-container">
                <mat-icon class="device-icon">{{ getTypeIcon(device.type) }}</mat-icon>
              </div>
              <div class="device-info">
                <h2>{{ getTypeLabel(device.type) }}</h2>
                <p class="subtitle">Appareil #{{ device.id }}</p>
              </div>
            </div>
            <mat-divider></mat-divider>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Adresse MAC</span>
                <code class="mac-value">{{ device.adresseMac }}</code>
              </div>
              <div class="info-item">
                <span class="label">Version firmware</span>
                <span class="value">{{ device.firmwareVersion }}</span>
              </div>
              <div class="info-item">
                <span class="label">Salle</span>
                <span class="value">{{ device.salleNom || 'Non assignee' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Status Card -->
        <mat-card class="info-card status-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="section-icon status-section-icon">monitor_heart</mat-icon>
            <mat-card-title>Statut de l'appareil</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-display" [class.online]="device.estEnLigne" [class.offline]="!device.estEnLigne">
              <div class="status-indicator">
                <span class="big-status-dot"></span>
                <span class="status-text">{{ device.estEnLigne ? 'En ligne' : 'Hors ligne' }}</span>
              </div>
            </div>

            <div class="heartbeat-info" *ngIf="device.lastHeartbeat">
              <mat-divider></mat-divider>
              <h4>Dernier battement de coeur</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Uptime</span>
                  <span class="value">{{ formatUptime(device.lastHeartbeat.uptime) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Memoire libre</span>
                  <span class="value">{{ formatMemory(device.lastHeartbeat.freeMemory) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Horodatage</span>
                  <span class="value">{{ device.lastHeartbeat.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                </div>
              </div>
            </div>

            <div class="no-heartbeat" *ngIf="!device.lastHeartbeat">
              <mat-divider></mat-divider>
              <p>Aucune donnee de battement de coeur disponible</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Current Reading Card -->
        <mat-card class="info-card reading-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="section-icon reading-section-icon">speed</mat-icon>
            <mat-card-title>Valeur mesuree</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="reading-display" *ngIf="device.valeurMesuree !== null && device.valeurMesuree !== undefined">
              <span class="reading-value">{{ device.valeurMesuree | number:'1.1-2' }}</span>
              <span class="reading-unit">{{ getUnit(device.type) }}</span>
            </div>
            <div class="reading-display no-reading" *ngIf="device.valeurMesuree === null || device.valeurMesuree === undefined">
              <span class="reading-value">--</span>
            </div>
            <p class="reading-timestamp" *ngIf="device.dateHeureMesure">
              Derniere mesure : {{ device.dateHeureMesure | date:'dd/MM/yyyy HH:mm:ss' }}
            </p>
            <p class="reading-timestamp" *ngIf="!device.dateHeureMesure">
              Aucune mesure enregistree
            </p>
          </mat-card-content>
        </mat-card>

        <!-- Actions Card -->
        <mat-card class="info-card actions-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="section-icon actions-section-icon">settings</mat-icon>
            <mat-card-title>Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actions-list">
              <div class="action-item">
                <div class="action-info">
                  <h4>Basculer le statut</h4>
                  <p>Forcer manuellement le statut en ligne / hors ligne</p>
                </div>
                <button mat-raised-button
                        [color]="device.estEnLigne ? 'warn' : 'primary'"
                        [disabled]="toggling"
                        (click)="toggleStatus()">
                  <mat-icon>{{ device.estEnLigne ? 'power_settings_new' : 'power' }}</mat-icon>
                  {{ device.estEnLigne ? 'Mettre hors ligne' : 'Mettre en ligne' }}
                </button>
              </div>

              <mat-divider></mat-divider>

              <div class="action-item">
                <div class="action-info">
                  <h4>Mise a jour OTA</h4>
                  <p>Mettre a jour le firmware a distance</p>
                </div>
                <button mat-raised-button disabled
                        matTooltip="Fonctionnalite a venir">
                  <mat-icon>system_update</mat-icon>
                  Mise a jour OTA
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="error-state" *ngIf="!loading && !device">
        <mat-icon>error_outline</mat-icon>
        <p>Appareil introuvable</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Retour a la liste
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 16px;
    }
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      p { color: #666; margin-top: 16px; }
    }
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .header-card {
      grid-column: 1 / -1;
    }
    .info-card {
      border-radius: 12px;
    }
    .device-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    .device-icon-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1565c0, #1a237e);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .device-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }
    .device-info h2 {
      margin: 0 0 4px 0;
      color: #1a237e;
      font-size: 24px;
      font-weight: 600;
    }
    .device-info .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-item .label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .info-item .value {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }
    .mac-value {
      font-family: 'Roboto Mono', monospace;
      font-size: 15px;
      color: #333;
      background: #f5f5f5;
      padding: 4px 10px;
      border-radius: 4px;
      display: inline-block;
    }
    .section-icon {
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: 40px !important;
      height: 40px !important;
      border-radius: 50%;
      font-size: 20px;
      color: white;
    }
    .status-section-icon { background-color: #2e7d32; }
    .reading-section-icon { background-color: #e65100; }
    .actions-section-icon { background-color: #6a1b9a; }
    .status-display {
      display: flex;
      justify-content: center;
      padding: 24px;
      border-radius: 12px;
      margin: 16px 0;
    }
    .status-display.online {
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
    }
    .status-display.offline {
      background: linear-gradient(135deg, #ffebee, #ffcdd2);
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .big-status-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-display.online .big-status-dot {
      background-color: #4caf50;
      box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
    }
    .status-display.offline .big-status-dot {
      background-color: #f44336;
      box-shadow: 0 0 8px rgba(244, 67, 54, 0.6);
    }
    .status-text {
      font-size: 20px;
      font-weight: 600;
    }
    .status-display.online .status-text { color: #2e7d32; }
    .status-display.offline .status-text { color: #c62828; }
    .heartbeat-info h4 {
      color: #333;
      margin: 16px 0 8px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .no-heartbeat {
      p {
        color: #999;
        text-align: center;
        padding: 16px 0;
        font-style: italic;
      }
    }
    .reading-display {
      text-align: center;
      padding: 24px;
      margin: 16px 0;
    }
    .reading-value {
      font-size: 48px;
      font-weight: 700;
      color: #1a237e;
    }
    .reading-unit {
      font-size: 24px;
      color: #666;
      margin-left: 8px;
    }
    .no-reading .reading-value {
      color: #ccc;
    }
    .reading-timestamp {
      text-align: center;
      color: #888;
      font-size: 13px;
      margin: 0;
    }
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }
    .action-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
    }
    .action-info h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 14px;
    }
    .action-info p {
      margin: 0;
      color: #888;
      font-size: 13px;
    }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      color: #999;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; color: #f44336; }
      p { margin-bottom: 16px; font-size: 16px; }
    }
    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
      }
      .actions-card {
        grid-column: 1;
      }
    }
  `]
})
export class DeviceDetailComponent implements OnInit, OnDestroy {
  device: IoTDeviceDto | null = null;
  loading = true;
  toggling = false;
  private deviceId!: number;
  private wsSub!: Subscription;

  constructor(
    private api: ApiService,
    private wsService: WebSocketService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.deviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDevice();

    this.wsSub = this.wsService.deviceStatus$.subscribe(status => {
      if (this.device && (this.device.adresseMac === status.deviceId || this.device.id?.toString() === status.deviceId)) {
        this.device = { ...this.device, estEnLigne: status.online };
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }

  loadDevice(): void {
    this.loading = true;
    this.api.get<IoTDeviceDto>('/iot/devices/' + this.deviceId).subscribe({
      next: (data) => {
        this.device = data;
        this.loading = false;
      },
      error: () => {
        this.device = null;
        this.loading = false;
      }
    });
  }

  toggleStatus(): void {
    if (!this.device) return;
    this.toggling = true;
    const newStatus = !this.device.estEnLigne;

    this.api.put('/iot/devices/' + this.deviceId + '/status', { online: newStatus }).subscribe({
      next: () => {
        if (this.device) {
          this.device = { ...this.device, estEnLigne: newStatus };
        }
        this.snackBar.open(
          newStatus ? 'Appareil mis en ligne' : 'Appareil mis hors ligne',
          'Fermer',
          { duration: 3000 }
        );
        this.toggling = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
        this.toggling = false;
      }
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'TEMPERATURE': 'thermostat',
      'CO2': 'co2',
      'PRESENCE': 'person_pin',
      'RFID_READER': 'contactless'
    };
    return icons[type] || 'sensors';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'TEMPERATURE': 'Capteur de temperature',
      'CO2': 'Capteur de CO2',
      'PRESENCE': 'Capteur de presence',
      'RFID_READER': 'Lecteur RFID'
    };
    return labels[type] || type;
  }

  getUnit(type: string): string {
    const units: Record<string, string> = {
      'TEMPERATURE': '\u00B0C',
      'CO2': 'ppm',
      'PRESENCE': '',
      'RFID_READER': ''
    };
    return units[type] || '';
  }

  formatUptime(seconds: number): string {
    if (!seconds && seconds !== 0) return '—';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (days > 0) parts.push(days + 'j');
    if (hours > 0) parts.push(hours + 'h');
    parts.push(minutes + 'min');
    return parts.join(' ');
  }

  formatMemory(bytes: number): string {
    if (!bytes && bytes !== 0) return '—';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' Go';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return bytes + ' o';
  }

  goBack(): void {
    this.router.navigate(['/devices']);
  }
}
