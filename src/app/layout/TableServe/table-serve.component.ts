import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../core/services/signalr.service';
import { TableOrderService } from '../../core/services/table-order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-serve',
  templateUrl: './table-serve.component.html',
  styleUrls: ['./table-serve.component.scss']
})
export class TableServeComponent implements OnInit {

    nonAcTables: string[] = [];
    acTables: string[] = [];
    dpTable: string = "D/P";
    tableTimers: { [tableName: string]: string } = {};
    
  constructor(
    private signalRService: SignalRService,
    private tableOrderService: TableOrderService,
    private router: Router
    ) {}

  ngOnInit(): void {

    // ✅ Start SignalR live connection
    this.signalRService.startConnection();

    // ✅ Listen for live table updates
    this.signalRService.onTableUpdate(data => {
      console.log("LIVE TABLE UPDATE:", data);
      this.loadTables();   // refresh UI
    });

    this.signalRService.onTableTimerUpdate(data => {
    this.tableTimers[data.table] = data.timeDisplay;
    });

    this.signalRService.onTableTimerStop(table => {
        delete this.tableTimers[table];
        });

    // ✅ Load tables on page load
    this.loadTables();
  }

  loadTables() {
  const userId = 1; // later from auth

  this.tableOrderService.getTableStatuses(userId).subscribe({
    next: (res : any) => {
      this.nonAcTables = res.nonAc;
      this.acTables = res.ac;
      this.dpTable = res.dp;
    },
    error: (err : any) => console.error("TABLE LOAD ERROR:", err)
  });
}

navigateToDashboard(tableName: string) {
    console.log('tableName came for open to choose' + tableName)
  this.router.navigate(['/dashboard'], { queryParams: { table: tableName }});
}
openTable(tableNumber: string) {
    console.log('tableNumber came for open to choose' + tableNumber)

  this.router.navigate(['/dashboard'], { queryParams: { table: tableNumber }});
}
getStatusClass(table: string) {
  if (this.tableTimers[table]) return 'occupied';
  return 'available';
}
}
