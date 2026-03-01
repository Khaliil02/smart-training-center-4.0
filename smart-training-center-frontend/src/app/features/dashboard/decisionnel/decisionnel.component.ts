import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';
import { DashboardDecisionnelDto, FiliereStatsDto, EnvironnementResumeDto } from '../../../core/models';

@Component({
  selector: 'app-decisionnel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatTableModule, MatIconModule, MatProgressSpinnerModule,
    BaseChartDirective
  ],
  template: `
    <div class="page-shell">
      <h2>Tableau de bord decisionnel</h2>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Chargement des donnees...</p>
        </div>
      }

      @if (errorMessage) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      }

      @if (dashboard && !loading) {
        <!-- KPI Cards -->
        <div class="cards-row">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper green">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Taux Reussite Global</span>
                <span class="card-value">{{ dashboard.tauxReussiteGlobal | number:'1.1-1' }}%</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper blue">
                <mat-icon>event_available</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Taux Presence Global</span>
                <span class="card-value">{{ dashboard.tauxPresenceGlobal | number:'1.1-1' }}%</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Bar Chart: Taux de reussite par filiere -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Taux de reussite par filiere</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                [type]="'bar'">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Filiere Stats Table -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Statistiques par filiere</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="dashboard.filiereStats" class="full-width">

              <ng-container matColumnDef="filiere">
                <th mat-header-cell *matHeaderCellDef>Filiere</th>
                <td mat-cell *matCellDef="let row">{{ row.filiereNom }}</td>
              </ng-container>

              <ng-container matColumnDef="etudiants">
                <th mat-header-cell *matHeaderCellDef>Etudiants</th>
                <td mat-cell *matCellDef="let row">{{ row.totalEtudiants }}</td>
              </ng-container>

              <ng-container matColumnDef="tauxReussite">
                <th mat-header-cell *matHeaderCellDef>Taux Reussite</th>
                <td mat-cell *matCellDef="let row">
                  <span [class]="getReussiteClass(row.tauxReussite)">
                    {{ row.tauxReussite | number:'1.1-1' }}%
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="progression">
                <th mat-header-cell *matHeaderCellDef>Progression Moy.</th>
                <td mat-cell *matCellDef="let row">{{ row.progressionMoyenne | number:'1.1-1' }}%</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="filiereColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: filiereColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- Environmental Indicators Summary -->
        @if (dashboard.indicateursEnvironnementaux && dashboard.indicateursEnvironnementaux.length > 0) {
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title>Indicateurs environnementaux</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="dashboard.indicateursEnvironnementaux" class="full-width">

                <ng-container matColumnDef="salle">
                  <th mat-header-cell *matHeaderCellDef>Salle</th>
                  <td mat-cell *matCellDef="let row">{{ row.salleNom }}</td>
                </ng-container>

                <ng-container matColumnDef="temperature">
                  <th mat-header-cell *matHeaderCellDef>Temperature Moy.</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.temperatureMoyenne !== null) {
                      <span [class]="getTempClass(row.temperatureMoyenne)">
                        {{ row.temperatureMoyenne | number:'1.1-1' }} C
                      </span>
                    } @else {
                      <span class="no-data">N/A</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="co2">
                  <th mat-header-cell *matHeaderCellDef>CO2 Moyen</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.co2Moyen !== null) {
                      <span [class]="getCo2Class(row.co2Moyen)">
                        {{ row.co2Moyen | number:'1.0-0' }} ppm
                      </span>
                    } @else {
                      <span class="no-data">N/A</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="presence">
                  <th mat-header-cell *matHeaderCellDef>Presence Moy.</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.presenceMoyenne !== null) {
                      {{ row.presenceMoyenne | number:'1.0-0' }}
                    } @else {
                      <span class="no-data">N/A</span>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="envColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: envColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
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
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
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
    .cards-row {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .summary-card {
      flex: 1;
      min-width: 260px;
      border-radius: 12px;
    }
    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }
    .card-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-icon-wrapper mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: white;
    }
    .card-icon-wrapper.blue {
      background: linear-gradient(135deg, #1a237e, #3949ab);
    }
    .card-icon-wrapper.green {
      background: linear-gradient(135deg, #2e7d32, #43a047);
    }
    .card-info {
      display: flex;
      flex-direction: column;
    }
    .card-label {
      font-size: 13px;
      color: #888;
      font-weight: 500;
    }
    .card-value {
      font-size: 30px;
      font-weight: 700;
      color: #1a237e;
    }
    .chart-card, .table-card {
      margin-bottom: 24px;
      border-radius: 12px;
    }
    .chart-card mat-card-header,
    .table-card mat-card-header {
      padding: 16px 16px 0 16px;
    }
    .chart-container {
      position: relative;
      height: 350px;
      padding: 16px;
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
    .reussite-high {
      color: #2e7d32;
      font-weight: 600;
    }
    .reussite-medium {
      color: #e65100;
      font-weight: 600;
    }
    .reussite-low {
      color: #c62828;
      font-weight: 600;
    }
    .temp-normal {
      color: #2e7d32;
      font-weight: 500;
    }
    .temp-warning {
      color: #e65100;
      font-weight: 500;
    }
    .temp-alert {
      color: #c62828;
      font-weight: 500;
    }
    .co2-normal {
      color: #2e7d32;
      font-weight: 500;
    }
    .co2-warning {
      color: #e65100;
      font-weight: 500;
    }
    .co2-alert {
      color: #c62828;
      font-weight: 500;
    }
    .no-data {
      color: #bbb;
      font-style: italic;
    }
  `]
})
export class DecisionnelComponent implements OnInit {
  dashboard: DashboardDecisionnelDto | null = null;
  loading = true;
  errorMessage = '';

  filiereColumns = ['filiere', 'etudiants', 'tauxReussite', 'progression'];
  envColumns = ['salle', 'temperature', 'co2', 'presence'];

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Taux de reussite (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Filiere'
        }
      }
    }
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.get<DashboardDecisionnelDto>('/dashboard/decisionnel').subscribe({
      next: (data) => {
        this.dashboard = data;
        this.buildChart(data.filiereStats);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement du tableau de bord decisionnel.';
      }
    });
  }

  private buildChart(stats: FiliereStatsDto[]): void {
    this.barChartData = {
      labels: stats.map(s => s.filiereNom),
      datasets: [
        {
          data: stats.map(s => s.tauxReussite),
          label: 'Taux de reussite (%)',
          backgroundColor: stats.map(s => {
            if (s.tauxReussite >= 70) return '#43a047';
            if (s.tauxReussite >= 50) return '#fb8c00';
            return '#e53935';
          }),
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  }

  getReussiteClass(taux: number): string {
    if (taux >= 70) return 'reussite-high';
    if (taux >= 50) return 'reussite-medium';
    return 'reussite-low';
  }

  getTempClass(temp: number): string {
    if (temp > 30) return 'temp-alert';
    if (temp > 26) return 'temp-warning';
    return 'temp-normal';
  }

  getCo2Class(co2: number): string {
    if (co2 > 1000) return 'co2-alert';
    if (co2 > 800) return 'co2-warning';
    return 'co2-normal';
  }
}
