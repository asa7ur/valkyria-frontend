import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {LineupService} from '../../core/services/lineup.service';
import {Performance, DayOption} from '../../core/models/lineup.model';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-lineup',
  imports: [
    DatePipe
  ],
  templateUrl: './lineup.html',
  styles: ``,
})
export class Lineup implements OnInit {
  private lineupService = inject(LineupService);
  private allPerformances = signal<Performance[]>([]);
  protected selectedDay = signal<string>('ALL');

  protected readonly days: DayOption[] = [
    {label: 'ALL', date: 'ALL'},
    {label: 'WED 8', date: '2026-07-08'},
    {label: 'THU 9', date: '2026-07-09'},
    {label: 'FRI 10', date: '2026-07-10'},
    {label: 'SAT 11', date: '2026-07-11'}
  ];

  private filteredByDay = computed(() => {
    const day = this.selectedDay();
    const list = this.allPerformances();
    if (day === 'ALL') return list;
    return list.filter(p => p.startTime.startsWith(day));
  })

  protected performancesByStage = computed(() => {
    const performances = this.filteredByDay();
    const grouped: { [key: string]: Performance[] } = {};

    performances.forEach(p => {
      if (!grouped[p.stage.name]) {
        grouped[p.stage.name] = [];
      }
      grouped[p.stage.name].push(p);
    });

    return grouped;
  })

  protected stageNames = computed(() => Object.keys(this.performancesByStage()));

  ngOnInit() {
    this.lineupService.getLineup().subscribe({
      next: (data) => this.allPerformances.set(data),
      error: (err) => console.error('Error al cargar el Lineup:', err)
    });
  }

  setDay(date: string) {
    this.selectedDay.set(date);
  }
}
