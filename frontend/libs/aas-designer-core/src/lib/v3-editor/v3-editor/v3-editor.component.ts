import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AasConfirmationService, buildShellsListRoute, NotificationService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  viewChild,
  ViewChild,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DppPcfEntry, DppPcfEntryType } from 'battery-passport-assistant';
import { cloneDeep } from 'lodash-es';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { AasxExportComponent } from '../../general/aasx-export/aasx-export.component';
import { DiffViewerComponent } from '../../general/diff-viewer/diff-viewer.component';
import { AasValidatorService } from '../../validation/aas-validator';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3EditorService } from '../v3-editor.service';
import { V3TreeService } from '../v3-tree/v3-tree.service';
type VerificationError = aas.verification.VerificationError;

import { LangStringShortNameTypeIec61360 } from '@aas-core-works/aas-core3.1-typescript/types';

import { SseNotificationService } from '@aas/aas-designer-shared';
import {
  AasViewerMainComponent,
  CapabilityDescriptionViewerComponent,
  PcfStepViewerComponent,
  PcfViewerV1Component,
  ProductOrSectorSpecificPcfStepViewerComponent,
  ProductOrSectorSpecificPcfViewerComponent,
  SubmodelSpecializedViewerComponent,
} from '@aas/aas-viewer-standalone';
import { PortalService } from '@aas/common-services';
import { SemanticIdHelper } from '@aas/helpers';
import { AvailableInfastructure, ShellsClient } from '@aas/webapi-client';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver-es';
import { get, set } from 'lodash-es';
import { BadgeDirective } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Fieldset } from 'primeng/fieldset';
import { Menu } from 'primeng/menu';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { SplitButton } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';
import { lastValueFrom, Subscription } from 'rxjs';
import { PcfEntryMapperService } from '../../general/pcf-entry-assistant/pcf-entry-mapper.service';
import { PcnChangeInfo } from '../../pcn/pcn-changes/pcn-change-info';
import { PcnChangesComponent } from '../../pcn/pcn-changes/pcn-changes.component';
import { AssetInterfacesInterfaceAddonComponent } from '../addons/asset-interfaces-interface-addon/asset-interfaces-interface-addon.component';
import { CapabilityAddonComponent } from '../addons/capability-addon/capability-addon.component';
import { PcfEntryAddonComponent } from '../addons/pcf-entry-addon/pcf-entry-addon.component';
import { EnterChangelogCommentComponent } from '../components/enter-changelog-comment/enter-changelog-comment.component';
import { IdValidatorComponent } from '../components/id-validator/id-validator.component';
import { V3BasicEventElementComponent } from '../components/v3-basic-event-element/v3-basic-event-element.component';
import { V3BlobEditorComponent } from '../components/v3-blob-editor/v3-blob-editor.component';
import { V3CapabilityElementComponent } from '../components/v3-capability-element/v3-capability-element.component';
import { V3ConceptDescriptionComponent } from '../components/v3-concept-description/v3-concept-description.component';
import { V3ConceptDescriptionsComponent } from '../components/v3-concept-descriptions/v3-concept-descriptions.component';
import { V3EntityElementComponent } from '../components/v3-entity-element/v3-entity-element.component';
import { V3FileEditorComponent } from '../components/v3-file-editor/v3-file-editor.component';
import { V3MissingSubmodelComponent } from '../components/v3-missing-submodel/v3-missing-submodel.component';
import { V3MultilanguagePropertyComponent } from '../components/v3-multilanguage-property/v3-multilanguage-property.component';
import { V3OperationComponent } from '../components/v3-operation/v3-operation.component';
import { V3PropertyEditorComponent } from '../components/v3-property-editor/v3-property-editor.component';
import { V3RangeElementComponent } from '../components/v3-range-element/v3-range-element.component';
import { V3ReferenceElementComponent } from '../components/v3-reference-element/v3-reference-element.component';
import { V3RelationshipElementComponent } from '../components/v3-relationship-element/v3-relationship-element.component';
import { V3ShellComponent } from '../components/v3-shell/v3-shell.component';
import { V3ShellsComponent } from '../components/v3-shells/v3-shells.component';
import { V3SubmodelEditorComponent } from '../components/v3-submodel-editor/v3-submodel-editor.component';
import { V3SubmodelElementCollectionEditorComponent } from '../components/v3-submodel-element-collection-editor/v3-submodel-element-collection-editor.component';
import { V3SubmodelElementListEditorComponent } from '../components/v3-submodel-element-list-editor/v3-submodel-element-list-editor.component';
import { V3SupplementalFileComponent } from '../components/v3-supplemental-file/v3-supplemental-file.component';
import { V3FilesComponent } from '../components/v3-supplemental-files/v3-supplemental-files.component';
import { AasDesignerVerificationError } from './aas-designer-verification-error';
import { ChangelogAppender } from './changelog-appender';
@Component({
  selector: 'aas-v3-editor',
  templateUrl: './v3-editor.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [
    Message,
    Button,
    BadgeDirective,
    Tooltip,
    SplitButton,
    Menu,
    V3ShellsComponent,
    V3ShellComponent,
    V3PropertyEditorComponent,
    V3SubmodelElementCollectionEditorComponent,
    V3FileEditorComponent,
    V3SubmodelEditorComponent,
    V3SubmodelElementListEditorComponent,
    V3ConceptDescriptionComponent,
    V3MultilanguagePropertyComponent,
    V3OperationComponent,
    V3ReferenceElementComponent,
    V3EntityElementComponent,
    V3RangeElementComponent,
    V3ConceptDescriptionsComponent,
    V3FilesComponent,
    V3SupplementalFileComponent,
    V3BlobEditorComponent,
    V3CapabilityElementComponent,
    V3RelationshipElementComponent,
    V3MissingSubmodelComponent,
    Fieldset,
    V3BasicEventElementComponent,
    AasxExportComponent,
    Dialog,
    DiffViewerComponent,
    TableModule,
    Select,
    FormsModule,
    PrimeTemplate,
    Tag,
    ToggleSwitch,
    CapabilityDescriptionViewerComponent,
    SubmodelSpecializedViewerComponent,
    AasViewerMainComponent,
    PcfViewerV1Component,
    PcfStepViewerComponent,
    ProductOrSectorSpecificPcfViewerComponent,
    ProductOrSectorSpecificPcfStepViewerComponent,
    TranslateModule,
  ],
})
export class V3EditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() loading: boolean = false;
  @Input() selectedElement: V3TreeItem<any> | undefined;
  @Input() shellResult: ShellResult | undefined;
  @Input({ required: true }) repositoryUrl: string = '';

  @Output() actionRequested: EventEmitter<'reset'> = new EventEmitter<'reset'>();

  @ViewChild('exportComponent') exportComponent: AasxExportComponent | undefined;
  @ViewChild('diffViewer') diffViewer: DiffViewerComponent | undefined;

  router = inject(Router);

  EditorTypeOption = EditorTypeOption;

  menuItems: MenuItem[] = [];
  v3ShellBackup: ShellResult | null | undefined;
  validateMenuItems: MenuItem[] = [];
  saveMenuItems: MenuItem[] = [];
  displayDiff: boolean = false;
  validationErrors = signal<AasDesignerVerificationError[]>([]);
  validationErrorCount: number = 0;
  displayValidationResult: boolean = false;
  advanced: boolean = false;
  constraintOptions: string[] = [];

  portalService = inject(PortalService);
  ref: DynamicDialogRef | undefined | null;

  dialogService = inject(DialogService);

  sseNotificationService = inject(SseNotificationService);
  env1 = signal<aas.types.Environment | null>(null);
  env2 = signal<aas.types.Environment | null>(null);
  showDiffChanges = model<boolean>(false);
  diffViewerChanges = viewChild<DiffViewerComponent>('diffViewerChanges');
  shellsClient = inject(ShellsClient);
  showUpdateWarning = signal<boolean>(false);
  currentInfrastructure = signal<AvailableInfastructure | null>(PortalService.getCurrentAasInfrastructureSetting());

  subscriptions: Subscription[] = [];
  capabilityDetailMode: 'viewer' | 'edit' = 'viewer';
  bomReinitializeRequestId = 0;
  private lastSelectedElementId = '';
  private forceEditModeOnNextSelection = false;

  constructor(
    private translate: TranslateService,
    private service: V3EditorService,
    private notificationService: NotificationService,
    private confirmationService: AasConfirmationService,
    public treeService: V3TreeService,
    private aasValidatorService: AasValidatorService,
    private pcfEntryMapperService: PcfEntryMapperService,
  ) {
    this.treeService.editorComponent = this;
  }

  ngOnInit(): void {
    this.initMenuItems();
    this.initValidationMenuItems();
    this.initSaveMenuItems();

    const aasId = this.shellResult?.v3Shell?.assetAdministrationShells?.[0].id ?? '';

    this.v3ShellBackup = cloneDeep(this.shellResult);
    this.subscriptions.push(
      this.portalService.currentInfrastructureChanged.subscribe(() => {
        this.currentInfrastructure.set(PortalService.getCurrentAasInfrastructureSetting());
      }),
    );

    this.subscriptions.push(
      this.sseNotificationService.productChangeNotificationReceived.subscribe(async (message) => {
        const currentInfraId = PortalService.getCurrentAasInfrastructureSetting()?.id;
        if (message.aasIdentifier === aasId && currentInfraId === message.infrastructureId) {
          const content = JSON.parse(message.content).submodel as PcnChangeInfo;
          // eslint-disable-next-line no-console
          console.log('PCN_UPDATE_RECEIVED', content);
          this.ref = this.dialogService.open(PcnChangesComponent, {
            width: '50%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: false,
            header: this.translate.instant('PCN_UPDATE_RECEIVED'),
            data: {
              changeData: content,
            },
            closable: true,
          });
        }
      }),
    );

    this.subscriptions.push(
      this.sseNotificationService.shellUpdated.subscribe(async (message) => {
        if (
          message.aasIdentifier === aasId &&
          PortalService.getCurrentAasInfrastructureSetting()?.id === message.infrastructureId
        ) {
          const res = await lastValueFrom(this.shellsClient.shells_GetShellPlain(aasId));
          if (res.plainJson != null) {
            const jsonable = JSON.parse(res.plainJson);
            const newEnv = aas.jsonization.environmentFromJsonable(jsonable).value;
            if (
              newEnv != null &&
              this.shellResult?.v3Shell != null &&
              this.hasUpdateChanges(newEnv, this.shellResult?.v3Shell)
            ) {
              this.showUpdateWarning.set(true);
              this.env1.set(this.shellResult?.v3Shell);
              this.env2.set(newEnv);
            }
          }
        }
      }),
    );

    this.subscriptions.push(
      this.sseNotificationService.submodelUpdated.subscribe(async (message) => {
        if (
          this.shellResult?.v3Shell?.submodels?.some((s) => s.id === message.submodelIdentifier) &&
          PortalService.getCurrentAasInfrastructureSetting()?.id === message.infrastructureId
        ) {
          const res = await lastValueFrom(this.shellsClient.shells_GetShellPlain(aasId));
          if (res.plainJson != null) {
            const jsonable = JSON.parse(res.plainJson);
            const newEnv = aas.jsonization.environmentFromJsonable(jsonable).value;
            if (
              newEnv != null &&
              this.shellResult?.v3Shell != null &&
              this.hasUpdateChanges(newEnv, this.shellResult?.v3Shell)
            ) {
              this.showUpdateWarning.set(true);
              this.env1.set(this.shellResult?.v3Shell);
              this.env2.set(newEnv);
            }
          }
        }
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedElement' in changes) {
      this.syncCapabilityDetailMode();
    }
  }

  showUpdateChanges() {
    this.showDiffChanges.set(true);
    this.diffViewerChanges()?.diff();
  }

  discardAndReload() {
    this.actionRequested.emit('reset');
  }

  hasUpdateChanges(env1: aas.types.Environment, env2: aas.types.Environment) {
    return JSON.stringify(env1) !== JSON.stringify(env2);
  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private syncCapabilityDetailMode() {
    const nextSelectedElementId = this.selectedElement?.id ?? '';
    if (nextSelectedElementId !== this.lastSelectedElementId) {
      if (this.forceEditModeOnNextSelection) {
        this.capabilityDetailMode = 'edit';
        this.forceEditModeOnNextSelection = false;
      } else {
        this.capabilityDetailMode = this.isViewerToggleSelection() ? 'viewer' : 'edit';
      }
      this.lastSelectedElementId = nextSelectedElementId;
    }
  }

  requestEditModeForNextSelection(): void {
    this.forceEditModeOnNextSelection = true;
  }

  isViewerToggleSelection(): boolean {
    return (
      this.isCapabilityContextSelection() ||
      this.isGenericSubmodelSelection() ||
      this.isPcfAssistantContextSelection() ||
      this.isAssetInterfacesContextSelection()
    );
  }

  isCapabilityContextSelection(): boolean {
    return (
      this.isCapabilityDescriptionSubmodelSelection() ||
      this.isCapabilitySetSelection() ||
      this.isCapabilityContainerSelection() ||
      this.isGenericSubmodelSelection()
    );
  }

  isGenericSubmodelSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.Submodel &&
      !this.isCapabilityDescriptionSubmodel(this.selectedElement.content)
    );
  }

  isCapabilityViewerMode(): boolean {
    return (
      (this.isCapabilityContextSelection() || this.isAssetInterfacesContextSelection()) &&
      this.capabilityDetailMode === 'viewer'
    );
  }

  isPcfViewerMode(): boolean {
    return this.isPcfAssistantContextSelection() && this.capabilityDetailMode === 'viewer';
  }

  isCapabilityEditMode(): boolean {
    return !this.isViewerToggleSelection() || this.capabilityDetailMode === 'edit';
  }

  showCapabilityViewer(): void {
    this.capabilityDetailMode = 'viewer';
  }

  showCapabilityEditor(): void {
    this.capabilityDetailMode = 'edit';
  }

  async onBomReinitializeInViewerRequested(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      message: this.translate.instant('BOM_REINITIALIZE_CONFIRM'),
    });

    if (!confirmed) {
      return;
    }

    this.showCapabilityEditor();
    this.bomReinitializeRequestId++;
  }

  isAssetInterfacesDescriptionSubmodelSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.Submodel &&
      this.isAssetInterfacesDescriptionSubmodel(this.selectedElement.content)
    );
  }

  isAssetInterfacesContextSelection(): boolean {
    return (
      this.isAssetInterfacesDescriptionSubmodelSelection() || this.isAssetInterfacesDescriptionInterfaceSelection()
    );
  }

  isAssetInterfacesDescriptionInterfaceSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.SubmodelElementCollection &&
      SemanticIdHelper.hasSemanticId(
        this.selectedElement.content,
        'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface',
      )
    );
  }

  openAddAssetInterfacesDescriptionInterfaceAddon(): void {
    const submodel = this.selectedElement?.content;
    if (!(submodel instanceof aas.types.Submodel) || !this.isAssetInterfacesDescriptionSubmodelSelection()) return;

    const count = this.getAidInterfaces(submodel).length;
    this.ref = this.dialogService.open(AssetInterfacesInterfaceAddonComponent, {
      width: '65%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('AID_INTERFACE_ADD'),
      closable: true,
      modal: true,
      data: { count },
    });

    this.ref?.onClose.subscribe((newInterface: aas.types.SubmodelElementCollection | null) => {
      if (newInterface == null) return;
      if (submodel.submodelElements == null) submodel.submodelElements = [];
      submodel.submodelElements.push(newInterface);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(newInterface), 0);
    });
  }

  openEditAssetInterfacesDescriptionInterfaceAddon(): void {
    const current = this.selectedElement?.content;
    if (
      !(current instanceof aas.types.SubmodelElementCollection) ||
      !this.isAssetInterfacesDescriptionInterfaceSelection()
    )
      return;

    const parentSubmodel = this.capabilityViewerSubmodel;
    const count = parentSubmodel != null ? this.getAidInterfaces(parentSubmodel).length : 0;
    this.ref = this.dialogService.open(AssetInterfacesInterfaceAddonComponent, {
      width: '65%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('AID_INTERFACE_EDIT_WITH_ASSISTANT'),
      closable: true,
      modal: true,
      data: { count, existingInterface: cloneDeep(current) },
    });

    this.ref?.onClose.subscribe((editedInterface: aas.types.SubmodelElementCollection | null) => {
      if (editedInterface == null) return;
      Object.assign(current as any, editedInterface as any);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(current), 0);
    });
  }

  async deleteAssetInterfacesDescriptionInterface(): Promise<void> {
    const current = this.selectedElement?.content;
    const parent = this.selectedElement?.parent?.content;
    if (!(current instanceof aas.types.SubmodelElementCollection) || !(parent instanceof aas.types.Submodel)) return;
    if (!this.isAssetInterfacesDescriptionInterfaceSelection()) return;

    const confirmed = await this.confirmationService.confirm({
      message: this.translate.instant('AID_INTERFACE_DELETE_Q'),
    });
    if (!confirmed) return;

    parent.submodelElements = (parent.submodelElements ?? []).filter((el) => el !== current);
    this.treeService.refreshWholeTree();
    setTimeout(() => this.treeService.selectNodeByElement(parent), 0);
  }

  get capabilityViewerSubmodel(): aas.types.Submodel | undefined {
    let node: V3TreeItem<any> | null | undefined = this.selectedElement;
    while (node != null) {
      if (node.content instanceof aas.types.Submodel) {
        return node.content;
      }
      node = node.parent;
    }
    return undefined;
  }

  get capabilityViewerSet(): aas.types.SubmodelElementCollection | undefined {
    if (this.isCapabilitySetSelection()) {
      return this.selectedElement?.content as aas.types.SubmodelElementCollection;
    }
    if (this.isCapabilityContainerSelection()) {
      let node: V3TreeItem<any> | null | undefined = this.selectedElement?.parent;
      while (node != null) {
        if (
          node.content instanceof aas.types.SubmodelElementCollection &&
          SemanticIdHelper.hasSemanticId(
            node.content,
            'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
          )
        ) {
          return node.content;
        }
        node = node.parent;
      }
    }
    return undefined;
  }

  get capabilityViewerContainer(): aas.types.SubmodelElementCollection | undefined {
    if (this.isCapabilityContainerSelection()) {
      return this.selectedElement?.content as aas.types.SubmodelElementCollection;
    }
    return undefined;
  }

  get capabilityViewerSubmodels(): aas.types.Submodel[] {
    return this.shellResult?.v3Shell?.submodels ?? [];
  }

  isCapabilityDescriptionSubmodelSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.Submodel &&
      this.isCapabilityDescriptionSubmodel(this.selectedElement.content)
    );
  }

  private isCapabilityDescriptionSubmodel(submodel: aas.types.Submodel): boolean {
    return (
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CapabilityDescription/1/0') ||
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CapabilityDescription/1/0/Submodel') ||
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/SubmodelTemplate/CapabilityDescription/1/0')
    );
  }

  private isAssetInterfacesDescriptionSubmodel(submodel: aas.types.Submodel): boolean {
    return (
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Submodel') ||
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0')
    );
  }

  private getAidInterfaces(submodel: aas.types.Submodel): aas.types.SubmodelElementCollection[] {
    return (submodel.submodelElements ?? []).filter(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface'),
    );
  }

  isCapabilitySetSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.SubmodelElementCollection &&
      SemanticIdHelper.hasSemanticId(
        this.selectedElement.content,
        'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
      )
    );
  }

  isCapabilityContainerSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.SubmodelElementCollection &&
      SemanticIdHelper.hasSemanticId(
        this.selectedElement.content,
        'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
      )
    );
  }

  openCapabilityContainerAddon(): void {
    const container = this.selectedElement?.content;
    if (!(container instanceof aas.types.SubmodelElementCollection) || !this.isCapabilityContainerSelection()) return;

    const capabilitySet = this.capabilityViewerSet;
    const count = (capabilitySet?.value ?? []).filter(
      (el) =>
        el instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0'),
    ).length;
    const availableCapabilityRefs = (
      (capabilitySet?.value ?? []).filter(
        (el): el is aas.types.SubmodelElementCollection =>
          el instanceof aas.types.SubmodelElementCollection &&
          SemanticIdHelper.hasSemanticId(
            el,
            'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
          ),
      ) as aas.types.SubmodelElementCollection[]
    )
      .flatMap((el) =>
        (el.value ?? []).filter((child): child is aas.types.Capability => child instanceof aas.types.Capability),
      )
      .map((capability) => capability.idShort?.trim() ?? '')
      .filter((idShort) => idShort !== '');

    this.ref = this.dialogService.open(CapabilityAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('CAPABILITY_EDIT_WITH_ASSISTANT'),
      closable: true,
      modal: true,
      data: {
        count,
        currentLanguage: this.portalService.currentLanguage,
        currentSubmodelId: this.capabilityViewerSubmodel?.id ?? '',
        availableCapabilityRefs,
        existingCapabilityContainer: cloneDeep(container),
      },
    });

    this.ref?.onClose.subscribe((editedContainer: aas.types.SubmodelElementCollection | null) => {
      if (editedContainer == null) return;
      Object.assign(container as any, editedContainer as any);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(container), 0);
    });
  }

  openAddCapabilityAddonForSet(): void {
    const capabilitySet = this.selectedElement?.content;
    if (!(capabilitySet instanceof aas.types.SubmodelElementCollection) || !this.isCapabilitySetSelection()) return;

    const count = this.getCapabilityContainers(capabilitySet).length;
    const availableCapabilityRefs = this.collectCapabilityRefs(capabilitySet);

    this.ref = this.dialogService.open(CapabilityAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('ADD_CAPABILITY'),
      closable: true,
      modal: true,
      data: {
        count,
        currentLanguage: this.portalService.currentLanguage,
        currentSubmodelId: this.capabilityViewerSubmodel?.id ?? '',
        availableCapabilityRefs,
      },
    });

    this.ref?.onClose.subscribe((capabilityContainer: aas.types.SubmodelElementCollection | null) => {
      if (capabilityContainer == null) return;
      if (capabilitySet.value == null) capabilitySet.value = [];
      capabilitySet.value.push(capabilityContainer);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(capabilitySet), 0);
    });
  }

  private getCapabilityContainers(
    capabilitySet: aas.types.SubmodelElementCollection,
  ): aas.types.SubmodelElementCollection[] {
    return (capabilitySet.value ?? []).filter(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0'),
    );
  }

  private collectCapabilityRefs(capabilitySet: aas.types.SubmodelElementCollection): string[] {
    return this.getCapabilityContainers(capabilitySet)
      .flatMap((container) =>
        (container.value ?? []).filter((child): child is aas.types.Capability => child instanceof aas.types.Capability),
      )
      .map((capability) => capability.idShort?.trim() ?? '')
      .filter((idShort) => idShort !== '');
  }

  isPcfAssistantContextSelection(): boolean {
    return this.isPcfListSelection() || this.isPcfEntrySelection();
  }

  isPcfListSelection(): boolean {
    const content = this.selectedElement?.content;
    return content instanceof aas.types.SubmodelElementList && this.getPcfListType(content) != null;
  }

  isProductCarbonFootprintListSelection(): boolean {
    const content = this.selectedElement?.content;
    return (
      content instanceof aas.types.SubmodelElementList && this.getPcfListType(content) === 'product-carbon-footprint'
    );
  }

  isProductOrSectorSpecificCarbonFootprintListSelection(): boolean {
    const content = this.selectedElement?.content;
    return (
      content instanceof aas.types.SubmodelElementList &&
      this.getPcfListType(content) === 'product-or-sector-specific-carbon-footprint'
    );
  }

  isPcfEntrySelection(): boolean {
    return this.getSelectedPcfEntryContext() != null;
  }

  isProductCarbonFootprintEntrySelection(): boolean {
    return this.getSelectedPcfEntryContext()?.entryType === 'product-carbon-footprint';
  }

  isProductOrSectorSpecificCarbonFootprintEntrySelection(): boolean {
    return this.getSelectedPcfEntryContext()?.entryType === 'product-or-sector-specific-carbon-footprint';
  }

  openAddPcfEntryAddon(): void {
    const list = this.selectedElement?.content;
    if (!(list instanceof aas.types.SubmodelElementList)) {
      return;
    }

    const entryType = this.getPcfListType(list);
    if (entryType == null) {
      return;
    }

    this.ref = this.dialogService.open(PcfEntryAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('PCF_ADD_ENTRY'),
      closable: true,
      modal: true,
      data: {
        entryType,
        entryIndex: (list.value ?? []).length,
      },
    });

    this.ref?.onClose.subscribe((entry: DppPcfEntry | null) => {
      if (entry == null) {
        return;
      }

      if (list.value == null) {
        list.value = [];
      }

      list.value.push(this.pcfEntryMapperService.createEntryElement(entry, list.value.length));
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(list), 0);
    });
  }

  openEditPcfEntryAddon(): void {
    this.openEditPcfEntryAddonByIndex();
  }

  openEditPcfEntryAddonByIndex(indexOverride?: number): void {
    const context = this.getSelectedPcfEntryContext();
    if (context == null) {
      const selectedList = this.selectedElement?.content;
      if (!(selectedList instanceof aas.types.SubmodelElementList)) {
        return;
      }

      const entryType = this.getPcfListType(selectedList);
      if (entryType == null || indexOverride == null) {
        return;
      }

      const existingElement = (selectedList.value ?? [])[indexOverride];
      if (!(existingElement instanceof aas.types.SubmodelElementCollection)) {
        return;
      }

      this.openPcfEntryEditor(entryType, existingElement, indexOverride);
      return;
    }

    this.openPcfEntryEditor(context.entryType, context.collection, context.index);
  }

  get pcfListViewerSubmodel(): aas.types.Submodel | undefined {
    const selectedContent = this.selectedElement?.content;
    if (!(selectedContent instanceof aas.types.SubmodelElementList)) {
      return undefined;
    }

    const entryType = this.getPcfListType(selectedContent);
    if (entryType == null) {
      return undefined;
    }

    const listSemanticId =
      entryType === 'product-carbon-footprint'
        ? 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0'
        : 'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0';

    const submodel = new aas.types.Submodel('urn:temporary:pcf-list-viewer');
    submodel.idShort = selectedContent.idShort ?? 'CarbonFootprint';
    submodel.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.GlobalReference,
        'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
      ),
    ]);

    const list = cloneDeep(selectedContent);
    list.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, listSemanticId),
    ]);
    submodel.submodelElements = [list];
    return submodel;
  }

  get pcfSelectedStep(): aas.types.SubmodelElementCollection | undefined {
    return this.getSelectedPcfEntryContext()?.collection;
  }

  private openPcfEntryEditor(
    entryType: DppPcfEntryType,
    existingElement: aas.types.SubmodelElementCollection,
    index: number,
  ) {
    this.ref = this.dialogService.open(PcfEntryAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('PCF_EDIT_WITH_ASSISTANT'),
      closable: true,
      modal: true,
      data: {
        entryType,
        existingElement: cloneDeep(existingElement),
        entryIndex: index,
      },
    });

    this.ref?.onClose.subscribe((entry: DppPcfEntry | null) => {
      if (entry == null) {
        return;
      }

      const updated = this.pcfEntryMapperService.createEntryElement(entry, index);
      Object.assign(existingElement as any, updated as any);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(existingElement), 0);
    });
  }

  private getSelectedPcfEntryContext(): {
    collection: aas.types.SubmodelElementCollection;
    entryType: DppPcfEntryType;
    index: number;
  } | null {
    const collection = this.selectedElement?.content;
    const parent = this.selectedElement?.parent?.content;
    if (
      !(collection instanceof aas.types.SubmodelElementCollection) ||
      !(parent instanceof aas.types.SubmodelElementList)
    ) {
      return null;
    }

    const entryType = this.getPcfListType(parent);
    if (entryType == null) {
      return null;
    }

    return {
      collection,
      entryType,
      index: Math.max(0, (parent.value ?? []).indexOf(collection)),
    };
  }

  private getPcfListType(list: aas.types.SubmodelElementList): DppPcfEntryType | null {
    if (
      SemanticIdHelper.hasSemanticId(list, 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0') ||
      list.idShort === 'ProductCarbonFootprints'
    ) {
      return 'product-carbon-footprint';
    }

    if (
      SemanticIdHelper.hasSemanticId(
        list,
        'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0',
      ) ||
      list.idShort === 'ProductOrSectorSpecificCarbonFootprints'
    ) {
      return 'product-or-sector-specific-carbon-footprint';
    }

    return null;
  }

  initValidationMenuItems() {
    this.validateMenuItems = [
      {
        icon: 'pi pi-check-circle',
        command: () => this.validate(),
        label: this.translate.instant('VALIDATE'),
        disabled: this.loading,
      },
      {
        icon: 'fa-solid fa-spell-check',
        command: () => this.validateIds(),
        label: this.translate.instant('VALIDATE_IDS'),
        disabled: this.loading,
      },
      {
        icon: 'fa-solid fa-code-compare',
        command: () => this.diff(),
        label: this.translate.instant('DIFF'),
        disabled: this.loading,
      },
    ];
  }

  initSaveMenuItems() {
    this.saveMenuItems = [
      {
        icon: 'pi pi-save',
        command: () => this.save(true, null),
        label: this.translate.instant('SAVE'),
        disabled: this.loading,
      },
      {
        icon: 'pi pi-save',
        command: () => this.showChangelogCommentDialog(),
        label: this.translate.instant('SAVE_WITH_COMMENT'),
        disabled: this.loading,
      },
      {
        icon: 'pi pi-save',
        command: () => this.save(false, null),
        label: this.translate.instant('SAVE_WITHOUT_CHANGELOG'),
        disabled: this.loading,
      },
    ];
  }

  showChangelogCommentDialog() {
    this.ref = this.dialogService.open(EnterChangelogCommentComponent, {
      header: this.translate.instant('CHANGELOG_COMMENT'),
      modal: true,
      width: '50%',
      closable: true,
    });

    this.ref?.onClose.subscribe((data: string) => {
      if (data) {
        this.save(true, data);
      }
    });
  }

  async save(saveChangelog: boolean, comment: string | null) {
    if (this.shellResult != null) {
      if (saveChangelog) {
        const result = ChangelogAppender.appendChangelog(
          comment,
          this.shellResult,
          this.portalService.user?.loginName ?? 'AasDesigner',
          this.portalService.iriPrefix,
        );
        if (result === 'updated') {
          this.treeService.refreshChangelogNodes();
        } else {
          this.treeService.refreshWholeTree();
        }
      }
      this.loading = true;
      try {
        await this.service.saveNew(this.shellResult);
        this.v3ShellBackup = cloneDeep(this.shellResult);
        this.notificationService.showMessageAlways('SUCCESS', 'SUCCESS', 'success', false);
      } finally {
        this.loading = false;
      }
    }
  }

  initMenuItems() {
    this.menuItems = [
      {
        icon: 'pi pi-download',
        command: () => this.export(),
        label: this.translate.instant('EXPORT_AASX'),
        disabled: this.loading || this.hasChanges(),
      },
      // {
      //   icon: 'fa-solid fa-file-csv',
      //   command: () => this.exportCsv(),
      //   label: this.translate.instant('EXPORT_CSV'),
      //   disabled: this.loading || this.hasChanges(),
      // },
      {
        icon: 'pi pi-eye',
        routerLink: PortalService.buildViewerRoute(this.shellResult?.v3Shell?.assetAdministrationShells?.[0].id ?? ''),
        label: this.translate.instant('VIEW_MODE'),
        disabled: this.loading,
      },
    ];
  }

  async reset() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('RESET_Q'),
      })
    ) {
      this.actionRequested.emit('reset');
    }
  }

  hasChanges() {
    return (
      this.hasMetadataChanges() ||
      this.hasChangedThumbnail() ||
      JSON.stringify(this.v3ShellBackup?.v3Shell) !== JSON.stringify(this.shellResult?.v3Shell) ||
      (this.shellResult?.deletedFiles != null && this.shellResult.deletedFiles.length > 0)
    );
  }

  hasChangedThumbnail() {
    return JSON.stringify(this.v3ShellBackup?.addedFiles) !== JSON.stringify(this.shellResult?.addedFiles);
  }

  hasMetadataChanges() {
    return (
      this.v3ShellBackup?.packageMetadata.filename !== this.shellResult?.packageMetadata.filename ||
      this.v3ShellBackup?.packageMetadata.beschreibung !== this.shellResult?.packageMetadata.beschreibung
    );
  }

  async share() {
    if (this.shellResult != null)
      if (await this.confirmationService.confirm({ message: this.translate.instant('SHARE_AAS_Q') })) {
        try {
          this.loading = true;
          const res = await this.service.share(this.shellResult.id);
          if (res) {
            this.shellResult.packageMetadata.freigabeLevel = 'ORGANISATION';
            this.v3ShellBackup = cloneDeep(this.shellResult);
            this.initMenuItems();
          }
        } finally {
          this.loading = false;
        }
      }
  }
  async unshare() {
    if (this.shellResult != null)
      if (await this.confirmationService.confirm({ message: this.translate.instant('UNSHARE_AAS_Q') })) {
        try {
          this.loading = true;
          const res = await this.service.unshare(this.shellResult.id);
          if (res) {
            this.shellResult.packageMetadata.freigabeLevel = 'PRIVATE';
            this.v3ShellBackup = cloneDeep(this.shellResult);
            this.initMenuItems();
          }
        } finally {
          this.loading = false;
        }
      }
  }

  export() {
    if (this.shellResult != null)
      this.exportComponent?.startExport(
        this.shellResult.v3Shell?.assetAdministrationShells?.[0].id ?? '',
        this.shellResult.v3Shell?.assetAdministrationShells?.[0].idShort ?? '',
      );
  }

  async validate() {
    this.validationErrors.set([]);
    const validationErrors: AasDesignerVerificationError[] = [];
    if (this.shellResult?.v3Shell != null) {
      try {
        const errs = aas.verification.verify(this.shellResult.v3Shell);
        let number = 1;
        this.constraintOptions = [];
        for (const error of errs ?? []) {
          if (error.message.includes('RFC 8089')) continue;
          const myError = new AasDesignerVerificationError(error);
          myError.messageTranslated = this.translate.instant('errorMessages.' + error.message);
          myError.number = number++;
          myError.label = this.getFixErrorLabel(myError);
          myError.allLabel = this.getFixAllErrorsLabel(myError);
          if (
            this.constraintOptions.indexOf(myError.constraint ?? '') === -1 &&
            myError.constraint != null &&
            myError.constraint !== ''
          ) {
            this.constraintOptions.push(myError.constraint);
          }
          validationErrors.push(myError);
        }
      } catch (e: any) {
        // this.notificationService.showMessageAlways(e.message, 'ERROR', 'error', true);
        // eslint-disable-next-line no-console
        console.log(e);
      }
    }
    this.validationErrors.set(validationErrors);
    this.validationErrorCount = this.validationErrors().length;
    if (this.validationErrorCount > 0) this.showValidationResult();
    else this.notificationService.showMessageAlways('NO_ERRORS_FOUND', 'SUCCESS', 'success', false);
  }

  validateIds() {
    if (this.hasChanges()) {
      this.notificationService.showMessageAlways('SAVE_BEFORE_VALIDATION', 'HINT', 'info', true);
    } else {
      this.ref = this.dialogService.open(IdValidatorComponent, {
        header: this.translate.instant('ID_VALIDATION'),
        modal: true,
        width: '95%',
        data: {
          shellResult: this.shellResult,
        },
      });

      this.ref?.onClose.subscribe((result: { action: 'reroute' | 'refresh' | 'nothing'; id: string }) => {
        if (result == null) return;
        if (result.action === 'reroute') {
          // neu laden triggern oder neu routen
          this.router.navigate(PortalService.buildRepoEditRoute(result.id ?? ''));
        } else if (result.action === 'refresh') {
          this.actionRequested.emit('reset');
        } else {
          // do nothing
        }
      });
    }
  }

  showValidationResult() {
    this.displayValidationResult = true;
  }

  diff() {
    this.displayDiff = true;
    this.diffViewer?.diff();
  }

  isAutoFixable(error: VerificationError) {
    const x = get(this.shellResult?.v3Shell, error.path.toString().substring(1));
    return (
      error.message === 'Embedded data specifications must be either not set or have at least one item.' ||
      error.message === 'Supplemental semantic IDs must be either not set or have at least one item.' ||
      error.message === 'Value must be either not set or have at least one item.' ||
      error.message === 'Concept descriptions must be either not set or have at least one item.' ||
      error.message === 'Description must be either not set or have at least one item.' ||
      error.message === 'String shall have a maximum length of 18 characters.' ||
      (error.message === 'The value must not be empty.' &&
        (error.path.toString().endsWith('dataSpecificationContent.value') ||
          error.path.toString().endsWith('.dataSpecificationContent.sourceOfDefinition') ||
          error.path.toString().endsWith('.category') ||
          error.path.toString().endsWith('.unit') ||
          error.path.toString().endsWith('.symbol') ||
          error.path.toString().endsWith('.valueFormat') ||
          error.path.toString().endsWith('.administration.version') ||
          error.path.toString().endsWith('.text')) &&
        x === '') ||
      (error.message === 'Value must be consistent with the value type.' && x.value === '') ||
      // error.message === 'Keys must contain at least one item.' ||
      error.message ===
        'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.' ||
      error.message ===
        'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.'
    );
  }

  fixAll(error: VerificationError) {
    switch (error.message) {
      case 'Embedded data specifications must be either not set or have at least one item.':
        this.fixEmbeddedDataSpecifications(error);
        break;
      case 'Supplemental semantic IDs must be either not set or have at least one item.':
        this.fixSupplementalSemanticIds(error);
        break;
      case 'Description must be either not set or have at least one item.':
        this.fixDescriptionValue(error);
        break;
      case 'Value must be either not set or have at least one item.':
        this.fixValue(error);
        break;
      case 'Concept descriptions must be either not set or have at least one item.':
        if (this.shellResult?.v3Shell != null) this.shellResult.v3Shell.conceptDescriptions = null;
        break;
      case 'The value must not be empty.':
        this.fixNotEmpty(error);
        break;
      case 'Value must be consistent with the value type.':
        this.fixEmpty(error);
        break;
      case 'String shall have a maximum length of 18 characters.':
        this.fixLength(error);
        break;
      // case 'Keys must contain at least one item.':
      //   this.fixKeysMustContainAtLeastOneItem(error);
      //   break;
      case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
        this.fixModelReference(error);
        break;
      case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
        this.fixAllGlobalReference(error);
        break;
    }

    this.validate();
  }

  fixThis(error: VerificationError) {
    if (this.shellResult?.v3Shell != null) {
      const path = error.path.toString().substring(1);
      const x = get(this.shellResult?.v3Shell, path);
      switch (error.message) {
        case 'Embedded data specifications must be either not set or have at least one item.':
          x.embeddedDataSpecifications = null;
          break;
        case 'Supplemental semantic IDs must be either not set or have at least one item.':
          x.supplementalSemanticIds = null;
          break;
        case 'Concept descriptions must be either not set or have at least one item.':
          this.shellResult.v3Shell.conceptDescriptions = null;
          break;
        case 'Value must be either not set or have at least one item.':
        case 'Description must be either not set or have at least one item.':
        case 'Value must be consistent with the value type.':
          x.value = null;
          break;
        case 'The value must not be empty.':
          if (
            path.toString().endsWith('dataSpecificationContent.value') ||
            path.toString().endsWith('.dataSpecificationContent.sourceOfDefinition') ||
            path.toString().endsWith('.category') ||
            path.toString().endsWith('.unit') ||
            path.toString().endsWith('.valueFormat') ||
            path.toString().endsWith('.administration.version') ||
            path.toString().endsWith('.symbol')
          ) {
            set(this.shellResult?.v3Shell, path, null);
          } else if (path.toString().endsWith('.text')) {
            set(this.shellResult?.v3Shell, path, ' ');
          }
          break;
        case 'String shall have a maximum length of 18 characters.':
          if (x === '') {
            set(this.shellResult?.v3Shell, path, null);
          } else if (x.length > 18) {
            set(this.shellResult?.v3Shell, path, x.substring(0, 18));
          }
          break;
        // case 'Keys must contain at least one item.':
        //   set(this.shellResult?.v3Shell, path, null);
        //   break;
        case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
          set(this.shellResult?.v3Shell, path.toString() + '.type', 0);
          break;
        case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
          if (x.keys != null && x.keys[0] != null) x.keys[0].type = aas.types.KeyTypes.GlobalReference;
          break;
      }
    }
    this.validate();
  }

  fixSupplementalSemanticIds(error: aas.verification.VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) x.supplementalSemanticIds = null;
        }
      });
  }

  fixEmbeddedDataSpecifications(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) x.embeddedDataSpecifications = null;
        }
      });
  }

  fixValue(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) x.value = null;
        }
      });
  }

  fixDescriptionValue(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);

          const x = get(this.shellResult.v3Shell, path + '.description');
          if (x != null) set(this.shellResult.v3Shell, path + '.description', null);
        }
      });
  }

  fixEmpty(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x?.value === '') {
            x.value = null;
          }
        }
      });
  }

  fixLength(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x === '') {
            set(this.shellResult?.v3Shell, path, null);
          }
          if (x !== '' && x.length > 18) {
            set(this.shellResult?.v3Shell, path, x.substring(0, 18));
          }
          if (x instanceof LangStringShortNameTypeIec61360) {
            x.text = x.text.substring(0, 18);
          }
        }
      });
  }

  fixNotEmpty(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        const path = e.path.toString().substring(1);
        if (
          this.shellResult?.v3Shell != null &&
          (path.endsWith('dataSpecificationContent.value') ||
            path.toString().endsWith('.dataSpecificationContent.sourceOfDefinition') ||
            path.toString().endsWith('.category') ||
            path.toString().endsWith('.unit') ||
            path.toString().endsWith('.valueFormat') ||
            path.toString().endsWith('.administration.version') ||
            path.toString().endsWith('.symbol'))
        ) {
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) set(this.shellResult?.v3Shell, path, null);
        } else if (this.shellResult?.v3Shell != null && path.endsWith('.text')) {
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) set(this.shellResult?.v3Shell, path, ' ');
        }
      });
  }

  fixKeysMustContainAtLeastOneItem(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) {
            x.keys = null;
            //set(this.shellResult?.v3Shell, path, null);
          }
        }
      });
  }

  fixModelReference(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const typePath = path + '.type';
          const x = get(this.shellResult.v3Shell, typePath);
          if (x != null) set(this.shellResult?.v3Shell, typePath, 0);
        }
      });
  }

  fixAllGlobalReference(error: VerificationError) {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null && x.keys != null && x.keys[0] != null) x.keys[0].type = aas.types.KeyTypes.GlobalReference;
        }
      });
  }

  async exportJson() {
    if (this.shellResult != null) {
      const fileContent = this.shellResult.plainJson;
      const blob = new Blob([fileContent], {
        type: 'application/octet-stream',
      });
      saveAs(blob, (this.shellResult.v3Shell?.assetAdministrationShells?.[0].idShort ?? 'export') + '.json');
    }
  }

  get assetInformation() {
    return this.treeService.getAssetInformation();
  }

  get idShort() {
    return this.treeService.getIdShort();
  }

  get submodel() {
    return this.treeService.getCurrentSubmodel();
  }

  get selectedSubmodel(): aas.types.Submodel | undefined {
    return this.selectedElement?.content instanceof aas.types.Submodel ? this.selectedElement.content : undefined;
  }

  get currentLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang() || 'de';
  }

  getFixAllErrorsLabel(error: any) {
    let label = 'FIX_ALL';

    switch (error.message) {
      case 'Embedded data specifications must be either not set or have at least one item.':
      case 'Supplemental semantic IDs must be either not set or have at least one item.':
      case 'Concept descriptions must be either not set or have at least one item.':
      case 'Value must be either not set or have at least one item.':
      case 'Description must be either not set or have at least one item.':
      case 'Value must be consistent with the value type.':
      case 'The value must not be empty.':
        label = 'SET_NULL_ALL';
        break;
      case 'String shall have a maximum length of 18 characters.':
        label = 'SHORTEN_ALL';
        break;
      case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
        label = 'SET_TYPE_ALL';
        break;
      case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
        label = 'SET_GLOBAL_REFERENCE_ALL';
        break;
    }

    return label;
  }

  getFixErrorLabel(error: any) {
    let label = 'FIX_ALL';

    switch (error.message) {
      case 'Embedded data specifications must be either not set or have at least one item.':
      case 'Supplemental semantic IDs must be either not set or have at least one item.':
      case 'Concept descriptions must be either not set or have at least one item.':
      case 'Value must be either not set or have at least one item.':
      case 'Description must be either not set or have at least one item.':
      case 'Value must be consistent with the value type.':
      case 'The value must not be empty.':
        label = 'SET_NULL';
        break;
      case 'String shall have a maximum length of 18 characters.':
        label = 'SHORTEN';
        break;
      case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
        label = 'SET_TYPE';
        break;
      case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
        label = 'SET_GLOBAL_REFERENCE';
        break;
    }

    return label;
  }

  async deleteShell() {
    if ((await this.confirmationService.confirm({ message: this.translate.instant('DELETE_SHELL_Q') })) === true) {
      try {
        this.loading = true;
        await lastValueFrom(
          this.shellsClient.shells_Delete(this.shellResult?.v3Shell?.assetAdministrationShells?.[0].id ?? ''),
        );
        this.router.navigate(buildShellsListRoute());
      } finally {
        this.loading = false;
      }
    }
  }

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
}
