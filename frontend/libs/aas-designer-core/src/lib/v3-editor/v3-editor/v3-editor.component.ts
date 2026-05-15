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
import { cloneDeep } from 'lodash-es';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { AasxExportComponent } from '../../general/aasx-export/aasx-export.component';
import { DiffViewerComponent } from '../../general/diff-viewer/diff-viewer.component';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3EditorService } from '../v3-editor.service';
import { V3TreeService } from '../v3-tree/v3-tree.service';

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
import { AvailableInfastructure, ShellsClient } from '@aas/webapi-client';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver-es';
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
import { PcnChangeInfo } from '../../pcn/pcn-changes/pcn-change-info';
import { PcnChangesComponent } from '../../pcn/pcn-changes/pcn-changes.component';
import { EnterChangelogCommentComponent } from '../components/enter-changelog-comment/enter-changelog-comment.component';
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
import { ChangelogAppender } from './changelog-appender';
import { V3EditorCapabilityService } from './v3-editor-capability.service';
import { V3EditorPcfService } from './v3-editor-pcf.service';
import { V3EditorValidationService } from './v3-editor-validation.service';
@Component({
  selector: 'aas-v3-editor',
  templateUrl: './v3-editor.component.html',
  styleUrls: ['../../../host.scss'],
  providers: [V3EditorPcfService, V3EditorCapabilityService, V3EditorValidationService],
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
  saveMenuItems: MenuItem[] = [];

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

  public validationService = inject(V3EditorValidationService);
  public capabilityService = inject(V3EditorCapabilityService);
  public pcfService = inject(V3EditorPcfService);

  constructor(
    private translate: TranslateService,
    private service: V3EditorService,
    private notificationService: NotificationService,
    private confirmationService: AasConfirmationService,
    public treeService: V3TreeService,
  ) {
    this.treeService.editorComponent = this;
  }

  ngOnInit(): void {
    this.validationService.shellResult = this.shellResult;
    this.validationService.hasChanges = () => this.hasChanges();
    this.capabilityService.shellResult = this.shellResult;

    this.validationService.initValidationMenuItems(() => this.diff());
    this.initSaveMenuItems();
    this.initMenuItems();

    const aasId = this.shellResult?.v3Shell?.assetAdministrationShells?.[0].id ?? '';

    this.v3ShellBackup = cloneDeep(this.shellResult);
    this.subscriptions.push(
      this.validationService.actionRequested$.subscribe((action) => this.actionRequested.emit(action)),
    );

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
      this.capabilityService.selectedElement = this.selectedElement;
      this.pcfService.selectedElement = this.selectedElement;
      this.capabilityService.syncCapabilityDetailMode();
    }
    if ('shellResult' in changes) {
      this.validationService.shellResult = this.shellResult;
      this.capabilityService.shellResult = this.shellResult;
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
    this.validationService.destroy();
    this.capabilityService.destroy();
    this.pcfService.destroy();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  requestEditModeForNextSelection(): void {
    this.capabilityService.requestEditModeForNextSelection();
  }

  async onBomReinitializeInViewerRequested(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      message: this.translate.instant('BOM_REINITIALIZE_CONFIRM'),
    });

    if (!confirmed) {
      return;
    }

    this.capabilityService.showCapabilityEditor();
    this.capabilityService.bomReinitializeRequestId++;
  }

  diff(): void {
    this.validationService.displayDiff = true;
    this.diffViewer?.diff();
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
