import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {LineupService} from '../../core/services/lineup.service';
import {Performance, DayOption} from '../../core/models/lineup.model';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-lineup',
  imports: [
    CommonModule
  ],
  templateUrl: './lineup.html',
  styles: ``,
})
export class Lineup implements OnInit {
  private lineupService = inject(LineupService);
  private allPerformances = signal<Performance[]>([]);
  protected selectedDay = signal<string>('ALL');
  protected readonly Object = Object;

  protected readonly days: DayOption[] = [
    {label: 'ALL', date: 'ALL'},
    {label: 'WED 13', date: '2025-08-13'},
    {label: 'THU 14', date: '2025-08-14'},
    {label: 'FRI 15', date: '2025-08-15'},
    {label: 'SAT 16', date: '2025-08-16'}
  ];

  private getFestivalDate(isoString: string): string {
    const date = new Date(isoString);
    const hours = date.getHours();

    if (hours < 6) {
      date.setDate(date.getDate() - 1);
    }

    // Retornamos solo la parte YYYY-MM-DD
    return date.toISOString().split('T')[0];
  }

  protected groupedLineup = computed(() => {
    const performances = this.allPerformances();
    const dayFilter = this.selectedDay();

    const grouped: { [date: string]: { [stage: string]: Performance[] } } = {};

    performances.forEach(p => {
      // Usamos la nueva lógica para determinar el día
      const festivalDate = this.getFestivalDate(p.startTime);

      // Filtrado por el selector de la cabecera
      if (dayFilter !== 'ALL' && festivalDate !== dayFilter) return;

      if (!grouped[festivalDate]) grouped[festivalDate] = {};
      if (!grouped[festivalDate][p.stage.name]) grouped[festivalDate][p.stage.name] = [];

      grouped[festivalDate][p.stage.name].push(p);
    });

    return grouped;
  });

  protected getGroupedDates = computed(() => Object.keys(this.groupedLineup()).sort());

  getDayLabel(date: string): string {
    return this.days.find(d => d.date === date)?.label || date;
  }

  ngOnInit() {
    this.lineupService.getLineup().subscribe({
      next: (data) => this.allPerformances.set(data),
      error: (err) => console.error('Error:', err)
    });
  }

  setDay(date: string) {
    this.selectedDay.set(date);
  }
}
