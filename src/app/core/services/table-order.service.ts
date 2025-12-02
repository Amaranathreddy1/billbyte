// src/app/core/services/table-order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TableOrderItemDto {
  TableOrderId?: number;
  TableNumber?: string;
  ItemId: number;
  ItemName?: string;
  ItemCost?: number;
  ImageUrl?: string;
  Qty: number;
}

export interface TableOrderDto {
  TableOrderId: number;
  TableNumber: string;
  ZoneType: string;
  UserId: number;
  ItemIds: string;
  TotalCost: number;
  StartTime?: string;
  UserType: string;
  PaymentMode?: string;
  Status: string;
  Items: TableOrderItemDto[];
}

@Injectable({ providedIn: 'root' })
export class TableOrderService {
  private base = '/api/TableOrder';

  constructor(private http: HttpClient) {}

  getOrder(tableNumber: string): Observable<TableOrderDto> {
    return this.http.get<TableOrderDto>(`${this.base}/${tableNumber}`);
  }

  saveOrder(payload: any) {
    return this.http.post<{ success: boolean; orderId: number }>(`${this.base}/save`, payload);
  }

  // helper: update status endpoint (if you have)
  updateStatus(table: string, status: string) {
    return this.http.post(`${this.base}/updatestatus`, { table, status });
  }
}
