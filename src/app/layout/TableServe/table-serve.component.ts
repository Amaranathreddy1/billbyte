// src/app/layout/TableServe/table-serve.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignalRService } from '../../core/services/signalr.service';
import { TableOrderService } from '../../core/services/table-order.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table-serve',
  templateUrl: './table-serve.component.html',
  styleUrls: ['./table-serve.component.scss']
})
export class TableServeComponent implements OnInit, OnDestroy {
  nonAcTables: string[] = [];
  acTables: string[] = [];
  dpTable = 'D/P';

  // timer & status structures
  tableTimers: { [table: string]: string } = {};
  timerIntervals: { [table: string]: any } = {};
  startTimes: { [table: string]: number | null } = {}; // epoch ms or null
  occupiedTables = new Set<string>();
  tableStatuses: { [table: string]: string } = {};

  private subs: Subscription[] = [];

  constructor(
    private signalR: SignalRService,
    private tableOrderService: TableOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signalR.startConnection();

    // sample: build 10 non-ac and 5 ac (prefer to load from BU settings)
    this.nonAcTables = Array.from({length:10}, (_,i)=>`T${i+1}`);
    this.acTables = Array.from({length:5}, (_,i)=>`T${i+1}`);

    // subscribe to SignalR events
    this.subs.push(
      this.signalR.tableTimerUpdate$.subscribe((u) => {
        this.tableTimers[u.table] = u.timeDisplay;
        this.occupiedTables.add(u.table);
      })
    );

    this.subs.push(
      this.signalR.tableTimerStop$.subscribe((table) => {
        if (this.timerIntervals[table]) {
          clearInterval(this.timerIntervals[table]);
          delete this.timerIntervals[table];
        }
        delete this.tableTimers[table];
        this.occupiedTables.delete(table);
      })
    );

    this.subs.push(
      this.signalR.tableStatusUpdate$.subscribe(p => {
        this.tableStatuses[p.table] = p.status;
        if (p.status === 'Occupied') this.occupiedTables.add(p.table);
        else this.occupiedTables.delete(p.table);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    // clear intervals
    Object.keys(this.timerIntervals).forEach(t => {
      clearInterval(this.timerIntervals[t]);
    });
  }

  openTable(tableNumber: string) {
    // navigate to dashboard payment view w/ query param
    this.router.navigate(['/dashboard'], { queryParams: { table: tableNumber }});
  }

  // view helpers
  getStatusClass(table: string) {
    const status = this.tableStatuses[table] || (this.occupiedTables.has(table) ? 'Occupied' : 'Available');
    return {
      'available-table': status === 'Available',
      'occupied-table': status === 'Occupied',
      'billed-table': status === 'Billed'
    };
  }
}
