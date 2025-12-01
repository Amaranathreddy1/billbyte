import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  private apiUrl = 'https://localhost:7015/api/pages'; // API URL

  constructor(private http: HttpClient) { }

  getPages() {
    console.log("came" + this.apiUrl);
    return this.http.get<any[]>(this.apiUrl);
  }
}
