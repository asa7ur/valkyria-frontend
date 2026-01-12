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

  /**
   * Agrupa las actuaciones por fecha y luego por escenario.
   */
  protected groupedLineup = computed(() => {
    const performances = [...this.allPerformances()].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

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

  /**
   * Devuelve los nombres de los escenarios ordenados.
   */
  protected getOrderedStages(date: string): string[] {
    const stages = Object.keys(this.groupedLineup()[date]);
    const order = [
      'Asgard del Sur',
      'Valhalla de Triana',
      'Fenrir del Al-Ándalus',
      'Drakkar de Guadalquivir'
    ];

    return stages.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      // Si un escenario no está en la lista, se pone al final
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  }

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

  /**
   * Cambia el filtro del día seleccionado.
   */
  setDay(date: string) {
    this.selectedDay.set(date);
  }
}
