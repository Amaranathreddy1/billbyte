import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FoodTypeSelectionService {

  private selectedTypeSubject = new BehaviorSubject<number>(1);
  selectedType$ = this.selectedTypeSubject.asObservable();

  setSelectedType(typeId: number) {
    this.selectedTypeSubject.next(typeId);
  }
}
