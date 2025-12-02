import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {Subject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  public tableTimerUpdate$ = new Subject<{ table: string; timeDisplay: string }>();
  public tableTimerStop$ = new Subject<string>();
  public tableStatusUpdate$ = new Subject<{ table: string; status: string }>();


  startConnection() {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7015/tableHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ SignalR connected'))
      .catch(err => console.error('SignalR error', err));
  }

  // ---- Client listeners ----
  onTableTimerUpdate(callback: (data: any) => void) {
    if (!this.hubConnection) return;
    this.hubConnection.on('ReceiveTableTimerUpdate', (data: any) => callback(data));
  }

  onTableTimerStop(callback: (table: string) => void) {
    if (!this.hubConnection) return;
    this.hubConnection.on('ReceiveTableTimerStop', (table: string) => callback(table));
  }

  onTableUpdate(callback: (payload: any) => void) {
    if (!this.hubConnection) return;
    this.hubConnection.on('ReceiveTableUpdate', (payload: any) => callback(payload));
  }

  // ---- Invokes (client -> server) ----
  sendTableTimerUpdate(table: string, timeDisplay: string) {
    if (!this.hubConnection) return;
    return this.hubConnection.invoke('BroadcastTableTimerUpdate', table, timeDisplay)
      .catch(err => console.error('sendTableTimerUpdate error', err));
  }

  sendTableTimerStop(table: string) {
    if (!this.hubConnection) return;
    return this.hubConnection.invoke('BroadcastTableTimerStop', table)
      .catch(err => console.error('sendTableTimerStop error', err));
  }

  sendTableUpdate(table: string, status: string) {
    if (!this.hubConnection) return;
    return this.hubConnection.invoke('BroadcastTableUpdate', table, status)
      .catch(err => console.error('sendTableUpdate error', err));
  }
  sendTableStatusUpdate(table: string, status: string) {
    if (!this.hubConnection) return;
    this.hubConnection.invoke("UpdateTableStatus", table, status);
  }
}
