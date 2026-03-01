import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardPedagogiqueDto, CoursStatsDto } from '../../../core/models';

@Component({
  selector: 'app-pedagogique',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatTableModule, MatProgressBarModule,
    MatIconModule, MatProgressSpinnerModule,
    BaseChartDirective
  ],
  template: `
    <div class="page-shell">
      <h2>Tableau de bord pedagogique</h2>

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
                <mat-icon>menu_book</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Total Cours</span>
                <span class="card-value">{{ dashboard.totalCours }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon-wrapper green">
                <mat-icon>school</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Total Etudiants</span>
                <span class="card-value">{{ dashboard.totalEtudiants }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Bar Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Progression moyenne par cours</mat-card-title>
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

        <!-- Course Stats Table -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Statistiques des cours</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="dashboard.coursStats" class="full-width">

              <ng-container matColumnDef="cours">
                <th mat-header-cell *matHeaderCellDef>Cours</th>
                <td mat-cell *matCellDef="let row">{{ row.coursTitre }}</td>
              </ng-container>

              <ng-container matColumnDef="inscrits">
                <th mat-header-cell *matHeaderCellDef>Inscrits</th>
                <td mat-cell *matCellDef="let row">{{ row.nombreInscrits }}</td>
              </ng-container>

              <ng-container matColumnDef="progression">
                <th mat-header-cell *matHeaderCellDef>Progression Moy.</th>
                <td mat-cell *matCellDef="let row">
                  <div class="progress-cell">
                    <mat-progress-bar mode="determinate" [value]="row.progressionMoyenne"></mat-progress-bar>
                    <span>{{ row.progressionMoyenne | number:'1.1-1' }}%</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="tauxReussite">
                <th mat-header-cell *matHeaderCellDef>Taux Reussite</th>
                <td mat-cell *matCellDef="let row">{{ row.tauxReussite | number:'1.1-1' }}%</td>
              </ng-container>

              <ng-container matColumnDef="noteMoyenne">
                <th mat-header-cell *matHeaderCellDef>Note Moy.</th>
                <td mat-cell *matCellDef="let row">{{ row.noteMoyenne | number:'1.2-2' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
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
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .summary-card {
      flex: 1;
      min-width: 220px;
      border-radius: 12px;
    }
    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .card-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
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
      font-size: 28px;
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
    .progress-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .progress-cell mat-progress-bar {
      width: 100px;
    }
    .progress-cell span {
      font-size: 13px;
      font-weight: 500;
      min-width: 50px;
    }
  `]
})
export class PedagogiqueComponent implements OnInit {
  dashboard: DashboardPedagogiqueDto | null = null;
  loading = true;
  errorMessage = '';
  displayedColumns = ['cours', 'inscrits', 'progression', 'tauxReussite', 'noteMoyenne'];

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Progression (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Cours'
        }
      }
    }
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    const email = this.authService.getUserEmail();
    const params: any = {};
    if (email) {
      params.enseignantEmail = email;
    }

    this.apiService.get<DashboardPedagogiqueDto>('/dashboard/pedagogique', params).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.buildChart(data.coursStats);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement du tableau de bord pedagogique.';
      }
    });
  }

  private buildChart(stats: CoursStatsDto[]): void {
    this.barChartData = {
      labels: stats.map(s => s.coursTitre),
      datasets: [
        {
          data: stats.map(s => s.progressionMoyenne),
          label: 'Progression Moyenne (%)',
          backgroundColor: '#3949ab',
          borderColor: '#1a237e',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  }
}
