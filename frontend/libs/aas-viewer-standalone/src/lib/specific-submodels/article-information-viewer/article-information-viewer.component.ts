import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { ConceptUnitService, inlineUnitOf, semanticIdOf } from '../../concept-unit.service';
import { SemanticDescriptionPopupComponent } from '../../semantic-description-popup/semantic-description-popup.component';

@Component({
  selector: 'aas-article-information-viewer',
  templateUrl: './article-information-viewer.component.html',
  styleUrls: ['./article-information-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    InputGroup,
    InputGroupAddon,
    InputText,
    TranslateModule,
    HelpLabelComponent,
    SemanticDescriptionPopupComponent,
  ],
})
export class ArticleInformationViewerComponent {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input({ required: true }) currentLang = 'de';

  private readonly units = inject(ConceptUnitService);

  constructor(private translate: TranslateService) {
    translate.onLangChange.subscribe((lang: any) => {
      this.currentLang = lang.lang;
    });
  }

  get identifyingOrderNumber() {
    return this.findElement('IdentifyingOrderNumber', '0173-1#02-AAO689#001');
  }

  get productDescription() {
    return this.findElement('ProductDescription', '0173-1#02-AAO240#002');
  }

  get productGroup() {
    return this.findElement('ManufacturerProductFamily', '0173-1#02-AAV283#001');
  }

  get unitOfContent() {
    return this.findElement('UnitOfContent', '0173-1#02-AAO250#002');
  }

  get weight() {
    return this.findElement('Weight', '0173-1#02-AAB713#006');
  }

  get grossWeight() {
    return this.findElement('GrossWeight', '0173-1#02-BAF368#004');
  }

  findElement(idShort: string, semanticId: string): aas.types.ISubmodelElement | undefined {
    return this.submodel?.submodelElements?.find(
      (sme) => (sme.idShort ?? '').toLowerCase() === idShort.toLowerCase() || this.hasSemanticId(sme, semanticId),
    );
  }

  /** Displayed value of an element (text in the current language for multi-language properties). */
  textOf(element: aas.types.ISubmodelElement | undefined): string {
    if (element instanceof aas.types.Property) {
      return element.value ?? '';
    }
    if (element instanceof aas.types.MultiLanguageProperty) {
      const entries = element.value ?? [];
      return (
        entries.find((e) => e.language.toLowerCase() === this.currentLang.toLowerCase())?.text ??
        entries.find((e) => e.language.toLowerCase() === 'en')?.text ??
        entries[0]?.text ??
        ''
      );
    }
    return '';
  }

  /** Semantic ID of an element for the "?" to its concept description. */
  readonly semanticIdOf = semanticIdOf;

  /** Unit of an element (at the element or from its concept description). */
  unitOf(element: aas.types.ISubmodelElement | undefined): string {
    return this.units.unit(semanticIdOf(element), inlineUnitOf(element));
  }

  hasSemanticId(sme: aas.types.ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.trim() === semanticId) != null;
  }
}
