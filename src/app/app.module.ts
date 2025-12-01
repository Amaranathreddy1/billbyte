import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
//import { provideHttpClient } from '@angular/common/http';
import { FoodTabsComponent } from './layout/FoodType/food-tabs.component';
import { HttpClientModule } from '@angular/common/http';
import { AgGridAngular } from 'ag-grid-angular';

// import { GridModule } from '@progress/kendo-angular-grid';
// import { ButtonsModule } from '@progress/kendo-angular-buttons';
// import { InputsModule } from '@progress/kendo-angular-inputs';
// import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent//,
    //FoodTabsComponent
    
  ],
  imports: [
    BrowserModule,
    CommonModule ,
     HttpClientModule,
     FoodTabsComponent, AgGridAngular
  ],
  providers: [
    // provideHttpClient()   // <-- should be inside providers, NOT imports
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
