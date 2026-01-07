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
  // Inyección del cliente de datos con un nombre de variable corto
  private client = inject(LineupClient);

  private allPerformances = signal<Performance[]>([]);
  protected selectedDay = signal<string>('ALL');

  protected readonly days = FESTIVAL_DAYS;
  protected readonly Object = Object;

  /**
   * Lógica computada para agrupar las actuaciones por fecha y escenario.
   * Se actualiza automáticamente cuando cambia el día seleccionado o los datos.
   */
  protected groupedLineup = computed(() => {
    const performances = this.allPerformances();
    const dayFilter = this.selectedDay();
    const grouped: { [date: string]: { [stage: string]: Performance[] } } = {};

    performances.forEach(p => {
      const dateKey = getFestivalDate(p.startTime);

      // Filtrado por día
      if (dayFilter !== 'ALL' && dateKey !== dayFilter) return;

      if (!grouped[dateKey]) grouped[dateKey] = {};
      if (!grouped[dateKey][p.stage.name]) grouped[dateKey][p.stage.name] = [];

      grouped[dateKey][p.stage.name].push(p);
    });

    return grouped;
  });

  /**
   * Obtiene las fechas agrupadas y ordenadas para las pestañas de la UI.
   */
  protected getGroupedDates = computed(() =>
    Object.keys(this.groupedLineup()).sort()
  );

  ngOnInit() {
    // Uso del 'client' para obtener la programación del festival
    this.client.getLineup().subscribe({
      next: (data) => this.allPerformances.set(data),
      error: (err) => console.error('Error fetching lineup:', err)
    });
  }

  /**
   * Devuelve la etiqueta amigable (ej: "WED 13") para una fecha técnica.
   */
  getDayLabel(date: string): string {
    return this.days.find(d => d.date === date)?.label || date;
  }

  /**
   * Actualiza el signal del día seleccionado para filtrar la vista.
   */
  setDay(date: string) {
    this.selectedDay.set(date);
  }
}
