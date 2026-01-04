import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LineupService} from '../../core/services/lineup.service';
import {Performance, FESTIVAL_DAYS} from '../../core/models/lineup.model';
import {getFestivalDate} from '../../shared/utils/date-utils';

@Component({
  selector: 'app-lineup',
  standalone: true, // Asumiendo que usas standalone
  imports: [CommonModule],
  templateUrl: './lineup.html',
})
export class Lineup implements OnInit {
  private lineupService = inject(LineupService);

  private allPerformances = signal<Performance[]>([]);
  protected selectedDay = signal<string>('ALL');

  protected readonly days = FESTIVAL_DAYS;
  protected readonly Object = Object;

  // Lógica de agrupamiento extraída a una propiedad computada limpia
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
    this.lineupService.getLineup().subscribe({
      next: (data) => this.allPerformances.set(data),
      error: (err) => console.error('Error fetching lineup:', err)
    });
  }

  getDayLabel(date: string): string {
    return this.days.find(d => d.date === date)?.label || date;
  }

  setDay(date: string) {
    this.selectedDay.set(date);
  }
}
