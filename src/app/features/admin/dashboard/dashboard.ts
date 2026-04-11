import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardApiService} from '../../../core/services/dashboard-api';
import {DashboardStats} from '../../../core/models/dashboard-stats';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  stats?: DashboardStats;
  loading = true;

  constructor(private dashboardApi: DashboardApiService) {
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardApi.getStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
