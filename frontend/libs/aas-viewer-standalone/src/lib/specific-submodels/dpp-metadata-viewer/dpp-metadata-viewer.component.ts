import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { DateProxyPipe } from '@aas/common-pipes';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tag } from '@openng/optimus-ui/tag';
import { SemanticDescriptionPopupComponent } from '../../semantic-description-popup/semantic-description-popup.component';
import {
  buildDppMetadataView,
  contentSpecificationName,
  DppMetadataField,
  dppGranularityLabel,
  dppStatusLabel,
  dppStatusTone,
} from './dpp-metadata';

interface DppRow {
  labelKey: string;
  icon: string;
  field: DppMetadataField;
}

/**
 * DPP metadata (IDTA DPP metadata 1.0): the status of the digital product passport as hero, coloured by its meaning,
 * and the identifiers below.
 */
@Component({
  selector: 'aas-dpp-metadata-viewer',
  templateUrl: './dpp-metadata-viewer.component.html',
  styleUrl: './dpp-metadata-viewer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    DateProxyPipe,
    InputGroup,
    InputGroupAddon,
    InputText,
    Tag,
    SemanticDescriptionPopupComponent,
  ],
})
export class DppMetadataViewerComponent {
  submodel = input<aas.types.Submodel | undefined>(undefined);

  metadata = computed(() => buildDppMetadataView(this.submodel()));

  statusLabel = computed(() => dppStatusLabel(this.metadata().dppStatus.value));
  statusTone = computed(() => dppStatusTone(this.metadata().dppStatus.value));
  granularityLabel = computed(() => dppGranularityLabel(this.metadata().granularity.value));

  lastUpdate = computed(() => {
    const value = this.metadata().lastUpdate.value;
    const date = value !== '' ? new Date(value) : null;
    return date != null && !Number.isNaN(date.getTime()) ? date : null;
  });

  /** Identifier fields that have a value, in the order of the specification. */
  rows = computed<DppRow[]>(() => {
    const view = this.metadata();
    const rows: DppRow[] = [
      { labelKey: 'DPP_FIELD_DIGITALPRODUCTPASSPORTID', icon: 'fa-passport', field: view.digitalProductPassportId },
      { labelKey: 'DPP_FIELD_UNIQUEPRODUCTIDENTIFIER', icon: 'fa-barcode', field: view.uniqueProductIdentifier },
      { labelKey: 'DPP_FIELD_ECONOMICOPERATORID', icon: 'fa-building', field: view.economicOperatorId },
      { labelKey: 'DPP_FIELD_FACILITYID', icon: 'fa-warehouse', field: view.facilityId },
    ];
    return rows.filter((row) => row.field.value !== '');
  });

  /** Content specifications with a readable name where one is known. */
  specifications = computed(() =>
    this.metadata().contentSpecificationIds.map((specification) => ({
      ...specification,
      name: contentSpecificationName(specification.value),
    })),
  );

  isLink(value: string) {
    return /^https?:\/\//i.test(value.trim());
  }
}
