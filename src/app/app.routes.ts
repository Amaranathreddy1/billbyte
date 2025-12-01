import { Routes } from '@angular/router';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { MenuManagementComponent } from './layout/Menu/menu-management.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },         // Default
  { path: 'dashboard', component: DashboardComponent }, // Dashboard button
  { path: 'menu-management', component: MenuManagementComponent },
  { path: '', component: DashboardComponent,data: { fromApp: true }}

];
