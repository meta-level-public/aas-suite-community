import { AppConfigService, EncodingService, PortalService } from '@aas/common-services';
import { UrlHelper } from '@aas/helpers';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface RegistryLocalizedText {
  language?: string;
  text?: string;
  [key: string]: unknown;
}

export interface RegistryProtocolInformation {
  href?: string;
  endpointProtocol?: string;
  endpointProtocolVersion?: string[];
  subprotocol?: string;
  subprotocolBody?: string;
  subprotocolBodyEncoding?: string;
  securityAttributes?: unknown;
  [key: string]: unknown;
}

export interface RegistryEndpoint {
  interface?: string;
  protocolInformation?: RegistryProtocolInformation;
  [key: string]: unknown;
}

export interface RegistryDescriptorAdministration {
  version?: string;
  revision?: string;
  templateId?: string;
  creator?: unknown;
  [key: string]: unknown;
}

export interface RegistrySubmodelDescriptor {
  id?: string;
  idShort?: string;
  displayName?: RegistryLocalizedText[];
  description?: RegistryLocalizedText[];
  administration?: RegistryDescriptorAdministration | null;
  semanticId?: unknown;
  supplementalSemanticIds?: unknown[];
  endpoints?: RegistryEndpoint[];
  [key: string]: unknown;
}

export interface RegistryAasDescriptor extends RegistrySubmodelDescriptor {
  assetKind?: string;
  assetType?: string;
  globalAssetId?: string;
  specificAssetIds?: unknown[];
  submodelDescriptors?: RegistrySubmodelDescriptor[];
}

@Injectable({
  providedIn: 'root',
})
export class RegistryCorrectionService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);

  async getAasDescriptor(aasId: string) {
    return await lastValueFrom(
      this.http.get<RegistryAasDescriptor>(`${this.getProxyBase('aas-reg')}shell-descriptors/${this.encodeId(aasId)}`),
    );
  }

  async getSubmodelDescriptor(submodelId: string) {
    return await lastValueFrom(
      this.http.get<RegistrySubmodelDescriptor>(
        `${this.getProxyBase('sm-reg')}submodel-descriptors/${this.encodeId(submodelId)}`,
      ),
    );
  }

  async saveAasDescriptor(originalAasId: string, descriptor: RegistryAasDescriptor) {
    await this.deleteDescriptor(`${this.getProxyBase('aas-reg')}shell-descriptors/${this.encodeId(originalAasId)}`);
    await lastValueFrom(this.http.post(`${this.getProxyBase('aas-reg')}shell-descriptors`, descriptor));
  }

  async saveSubmodelDescriptor(originalSubmodelId: string, descriptor: RegistrySubmodelDescriptor) {
    await this.deleteDescriptor(
      `${this.getProxyBase('sm-reg')}submodel-descriptors/${this.encodeId(originalSubmodelId)}`,
    );
    await lastValueFrom(this.http.post(`${this.getProxyBase('sm-reg')}submodel-descriptors`, descriptor));
  }

  private async deleteDescriptor(url: string) {
    try {
      await lastValueFrom(this.http.delete(url));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return;
      }

      throw error;
    }
  }

  private getProxyBase(kind: 'aas-reg' | 'sm-reg') {
    const proxyApiPath = this.appConfigService.config.aasProxyApiPath;
    if (!proxyApiPath) {
      throw new Error('AAS proxy API path is not configured');
    }

    const infrastructureId = PortalService.getCurrentAasInfrastructureId();
    if (infrastructureId < 0) {
      throw new Error('No active AAS infrastructure selected');
    }

    return `${UrlHelper.appendSlash(proxyApiPath)}${infrastructureId}/${kind}/`;
  }

  private encodeId(value: string) {
    return EncodingService.base64urlEncode(value);
  }
}
