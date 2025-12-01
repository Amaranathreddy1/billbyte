import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillByteMenu } from '../../models/menu.model'; // if you have model file

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private base = 'https://localhost:7015/api/BillByteMenu';

  constructor(private http: HttpClient) {}

  // GET all menu items
  getAll(): Observable<BillByteMenu[]> {
    return this.http.get<BillByteMenu[]>(this.base);
  }

  // CREATE new item
  create(item: BillByteMenu) {
    
    console.log("service item:", item);
    return this.http.post<BillByteMenu>(this.base, item);
  }

  // UPDATE existing item
  update(id: number, item: BillByteMenu) {
    return this.http.put<BillByteMenu>(`${this.base}/${id}`, item);
  }

  // DELETE item
  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  // UPLOAD image
  uploadImage(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.base}/upload`, formData);
  }

  // ⭐ NEW API: GET BY FOOD TYPE ⭐
  getByFoodType(typeId: number) {
    return this.http.get<BillByteMenu[]>(`${this.base}/type/${typeId}`);
  }
}
