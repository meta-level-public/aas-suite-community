import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { BomHierarchyChartComponent } from '@aas/bom-diagram';
import { HelpLabelComponent } from '@aas/common-components';
import { AppConfigService, PortalService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, inject, input, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { AasDesignerChangelogComponent } from '../aas-designer-changelog/aas-designer-changelog.component';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { PcnHandlingComponent } from '../pcn/pcn-handling/pcn-handling.component';
import { V3AdministrationComponent } from '../v3-administration/v3-administration.component';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3IdComponent } from '../v3-id/v3-id.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';
type AssetInformation = aas.types.AssetInformation;
type Entity = aas.types.Entity;
type VerificationError = aas.verification.VerificationError;

@Component({
  selector: 'aas-v3-submodel-editor',
  templateUrl: './v3-submodel-editor.component.html',
  imports: [
    Fieldset,
    NgClass,
    HelpLabelComponent,
    V3IdComponent,
    V3IdShortComponent,
    Select,
    V3UndoDirective,
    FormsModule,
    V3LangStringListComponent,
    V3CategoryComponent,
    V3AdministrationComponent,
    V3SemanticDescriptionComponent,
    V3EmbeddedDataSpecificationComponent,
    V3QualifiersComponent,
    BomHierarchyChartComponent,
    AasDesignerChangelogComponent,
    PcnHandlingComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3SubmodelEditorComponent extends V3ComponentBase implements OnChanges {
  @Input() submodel: V3TreeItem<aas.types.Submodel> | undefined | null;
  @Input() shellResult: ShellResult | undefined | null;
  @Input() bomReinitializeRequestId = 0;
  assetInformation = input.required<AssetInformation>();
  idShort = input.required<string>();

  info = Info;

  appConfigService = inject(AppConfigService);
  isAasDesignerChangelog = signal(false);
  isPcnSubmodel = signal(false);
  isBomSubmodel = signal(false);
  changelogCollection = signal<aas.types.SubmodelElementCollection>(new aas.types.SubmodelElementCollection());

  constructor() {
    super();
  }

  ngOnChanges(_changes: SimpleChanges) {
    if (this.submodel?.content != null) {
      if (this.hasSemanticId(this.submodel.content, 'AasDesignerChangelog')) {
        queueMicrotask(() => this.isAasDesignerChangelog.set(true));
        const smc = this.submodel.content.submodelElements?.find((sme) => sme.idShort === 'Changes');
        if (smc != null && smc instanceof aas.types.SubmodelElementCollection) {
          this.changelogCollection.set(smc);
        }
      } else {
        queueMicrotask(() => this.isAasDesignerChangelog.set(false));
        this.changelogCollection.set(new aas.types.SubmodelElementCollection());
      }

      if (
        this.hasSemanticId(this.submodel.content, 'https://admin-shell.io/idta/HierarchicalStructures/1/0/Submodel') ||
        this.hasSemanticId(this.submodel.content, 'https://admin-shell.io/idta/HierarchicalStructures/1/1/Submodel')
      ) {
        queueMicrotask(() => this.isBomSubmodel.set(true));
      } else {
        queueMicrotask(() => this.isBomSubmodel.set(false));
      }

      if (this.hasSemanticId(this.submodel.content, '0173-10029#01-XFB001#001')) {
        queueMicrotask(() => this.isPcnSubmodel.set(true));
      } else {
        queueMicrotask(() => this.isPcnSubmodel.set(false));
      }
    } else {
      queueMicrotask(() => this.isAasDesignerChangelog.set(false));
      queueMicrotask(() => this.isBomSubmodel.set(false));
    }
  }

  hasSemanticId(sme: aas.types.ISubmodelElement | undefined, semanticId: string) {
    return sme?.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  get errors() {
    let errors: VerificationError[] = [];
    if (this.submodel?.content != null) {
      for (const error of aas.verification.verify(this.submodel.content, false)) {
        errors.push(error);
      }
      errors = [...errors, ...this.administrationErrors, ...this.semanticErrors];
    }
    return errors;
  }

  get administrationErrors() {
    const errors = [];
    if (this.submodel?.content?.administration != null) {
      for (const error of aas.verification.verify(this.submodel.content.administration, false)) {
        errors.push(error);
      }
    }
    return errors;
  }

  get semanticErrors() {
    const errors = [];
    if (this.submodel?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.submodel.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors;
  }

  get hasDetailErrors() {
    const errors = [];
    if (this.submodel?.content != null) {
      for (const error of aas.verification.verify(this.submodel.content, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  get hasSemanticErrors() {
    const errors = [];
    if (this.submodel?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.submodel.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  get hasAdministrationErrors() {
    const errors = [];
    if (this.submodel?.content?.administration != null) {
      for (const error of aas.verification.verify(this.submodel.content.administration, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  get hasQualifierErrors() {
    const errors = [];
    if (this.submodel?.content?.qualifiers != null) {
      for (const quali of this.submodel.content.qualifiers) {
        for (const error of aas.verification.verify(quali, false)) {
          errors.push(error);
        }
      }
    }
    return errors.length > 0;
  }
  get entryNode() {
    return this.submodel?.content?.submodelElements?.find((sme) =>
      sme.semanticId?.keys.find(
        (k) =>
          k.value === 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0' ||
          k.value === 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/1',
      ),
    ) as Entity;
  }

  get currentRegistry() {
    return PortalService.getCurrentAasInfrastructureSetting()?.aasRepositoryUrl ?? 'blubb';
  }
}
