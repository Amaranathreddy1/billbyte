import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRService {

  private hubConnection!: HubConnection;

    tableTimerUpdateListener: ((data: any) => void) | null = null;
    tableTimerStopListener: ((table: string) => void) | null = null;

  startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7015/tableHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.log('SignalR Error: ', err));

      this.hubConnection.on("ReceiveTableTimerUpdate", (data) => {
        if (this.tableTimerUpdateListener) {
            this.tableTimerUpdateListener(data);
        }
        });

        this.hubConnection.on("ReceiveTableTimerStop", (table) => {
        if (this.tableTimerStopListener) {
            this.tableTimerStopListener(table);
        }
        });
  }

  onTableUpdate(callback: (data: any) => void) {
    this.hubConnection.on('TableStatusUpdated', callback);
  }

 onTableTimerUpdate(callback: (data: any) => void) {
    this.hubConnection.on("TableTimerUpdate", callback);
    }

    onTableTimerStop(callback: (table: string) => void) {
    this.hubConnection.on("TableTimerStop", callback);
    }

    sendTableTimerUpdate(table: string, timeDisplay: string) {
    this.hubConnection.invoke("BroadcastTableTimerUpdate", { table, timeDisplay });
    }

    sendTableTimerStop(table: string) {
    this.hubConnection.invoke("BroadcastTableTimerStop", table);
    }
    sendTableUpdate(table: string, status: string) {
    this.hubConnection.invoke("SendTableUpdate", { table, status });
    }
}
