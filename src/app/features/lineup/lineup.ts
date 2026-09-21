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
import { environment } from '../../../environments/environment';

// Orden de escenarios deseado; el primero es el principal
const STAGE_ORDER = [
  'Asgard del Sur',
  'Valhalla de Triana',
  'Fenrir del Al-Ándalus',
  'Drakkar de Guadalquivir'
];

// Cada día lleva además su cabeza de cartel: el último en actuar en el escenario principal
interface LineupDay extends StructuredDay {
  headliner: Performance | null;
  total: number;
}

@Component({
  selector: 'app-lineup',
  imports: [CommonModule, RouterLink, TranslateModule, LocalizedNamePipe],
  templateUrl: './lineup.html',
  styleUrl: './lineup.css',
})
export class Lineup implements OnInit {
  private client = inject(LineupClient);
  private translate = inject(TranslateService);
  private readonly logosBaseUrl = `${environment.apiUrl}/uploads/artists/`;

  protected isLoading = signal<boolean>(true);
  private allPerformances = signal<Performance[]>([]);
  protected selectedDay = signal<string>('ALL');

  protected currentLang = toSignal(
    this.translate.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translate.getCurrentLang() || 'es' }
  );

  protected readonly days = FESTIVAL_DAYS;

  /**
   * Agrupa las actuaciones por día (de festival: lo de después de medianoche cuenta como la noche anterior)
   * y, dentro de cada día, por escenario en el orden de STAGE_ORDER.
   */
  protected structuredLineup = computed<LineupDay[]>(() => {
    const rawPerformances = this.allPerformances();
    const dayFilter = this.selectedDay();

    const groups = new Map<string, Map<string, Performance[]>>();

    rawPerformances.forEach(p => {
      const dateKey = getFestivalDate(p.startTime);
      if (dayFilter !== 'ALL' && dateKey !== dayFilter) return;

      if (!groups.has(dateKey)) groups.set(dateKey, new Map());
      const stagesMap = groups.get(dateKey)!;

      if (!stagesMap.has(p.stage.name)) stagesMap.set(p.stage.name, []);
      stagesMap.get(p.stage.name)!.push(p);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stagesMap]) => {
        const stages = Array.from(stagesMap.entries())
          .sort(([nameA], [nameB]) => {
            const idxA = STAGE_ORDER.indexOf(nameA);
            const idxB = STAGE_ORDER.indexOf(nameB);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
          })
          .map(([name, performances]) => ({
            name,
            nameEn: performances[0]?.stage.nameEn,
            performances: performances.sort((a, b) => a.startTime.localeCompare(b.startTime))
          }));

        const mainStage = stages.find(stage => stage.name === STAGE_ORDER[0]);
        return {
          date,
          stages,
          headliner: mainStage?.performances.at(-1) ?? null,
          total: stages.reduce((sum, stage) => sum + stage.performances.length, 0)
        };
      });
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

  protected logoUrl(perf: Performance): string | null {
    return perf.artist.logo ? `${this.logosBaseUrl}${perf.artist.logo}_thumb.webp` : null;
  }
}
