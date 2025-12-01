import { TestBed } from '@angular/core/testing';

import { FoodTypeSelectionService } from './food-type-selection.service';

describe('FoodTypeSelectionService', () => {
  let service: FoodTypeSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodTypeSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
