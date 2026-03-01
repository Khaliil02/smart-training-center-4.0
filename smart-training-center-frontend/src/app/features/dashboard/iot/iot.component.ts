import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import {
  SalleDto,
  DashboardIoTDto,
  FleetStatusDto,
  CapteurIoTDto,
  AlerteDto,
  EnvironnementDto
} from '../../../core/models';

@Component({
  selector: 'app-iot-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatSelectModule, MatFormFieldModule,
    MatTableModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatBadgeModule
  ],
  template: `
    <div class="page-shell">
      <h2>Tableau de bord IoT</h2>

      <!-- Salle Selector -->
      <mat-card class="selector-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="salle-select">
            <mat-label>Selectionner une salle</mat-label>
            <mat-select [(value)]="selectedSalleId" (selectionChange)="onSalleChange()">
              @for (salle of salles; track salle.id) {
                <mat-option [value]="salle.id">{{ salle.nomSalle }} ({{ salle.type }})</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>meeting_room</mat-icon>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      @if (loadingSalles) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Chargement des salles...</p>
        </div>
      }

      @if (errorMessage) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      }

      <!-- Fleet Status Summary -->
      @if (fleetStatus) {
        <div class="section-title">
          <mat-icon>device_hub</mat-icon>
          <span>Statut de la flotte</span>
        </div>
        <div class="cards-row">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper blue">
                <mat-icon>devices</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Total Appareils</span>
                <span class="card-value">{{ fleetStatus.totalDevices }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper green">
                <mat-icon>wifi</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">En ligne</span>
                <span class="card-value online-value">{{ fleetStatus.devicesOnline }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper grey">
                <mat-icon>wifi_off</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Hors ligne</span>
                <span class="card-value offline-value">{{ fleetStatus.devicesOffline }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Real-time Environment Data (when salle selected) -->
      @if (iotDashboard && !loadingDashboard) {
        <div class="section-title">
          <mat-icon>sensors</mat-icon>
          <span>Environnement en temps reel - {{ iotDashboard.salleNom }}</span>
        </div>
        <div class="cards-row">
          <!-- Temperature Gauge -->
          <mat-card class="gauge-card" [class]="getTempCardClass(iotDashboard.environnementActuel.temperature)">
            <mat-card-content>
              <div class="gauge-header">
                <mat-icon>thermostat</mat-icon>
                <span>Temperature</span>
              </div>
              <div class="gauge-value">
                @if (iotDashboard.environnementActuel.temperature !== null) {
                  {{ iotDashboard.environnementActuel.temperature | number:'1.1-1' }}
                  <span class="gauge-unit">C</span>
                } @else {
                  <span class="no-data">N/A</span>
                }
              </div>
              <div class="gauge-status">
                @if (iotDashboard.environnementActuel.temperature !== null) {
                  @if (iotDashboard.environnementActuel.temperature > 30) {
                    <mat-icon class="status-alert">error</mat-icon>
                    <span class="status-alert">Alerte</span>
                  } @else if (iotDashboard.environnementActuel.temperature > 26) {
                    <mat-icon class="status-warning">warning</mat-icon>
                    <span class="status-warning">Attention</span>
                  } @else {
                    <mat-icon class="status-normal">check_circle</mat-icon>
                    <span class="status-normal">Normal</span>
                  }
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- CO2 Gauge -->
          <mat-card class="gauge-card" [class]="getCo2CardClass(iotDashboard.environnementActuel.co2)">
            <mat-card-content>
              <div class="gauge-header">
                <mat-icon>cloud</mat-icon>
                <span>CO2</span>
              </div>
              <div class="gauge-value">
                @if (iotDashboard.environnementActuel.co2 !== null) {
                  {{ iotDashboard.environnementActuel.co2 | number:'1.0-0' }}
                  <span class="gauge-unit">ppm</span>
                } @else {
                  <span class="no-data">N/A</span>
                }
              </div>
              <div class="gauge-status">
                @if (iotDashboard.environnementActuel.co2 !== null) {
                  @if (iotDashboard.environnementActuel.co2 > 1000) {
                    <mat-icon class="status-alert">error</mat-icon>
                    <span class="status-alert">Alerte</span>
                  } @else if (iotDashboard.environnementActuel.co2 > 800) {
                    <mat-icon class="status-warning">warning</mat-icon>
                    <span class="status-warning">Attention</span>
                  } @else {
                    <mat-icon class="status-normal">check_circle</mat-icon>
                    <span class="status-normal">Normal</span>
                  }
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Presence Count -->
          <mat-card class="gauge-card gauge-normal">
            <mat-card-content>
              <div class="gauge-header">
                <mat-icon>people</mat-icon>
                <span>Presence</span>
              </div>
              <div class="gauge-value">
                @if (iotDashboard.environnementActuel.presenceCount !== null) {
                  {{ iotDashboard.environnementActuel.presenceCount }}
                  <span class="gauge-unit">pers.</span>
                } @else {
                  <span class="no-data">N/A</span>
                }
              </div>
              <div class="gauge-status">
                <mat-icon class="status-normal">visibility</mat-icon>
                <span class="status-normal">Detectee</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Capteurs Table -->
        @if (iotDashboard.capteurs && iotDashboard.capteurs.length > 0) {
          <div class="section-title">
            <mat-icon>developer_board</mat-icon>
            <span>Capteurs de la salle</span>
          </div>
          <mat-card class="table-card">
            <mat-card-content>
              <table mat-table [dataSource]="iotDashboard.capteurs" class="full-width">

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let row">{{ row.type }}</td>
                </ng-container>

                <ng-container matColumnDef="adresseMac">
                  <th mat-header-cell *matHeaderCellDef>Adresse MAC</th>
                  <td mat-cell *matCellDef="let row">
                    <code class="mac-address">{{ row.adresseMac }}</code>
                  </td>
                </ng-container>

                <ng-container matColumnDef="valeur">
                  <th mat-header-cell *matHeaderCellDef>Valeur mesuree</th>
                  <td mat-cell *matCellDef="let row">{{ row.valeurMesuree | number:'1.1-1' }}</td>
                </ng-container>

                <ng-container matColumnDef="firmware">
                  <th mat-header-cell *matHeaderCellDef>Firmware</th>
                  <td mat-cell *matCellDef="let row">{{ row.firmwareVersion }}</td>
                </ng-container>

                <ng-container matColumnDef="statut">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="status-badge" [class.online]="row.estEnLigne" [class.offline]="!row.estEnLigne">
                      <mat-icon>{{ row.estEnLigne ? 'wifi' : 'wifi_off' }}</mat-icon>
                      {{ row.estEnLigne ? 'En ligne' : 'Hors ligne' }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="capteurColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: capteurColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }

        <!-- Recent Alerts Table -->
        @if (iotDashboard.alertesRecentes && iotDashboard.alertesRecentes.length > 0) {
          <div class="section-title">
            <mat-icon>notifications_active</mat-icon>
            <span>Alertes recentes</span>
          </div>
          <mat-card class="table-card">
            <mat-card-content>
              <table mat-table [dataSource]="iotDashboard.alertesRecentes" class="full-width">

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="alert-type">{{ row.type }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="message">
                  <th mat-header-cell *matHeaderCellDef>Message</th>
                  <td mat-cell *matCellDef="let row">{{ row.message }}</td>
                </ng-container>

                <ng-container matColumnDef="dateHeure">
                  <th mat-header-cell *matHeaderCellDef>Date / Heure</th>
                  <td mat-cell *matCellDef="let row">{{ row.dateHeure | date:'dd/MM/yyyy HH:mm' }}</td>
                </ng-container>

                <ng-container matColumnDef="statut">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="alert-statut" [class.active]="row.statut === 'ACTIVE'" [class.resolved]="row.statut === 'RESOLUE'">
                      {{ row.statut }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="alerteColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: alerteColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
      }

      @if (loadingDashboard) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des donnees de la salle...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-shell {
      padding: 24px;
    }
    h2 {
      color: #1a237e;
      margin-bottom: 24px;
      font-size: 26px;
      font-weight: 600;
    }
    .selector-card {
      margin-bottom: 24px;
      border-radius: 12px;
    }
    .selector-card mat-card-content {
      padding: 16px;
    }
    .salle-select {
      width: 100%;
      max-width: 400px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      gap: 16px;
      color: #666;
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
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      margin-top: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #1a237e;
    }
    .section-title mat-icon {
      color: #3949ab;
    }
    .cards-row {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .summary-card {
      flex: 1;
      min-width: 200px;
      border-radius: 12px;
    }
    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .card-icon-wrapper {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-icon-wrapper mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: white;
    }
    .card-icon-wrapper.blue {
      background: linear-gradient(135deg, #1a237e, #3949ab);
    }
    .card-icon-wrapper.green {
      background: linear-gradient(135deg, #2e7d32, #43a047);
    }
    .card-icon-wrapper.grey {
      background: linear-gradient(135deg, #616161, #9e9e9e);
    }
    .card-info {
      display: flex;
      flex-direction: column;
    }
    .card-label {
      font-size: 12px;
      color: #888;
      font-weight: 500;
    }
    .card-value {
      font-size: 26px;
      font-weight: 700;
      color: #1a237e;
    }
    .online-value {
      color: #2e7d32;
    }
    .offline-value {
      color: #9e9e9e;
    }

    /* Gauge Cards */
    .gauge-card {
      flex: 1;
      min-width: 200px;
      border-radius: 12px;
      text-align: center;
      transition: border-color 0.3s;
    }
    .gauge-card mat-card-content {
      padding: 24px 16px;
    }
    .gauge-normal {
      border-left: 4px solid #43a047;
    }
    .gauge-warning {
      border-left: 4px solid #fb8c00;
    }
    .gauge-alert {
      border-left: 4px solid #e53935;
    }
    .gauge-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #555;
    }
    .gauge-header mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .gauge-value {
      font-size: 42px;
      font-weight: 700;
      color: #1a237e;
      margin-bottom: 8px;
    }
    .gauge-unit {
      font-size: 18px;
      font-weight: 400;
      color: #888;
    }
    .gauge-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 500;
    }
    .gauge-status mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .status-normal {
      color: #43a047;
    }
    .status-warning {
      color: #fb8c00;
    }
    .status-alert {
      color: #e53935;
    }
    .no-data {
      font-size: 24px;
      color: #bbb;
      font-style: italic;
      font-weight: 400;
    }

    /* Tables */
    .table-card {
      margin-bottom: 24px;
      border-radius: 12px;
    }
    .full-width {
      width: 100%;
    }
    table {
      width: 100%;
    }
    th.mat-header-cell {
      font-weight: 600;
      color: #1a237e;
      font-size: 13px;
    }
    .mac-address {
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .status-badge.online {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .status-badge.offline {
      background-color: #f5f5f5;
      color: #9e9e9e;
    }
    .alert-type {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      color: #c62828;
    }
    .alert-statut {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .alert-statut.active {
      background-color: #fce4ec;
      color: #c62828;
    }
    .alert-statut.resolved {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
  `]
})
export class IotComponent implements OnInit, OnDestroy {
  salles: SalleDto[] = [];
  selectedSalleId: number | null = null;
  iotDashboard: DashboardIoTDto | null = null;
  fleetStatus: FleetStatusDto | null = null;

