import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardBuSettings {
  isTableServeNeeded: boolean;
  nonAcTables: number;
  acTables: number;
}

@Injectable({ providedIn: 'root' })
export class BuSettingsService {

  private base = 'https://localhost:7015/api/Settings';

  constructor(private http: HttpClient) {}

  // TEMP: pass userId explicitly (later from login/JWT)
  getDashboardSettings(userId: number): Observable<DashboardBuSettings> {
    return this.http.get<DashboardBuSettings>(`${this.base}/dashboard/${userId}`);
  }
}
