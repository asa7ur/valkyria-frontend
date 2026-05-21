import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalizedNamePipe } from '../../shared/pipes/localized-name.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LineupClient } from '../../core/services/lineup-client';
import { Performance, FESTIVAL_DAYS, StructuredDay } from '../../core/models/performance';
import { getFestivalDate } from '../../shared/utils/date-utils';

@Component({
  selector: 'app-lineup',
  imports: [CommonModule, RouterLink, TranslateModule, LocalizedNamePipe],
  templateUrl: './lineup.html',
})
export class Lineup implements OnInit {
  private client = inject(LineupClient);
  private translate = inject(TranslateService);

  protected isLoading = signal<boolean>(true);
  private allPerformances = signal<Performance[]>([]);
  protected selectedDay = signal<string>('ALL');

  protected currentLang = toSignal(
    this.translate.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translate.getCurrentLang() || 'es' }
  );

  protected readonly days = FESTIVAL_DAYS;

  /**
   * Transforma y agrupa los datos en una única estructura jerárquica plana.
   */
  protected structuredLineup = computed<StructuredDay[]>(() => {
    const rawPerformances = this.allPerformances();
    const dayFilter = this.selectedDay();

    // Orden de escenarios deseado
    const stageOrder = [
      'Asgard del Sur',
      'Valhalla de Triana',
      'Fenrir del Al-Ándalus',
      'Drakkar de Guadalquivir'
    ];

    // 1. Agrupación intermedia usando un Map para eficiencia
    const groups = new Map<string, Map<string, Performance[]>>();

    rawPerformances.forEach(p => {
      const dateKey = getFestivalDate(p.startTime);
      if (dayFilter !== 'ALL' && dateKey !== dayFilter) return;

      if (!groups.has(dateKey)) groups.set(dateKey, new Map());
      const stagesMap = groups.get(dateKey)!;

      if (!stagesMap.has(p.stage.name)) stagesMap.set(p.stage.name, []);
      stagesMap.get(p.stage.name)!.push(p);
    });

    // 2. Convertir Map a Array ordenado de StructuredDay
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stagesMap]) => ({
        date,
        stages: Array.from(stagesMap.entries())
          .sort(([nameA], [nameB]) => {
            const idxA = stageOrder.indexOf(nameA);
            const idxB = stageOrder.indexOf(nameB);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
          })
          .map(([name, performances]) => ({
            name,
            nameEn: performances[0]?.stage.nameEn,
            performances: performances.sort((a, b) => a.startTime.localeCompare(b.startTime))
          }))
      }));
  });

  ngOnInit() {
    this.isLoading.set(true);
    this.client.getLineup().subscribe({
      next: (data) => {
        this.allPerformances.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setDay(date: string) {
    this.selectedDay.set(date);
  }
}
