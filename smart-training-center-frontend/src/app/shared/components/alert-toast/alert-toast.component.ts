import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-alert-toast',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  template: ''
})
export class AlertToastComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private snackBar: MatSnackBar,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.wsService.alerts$.pipe(takeUntil(this.destroy$)).subscribe(alert => {
      if (alert) {
        this.snackBar.open(
          `Alerte: ${alert.type} - ${alert.message}`,
          'Fermer',
          { duration: 5000, panelClass: ['alert-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
