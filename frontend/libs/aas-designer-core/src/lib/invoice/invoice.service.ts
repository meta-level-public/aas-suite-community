import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrgaRechnung } from '@aas-designer-model';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async generate(rechnungsMonatString: string) {
    const params = new HttpParams().append('rechnungsMonatString', rechnungsMonatString);
    const organisations = await lastValueFrom(
      this.http.get<OrgaRechnung[]>(`${this.appConfigService.config.apiPath}/Invoice/Generate`, { params }),
    );
    return organisations.map((d: any) => OrgaRechnung.fromDto(d));
  }

  async load(rechnungsMonatString: string) {
    const params = new HttpParams().append('rechnungsMonatString', rechnungsMonatString);
    const organisations = await lastValueFrom(
      this.http.get<OrgaRechnung[]>(`${this.appConfigService.config.apiPath}/Invoice/Load`, { params }),
    );
    return organisations.map((d: any) => OrgaRechnung.fromDto(d));
  }
}
