import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async validate(value: string, type: string) {
    const params = new HttpParams().set('value', value ?? '');
    return lastValueFrom(
      this.http.get<boolean>(`${this.appConfigService.config.apiPath}/Validators/${type}`, { params }),
    );
  }
}
