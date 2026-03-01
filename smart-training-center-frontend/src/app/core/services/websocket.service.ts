import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlerteDto } from '../models';
import { EnvironnementDto } from '../models';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client;
  private connected$ = new BehaviorSubject<boolean>(false);

  private alertSubject = new Subject<AlerteDto>();
  private sensorDataSubjects = new Map<number, Subject<EnvironnementDto>>();
  private deviceStatusSubject = new Subject<{ deviceId: string; online: boolean }>();

  alerts$ = this.alertSubject.asObservable();
  deviceStatus$ = this.deviceStatusSubject.asObservable();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected$.next(true);
        this.subscribeToAlerts();
        this.subscribeToDeviceStatus();
      },
      onDisconnect: () => {
        this.connected$.next(false);
      }
    });
  }

  connect(): void {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  subscribeSalleRealtime(salleId: number): Observable<EnvironnementDto> {
    if (!this.sensorDataSubjects.has(salleId)) {
      const subject = new Subject<EnvironnementDto>();
      this.sensorDataSubjects.set(salleId, subject);

      if (this.client.connected) {
        this.client.subscribe(`/topic/salles/${salleId}/realtime`, (message: IMessage) => {
          subject.next(JSON.parse(message.body));
        });
      } else {
        this.connected$.subscribe(connected => {
          if (connected) {
            this.client.subscribe(`/topic/salles/${salleId}/realtime`, (message: IMessage) => {
              subject.next(JSON.parse(message.body));
            });
          }
        });
      }
    }
    return this.sensorDataSubjects.get(salleId)!.asObservable();
  }

  private subscribeToAlerts(): void {
    this.client.subscribe('/topic/alerts', (message: IMessage) => {
      this.alertSubject.next(JSON.parse(message.body));
    });
  }

  private subscribeToDeviceStatus(): void {
    this.client.subscribe('/topic/devices/status', (message: IMessage) => {
      this.deviceStatusSubject.next(JSON.parse(message.body));
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
