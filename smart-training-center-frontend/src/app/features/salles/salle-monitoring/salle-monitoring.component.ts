import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';
import { EnvironnementDto } from '../../../core/models/salle.model';
import { PresenceDto } from '../../../core/models/presence.model';

@Component({
  selector: 'app-salle-monitoring',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule, MatTooltipModule,
    BaseChartDirective, DatePipe
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
            <h2>Monitoring - {{ salleNom || 'Chargement...' }}</h2>
            <p class="subtitle">Historique des donnees environnementales</p>
          </div>
        </div>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement de l'historique...</p>
      </div>

      <!-- Current Values Cards -->
      <div class="current-row" *ngIf="!loading && latestEnv">
        <mat-card class="current-card temp-card">
          <div class="current-icon">
            <mat-icon>thermostat</mat-icon>
          </div>
          <div class="current-info">
            <span class="current-label">Temperature actuelle</span>
            <span class="current-value">
              {{ latestEnv.temperature !== null ? (latestEnv.temperature | number:'1.1-1') : '--' }} °C
            </span>
          </div>
        </mat-card>

        <mat-card class="current-card co2-card">
          <div class="current-icon co2-icon">
            <mat-icon>air</mat-icon>
          </div>
          <div class="current-info">
            <span class="current-label">CO2 actuel</span>
            <span class="current-value">
              {{ latestEnv.co2 !== null ? (latestEnv.co2 | number:'1.0-0') : '--' }} ppm
            </span>
          </div>
        </mat-card>

        <mat-card class="current-card presence-card">
          <div class="current-icon presence-icon">
            <mat-icon>groups</mat-icon>
          </div>
          <div class="current-info">
            <span class="current-label">Presence actuelle</span>
            <span class="current-value">
              {{ latestEnv.presenceCount !== null ? latestEnv.presenceCount : '--' }} personnes
            </span>
          </div>
        </mat-card>
      </div>

      <!-- Temperature Chart -->
      <mat-card class="chart-card" *ngIf="!loading && historique.length > 0">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>thermostat</mat-icon>
            Historique de temperature
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-container">
            <canvas baseChart
              [datasets]="tempChartData.datasets"
              [labels]="tempChartData.labels"
              [options]="tempChartOptions"
              type="line">
            </canvas>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- CO2 Chart -->
      <mat-card class="chart-card" *ngIf="!loading && historique.length > 0">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>air</mat-icon>
            Historique de CO2
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-container">
            <canvas baseChart
              [datasets]="co2ChartData.datasets"
              [labels]="co2ChartData.labels"
              [options]="co2ChartOptions"
              type="line">
            </canvas>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- No data -->
      <div class="empty-state" *ngIf="!loading && historique.length === 0">
        <mat-icon>show_chart</mat-icon>
        <p>Aucune donnee historique disponible</p>
      </div>

      <!-- Recent Presences -->
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
            <p class="empty-text">Aucune presence enregistree</p>
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

    .current-row {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;
    }
    .current-card {
      display: flex; align-items: center; gap: 16px; padding: 16px 20px !important;
    }
    .current-icon {
      display: flex; align-items: center; justify-content: center;
      width: 48px; height: 48px; border-radius: 50%; background: #ef5350; color: white;
    }
    .co2-icon { background: #42a5f5 !important; }
    .presence-icon { background: #66bb6a !important; }
    .current-info { display: flex; flex-direction: column; }
    .current-label { font-size: 12px; color: #888; text-transform: uppercase; }
    .current-value { font-size: 24px; font-weight: 700; color: #333; }

    .chart-card {
      margin-bottom: 20px;
      mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
    }
    .chart-container {
      position: relative; height: 300px; width: 100%;
    }

    .section-card {
      margin-bottom: 20px;
      mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
    }
    .table-responsive { overflow-x: auto; }
    .full-width-table { width: 100%; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .method-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      background: #e3f2fd; color: #1565c0; font-size: 12px; font-weight: 500;
    }
    .empty-text { color: #999; text-align: center; padding: 24px; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center; padding: 64px; color: #999;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    }

    @media (max-width: 900px) {
      .current-row { grid-template-columns: 1fr; }
    }
  `]
})
export class SalleMonitoringComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  salleId!: number;
  salleNom: string = '';
  historique: EnvironnementDto[] = [];
  latestEnv: EnvironnementDto | null = null;
  presences: PresenceDto[] = [];
  loading = true;

  presenceColumns = ['etudiant', 'matricule', 'methode', 'dateHeure'];

  // Chart data
  tempChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  co2ChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  tempChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        title: { display: true, text: 'Temperature (°C)' },
        beginAtZero: false
      },
      x: {
        title: { display: true, text: 'Heure' }
      }
    }
  };

  co2ChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        title: { display: true, text: 'CO2 (ppm)' },
        beginAtZero: false
      },
      x: {
        title: { display: true, text: 'Heure' }
      }
    }
  };

  ngOnInit(): void {
    this.salleId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    this.api.get<EnvironnementDto[]>('/salles/' + this.salleId + '/environnement/historique').subscribe({
      next: (data) => {
        this.historique = data;
        if (data.length > 0) {
          this.latestEnv = data[data.length - 1];
          this.salleNom = data[0].salleNom;
        }
        this.buildCharts();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.api.get<PresenceDto[]>('/salles/' + this.salleId + '/presences').subscribe({
      next: (data) => { this.presences = data; }
    });

    // Also load salle name if historique is empty
    this.api.get<any>('/salles/' + this.salleId).subscribe({
      next: (salle) => { if (!this.salleNom) this.salleNom = salle.nomSalle; }
    });
  }

  private buildCharts(): void {
    const labels = this.historique.map(h => {
      if (h.temperatureTimestamp) {
        const d = new Date(h.temperatureTimestamp);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
      return '';
    });

    this.tempChartData = {
      labels,
      datasets: [
        {
          data: this.historique.map(h => h.temperature ?? 0),
          label: 'Temperature (°C)',
          borderColor: '#ef5350',
          backgroundColor: 'rgba(239, 83, 80, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2
        }
      ]
    };

    const co2Labels = this.historique.map(h => {
      if (h.co2Timestamp) {
        const d = new Date(h.co2Timestamp);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
      return '';
    });

    this.co2ChartData = {
      labels: co2Labels,
      datasets: [
        {
          data: this.historique.map(h => h.co2 ?? 0),
          label: 'CO2 (ppm)',
          borderColor: '#42a5f5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2
        }
      ]
    };
  }

  goBack(): void {
    this.router.navigate(['/salles', this.salleId]);
  }
}
