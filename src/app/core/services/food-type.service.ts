import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FoodType {
  foodTypeId: number;
  foodTypeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FoodTypeService {
  private apiUrl = 'https://localhost:7015/api/foodTypes';

  constructor(private http: HttpClient) {}

  getFoodTypes(): Observable<FoodType[]> {
     console.log("came1");
    return this.http.get<FoodType[]>(this.apiUrl);
  }
}
