import { Component } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { FoodTabsComponent } from './layout/FoodType/food-tabs.component';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    SidebarComponent,
    RouterOutlet,CommonModule
  ]
})
export class AppComponent {

  showFoodTabs = true;  // Default: show in dashboard
  selectedFoodTypeId: number | null = null;
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        // Hide food tabs ONLY on menu-management page
        if (event.urlAfterRedirects.includes('menu-management')) {
          this.showFoodTabs = false;
        } else {
          this.showFoodTabs = true;
        }
      }
    });
  }
  onFoodTypeChange(typeId: number) {
  this.selectedFoodTypeId = typeId;
}
}
