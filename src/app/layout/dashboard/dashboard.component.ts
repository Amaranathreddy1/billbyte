import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { FoodTypeService } from '../../core/services/food-type.service';
import { CommonModule } from '@angular/common';
import { FoodTypeSelectionService } from '../../core/services/food-type-selection.service';
import { FoodTabsComponent } from '../FoodType/food-tabs.component'; 
import { SalesChartComponent } from '../Sales-Chart/sales-chart.component';
import { DashboardAnalyticsService } from '../../core/services/dashboard-analytics.service';
import { Chart } from 'chart.js/auto';
import { BuSettingsService, DashboardBuSettings } from '../../core/services/bu-settings.service';
import { TableStatusService } from '../../core/services/table-status.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TableOrderService } from '../../core/services/table-order.service';
import { SignalRService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FoodTabsComponent, SalesChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  menuItems: any[] = [];
  selectedFoodTypeId: number | null = null;

  cart: any[] = [];
  totalAmount = 0;

  tableMode: boolean = true;
  showPaymentPanel: boolean = false;
  selectedTable: string | null = null;

  nonAcTables: string[] = [];
  acTables: string[] = [];

  private currentUserId = 1;

  tableStatuses: any = {}; // Available / Occupied / Billed

  // TIMER SYSTEM (NEW)
  tableTimers: { [table: string]: string } = {};  
  timerIntervals: { [table: string]: any } = {};  
  occupiedTables = new Set<string>();  

  orderType: 'OrderIn' | 'Delivery' | 'Parcel' | null = null;
  orderStartTime: Date | null = null;
  timerDisplay = '00:00:00';
  timerHandle: any;

  tableData: {
  [table: string]: {
    cart: any[];
    orderType: 'OrderIn' | 'Delivery' | 'Parcel' | null;
    timer: string;
    startTime: number | null;
    subtotal: number;
    tax: number;
    total: number;
  }
} = {};

  constructor(
    private menuService: MenuService,
    private foodTypeService: FoodTypeService,
    private foodTypeSelection: FoodTypeSelectionService,
    private dashboardService: DashboardAnalyticsService,
    private buSettings: BuSettingsService,
    private tableStatusService: TableStatusService,
    private route: ActivatedRoute,
    private tableOrderService: TableOrderService,
    private router: Router,
    private signalR: SignalRService
  ) {}

  ngOnInit(): void {

    this.signalR.startConnection();

    // When SignalR timer updates come from backend
    this.signalR.onTableTimerUpdate((update: any) => {
      this.tableTimers[update.table] = update.timeDisplay;
      this.occupiedTables.add(update.table);
    });

    this.signalR.onTableTimerStop((table: string) => {
      delete this.tableTimers[table];
      this.occupiedTables.delete(table);
    });

    // Load Food Types
    this.foodTypeService.getFoodTypes().subscribe(types => {
      if (types.length > 0) {
        this.selectedFoodTypeId = types[0].foodTypeId;
        this.loadItemsByType(this.selectedFoodTypeId);
      }
    });

    this.loadChart();
    this.loadSettingsAndInit();

    this.route.queryParams.subscribe(params => {
      if (params['table']) {
        this.selectedTable = params['table'];
        this.tableMode = false;
        this.showPaymentPanel = true;
        // this.loadOrderForTable(params['table']);
      }
    });

    this.foodTypeSelection.selectedType$.subscribe(id => {
      this.selectedFoodTypeId = id;
      this.loadItemsByType(id);
    });
  }


  // ----------------------------
  // TABLE TIMER START
  // ----------------------------
  startTableTimer(table: string) {
  if (this.timerIntervals[table]) return;

  const startTime = Date.now();

  this.timerIntervals[table] = setInterval(() => {
    const diff = Date.now() - startTime;

    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

    const timeString = `${h}:${m}:${s}`;

    this.tableTimers[table] = timeString;

    // broadcast to all screens
    this.signalR.sendTableTimerUpdate(table, timeString);

  }, 1000);

  this.occupiedTables.add(table);
}


  // ----------------------------
  // TABLE TIMER STOP
  // ----------------------------
  stopTableTimer(table: string) {
  if (this.timerIntervals[table]) {
    clearInterval(this.timerIntervals[table]);
    delete this.timerIntervals[table];
    delete this.tableTimers[table];

    this.signalR.sendTableTimerStop(table);
    this.occupiedTables.delete(table);
  }
}

placeOrder() {
  const table = this.selectedTable!;
  
  // STOP timer
  this.stopTableTimer(table);

  // CLEAR table saved data
  delete this.tableData[table];

  // RESET UI
  this.cart = [];
  this.totalAmount = 0;
  this.timerDisplay = "00:00:00";
  this.orderType = null;

  // MAKE TABLE GREEN AVAILABLE AGAIN
  this.tableStatusService.updateStatus(table, 'Available').subscribe(() => {
    console.log("Table reset to Available");
  });

  // GO BACK TO TABLE SCREEN
  this.returnToTables();
}


  // ----------------------------
  // FOOD MENU + CART
  // ----------------------------
  loadItemsByType(typeId: number) {
  console.log("FoodType Received:", typeId);

  this.menuService.getByFoodType(typeId).subscribe({
    next: res => {
      // keep qty from existing cart so selection remains
      this.menuItems = res.map(item => {
        const inCart = this.cart.find(c => c.itemId === item.itemId);
        return { ...item, qty: inCart ? inCart.qty : 0 };
      });
    },
    error: err => console.error(err)
  });
}

  calculateTotal() {
    this.totalAmount = this.cart.reduce((s, i) => s + (i.qty * i.itemCost), 0);
  }

  increase(item: any) {
  item.qty = (item.qty || 0) + 1;

  let exist = this.cart.find(c => c.itemId === item.itemId);
  if (exist) exist.qty = item.qty;
  else this.cart.push({ ...item });

  this.updateTableTotals();
}

decrease(item: any) {
  if (!item.qty) return;
  item.qty--;

  if (item.qty === 0) {
    this.cart = this.cart.filter(c => c.itemId !== item.itemId);
  }

  this.updateTableTotals();
}

updateTableTotals() {
  const subtotal = this.cart.reduce((sum, i) => sum + (i.qty * i.itemCost), 0);
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = subtotal + tax;

  this.totalAmount = subtotal;

  // save inside tableData
  const t = this.selectedTable!;
  this.tableData[t].cart = this.cart;
  this.tableData[t].subtotal = subtotal;
  this.tableData[t].tax = tax;
  this.tableData[t].total = total;
}


  // ----------------------------
  // TABLE CLICK → GO TO ORDER SCREEN
  // ----------------------------
  onTableClick(zone: string, table: string) {

  this.selectedTable = table;

  // If table is new → create default storage
  if (!this.tableData[table]) {
    this.tableData[table] = {
      cart: [],
      orderType: null,
      timer: '00:00:00',
      startTime: null,
      subtotal: 0,
      tax: 0,
      total: 0
    };
  }

  // Load saved data into UI
  this.cart = this.tableData[table].cart;
  this.orderType = this.tableData[table].orderType;
  this.timerDisplay = this.tableData[table].timer;
  this.totalAmount = this.tableData[table].subtotal;

  // Show payment panel
  this.tableMode = false;
  this.showPaymentPanel = true;
}


  // ----------------------------
  // ORDER TYPE (DineIn → START TIMER)
  // ----------------------------
  selectOrderType(type: 'OrderIn' | 'Delivery' | 'Parcel') {

  if (!this.cart.length) return;  // must select items first

  this.orderType = type;

  const t = this.selectedTable!;
  this.tableData[t].orderType = type;

  if (type === 'OrderIn') {
    this.startTableTimer(t);
  } else {
    this.stopTableTimer(t);
  }
}


  returnToTables() {
    this.showPaymentPanel = false;
    this.tableMode = true;
    this.router.navigate(['/dashboard'], { queryParams: {} });
  }


  // ----------------------------
  // TABLE STATUS COLORS
  // ----------------------------
  getStatusClass(table: string) {
    if (this.occupiedTables.has(table)) return 'occupied';
    return 'available';
  }


  // ----------------------------
  // ORDER LOAD
  // ----------------------------
  // loadOrderForTable(table: string) {
  //   this.tableOrderService.getOrder(table).subscribe(order => {

  //     if (!order || !order.items) {
  //       this.cart = [];
  //       this.calculateTotal();
  //       return;
  //     }

  //     this.cart = order.items.map((o: any) => ({
  //       itemId: o.itemId,
  //       itemName: o.itemName,
  //       itemCost: o.itemCost,
  //       imageUrl: o.imageUrl,
  //       qty: o.qty
  //     }));

  //     this.calculateTotal();
  //   });
  // }

  // ----------------------------
  // CHART
  // ----------------------------
  loadChart() {
    this.dashboardService.getSalesLast7Days().subscribe(data => this.renderChart(data));
  }

  renderChart(data: any) {
    const canvas = document.getElementById('orderChart') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          { label:'Dine In', data:data.dineIn, borderColor:'#4e73df' },
          { label:'Delivery', data:data.delivery, borderColor:'#1cc88a' },
          { label:'Parcel', data:data.parcel, borderColor:'#f6c23e' }
        ]
      }
    });
  }

  loadSettingsAndInit() {
    this.buSettings.getDashboardSettings(this.currentUserId).subscribe(settings => {
      this.tableMode = settings.isTableServeNeeded;
      this.nonAcTables = this.buildTableNames(settings.nonAcTables);
      this.acTables = this.buildTableNames(settings.acTables);
    });
  }

  private buildTableNames(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `T${i + 1}`);
  }

  // 🔍 Called from search box
searchProducts(event: any) {
  const text = event.target.value?.toLowerCase() ?? '';
  // Later: filter products here
  console.log("Searching:", text);
}

// 🧾 Toggles payment panel icon
togglePaymentPanel() {
  this.showPaymentPanel = !this.showPaymentPanel;
}

// 🟦 D/P button click
onDpClick(zone: 'NonAC' | 'AC') {
  console.log("D/P selected in zone:", zone);
  // Later: handle Delivery/Parcel actions here
}


}
