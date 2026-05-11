import {Pipe, PipeTransform, inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({name: 'localizedName', standalone: true, pure: false})
export class LocalizedNamePipe implements PipeTransform {
  private translate = inject(TranslateService);

  transform(item: {name: string; nameEn?: string} | null | undefined): string {
    if (!item) return '';
    return (this.translate.currentLang === 'en' && item.nameEn) ? item.nameEn : item.name;
  }
}