  loadingSalles = true;
  loadingDashboard = false;
  errorMessage = '';

  capteurColumns = ['type', 'adresseMac', 'valeur', 'firmware', 'statut'];
  alerteColumns = ['type', 'message', 'dateHeure', 'statut'];

  private wsSubscription: Subscription | null = null;

  constructor(
    private apiService: ApiService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadSalles();
    this.loadFleetStatus();
    this.wsService.connect();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  onSalleChange(): void {
    if (this.selectedSalleId) {
      this.loadSalleDashboard(this.selectedSalleId);
      this.subscribeToRealtime(this.selectedSalleId);
    }
  }

  getTempCardClass(temp: number | null): string {
    if (temp === null) return 'gauge-card gauge-normal';
    if (temp > 30) return 'gauge-card gauge-alert';
    if (temp > 26) return 'gauge-card gauge-warning';
    return 'gauge-card gauge-normal';
  }

  getCo2CardClass(co2: number | null): string {
    if (co2 === null) return 'gauge-card gauge-normal';
    if (co2 > 1000) return 'gauge-card gauge-alert';
    if (co2 > 800) return 'gauge-card gauge-warning';
    return 'gauge-card gauge-normal';
  }

  private loadSalles(): void {
    this.loadingSalles = true;
    this.apiService.get<SalleDto[]>('/salles').subscribe({
      next: (data) => {
        this.salles = data;
        this.loadingSalles = false;
      },
      error: (err) => {
        this.loadingSalles = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement des salles.';
      }
    });
  }

  private loadFleetStatus(): void {
    this.apiService.get<FleetStatusDto>('/dashboard/iot/fleet').subscribe({
      next: (data) => {
        this.fleetStatus = data;
      },
      error: () => {
        // Fleet status is optional; silently handled
      }
    });
  }

  private loadSalleDashboard(salleId: number): void {
    this.loadingDashboard = true;
    this.errorMessage = '';

    this.apiService.get<DashboardIoTDto>('/dashboard/iot', { salleId }).subscribe({
      next: (data) => {
        this.iotDashboard = data;
        this.loadingDashboard = false;
      },
      error: (err) => {
        this.loadingDashboard = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement des donnees IoT.';
      }
    });
  }

  private subscribeToRealtime(salleId: number): void {
    // Unsubscribe from previous salle
    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.wsService.subscribeSalleRealtime(salleId).subscribe({
      next: (env: EnvironnementDto) => {
        if (this.iotDashboard) {
          this.iotDashboard = {
            ...this.iotDashboard,
            environnementActuel: env
          };
        }
      }
    });
  }
}
