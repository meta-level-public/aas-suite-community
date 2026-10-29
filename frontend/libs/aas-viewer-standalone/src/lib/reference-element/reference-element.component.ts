import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input } from '@angular/core';
import { HelpLabelComponent } from '@aas/common-components';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { OpenShellButtonComponent } from '../open-shell-button/open-shell-button.component';

@Component({
  selector: 'aas-reference-element-v3',
  templateUrl: './reference-element.component.html',
  styleUrls: ['./reference-element.component.css'],
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, HelpLabelComponent, OpenShellButtonComponent],
})
export class ReferenceElementComponent {
  @Input() element: any;

  // Key types are enum values in aas-core objects and strings in plain JSON
  private toTypeName(type: aas.types.KeyTypes | string): string {
    return typeof type === 'number' ? (aas.stringification.keyTypesToString(type) ?? String(type)) : type;
  }

  // A ModelReference whose first key is an AAS points to another AAS that can be opened
  getShellAasId(index: number): string | null {
    const reference = this.element?.value;
    const key = reference?.keys?.[index];
    const isModelReference =
      reference?.type === aas.types.ReferenceTypes.ModelReference || reference?.type === 'ModelReference';
    if (index !== 0 || !isModelReference || key == null) return null;
    return this.toTypeName(key.type) === 'AssetAdministrationShell' ? key.value : null;
  }

  getReadableType(type: aas.types.KeyTypes | string): string {
    type = this.toTypeName(type);
    const typeMap: Record<string, string> = {
      GlobalReference: 'Global Reference',
      ModelReference: 'Model Reference',
      ExternalReference: 'External Reference',
      Submodel: 'Submodel',
      ConceptDescription: 'Concept Description',
      AssetAdministrationShell: 'Asset Administration Shell',
    };
    return typeMap[type] || type;
  }

  getIconForType(type: aas.types.KeyTypes | string): string {
    type = this.toTypeName(type);
    const iconMap: Record<string, string> = {
      GlobalReference: 'fa-solid fa-globe reference-type-icon',
      ModelReference: 'fa-solid fa-cube reference-type-icon',
      ExternalReference: 'fa-solid fa-external-link-alt reference-type-icon',
      Submodel: 'fa-solid fa-layer-group reference-type-icon',
      ConceptDescription: 'fa-solid fa-book reference-type-icon',
      AssetAdministrationShell: 'fa-solid fa-building reference-type-icon',
    };
    return iconMap[type] || 'fa-solid fa-link reference-type-icon';
  }

  isUrl(value: string): boolean {
    if (!value) return false;
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('www.');
  }

  getShortValue(value: string): string {
    if (!value) return '';

    // For URLs, show just the domain and path
    if (this.isUrl(value)) {
      try {
        const url = new URL(value);
        const path = url.pathname + url.hash;
        if (path.length > 50) {
          return url.hostname + '/...' + path.slice(-30);
        }
        return url.hostname + path;
      } catch {
        return value.length > 60 ? value.substring(0, 57) + '...' : value;
      }
    }

    // For IDs, show last segment
    const segments = value.split('/');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && lastSegment.length > 0) {
      return lastSegment.length > 60 ? '.../' + lastSegment.substring(0, 57) + '...' : lastSegment;
    }

    return value.length > 60 ? value.substring(0, 57) + '...' : value;
  }
}
