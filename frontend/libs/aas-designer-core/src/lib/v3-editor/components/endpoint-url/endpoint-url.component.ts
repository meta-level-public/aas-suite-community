import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { EncodingService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { Component, computed, inject, input } from '@angular/core';
import { EditorTypeOption } from '../../model/editor-type-option';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3EditorDataStoreService } from '../../v3-editor-data-store.service';
import { V3ComponentBase } from '../v3-component-base';
import { CurlComponent } from './curl.component';
import { UrlComponent } from './url.component';

@Component({
  selector: 'aas-endpoint-url',
  imports: [UrlComponent, CurlComponent],
  templateUrl: './endpoint-url.component.html',
})
export class EndpointUrlComponent extends V3ComponentBase {
  element = input.required<V3TreeItem<any>>();
  shellResult = input<ShellResult | undefined | null>();
  v3EditorDataStore = inject(V3EditorDataStoreService);

  idShortPath = computed<string>(() => {
    const element = this.element();
    if (element == null) return '';
    return this.getIdShortParentPath(this.element(), '');
  });

  submodelId = computed<string>(() => {
    return this.getSubmodelIdRecursive(this.element());
  });

  endpointUrl = computed<string>(() => {
    return this.getEndpointUrl();
  });

  curlCode = computed(() => {
    return `
    curl -X 'GET' \\
        '${this.endpointUrl()}' \\
        -H 'accept: application/json' \\
        -H 'ApiKey: YOUR_API_KEY_PROVIDED_BY_ADMIN'
        `;
  });

  getIdShortParentPath(element: any, idShortPath: string, indexed: boolean = false): string {
    if (element != null && !(element.content instanceof aas.types.Submodel)) {
      if (element.parent.content instanceof aas.types.SubmodelElementList) {
        // aktuellen index finden ...
        const index = element.parent.content.value.findIndex((e: any) => e.idShort === element.content.idShort);
        return this.getIdShortParentPath(element.parent, '[' + index + ']' + '.' + idShortPath, true);
      } else {
        if (idShortPath.length > 0) {
          if (indexed) {
            return this.getIdShortParentPath(element.parent, element.content.idShort + idShortPath);
          } else {
            return this.getIdShortParentPath(element.parent, element.content.idShort + '.' + idShortPath);
          }
        } else {
          return this.getIdShortParentPath(element.parent, element.content.idShort);
        }
      }
    } else {
      return idShortPath.endsWith('.') ? idShortPath.substring(0, idShortPath.length - 1) : idShortPath;
    }
  }

  getSubmodelIdRecursive(element: V3TreeItem<any>): string {
    if (element.editorType === EditorTypeOption.Submodel) {
      return element.content.id;
    } else if (element.parent != null) {
      return this.getSubmodelIdRecursive(element.parent);
    } else {
      return '';
    }
  }

  getEndpointUrl(): string {
    // const baseUrl = PortalService.getCurrentAasInfrastructureSetting()?.aasRepositoryUrl;

    // const shellResult = this.shellResult();
    // const id = shellResult?.v3Shell?.assetAdministrationShells?.[0].id;
    // if (id == null) return '';
    const id = this.v3EditorDataStore.editorDescriptor()?.aasDescriptorEntry?.oldId ?? '';
    const _aasIdentifierEncoded = EncodingService.base64urlEncode(id);

    let baseUrl = '';
    if (this.element().editorType === EditorTypeOption.AssetAdministrationShell) {
      baseUrl = this.v3EditorDataStore.editorDescriptor()?.aasDescriptorEntry?.endpoint ?? '';
    } else {
      const descriptor = this.v3EditorDataStore
        .editorDescriptor()
        ?.submodelDescriptorEntries?.find((s) => s.oldId === this.submodelId());
      if (descriptor == null) return '';
      baseUrl = descriptor.endpoint ?? '';
    }

    if (
      this.element().editorType === EditorTypeOption.Submodel ||
      this.element().editorType === EditorTypeOption.AssetAdministrationShell
    ) {
      return `${baseUrl}`;
    }

    return `${baseUrl}/submodel-elements/${this.idShortPath()}`;
  }
}
