import { Submodel } from '@aas-core-works/aas-core3.1-typescript/types';
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TableModule } from '@openng/optimus-ui/table';
import { Tag } from '@openng/optimus-ui/tag';
import { map, startWith } from 'rxjs';
import { ViewerStoreService } from '../../viewer-store.service';
import { loadViewerAttachmentUrl } from '../viewer-attachment';
import { GenericViewerComponent } from '../../generic-viewer/generic-viewer.component';
import { SemanticDescriptionPopupComponent } from '../../semantic-description-popup/semantic-description-popup.component';
import { ViewerUnitComponent } from '../../viewer-unit/viewer-unit.component';
import {
  buildTechnicalDataSheet,
  DataSheetClassification,
  DataSheetFile,
  DataSheetSection,
  sectionSize,
} from './technical-data-sheet';

/** Nested groups with up to this many entries start open, longer ones collapsed. */
const OPEN_GROUP_SIZE = 8;

/**
 * Data sheet view of a Technical Data submodel (IDTA 02003, 1.x and 2.0): header with product and images, the
 * property areas as cards with label/value tables, and collections with identical fields as one table.
 */
@Component({
  selector: 'aas-technicaldata-viewer',
  templateUrl: './technicaldata-viewer.component.html',
  styleUrl: './technicaldata-viewer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    TranslateModule,
    InputGroup,
    InputGroupAddon,
    InputText,
    TableModule,
    Tag,
    GenericViewerComponent,
    SemanticDescriptionPopupComponent,
    ViewerUnitComponent,
  ],
})
export class TechnicaldataViewerComponent {
  technicalData = input<Submodel | undefined>(undefined);

  private readonly translate = inject(TranslateService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly viewerStore = inject(ViewerStoreService);

  private readonly language = toSignal(
    this.translate.onLangChange.pipe(
      map((event) => event.lang),
      startWith(this.translate.currentLang ?? 'de'),
    ),
    { initialValue: 'de' },
  );

  sheet = computed(() => buildTechnicalDataSheet(this.technicalData(), this.language()));
  submodelId = computed(() => this.technicalData()?.id ?? '');

  hasHeader = computed(() => {
    const sheet = this.sheet();
    return (
      sheet.productDesignation !== '' ||
      sheet.manufacturerName !== '' ||
      sheet.images.length > 0 ||
      sheet.classifications.length > 0 ||
      this.hasBody(sheet.general)
    );
  });

  logoUrl = signal<SafeUrl | string | null>(null);
  imageUrls = signal<(SafeUrl | string | null)[]>([]);
  selectedImage = signal(0);

  constructor() {
    effect(() => {
      void this.loadImages(this.sheet().logo, this.sheet().images);
    });
  }

  hasBody(section: DataSheetSection) {
    return sectionSize(section) > 0;
  }

  size(section: DataSheetSection) {
    return sectionSize(section);
  }

  /** Consecutive groups with tables (full width) and without (columns), in their original order. */
  cardRuns(sections: DataSheetSection[]) {
    const runs: { wide: boolean; sections: DataSheetSection[] }[] = [];
    for (const section of sections) {
      const wide = section.tables.length > 0;
      const last = runs.at(-1);
      if (last?.wide === wide) {
        last.sections.push(section);
      } else {
        runs.push({ wide, sections: [section] });
      }
    }
    return runs;
  }

  startsOpen(section: DataSheetSection) {
    return sectionSize(section) <= OPEN_GROUP_SIZE;
  }

  classificationLabel(classification: DataSheetClassification) {
    const system = [classification.system, classification.version].filter((part) => part !== '').join(' ');
    return [system, classification.classId, classification.className].filter((part) => part !== '').join(' · ');
  }

  private async loadImages(logo: DataSheetFile | null, images: DataSheetFile[]) {
    const load = (file: DataSheetFile) =>
      loadViewerAttachmentUrl(this.http, this.sanitizer, this.viewerStore, file.idShortPath, file.value);
    this.selectedImage.set(0);
    this.logoUrl.set(logo != null ? await load(logo) : null);
    this.imageUrls.set(await Promise.all(images.map(load)));
  }
}
