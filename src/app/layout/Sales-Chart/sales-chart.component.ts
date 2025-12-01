import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { DashboardAnalyticsService, SalesPoint } from '../../core/services/dashboard-analytics.service';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="chart-card"><canvas #chart></canvas></div>`,
  styles: [`
    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      margin-bottom: 12px;
    }
    canvas { width: 100% !important; height: 220px !important; }
  `]
})
export class SalesChartComponent implements OnInit {
  @ViewChild('chart', { static: true }) chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  constructor(private analytics: DashboardAnalyticsService) {}

  ngOnInit() {
    this.analytics.getSalesLast7Days().subscribe({
      next: (data) => this.buildChart(data),
      error: (err) => console.error('Chart data error', err)
    });
  }

  private buildChart(data: SalesPoint[]) {
    // ensure sorted by DayDate
    data.sort((a,b) => (new Date(a.dayDate).getTime()) - (new Date(b.dayDate).getTime()));

    const labels = data.map(d => d.dayName); // e.g. Mon, Tue
    const orderIn = data.map(d => d.orderInCount);
    const delivery = data.map(d => d.deliveryCount);
    const parcel = data.map(d => d.parcelCount);

    const ctx = this.chartRef.nativeElement.getContext('2d')!;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'OrderIn',
            data: orderIn,
            borderColor: 'rgba(98, 0, 238, 0.85)', // purple-ish
            backgroundColor: 'rgba(98,0,238,0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3
          },
          {
            label: 'Delivery',
            data: delivery,
            borderColor: 'rgba(255, 165, 0, 0.9)', // orange
            backgroundColor: 'rgba(255,165,0,0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3
          },
          {
            label: 'Parcel',
            data: parcel,
            borderColor: 'rgba(46, 204, 113, 0.9)', // green
            backgroundColor: 'rgba(46,204,113,0.10)',
            fill: true,
            tension: 0.35,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 10 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      } as any
    });
  }
}
