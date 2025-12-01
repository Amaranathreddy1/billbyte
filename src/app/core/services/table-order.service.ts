import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface TableStatus {
  tableNumber: string;
  zoneType: string;
  status: 'Available' | 'Occupied' | 'Billed';
  startTime?: string;
  endTime?: string;
  spentTime?: number;
  totalCost?: number;
}

@Injectable({ providedIn: 'root' })
export class TableOrderService {
  private base = 'https://localhost:7015/api/TableOrder';
  private hubConnection!: signalR.HubConnection;

  private statusSubject = new BehaviorSubject<TableStatus[]>([]);
  statuses$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  // HTTP
  loadStatus(userId: number) {
    this.http.get<TableStatus[]>(`${this.base}/status/${userId}`)
      .subscribe(data => this.statusSubject.next(data));
  }
  
  getOrder(tableName: string) {
    console.log('table selected ' + tableName);

    return this.http.get<any>(`${this.base}/${tableName}`);
    }

  createOrder(payload: any) {
    return this.http.post(`${this.base}`, payload);
  }

  getTableStatuses(userId: number) {
    return this.http.get<any>(`${this.base}/status/${userId}`);
  }
  
  updateStatus(tableName: string, status: string) {
    return this.http.put<any>(`${this.base}/updateStatus`, {
      tableName,
      status
    });
  }
  
  resetStatus(tableName: string) {
        return this.http.put<any>(`${this.base}/reset/${tableName}`, {});
    }
    

  // SIGNALR
  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7015/hubs/table')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((err :any)=> console.error('SignalR error', err));

    this.hubConnection.on('TableStatusChanged', (status: TableStatus) => {
      const list = [...this.statusSubject.value];
      const idx = list.findIndex(t => t.tableNumber === status.tableNumber);
      if (idx >= 0) list[idx] = status;
      else list.push(status);
      this.statusSubject.next(list);
    });
  }


}
