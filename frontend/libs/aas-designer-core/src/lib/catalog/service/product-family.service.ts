import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ProductFamily } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class ProductFamilyService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async createProductFamily(productFamily: ProductFamily) {
    return lastValueFrom(
      this.http.put<ProductFamily>(`${this.appConfigService.config.apiPath}/ProductFamily/Add`, productFamily),
    );
  }

  async getAllProductFamilies() {
    const dtos = await lastValueFrom(
      this.http.get<ProductFamily[]>(`${this.appConfigService.config.apiPath}/ProductFamily/GetProductFamilys`),
    );
    return dtos.map((d) => ProductFamily.fromDto(d));
  }

  async updateProductFamily(productFamily: ProductFamily) {
    return lastValueFrom(
      this.http.patch<ProductFamily>(`${this.appConfigService.config.apiPath}/ProductFamily/Update`, productFamily),
    );
  }

  async deleteProductFamilyById(id: number) {
    const params = new HttpParams().append('id', id);
    return lastValueFrom(
      this.http.delete<ProductFamily>(`${this.appConfigService.config.apiPath}/ProductFamily/Remove`, {
        params,
      }),
    );
  }
}
