import { Component, Input } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'aas-property-viewer',
  templateUrl: './property-viewer.component.html',
  imports: [],
})
export class PropertyViewerComponent {
  @Input() property: any;
  @Input() conceptDescriptions: any;
  @Input() apiUrl: string = '/api';

  get formattedValue() {
    // TODO: vereinfachen und universeller umsetzen für alle Datentypen
    const cd = this.getConceptDescription();

    if (cd != null) {
      if (this.property.valueType.toLowerCase() === 'datetime') {
        if (cd.format != null) {
          const d = moment.utc(this.property.value, cd.format);
          return d.local().format('L LTS');
        } else if (cd.embeddedDataSpecifications.length > 0 && cd.embeddedDataSpecifications[0]) {
          const d = moment.utc(this.property.value, cd.embeddedDataSpecifications[0].dataSpecificationContent.format);
          return d.local().format('L LTS');
        } else {
          try {
            const d = moment.utc(this.property.value);
            return d.local().format('L LTS');
          } catch {
            // ignore format problem, just return raw
            return this.property.value;
          }
        }
      }
      if (cd.unit != null) {
        return this.property.value + ' ' + cd.unit;
      } else if (
        cd.embeddedDataSpecifications.length > 0 &&
        cd.embeddedDataSpecifications[0].dataSpecificationContent?.unit != null
      ) {
        return this.property.value + ' ' + cd.embeddedDataSpecifications[0].dataSpecificationContent?.unit;
      }

      return this.property.value;
    } else {
      if (this.property.valueType.toLowerCase() === 'datetime') {
        try {
          const d = moment.utc(this.property.value);
          return d.local().format('L LTS');
        } catch {
          // ignore format problem, just return raw
          return this.property.value;
        }
      }
    }

    return this.property.value;
  }

  getConceptDescription() {
    return this.conceptDescriptions?.find(
      (c: any) =>
        c.identification.id ===
        this.property.semanticId?.keys?.find((k: any) => k.type === 'ConceptDescription')?.value,
    );
  }
}
