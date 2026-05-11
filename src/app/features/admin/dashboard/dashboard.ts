import { Component, OnInit, inject, signal, computed, effect, viewChild, ElementRef, DestroyRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardApiService } from '../../../core/services/dashboard-api';
import { DashboardStats } from '../../../core/models/dashboard-stats';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Chart,
  LineController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(LineController, DoughnutController, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('salesChart');
  private readonly donutRef  = viewChild<ElementRef<HTMLCanvasElement>>('donutChart');
  private chartInstance?: Chart<'line'>;
  private donutInstance?: Chart<'doughnut'>;

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly loading = signal(true);

  protected readonly bestDay = computed(() => {
    const trend = this.stats()?.salesTrend ?? [];
    return trend.length > 0 ? trend.reduce((b, d) => (d.amount > b.amount ? d : b), trend[0]) : null;
  });

  protected readonly avgAmount = computed(() => {
    const trend = this.stats()?.salesTrend ?? [];
    if (trend.length === 0) return 0;
    return trend.reduce((s, d) => s + d.amount, 0) / trend.length;
  });

  protected readonly trendPct = computed(() => {
    const trend = this.stats()?.salesTrend ?? [];
    if (trend.length < 4) return 0;
    const half = Math.floor(trend.length / 2);
    const avg1 = trend.slice(0, half).reduce((s, d) => s + d.amount, 0) / half;
    const avg2 = trend.slice(half).reduce((s, d) => s + d.amount, 0) / (trend.length - half);
    return avg1 > 0 ? ((avg2 - avg1) / avg1) * 100 : 0;
  });

  constructor() {
    effect(() => {
      const canvas = this.canvasRef()?.nativeElement;
      const trend = this.stats()?.salesTrend;
      if (!canvas || !trend?.length) return;
      untracked(() => this.renderChart(canvas, trend));
    });

    effect(() => {
      const canvas = this.donutRef()?.nativeElement;
      const breakdown = this.stats()?.salesBreakdown;
      if (!canvas || !breakdown?.length) return;
      untracked(() => this.renderDoughnut(canvas, breakdown));
    });

    this.destroyRef.onDestroy(() => {
      this.chartInstance?.destroy();
      this.donutInstance?.destroy();
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.dashboardApi
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.stats.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando dashboard:', err);
          this.loading.set(false);
        },
      });
  }

  private renderDoughnut(canvas: HTMLCanvasElement, breakdown: DashboardStats['salesBreakdown']): void {
    const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16','#f97316'];

    this.donutInstance?.destroy();
    this.donutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: breakdown.map((p) => p.label),
        datasets: [{
          data: breakdown.map((p) => p.count),
          backgroundColor: COLORS.slice(0, breakdown.length),
          borderWidth: 2,
          borderColor: 'transparent',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8',
              font: { size: 11 },
              boxWidth: 12,
              padding: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} uds.`,
            },
          },
        },
      },
    });
  }

  private renderChart(canvas: HTMLCanvasElement, trend: DashboardStats['salesTrend']): void {
    const labels = trend.map((d) =>
      new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    );
    const amounts = trend.map((d) => d.amount);

    this.chartInstance?.destroy();
    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: amounts,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: amounts.length <= 14 ? 4 : 0,
            pointHoverRadius: 6,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                  ctx.parsed.y ?? 0
                ),
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: { color: '#94a3b8', maxTicksLimit: 7 },
          },
          y: {
            border: { display: false },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: {
              color: '#94a3b8',
              callback: (value) =>
                new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(+value),
            },
          },
        },
      },
    });
  }
}
