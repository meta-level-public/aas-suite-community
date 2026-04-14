import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { DialogFooter, HelpLabelComponent, UiLabelResolver } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { Component, inject, Input, OnChanges, signal, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { v4 as uuid } from 'uuid';
import { Info } from '../../../general/model/info-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { ErrorPanelComponent } from '../error-panel/error-panel.component';
import { SearchConceptDescriptionComponent } from '../search-concept-description/search-concept-description.component';
import { ErrorHandlingAction, V3ComponentBase } from '../v3-component-base';
import { V3KeyListComponent } from '../v3-key-list/v3-key-list.component';
import { V3LangStringDisplayComponent } from '../v3-lang-string-display/v3-lang-string-display.component';
type ConceptDescription = aas.types.ConceptDescription;
type Reference = aas.types.Reference;
type VerificationError = aas.verification.VerificationError;

@Component({
  selector: 'aas-v3-semantic-description',
  templateUrl: './v3-semantic-description.component.html',
  styleUrls: ['./v3-semantic-description.component.css'],
  imports: [
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    Button,
    TableModule,
    PrimeTemplate,
    HelpLabelComponent,
    InputGroup,
    FormsModule,
    InputText,
    InputGroupAddon,
    V3LangStringDisplayComponent,
    Message,
    ErrorPanelComponent,
    TranslateModule,
  ],
})
export class V3SemanticDescriptionComponent extends V3ComponentBase implements OnChanges {
  @Input({ required: true }) semanticId: aas.types.Reference | undefined | null;
  @Input({ required: true }) supplemantalSemanticIds: aas.types.Reference[] | undefined | null;
  @Input({ required: true }) referenceParent: any;
  @Input({ required: true }) referenceParentPropertyName: string = '';
  @Input({ required: true }) shellResult: ShellResult | undefined | null;
  info = Info;

  @ViewChild('keyList') keyList: V3KeyListComponent | undefined | null;
  ReferenceType = aas.types.ReferenceTypes;

  ref: DynamicDialogRef | undefined | null;
  dialogService = inject(DialogService);

  cd = signal<aas.types.ConceptDescription | null>(null);
  supplementalCds = signal<aas.types.ConceptDescription[] | null>(null);

  translate = inject(TranslateService);

  constructor(private treeService: V3TreeService) {
    super();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.loadCd();
    const cds: aas.types.ConceptDescription[] = [];
    this.supplemantalSemanticIds?.forEach((ref) => {
      const conceptDescription = this.shellResult?.v3Shell?.conceptDescriptions?.find(
        (candidate) => candidate.id === ref?.keys[0].value,
      );
      if (conceptDescription != null) {
        cds.push(conceptDescription);
      }
    });

    this.supplementalCds.set(cds);
  }

  loadCd() {
    // echte CD finden
    const conceptDescription = this.shellResult?.v3Shell?.conceptDescriptions?.find(
      (candidate) => candidate.id === this.semanticId?.keys?.[0]?.value,
    );
    this.cd.set(conceptDescription ?? null);
  }

  addReference() {
    if (this.semanticId == null && this.referenceParent != null) {
      const id = uuid();
      const key = new aas.types.Key(aas.types.KeyTypes.GlobalReference, id);
      const ref = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [key]);
      this.referenceParent[this.referenceParentPropertyName] = ref;
      this.semanticId = ref;
      this.treeService.registerFieldUndoStep();
    }
  }

  removeReferenceBlock() {
    this.referenceParent[this.referenceParentPropertyName] = null;
    this.semanticId = null;

    this.treeService.registerFieldUndoStep();
  }

  getDatatypeLabel(spec: aas.types.IDataSpecificationContent | undefined | null) {
    return UiLabelResolver.getDatatypeLabel(spec);
  }

  addAdditionalReference() {
    if (this.supplemantalSemanticIds == null) {
      this.supplemantalSemanticIds = [];
      this.referenceParent.supplemantalSemanticIds = this.supplemantalSemanticIds;
    }
    const id = uuid();
    const ref = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, id),
    ]);
    this.supplemantalSemanticIds?.push(ref);
    this.treeService.registerFieldUndoStep();
  }

  removeAdditionalReference(item: Reference) {
    const index = this.supplemantalSemanticIds?.indexOf(item);
    if (index != null && index > -1) {
      this.supplemantalSemanticIds?.splice(index, 1);
      this.treeService.registerFieldUndoStep();
    }
  }

  getCd(ref: Reference) {
    const conceptDescription = this.shellResult?.v3Shell?.conceptDescriptions?.find(
      (candidate) => candidate.id === ref?.keys[0].value,
    );
    return conceptDescription;
  }

  getDataspec(ref: Reference) {
    const cd = this.getCd(ref);
    if (cd == null) return null;
    return cd.embeddedDataSpecifications?.[0]?.dataSpecificationContent as aas.types.DataSpecificationIec61360;
  }

  searchCd(item: Reference | null) {
    this.ref = this.dialogService.open(SearchConceptDescriptionComponent, {
      header: this.translate.instant('SEARCH_CD_REPO'),
      width: '70%',
      data: {
        currentId: this.semanticId?.keys[0].value,
        parent: item,
      },
      templates: {
        footer: DialogFooter,
      },
      closable: true,
    });

    this.ref?.onClose.subscribe((result: { item: Reference | null; cd: ConceptDescription }) => {
      if (result != null) {
        if (item != null) {
          // supplemental ID
          item.keys[0].value = result.cd.id;
          this.treeService.registerFieldUndoStep();
          this.shellResult?.v3Shell?.conceptDescriptions?.push(result.cd);
          this.treeService.appendConceptDescription(result.cd);
        } else {
          if (this.semanticId?.keys?.[0] != null) {
            this.semanticId.keys[0].value = result.cd.id;
            this.treeService.registerFieldUndoStep();
            this.shellResult?.v3Shell?.conceptDescriptions?.push(result.cd);
            this.treeService.appendConceptDescription(result.cd);
            this.loadCd();
          }
        }
      }
    });
  }

  errorArr: { error: VerificationError; action: ErrorHandlingAction }[] = [];

  get errors() {
    const errors: { error: VerificationError; action: ErrorHandlingAction }[] = [];
    if (this.semanticId != null) {
      for (const error of aas.verification.verify(this.semanticId, false)) {
        errors.push({ error: error, action: this.getAction(error) });
      }
    }

    const diff = JSON.stringify(errors) !== JSON.stringify(this.errorArr);
    if (diff === true) {
      this.errorArr = [...errors];
    }

    return this.errorArr;
  }

  get hasErrors() {
    return this.errorArr.length > 0;
  }

  goToEditConceptDescription() {
    const cd = this.cd();
    if (cd != null) {
      this.treeService.selectConceptDescription(cd.id);
    }
  }

  goToEditConceptDescriptionById(id: string | undefined | null) {
    if (id == null) return;
    this.treeService.selectConceptDescription(id);
  }

  createConceptDescriptionById(id: string | null | undefined) {
    if (id == null) {
      id = uuid();
      if (this.semanticId?.keys[0] != null) {
        this.semanticId.keys[0].value = id;
      }
    }
    this.treeService.createAndSelectConceptDescription(id);
  }
}
