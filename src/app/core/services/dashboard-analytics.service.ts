import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalesPoint {
  dayName: string;
  dayDate: string; 
  orderInCount: number;
  deliveryCount: number;
  parcelCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {

  // ✔ Correct backend API URL
  private base = 'https://localhost:7015/api/Analytics';

  constructor(private http: HttpClient) {}

  // ✔ GET: /api/BillByteMenu/sales/last7days
  getSalesLast7Days() {
    return this.http.get<SalesPoint[]>(`${this.base}/sales/last7days`);
  }
}
