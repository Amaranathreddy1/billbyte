import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FoodTypeService, FoodType } from '../../core/services/food-type.service';
import { CommonModule } from '@angular/common';
import { FoodTypeSelectionService } from '../../core/services/food-type-selection.service';

@Component({
  selector: 'app-food-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-tabs.component.html',
  styleUrls: ['./food-tabs.component.css']
})
export class FoodTabsComponent implements OnInit {

  foodTypes: FoodType[] = [];
  selectedTypeId: number | null = null;

  @Output() foodTypeChanged = new EventEmitter<number>();

  constructor(
    private foodTypeService: FoodTypeService,
    private foodTypeSelection: FoodTypeSelectionService
  ) {}

  ngOnInit(): void {
    console.log("FoodTabsComponent ngOnInit called");

    this.foodTypeService.getFoodTypes().subscribe({
      next: (res) => {
        console.log("Food types API SUCCESS:", res);
        this.foodTypes = res;
      },
      error: (err) => {
        console.error("Food types API ERROR:", err);
      }
    });
  }

  // ⭐ SINGLE CLEAN METHOD
  selectType(type: FoodType) {
    this.selectedTypeId = type.foodTypeId;               // highlight
    this.foodTypeChanged.emit(type.foodTypeId);          // send to dashboard
    this.foodTypeSelection.setSelectedType(type.foodTypeId); // shared service
  }

}
