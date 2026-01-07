import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';

// Núcleo: Importaciones con nombres descriptivos y sin sufijos
import {LineupClient} from '../../core/services/lineup-client';
import {Performance, FESTIVAL_DAYS} from '../../core/models/performance';
import {getFestivalDate} from '../../shared/utils/date-utils';

@Component({
  selector: 'app-lineup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lineup.html',
})
export class Lineup implements OnInit {
  private client = inject(LineupClient);

  // Signal para el estado de carga
  protected isLoading = signal<boolean>(true);
  private allPerformances = signal<Performance[]>([]);
  protected selectedDay = signal<string>('ALL');

  protected readonly days = FESTIVAL_DAYS;
  protected readonly Object = Object;

  protected groupedLineup = computed(() => {
    const performances = this.allPerformances();
    const dayFilter = this.selectedDay();
    const grouped: { [date: string]: { [stage: string]: Performance[] } } = {};

    performances.forEach(p => {
      const dateKey = getFestivalDate(p.startTime);
      if (dayFilter !== 'ALL' && dateKey !== dayFilter) return;
      if (!grouped[dateKey]) grouped[dateKey] = {};
      if (!grouped[dateKey][p.stage.name]) grouped[dateKey][p.stage.name] = [];
      grouped[dateKey][p.stage.name].push(p);
    });

    return grouped;
  });

  protected getGroupedDates = computed(() =>
    Object.keys(this.groupedLineup()).sort()
  );

  ngOnInit() {
    this.isLoading.set(true);
    this.client.getLineup().subscribe({
      next: (data) => {
        this.allPerformances.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching lineup:', err);
        this.isLoading.set(false);
      }
    });
  }

  getDayLabel(date: string): string {
    return this.days.find(d => d.date === date)?.label || date;
  }

  setDay(date: string) {
    this.selectedDay.set(date);
  }
}
