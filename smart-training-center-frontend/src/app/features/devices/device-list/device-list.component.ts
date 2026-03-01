import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { IoTDeviceDto } from '../../../core/models/device.model';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h2>Gestion des appareils IoT</h2>
          <p class="subtitle">Surveillez et gerez les capteurs connectes du centre</p>
        </div>
        <button mat-raised-button color="primary" (click)="goToRegister()">
          <mat-icon>add_circle</mat-icon>
          Enregistrer un appareil
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher un appareil</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (keyup)="applyFilter($event)"
               placeholder="Type, adresse MAC, salle..." #filterInput>
      </mat-form-field>

      <div class="spinner-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement des appareils...</p>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table mat-table [dataSource]="dataSource" matSort class="device-table">

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let device">
              <div class="type-cell">
                <mat-icon class="type-icon">{{ getTypeIcon(device.type) }}</mat-icon>
                {{ getTypeLabel(device.type) }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="adresseMac">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Adresse MAC</th>
            <td mat-cell *matCellDef="let device">
              <code class="mac-address">{{ device.adresseMac }}</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="firmwareVersion">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Firmware</th>
            <td mat-cell *matCellDef="let device">{{ device.firmwareVersion }}</td>
          </ng-container>

          <ng-container matColumnDef="salleNom">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Salle</th>
            <td mat-cell *matCellDef="let device">{{ device.salleNom || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="valeurMesuree">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Valeur</th>
            <td mat-cell *matCellDef="let device">
              <span *ngIf="device.valeurMesuree !== null && device.valeurMesuree !== undefined">
                {{ device.valeurMesuree | number:'1.1-2' }}
                {{ getUnit(device.type) }}
              </span>
              <span *ngIf="device.valeurMesuree === null || device.valeurMesuree === undefined" class="no-data">—</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="dateHeureMesure">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Derniere mesure</th>
            <td mat-cell *matCellDef="let device">
              <span *ngIf="device.dateHeureMesure">{{ device.dateHeureMesure | date:'dd/MM/yyyy HH:mm' }}</span>
              <span *ngIf="!device.dateHeureMesure" class="no-data">—</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="estEnLigne">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let device">
              <span class="status-badge" [class.online]="device.estEnLigne" [class.offline]="!device.estEnLigne">
                <span class="status-dot"></span>
                {{ device.estEnLigne ? 'En ligne' : 'Hors ligne' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let device">
              <button mat-stroked-button color="primary"
                      (click)="goToDetail(device.id, $event)"
                      matTooltip="Voir les details">
                <mat-icon>visibility</mat-icon>
                Details
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              (click)="goToDetail(row.id)"
              class="clickable-row"></tr>

          <tr class="mat-row no-data-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              Aucun appareil trouve correspondant au filtre "{{ filterInput.value }}"
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                       showFirstLastButtons
                       aria-label="Selectionner la page">
        </mat-paginator>
      </div>

      <div class="empty-state" *ngIf="!loading && dataSource.data.length === 0">
        <mat-icon>sensors_off</mat-icon>
        <p>Aucun appareil enregistre</p>
        <button mat-raised-button color="primary" (click)="goToRegister()">
          Enregistrer un appareil
        </button>
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
    .search-field {
      width: 100%;
      max-width: 500px;
      margin-bottom: 16px;
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
    .device-table {
      width: 100%;
    }
    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .clickable-row:hover {
      background-color: #f5f5f5;
    }
    .type-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .type-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #1565c0;
    }
    .mac-address {
      font-family: 'Roboto Mono', monospace;
      font-size: 13px;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
      color: #333;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-badge.online {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .status-badge.offline {
      background-color: #ffebee;
      color: #c62828;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-badge.online .status-dot {
      background-color: #4caf50;
    }
    .status-badge.offline .status-dot {
      background-color: #f44336;
    }
    .no-data {
      color: #999;
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
      p { margin-bottom: 16px; font-size: 16px; }
    }
  `]
})
export class DeviceListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'type', 'adresseMac', 'firmwareVersion', 'salleNom',
    'valeurMesuree', 'dateHeureMesure', 'estEnLigne', 'actions'
  ];
  dataSource = new MatTableDataSource<IoTDeviceDto>([]);
  loading = true;
  private wsSub!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ApiService,
    private wsService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDevices();
    this.wsSub = this.wsService.deviceStatus$.subscribe(status => {
      const devices = this.dataSource.data;
      const device = devices.find(d => d.adresseMac === status.deviceId || d.id?.toString() === status.deviceId);
      if (device) {
        device.estEnLigne = status.online;
        this.dataSource.data = [...devices];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }

  loadDevices(): void {
    this.loading = true;
    this.api.get<IoTDeviceDto[]>('/iot/devices').subscribe({
      next: (data) => {
        this.dataSource.data = data;
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

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
      'TEMPERATURE': 'Temperature',
      'CO2': 'CO2',
      'PRESENCE': 'Presence',
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

  goToDetail(id: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(['/devices', id]);
  }

  goToRegister(): void {
    this.router.navigate(['/devices/register']);
  }
}
