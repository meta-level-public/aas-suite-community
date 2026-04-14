import { formatDateLike } from '@aas/helpers';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'vwsDate',
  standalone: true,
})
export class DateProxyPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}
  transform(value: string | Date | undefined | null, format: string = 'SHORT_DATE'): unknown {
    const datePattern = this.translateService.instant(format);
    return formatDateLike(value, this.translateService.currentLang, datePattern ?? format);
  }
}
