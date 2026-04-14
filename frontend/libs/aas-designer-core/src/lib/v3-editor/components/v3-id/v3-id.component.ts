import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { IdGenerationUtil, InstanceHelper } from '@aas/helpers';
import { ApiException } from '@aas/jwt-auth';
import { EClassItem, ShellResult } from '@aas/model';
import { ShellsClient } from '@aas/webapi-client';
import { Component, inject, Input, model, OnChanges, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Ripple } from 'primeng/ripple';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { lastValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { EClassLogoComponent } from '../../../general/eclass-logo/eclass-logo.component';
import { EclassSearchComponent } from '../../../general/eclass-search/eclass-search.component';
import { Info } from '../../../general/model/info-item';
import { VecLogoComponent } from '../../../general/vec-logo/vec-logo.component';
import { PortalService } from '@aas/common-services';
import { EditorTypeOption } from '../../model/editor-type-option';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3EditorDataStoreService } from '../../v3-editor-data-store.service';
import { V3EditorService } from '../../v3-editor.service';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { VecLookupComponent } from '../vec-lookup/vec-lookup.component';

@Component({
  selector: 'aas-v3-id',
  templateUrl: './v3-id.component.html',
  imports: [
    HelpLabelComponent,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    Button,
    Popover,
    InputGroup,
    Dialog,
    Tabs,
    TabList,
    Ripple,
    Tab,
    EClassLogoComponent,
    VecLogoComponent,
    EclassSearchComponent,
    VecLookupComponent,
    TranslateModule,
  ],
})
export class V3IdComponent implements OnChanges {
  @Input({ required: true }) element: V3TreeItem<any> | undefined;
  @Input({ required: false }) readonly: boolean = false;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;

  @ViewChild('op') op: Popover | undefined;

  info = Info;
  idBackup: any;
  showEclassSearch: boolean = false;

  newAasIdentifier = model('');

  eclassLoaded = output<any>();
  vecLoaded = output<any>();

  source = model('eclass');

  v3EditorDataStore = inject(V3EditorDataStoreService);

  constructor(
    private treeService: V3TreeService,
    private notificationService: NotificationService,
    private portalService: PortalService,
  ) {}

  ngOnChanges(): void {
    this.idBackup = this.element?.content.id;
  }

  verifyIdUniqueness() {
    if (this.element?.content != null && InstanceHelper.getInstanceName(this.element?.content) === 'Submodel') {
      const smId = this.element.content.id;
      const submodels = this.shellResult?.v3Shell?.submodels?.filter((sm) => sm.id === smId);
      return submodels == null || submodels.length <= 1;
    }
    return true;
  }

  get isRequired() {
    let required = false;
    switch (InstanceHelper.getInstanceName(this.element?.content)) {
      case 'ConceptDescription':
      case 'SubmodelElementCollection':
      case 'Submodel':
      case 'AssetAdministrationShell':
        required = true;
        break;
    }
    return required;
  }

  get isAasIdentifier() {
    return InstanceHelper.getInstanceName(this.element?.content) === 'AssetAdministrationShell';
  }

  get hasIri() {
    let hasIri = false;
    switch (InstanceHelper.getInstanceName(this.element?.content)) {
      case 'ConceptDescription':
      case 'AssetAdministrationShell':
      case 'Qualifier':
      case 'Submodel':
        hasIri = true;
        break;
    }
    return hasIri;
  }

  get hasIrdi() {
    let hasIrdi = false;
    switch (InstanceHelper.getInstanceName(this.element?.content)) {
      case 'ConceptDescription':
      case 'Qualifier':
        hasIrdi = true;
        break;
      case 'Submodel':
        if ((this.element?.content as aas.types.Submodel).kind === aas.types.ModellingKind.Template) {
          hasIrdi = true;
        }
    }
    return hasIrdi;
  }

  get hasCustom() {
    let hasCustom = false;
    switch (InstanceHelper.getInstanceName(this.element?.content)) {
      case 'ConceptDescription':
      case 'Qualifier':
        hasCustom = true;
        break;
      case 'Submodel':
        if ((this.element?.content as aas.types.Submodel).kind === aas.types.ModellingKind.Instance) {
          hasCustom = true;
        }
    }
    return hasCustom;
  }

  generateIri() {
    if (this.element != null)
      this.element.content.id = IdGenerationUtil.generateIri(
        InstanceHelper.getInstanceName(this.element.content),
        this.portalService.iriPrefix,
      );
    this.syncId();
  }

  generateAasIri() {
    this.newAasIdentifier.set(IdGenerationUtil.generateIri('aas', this.portalService.iriPrefix));
  }

  generateGuid() {
    if (this.element != null) this.element.content.id = uuid();
    this.syncId();
  }

  searchIrdi() {
    this.showEclassSearch = true;
  }

  selectEclass(item: EClassItem) {
    if (this.element?.content?.id != null) {
      this.element.content.id = item.irdi;
      this.syncId();
      this.treeService.registerFieldUndoStep();
      this.showEclassSearch = false;
      this.eclassLoaded.emit(item);
    }
    this.eclassLoaded.emit(item);
  }

