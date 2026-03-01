import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { SalleDto, CapteurIoTDto, EnvironnementDto } from '../../../core/models/salle.model';
import { PresenceDto } from '../../../core/models/presence.model';

@Component({
  selector: 'app-salle-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, DatePipe
  ],
  template: `
    <div class="page-shell">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()" matTooltip="Retour">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h2>{{ salle?.nomSalle || 'Chargement...' }}</h2>
            <p class="subtitle" *ngIf="salle">{{ getTypeLabel(salle.type) }} - Capacite : {{ salle.capacite }} places</p>
          </div>
        </div>
        <button mat-raised-button color="accent" [routerLink]="['/salles', salleId, 'monitoring']" *ngIf="salle">
          <mat-icon>show_chart</mat-icon>
          Monitoring
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement des donnees...</p>
      </div>

      <!-- Gauge Cards -->
      <div class="gauges-row" *ngIf="!loading && environnement">
        <!-- Temperature -->
        <mat-card class="gauge-card" [class]="getTempClass()">
          <div class="gauge-icon">
            <mat-icon>thermostat</mat-icon>
          </div>
          <div class="gauge-content">
            <span class="gauge-label">Temperature</span>
            <span class="gauge-value">
              {{ environnement.temperature !== null ? (environnement.temperature | number:'1.1-1') : '--' }}
              <span class="gauge-unit">°C</span>
            </span>
          </div>
          <div class="gauge-timestamp" *ngIf="environnement.temperatureTimestamp">
            {{ environnement.temperatureTimestamp | date:'HH:mm:ss' }}
          </div>
        </mat-card>

        <!-- CO2 -->
        <mat-card class="gauge-card" [class]="getCo2Class()">
          <div class="gauge-icon">
            <mat-icon>air</mat-icon>
          </div>
          <div class="gauge-content">
            <span class="gauge-label">CO2</span>
            <span class="gauge-value">
              {{ environnement.co2 !== null ? (environnement.co2 | number:'1.0-0') : '--' }}
              <span class="gauge-unit">ppm</span>
            </span>
          </div>
          <div class="gauge-timestamp" *ngIf="environnement.co2Timestamp">
            {{ environnement.co2Timestamp | date:'HH:mm:ss' }}
          </div>
        </mat-card>

        <!-- Presence -->
        <mat-card class="gauge-card gauge-presence">
          <div class="gauge-icon">
            <mat-icon>groups</mat-icon>
          </div>
          <div class="gauge-content">
            <span class="gauge-label">Presence</span>
            <span class="gauge-value">
              {{ environnement.presenceCount !== null ? environnement.presenceCount : '--' }}
              <span class="gauge-unit">personnes</span>
            </span>
          </div>
          <div class="gauge-timestamp" *ngIf="environnement.presenceTimestamp">
            {{ environnement.presenceTimestamp | date:'HH:mm:ss' }}
          </div>
        </mat-card>
      </div>

      <div class="ws-indicator" *ngIf="!loading && environnement">
        <span class="ws-dot" [class.connected]="wsConnected"></span>
        {{ wsConnected ? 'Mise a jour en temps reel active' : 'Connexion temps reel...' }}
      </div>

      <!-- Sensors Table -->
      <mat-card class="section-card" *ngIf="!loading && salle">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>sensors</mat-icon>
            Capteurs IoT
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-responsive" *ngIf="salle.capteurs && salle.capteurs.length > 0; else noCapteurs">
            <table mat-table [dataSource]="salle.capteurs" class="full-width-table">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let c">{{ c.type }}</td>
              </ng-container>
              <ng-container matColumnDef="adresseMac">
                <th mat-header-cell *matHeaderCellDef>Adresse MAC</th>
                <td mat-cell *matCellDef="let c"><code>{{ c.adresseMac }}</code></td>
              </ng-container>
              <ng-container matColumnDef="valeur">
                <th mat-header-cell *matHeaderCellDef>Valeur</th>
                <td mat-cell *matCellDef="let c">{{ c.valeurMesuree ?? '--' }}</td>
              </ng-container>
              <ng-container matColumnDef="firmware">
                <th mat-header-cell *matHeaderCellDef>Firmware</th>
                <td mat-cell *matCellDef="let c">{{ c.firmwareVersion }}</td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let c">
                  <span class="status-pill" [class.online]="c.estEnLigne" [class.offline]="!c.estEnLigne">
                    {{ c.estEnLigne ? 'En ligne' : 'Hors ligne' }}
                  </span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="capteurColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: capteurColumns;"></tr>
            </table>
          </div>
          <ng-template #noCapteurs>
            <p class="empty-text">Aucun capteur associe a cette salle</p>
          </ng-template>
        </mat-card-content>
      </mat-card>

      <!-- Recent Presences Table -->
      <mat-card class="section-card" *ngIf="!loading">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>badge</mat-icon>
            Presences recentes
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-responsive" *ngIf="presences.length > 0; else noPresences">
            <table mat-table [dataSource]="presences" class="full-width-table">
              <ng-container matColumnDef="etudiant">
                <th mat-header-cell *matHeaderCellDef>Etudiant</th>
                <td mat-cell *matCellDef="let p">{{ p.etudiantNom }}</td>
              </ng-container>
              <ng-container matColumnDef="matricule">
                <th mat-header-cell *matHeaderCellDef>Matricule</th>
                <td mat-cell *matCellDef="let p"><code>{{ p.etudiantMatricule }}</code></td>
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
              <tr mat-header-row *matHeaderRowDef="presenceColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: presenceColumns;"></tr>
            </table>
          </div>
          <ng-template #noPresences>
            <p class="empty-text">Aucune presence enregistree recemment</p>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
    }
    .header-left {
      display: flex; align-items: center; gap: 12px;
      h2 { color: #1a237e; margin: 0; font-size: 22px; }
      .subtitle { color: #666; margin: 2px 0 0; font-size: 14px; }
    }
    .loading-container {
      display: flex; flex-direction: column; align-items: center; padding: 48px;
      p { color: #666; margin-top: 16px; }
    }
    .gauges-row {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;
    }
    .gauge-card {
      display: flex; align-items: center; gap: 16px; padding: 20px !important;
      border-left: 5px solid; position: relative;
    }
    .gauge-icon {
      display: flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 50%; color: white;
    }
    .gauge-content {
      display: flex; flex-direction: column;
    }
    .gauge-label { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .gauge-value { font-size: 32px; font-weight: 700; line-height: 1.2; }
    .gauge-unit { font-size: 14px; font-weight: 400; color: #888; }
    .gauge-timestamp {
      position: absolute; top: 8px; right: 12px; font-size: 11px; color: #aaa;
    }
    /* Temperature */
    .gauge-temp-green { border-left-color: #4caf50; }
    .gauge-temp-green .gauge-icon { background: #4caf50; }
    .gauge-temp-green .gauge-value { color: #2e7d32; }
    .gauge-temp-orange { border-left-color: #ff9800; }
    .gauge-temp-orange .gauge-icon { background: #ff9800; }
    .gauge-temp-orange .gauge-value { color: #e65100; }
    .gauge-temp-red { border-left-color: #f44336; }
    .gauge-temp-red .gauge-icon { background: #f44336; }
    .gauge-temp-red .gauge-value { color: #c62828; }
    /* CO2 */
    .gauge-co2-green { border-left-color: #4caf50; }
    .gauge-co2-green .gauge-icon { background: #4caf50; }
    .gauge-co2-green .gauge-value { color: #2e7d32; }
    .gauge-co2-orange { border-left-color: #ff9800; }
    .gauge-co2-orange .gauge-icon { background: #ff9800; }
    .gauge-co2-orange .gauge-value { color: #e65100; }
    .gauge-co2-red { border-left-color: #f44336; }
    .gauge-co2-red .gauge-icon { background: #f44336; }
    .gauge-co2-red .gauge-value { color: #c62828; }
    /* Presence */
    .gauge-presence { border-left-color: #1565c0; }
    .gauge-presence .gauge-icon { background: #1565c0; }
    .gauge-presence .gauge-value { color: #1565c0; }

    .ws-indicator {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: #888; margin-bottom: 20px;
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

    .section-card {
      margin-bottom: 20px;
      mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
    }
    .table-responsive { overflow-x: auto; }
    .full-width-table { width: 100%; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .status-pill {
      display: inline-block; padding: 3px 10px; border-radius: 12px;
      font-size: 12px; font-weight: 500;
    }
    .status-pill.online { background: #e8f5e9; color: #2e7d32; }
    .status-pill.offline { background: #fbe9e7; color: #c62828; }
    .method-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      background: #e3f2fd; color: #1565c0; font-size: 12px; font-weight: 500;
    }
    .empty-text { color: #999; text-align: center; padding: 24px; }

    @media (max-width: 900px) {
      .gauges-row { grid-template-columns: 1fr; }
    }
  `]
})
export class SalleDetailComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private ws = inject(WebSocketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  salleId!: number;
  salle: SalleDto | null = null;
  environnement: EnvironnementDto | null = null;
  presences: PresenceDto[] = [];
  loading = true;
  wsConnected = false;

  capteurColumns = ['type', 'adresseMac', 'valeur', 'firmware', 'statut'];
  presenceColumns = ['etudiant', 'matricule', 'methode', 'dateHeure'];

  private wsSub?: Subscription;

  ngOnInit(): void {
    this.salleId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
    this.subscribeRealtime();
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  private loadData(): void {
    this.loading = true;
    this.api.get<SalleDto>('/salles/' + this.salleId).subscribe({
      next: (salle) => {
        this.salle = salle;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.api.get<EnvironnementDto>('/salles/' + this.salleId + '/environnement').subscribe({
      next: (env) => { this.environnement = env; }
    });

    this.api.get<PresenceDto[]>('/salles/' + this.salleId + '/presences').subscribe({
      next: (data) => { this.presences = data; }
    });
  }

  private subscribeRealtime(): void {
    this.ws.connect();
    this.wsSub = this.ws.subscribeSalleRealtime(this.salleId).subscribe({
      next: (env) => {
        this.environnement = env;
        this.wsConnected = true;
      }
    });
    // Mark connected after a short delay if data comes through
    setTimeout(() => { this.wsConnected = true; }, 2000);
  }

  getTempClass(): string {
    const temp = this.environnement?.temperature;
    if (temp === null || temp === undefined) return 'gauge-temp-green';
    if (temp < 26) return 'gauge-temp-green';
    if (temp <= 30) return 'gauge-temp-orange';
    return 'gauge-temp-red';
  }

  getCo2Class(): string {
    const co2 = this.environnement?.co2;
    if (co2 === null || co2 === undefined) return 'gauge-co2-green';
    if (co2 < 800) return 'gauge-co2-green';
    if (co2 <= 1000) return 'gauge-co2-orange';
    return 'gauge-co2-red';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'COURS': 'Salle de cours', 'TP': 'Salle de TP',
      'AMPHITHEATRE': 'Amphitheatre', 'LABO': 'Laboratoire'
    };
    return labels[type] || type;
  }

  goBack(): void {
    this.router.navigate(['/salles']);
  }
}
