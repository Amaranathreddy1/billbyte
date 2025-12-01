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
import { ActivatedRoute } from '@angular/router';
import { TableOrderService } from '../../core/services/table-order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,FoodTabsComponent,SalesChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
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

  tableStatuses: any = {};
  
  currentTableNumber: string | null = null;  // set from route when table clicked
  orderType: 'OrderIn' | 'Delivery' | 'Parcel' = 'OrderIn';
  paymentMode: 'Cash' | 'Card' | 'QR' = 'Cash';
  orderStartTime: Date | null = null;       // for timer
  timerDisplay = '00:00:00';
  timerHandle: any;
  showFoodTypes = false;
  isTableServeMode = true;

  constructor(
    private menuService: MenuService,
    private foodTypeService: FoodTypeService,
    private foodTypeSelection: FoodTypeSelectionService,
    private dashboardService: DashboardAnalyticsService,
    private buSettings: BuSettingsService,
    private tableStatusService: TableStatusService,
    private route: ActivatedRoute,
    private tableOrderService: TableOrderService,
    private router: Router
  ) {}
  
  ngOnInit(): void {

  // ✅ Load food types first, then default items
  this.foodTypeService.getFoodTypes().subscribe(types => {
    if (types.length > 0) {
      this.selectedFoodTypeId = types[0].foodTypeId;
      this.loadItemsByType(this.selectedFoodTypeId);
    }
  });

  // ✅ Load chart only once
  this.loadChart();

  // ✅ Load business settings (TableServe vs Normal mode)
  this.loadSettingsAndInit();

  // ✅ Detect selected table from URL
  this.route.queryParams.subscribe(params => {

  if (params['table']) {

    this.selectedTable = params['table'];

    this.tableMode = false;
    this.showPaymentPanel = true;

    this.loadOrderForTable(this.selectedTable ?? '');
  }
});

  // ✅ React when user clicks different food type tab
  this.foodTypeSelection.selectedType$.subscribe(id => {
    this.selectedFoodTypeId = id;
    this.loadItemsByType(id);
  });
}


  loadMenuItems() {
    if (!this.selectedFoodTypeId) return;

    this.menuService.getByFoodType(this.selectedFoodTypeId)
      .subscribe(items => this.menuItems = items);
  }

  selectType(id: number) {
    this.selectedFoodTypeId = id;
    this.loadMenuItems();
  }

  increase(item: any) {
  item.qty = (item.qty || 0) + 1;

  let exist = this.cart.find(c => c.itemId === item.itemId);

  if (exist) {
    exist.qty = item.qty;
  } else {
    this.cart.push({ ...item });
  }

  this.calculateTotal();
  }

  decrease(item: any) {
    if (!item.qty || item.qty === 0) return;

    item.qty--;

    if (item.qty === 0) {
      this.cart = this.cart.filter(c => c.itemId !== item.itemId);
    } else {
      let exist = this.cart.find(c => c.itemId === item.itemId);
      if (exist) exist.qty = item.qty;
    }

    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.cart.reduce((sum, i) => sum + (i.qty * i.itemCost), 0);
  }
  loadItemsByType(typeId: number) {
    console.log("FoodType Received:", typeId);

    this.menuService.getByFoodType(typeId).subscribe({
      next: res => this.menuItems = res,
      error: err => console.error(err)
    });
  }
  increaseQty(item: any) {
    item.qty = (item.qty || 0) + 1;
  }

  decreaseQty(item: any) {
    if (item.qty > 0) item.qty--;
  }

  toggleSidebar() {
    console.log("Sidebar toggle clicked!");
  }

  returnToTables() {
  this.showPaymentPanel = false;
  this.tableMode = true;
  this.cart = [];
  //this.orderType = null;
  //this.stopTimer();

  this.router.navigate(['/dashboard'], { queryParams: {} });
}

  togglePaymentPanel() {
    this.showPaymentPanel = !this.showPaymentPanel;
  }

  searchProducts(event: any) {
    const text = event.target.value.toLowerCase();
    console.log("Searching:", text);
  }
  loadInitialDashboardView() {
  // If table mode detect and hide food UI
  if (this.selectedTable) {
    console.log('showPaymentPanel mode On ' + this.showPaymentPanel)
    this.showFoodTypes = true;
    this.showPaymentPanel = true;
  } else {
    this.showFoodTypes = false;
    this.showPaymentPanel = false;
  }
}

  renderChart(data: any) {
  const labels = data.labels;   // ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
  const dineIn = data.dineIn;   // [20,40,35,50,60,30,40]
  const delivery = data.delivery;
  const parcel = data.parcel;

  const canvas = document.getElementById('orderChart') as HTMLCanvasElement;

  if (!canvas) return;

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Dine In',
          data: dineIn,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78,115,223,0.2)',
          borderWidth: 3,
          tension: 0.4,
        },
        {
          label: 'Delivery',
          data: delivery,
          borderColor: '#1cc88a',
          backgroundColor: 'rgba(28,200,138,0.2)',
          borderWidth: 3,
          tension: 0.4,
        },
        {
          label: 'Parcel',
          data: parcel,
          borderColor: '#f6c23e',
          backgroundColor: 'rgba(246,194,62,0.2)',
          borderWidth: 3,
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

private loadSettingsAndInit() {
    this.buSettings.getDashboardSettings(this.currentUserId).subscribe({
      next: (settings: DashboardBuSettings) => {
        this.tableMode = settings.isTableServeNeeded;

        if (this.isTableServeMode) {
          this.tableMode = true;
          this.showPaymentPanel = false;
        } else {
          this.tableMode = false;
          this.showPaymentPanel = true;
        }

        if (this.tableMode) {
          // build table names: T1..Tn and D/P
          this.nonAcTables = this.buildTableNames(settings.nonAcTables);
          this.acTables    = this.buildTableNames(settings.acTables);
          // in table mode we DO NOT load menu items / payment panel
        } else {
          // normal mode: load food items etc.
          this.loadItemsByType(1); // or default food-type
        }
      },
      error: err => console.error('BU settings error:', err)
    });
  }

  private buildTableNames(count: number): string[] {
    const arr: string[] = [];
    for (let i = 1; i <= count; i++) {
      arr.push(`T${i}`);
    }
    return arr;
  }

  // TABLE MODE click handlers
  onTableClick(zone: string, table: string) {

  console.log('✅ Table Clicked:', table);

  this.tableStatusService.updateStatus(table, 'Occupied').subscribe(() => {

    // switch to food ordering view
    this.tableMode = false;
    this.showPaymentPanel = true;

    // store selected table
    this.selectedTable = table;

    // load any existing order
    this.loadOrderForTable(table);

    // load items for default food type
    this.selectedFoodTypeId = this.selectedFoodTypeId ?? 1;
    this.loadItemsByType(this.selectedFoodTypeId);

  });
}


completeOrder(table: string) {
  this.tableStatusService.updateStatus(table, 'Billed').subscribe(() => {
    this.loadTableStatuses();
  });
}
resetTable(table: string) {
  this.tableStatusService.resetStatus(table).subscribe(() => {
    this.loadTableStatuses();
  });
}

  onDpClick(zone: 'NonAC' | 'AC') {
    console.log('D/P selected in', zone);
    // later: handle Delivery/Parcel from that side
  }

  loadChart() {
  this.dashboardService.getSalesLast7Days().subscribe({
    next: (data) => {
      console.log("Chart API Data:", data);
      this.renderChart(data);
    },
    error: (err) => console.error("Chart error:", err)
  });
}


loadTableStatuses() {
  const userId = 1;
  this.tableStatusService.getTableStatuses(userId).subscribe(res => {
  this.tableStatuses = res;
});
}
getTableStatus(tableName: string) {
  return this.tableStatuses[tableName] ?? 'Available';
}

getStatusClass(tableName: string) {
  const status = this.getTableStatus(tableName);

  switch(status) {
    case 'Occupied': return 'occupied';
    case 'Billed': return 'billed';
    default: return 'available';
  }
}

selectOrderType(type: 'OrderIn' | 'Delivery' | 'Parcel') {
  this.orderType = type;

  if (type === 'OrderIn') {
    if (!this.orderStartTime) {
      this.orderStartTime = new Date();
      this.startLocalTimer();
    }
  } else {
    // Delivery / Parcel -> no table timer required
    this.stopLocalTimer();
    this.orderStartTime = null;
    this.timerDisplay = '00:00:00';
  }
}

startLocalTimer() {
  this.stopLocalTimer();
  this.timerHandle = setInterval(() => {
    if (!this.orderStartTime) return;
    const diff = (Date.now() - this.orderStartTime.getTime()) / 1000;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = Math.floor(diff % 60);
    this.timerDisplay = 
      `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }, 1000);
}

stopLocalTimer() {
  if (this.timerHandle) {
    clearInterval(this.timerHandle);
    this.timerHandle = null;
  }
}

// called when Place Order button is clicked
placeOrder() {
  const itemsStr = this.cart
    .map(c => `${c.itemId}:${c.qty}`)
    .join(',');

  const payload = {
    tableNumber: this.currentTableNumber ?? 'D/P',
    zoneType: this.currentTableNumber ? 'NonAC' : 'DP',  // you can adjust
    userId: 1,
    itemIds: itemsStr,
    totalCost: this.totalAmount,
    startTime: (this.orderStartTime ?? new Date()).toISOString(),
    paymentMode: this.paymentMode,
    userType: this.orderType
  };

  this.tableOrderService.createOrder(payload).subscribe({
    next: () => {
      this.stopLocalTimer();
      // clear cart, maybe navigate back to table screen
    },
    error: (err: any) => console.error('Order save error', err)
  });
}

loadOrderForTable(table: string) {

  this.loadItemsByType(this.selectedFoodTypeId!);

  this.tableOrderService.getOrder(table).subscribe(order => {

    if (!order || !order.items) {
      this.cart = [];
      this.calculateTotal();
      return;
    }

    this.cart = order.items.map((o: any) => ({
      itemId: o.itemId,
      itemName: o.itemName,
      itemCost: o.itemCost,
      imageUrl: o.imageUrl,
      qty: o.qty
    }));

    this.calculateTotal();
  });
}

}

