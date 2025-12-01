import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableStatusService {

  private baseUrl = 'https://localhost:7015/api/TableOrder';

  constructor(private http: HttpClient) {}

  // ✅ Get all statuses for user
  getTableStatuses(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${userId}`);
  }

  // ✅ Update status (Available / Occupied / Billed)
  updateStatus(tableName: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updateStatus`, {
      tableName,
      status
    });
  }

  // ✅ Reset to Available
  resetStatus(tableName: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/reset/${tableName}`, {});
  }
}
