import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';
import { DashboardAdministratifDto } from '../../../core/models';

@Component({
  selector: 'app-administratif',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    BaseChartDirective
  ],
  template: `
    <div class="page-shell">
      <h2>Tableau de bord administratif</h2>

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
        <!-- Summary Cards -->
        <div class="cards-row">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper blue">
                <mat-icon>group</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Total Utilisateurs</span>
                <span class="card-value">{{ dashboard.totalUtilisateurs }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper purple">
                <mat-icon>meeting_room</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Total Salles</span>
                <span class="card-value">{{ dashboard.totalSalles }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper green">
                <mat-icon>sensors</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Appareils En ligne</span>
                <span class="card-value">{{ dashboard.devicesOnline }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper grey">
                <mat-icon>sensors_off</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Appareils Hors ligne</span>
                <span class="card-value">{{ dashboard.devicesOffline }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper red">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Alertes Actives</span>
                <span class="card-value">{{ dashboard.alertesActives }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Utilisateurs par role</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [data]="pieChartData"
                  [options]="pieChartOptions"
                  [type]="'pie'">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Salles par type</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [data]="doughnutChartData"
                  [options]="doughnutChartOptions"
                  [type]="'doughnut'">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Inscription Stats -->
        <mat-card class="stats-card">
          <mat-card-header>
            <mat-card-title>Statistiques des inscriptions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="inscription-stats">
              <div class="stat-item">
                <div class="stat-icon blue">
                  <mat-icon>assignment</mat-icon>
                </div>
                <div class="stat-details">
                  <span class="stat-value">{{ dashboard.totalInscriptions }}</span>
                  <span class="stat-label">Total Inscriptions</span>
                </div>
              </div>

              <div class="stat-divider"></div>

              <div class="stat-item">
                <div class="stat-icon orange">
                  <mat-icon>pending_actions</mat-icon>
                </div>
                <div class="stat-details">
                  <span class="stat-value">{{ dashboard.inscriptionsEnCours }}</span>
                  <span class="stat-label">En cours</span>
                </div>
              </div>

              <div class="stat-divider"></div>

              <div class="stat-item">
                <div class="stat-icon green">
                  <mat-icon>task_alt</mat-icon>
                </div>
                <div class="stat-details">
                  <span class="stat-value">{{ dashboard.inscriptionsTerminees }}</span>
                  <span class="stat-label">Terminees</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
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
      gap: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .summary-card {
      flex: 1;
      min-width: 180px;
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
    .card-icon-wrapper.purple {
      background: linear-gradient(135deg, #4a148c, #7b1fa2);
    }
    .card-icon-wrapper.green {
      background: linear-gradient(135deg, #2e7d32, #43a047);
    }
    .card-icon-wrapper.grey {
      background: linear-gradient(135deg, #616161, #9e9e9e);
    }
    .card-icon-wrapper.red {
      background: linear-gradient(135deg, #c62828, #e53935);
    }
    .card-icon-wrapper.orange {
      background: linear-gradient(135deg, #e65100, #fb8c00);
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
    .charts-row {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .chart-card {
      flex: 1;
      min-width: 340px;
      border-radius: 12px;
    }
    .chart-card mat-card-header {
      padding: 16px 16px 0 16px;
    }
    .chart-container {
      position: relative;
      height: 300px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stats-card {
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .stats-card mat-card-header {
      padding: 16px 16px 0 16px;
    }
    .inscription-stats {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 24px 16px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }
    .stat-icon.blue {
      background: #1a237e;
    }
    .stat-icon.orange {
      background: #e65100;
    }
    .stat-icon.green {
      background: #2e7d32;
    }
    .stat-details {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a237e;
    }
    .stat-label {
      font-size: 13px;
      color: #888;
    }
    .stat-divider {
      width: 1px;
      height: 48px;
      background-color: #e0e0e0;
    }
  `]
})
export class AdministratifComponent implements OnInit {
  dashboard: DashboardAdministratifDto | null = null;
  loading = true;
  errorMessage = '';

  private readonly CHART_COLORS = [
    '#1a237e', '#3949ab', '#5c6bc0', '#7986cb', '#9fa8da',
    '#c5cae9', '#e8eaf6', '#283593', '#303f9f', '#3f51b5'
  ];

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 } }
      }
    }
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 } }
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

    this.apiService.get<DashboardAdministratifDto>('/dashboard/administratif').subscribe({
      next: (data) => {
        this.dashboard = data;
        this.buildCharts(data);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement du tableau de bord administratif.';
      }
    });
  }

  private buildCharts(data: DashboardAdministratifDto): void {
    const roleLabels = Object.keys(data.utilisateursParRole).map(r => r.replace('ROLE_', ''));
    const roleValues = Object.values(data.utilisateursParRole);

    this.pieChartData = {
      labels: roleLabels,
      datasets: [
        {
          data: roleValues,
          backgroundColor: this.CHART_COLORS.slice(0, roleLabels.length)
        }
      ]
    };

    const typeLabels = Object.keys(data.sallesParType);
    const typeValues = Object.values(data.sallesParType);

    this.doughnutChartData = {
      labels: typeLabels,
      datasets: [
        {
          data: typeValues,
          backgroundColor: this.CHART_COLORS.slice(0, typeLabels.length)
        }
      ]
    };
  }
}