  selectVec(item: any) {
    if (this.element?.content?.id != null) {
      this.element.content.id = item.groupName;
      this.syncId();
      this.treeService.registerFieldUndoStep();
      this.showEclassSearch = false;
    }
    this.vecLoaded.emit(item);
  }

  syncId() {
    if (
      this.element?.content != null &&
      InstanceHelper.getInstanceName(this.element.content) === 'Submodel' &&
      !this.verifyIdUniqueness()
    ) {
      this.notificationService.showMessageAlways('ID_NOT_UNIQUE_WILL_BE_RESETTED', 'ERROR', 'error');
      this.element.content.id = this.idBackup;
    } else {
      // ElementReferenz suchen gehen und dann auf die neue ID setzen
      if (this.element?.content instanceof aas.types.ConceptDescription) {
        this.shellResult?.v3Shell?.submodels?.forEach((submodel) => {
          this.syncSemanticIdRecursive(submodel);
        });
        this.treeService.registerFieldUndoStep();
      }
      if (this.element?.content instanceof aas.types.Submodel) {
        this.shellResult?.v3Shell?.assetAdministrationShells?.forEach((shell) => {
          shell?.submodels?.forEach((submodel) => {
            submodel.keys.forEach((k) => {
              if (k.value === this.idBackup) {
                k.value = this.element?.content.id;
                this.treeService.registerFieldUndoStep();
                this.idBackup = this.element?.content.id;
              }
            });
          });
        });
      }
    }

    // id Änderung im store hinterlegen
    const descriptor = this.v3EditorDataStore.editorDescriptor();
    if (descriptor != null) {
      if (this.element?.editorType === EditorTypeOption.Submodel) {
        descriptor.submodelDescriptorEntries?.forEach((sm) => {
          if (sm.oldId === this.idBackup) {
            sm.newId = this.element?.content.id;
          }
        });
      }
      if (
        this.element?.editorType === EditorTypeOption.AssetAdministrationShell &&
        descriptor.aasDescriptorEntry != null
      ) {
        descriptor.aasDescriptorEntry.newId = this.element?.content.id;
      }
    }
  }

  syncSemanticIdRecursive(submodel: aas.types.ISubmodelElement) {
    const foundSm = submodel.semanticId?.keys.find((k) => k.value === this.idBackup);
    if (foundSm) {
      foundSm.value = this.element?.content.id;
    }
    if (submodel instanceof aas.types.Submodel) {
      submodel.submodelElements?.forEach((element) => {
        this.syncSemanticIdRecursive(element);
      });
    }
    if (submodel instanceof aas.types.SubmodelElementCollection) {
      submodel.value?.forEach((element) => {
        this.syncSemanticIdRecursive(element);
      });
    }
    if (submodel instanceof aas.types.SubmodelElementList) {
      submodel.value?.forEach((element) => {
        this.syncSemanticIdRecursive(element);
      });
    }
  }

  shellsClient = inject(ShellsClient);
  loading = signal(false);
  confirmationService = inject(AasConfirmationService);
  translate = inject(TranslateService);
  editorService = inject(V3EditorService);
  router = inject(Router);

  async startChangeIdentifier(event: MouseEvent, op: Popover) {
    // prüfen ob Änderungen vorhanden sind
    if (this.treeService.hasChanged()) {
      if (
        await this.confirmationService.confirm({
          message: this.translate.instant('SAVE_BEFORE_CHANGE_IDENTIFIER'),
        })
      ) {
        if (this.treeService.editorComponent?.shellResult != null) {
          await this.editorService.saveNew(this.treeService.editorComponent?.shellResult);
          this.treeService.editorComponent.v3ShellBackup = cloneDeep(this.shellResult);

          this.op?.toggle(event);
        }
      }
    } else {
      op.toggle(event);
    }
  }

  async changeIdentifier() {
    let msg = '';
    if (this.element != null) {
      try {
        this.loading.set(true);
        const res = await lastValueFrom(
          this.shellsClient.shells_ChangeAasIdentifier(this.newAasIdentifier(), this.element?.content.id),
        );
        if (res) {
          this.router.navigate(PortalService.buildRepoEditRoute(res));
        }
      } catch (e) {
        if (e instanceof ApiException && e.stacktrace != null) {
          msg = await (e.stacktrace as any as Blob).text();
          if (msg.includes('409')) {
            this.notificationService.showMessageAlways('CHANGE_IDENTIFIER_FAILED_ALREADY_EXISTS', 'ERROR', 'error');
          } else {
            this.notificationService.showMessageAlways('CHANGE_IDENTIFIER_FAILED', 'ERROR', 'error');
          }
        } else {
          this.notificationService.showMessageAlways('CHANGE_IDENTIFIER_FAILED', 'ERROR', 'error');
        }
      } finally {
        this.loading.set(false);
      }
    }
  }
}
