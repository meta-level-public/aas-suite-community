import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EClassPropertyService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getEclassPropertyCandidates(version: string, classification: string) {
    const params = new HttpParams().append('version', version).append('classification', classification);
    const url = `${this.appConfigService.config.apiPath}/Aas/GetEclassPropertyCandidates`;
    return lastValueFrom(this.http.get<any[]>(url, { params }));
  }

  async addTechnicalPropertiesToCollection(irdis: string[]) {
    const url = `${this.appConfigService.config.apiPath}/Eclass/CreateProperties`;
    return lastValueFrom(this.http.post<any>(url, irdis));
  }

  async hasEclassImported() {
    const url = `${this.appConfigService.config.apiPath}/Eclass/HasEclassImported`;
    return lastValueFrom(this.http.get<boolean>(url));
  }

  async findProperties(irdiPart: string) {
    const params = new HttpParams().append('irdiPart', irdiPart);
    const url = `${this.appConfigService.config.apiPath}/Eclass/FindProperties`;
    return lastValueFrom(this.http.get<any[]>(url, { params }));
  }

  getValuelistInfo(irdi: string) {
    const params = new HttpParams().append('irdi', irdi);
    const url = `${this.appConfigService.config.apiPath}/Eclass/GetValuelistInfo`;
    return lastValueFrom(this.http.get<any[]>(url, { params }));
  }
}
