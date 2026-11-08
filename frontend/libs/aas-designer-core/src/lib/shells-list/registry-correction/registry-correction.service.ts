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
    const base = this.getProxyBase('aas-reg');
    await this.replaceDescriptor(
      `${base}shell-descriptors/${this.encodeId(originalAasId)}`,
      `${base}shell-descriptors`,
      descriptor,
    );
  }

  async saveSubmodelDescriptor(originalSubmodelId: string, descriptor: RegistrySubmodelDescriptor) {
    const base = this.getProxyBase('sm-reg');
    await this.replaceDescriptor(
      `${base}submodel-descriptors/${this.encodeId(originalSubmodelId)}`,
      `${base}submodel-descriptors`,
      descriptor,
    );
  }

  /**
   * The registry cannot change a descriptor id via PUT, so the original descriptor is deleted and the new one posted.
   * If posting fails, the original descriptor is restored (best effort) and the original error is rethrown.
   */
  private async replaceDescriptor(
    descriptorUrl: string,
    collectionUrl: string,
    descriptor: RegistrySubmodelDescriptor,
  ) {
    const previousDescriptor = await this.getExistingDescriptor(descriptorUrl);
    await this.deleteDescriptor(descriptorUrl);

    try {
      await lastValueFrom(this.http.post(collectionUrl, descriptor));
    } catch (error) {
      if (previousDescriptor != null) {
        try {
          await lastValueFrom(this.http.post(collectionUrl, previousDescriptor));
        } catch {
          // Restoring failed as well; the original error is more relevant for the caller.
        }
      }
      throw error;
    }
  }

  private async getExistingDescriptor(url: string) {
    try {
      return await lastValueFrom(this.http.get<RegistrySubmodelDescriptor>(url));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }

      throw error;
    }
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
