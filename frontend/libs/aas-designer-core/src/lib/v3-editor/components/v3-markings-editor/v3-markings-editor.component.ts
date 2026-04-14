import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, Input, InputSignal, model, OnChanges, signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { AasConfirmationService } from '@aas/common-services';
import { FilenameHelper, SemanticIdHelper } from '@aas/helpers';
import { MarkingType, MarkingTypeCatalog, ShellResult, SupplementalFile } from '@aas/model';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { GeneratorStateStore } from '../../../generator/generator-state.store';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3EditorDataStoreService } from '../../v3-editor-data-store.service';
import { V3EditorService } from '../../v3-editor.service';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { SingleMarkingFileViewComponent } from './single-marking-file-view.component';
type ISubmodelElement = aas.types.ISubmodelElement;

@Component({
  selector: 'aas-v3-markings-editor',
  templateUrl: './v3-markings-editor.component.html',
  imports: [
    Toolbar,
    Select,
    FormsModule,
    PrimeTemplate,
    Button,
    TableModule,
    SingleMarkingFileViewComponent,
    Dialog,
    HelpLabelComponent,
    InputText,
    FileUpload,
    TranslateModule,
  ],
})
export class V3MarkingsEditorComponent implements OnChanges {
  selectedMarkingToAdd: MarkingType | undefined;

  markingsTreeItem: InputSignal<
    V3TreeItem<aas.types.SubmodelElementCollection> | V3TreeItem<aas.types.SubmodelElementList>
  > = input.required();
  markingsSmc = computed(() => {
    const markingsItem = this.markingsTreeItem();
    if (markingsItem != null) {
      return markingsItem.content as aas.types.SubmodelElementCollection | aas.types.SubmodelElementList;
    }
    return undefined;
  });

  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) indexed: boolean = false;
  @Input({ required: true }) idShortPath: string = '';
  @Input({ required: true }) submodelIdentifier: string = '';
  @Input({ required: true }) parentSml: boolean = false;

  v3EditorDataStore = inject(V3EditorDataStoreService);
  generatorStateStore = inject(GeneratorStateStore);

  fileUrls: Map<string, SafeUrl> = new Map<string, SafeUrl>();
  loading: boolean = false;
  types: { irdi: any; preferredNameEn: any; filename: string; additionalText: string }[] = [];

  showEditMarkingDialog = signal(false);
  editMarking: aas.types.SubmodelElementCollection | undefined = undefined;
  editMarkingAdditionalText = model('');
  editMarkingName = model('');
  editMarkingFile: File | undefined;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private confirmationService: AasConfirmationService,
    private translate: TranslateService,
    private treeService: V3TreeService,
    private editorService: V3EditorService,
  ) {}

  ngOnChanges(): void {
    this.initFiles();
    this.initTypes();
  }

  async initFiles() {
    const markingsSmc = this.markingsSmc();
    if (markingsSmc?.value != null) {
      markingsSmc.value.forEach((marking) => this.initFile(marking as aas.types.SubmodelElementCollection));
    }
  }

  getFileSrc(marking: aas.types.SubmodelElementCollection) {
    const path = FilenameHelper.replaceFileUri(this.getMarkingFilename(marking)) ?? '';
    return this.fileUrls.get(path);
  }

  async initFile(marking: aas.types.SubmodelElementCollection) {
    const path = FilenameHelper.replaceFileUri(this.getMarkingFilename(marking));
    if (this.shellResult != null) {
      const supplFile = this.shellResult.supplementalFiles.find((f) => f.filename === path || f.path === path);
      if (supplFile != null) {
        await this.loadFile(supplFile);
        if (supplFile.fileUrl != null) this.fileUrls.set(supplFile.path, supplFile.fileUrl);
      }
    }
  }

  async loadFile(supplementalFile: SupplementalFile) {
    if (supplementalFile?.isLoaded) return;
    if (supplementalFile?.file != null) {
      supplementalFile.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(supplementalFile.file),
      );
    } else if (this.shellResult?.id != null && supplementalFile?.path != null) {
      try {
        this.loading = true;
        supplementalFile.fileData = await this.editorService.getSupplementalFile(
          this.shellResult.id,
          supplementalFile.path,
        );
        if (supplementalFile.fileData != null) {
          supplementalFile.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(supplementalFile.fileData),
          );
        }
      } finally {
        this.loading = false;
      }
    }
  }

  initTypes() {
    this.types = [
      ...MarkingTypeCatalog.types,
      {
        irdi: this.translate.instant('CUSTOM'),
        preferredNameEn: this.translate.instant('CUSTOM'),
        filename: '',
        additionalText: '',
      },
    ];
  }

  async addMarking() {
    // TODO: Prüfen ob das Markins eine SML oder SMC ist.
    // Bei einer SML darf die idShort nicht gesetzt werden.
    // Bei einer SMC muss die idShort gesetzt werden.
    const markingsSmc = this.markingsSmc();
    if (this.selectedMarkingToAdd != null && this.selectedMarkingToAdd.filename !== '' && markingsSmc?.value != null) {
      const newMarking = new aas.types.SubmodelElementCollection();
      newMarking.idShort = `Marking${(markingsSmc?.value?.length ?? 0).toString().padStart(2, '0')}`;
      newMarking.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.ConceptDescription, '0173-1#01-AHD206#001'),
      ]);
      newMarking.value = [];

      await this.createMarkingFile(newMarking);

      this.createMarkingName(newMarking);
      this.createMarkingAdditionalText(newMarking);
      // this.createExplosionSafeties(newMarking);

      this.markingsSmc()?.value?.push(newMarking);
      this.treeService.refreshMarkingNodes();
    } else if (this.selectedMarkingToAdd?.irdi === this.translate.instant('CUSTOM')) {
      const newMarking = new aas.types.SubmodelElementCollection();
      newMarking.idShort = `Marking${(this.markingsSmc()?.value?.length ?? 0).toString().padStart(2, '0')}`;
      newMarking.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.ConceptDescription, '0173-1#01-AHD206#001'),
      ]);
      newMarking.value = [];
      this.createMarkingName(newMarking);
      this.createMarkingAdditionalText(newMarking);

      markingsSmc?.value?.push(newMarking);
      this.treeService.refreshMarkingNodes();
    }

    this.selectedMarkingToAdd = undefined;
    this.initFiles();
  }

  createMarkingName(newMarking: aas.types.SubmodelElementCollection) {
    const prop = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    prop.idShort = 'MarkingName';
    prop.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, '0112/2///61987#ABA231#009'),
    ]);
    prop.value = this.selectedMarkingToAdd?.irdi ?? '';
    newMarking.value?.push(prop);
  }

  createMarkingAdditionalText(newMarking: aas.types.SubmodelElementCollection) {
    const prop = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    prop.idShort = 'MarkingAdditionalText00';
    prop.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, '0112/2///61987#ABB146#007'),
    ]);
    prop.value = this.selectedMarkingToAdd?.additionalText ?? '';
    newMarking.value?.push(prop);
  }

  createExplosionSafeties(newMarking: aas.types.SubmodelElementCollection) {
    const smc = new aas.types.SubmodelElementCollection();
    smc.idShort = 'ExplosionSafeties';

    smc.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.ConceptDescription,
        'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/ExplosionSafeties',
      ),
    ]);

    const smcSafety = new aas.types.SubmodelElementCollection();
    smc.idShort = 'ExplosionSafeties';

    smcSafety.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.ConceptDescription,
        'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/ExplosionSafetiy',
      ),
    ]);

    newMarking.value?.push(smc);
  }

  async createMarkingFile(newMarking: aas.types.SubmodelElementCollection) {
    if (this.selectedMarkingToAdd != null) {
      const blob = await lastValueFrom(
        this.http.get('/assets/markings/' + this.selectedMarkingToAdd.filename, {
          responseType: 'blob' as any,
        }),
      );

      const file = new File([blob], this.selectedMarkingToAdd.filename, {
        type: (blob as any).type,
      });
      const path = `${FilenameHelper.sanitizeFilename(this.selectedMarkingToAdd.filename)}`;
      const newMarkingFile = new aas.types.File();
      newMarkingFile.contentType = (blob as any).type;
      newMarkingFile.idShort = 'MarkingFile';
      newMarkingFile.value = path;
      newMarkingFile.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.ConceptDescription, '0112/2///61987#ABO100#002'),
      ]);

      newMarking.value?.push(newMarkingFile);
      this.storeGeneratorMarkingFile(path, file);

      if (
        this.shellResult?.supplementalFiles.find((f) => f.path === path) == null &&
        this.shellResult?.addedFiles.find((f) => f.path === path) == null
      ) {
        const supplFile: SupplementalFile = {
          path: path,
          filename: this.selectedMarkingToAdd.filename,
          fileApiUrl: '',
          contentType: (blob as any).type,
          file,
          isLoaded: true,
          isLoading: false,
          isLocal: true,
          fileUrl: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)),
          fileData: null,
          id: null,
          isThumbnail: false,
        };
        this.shellResult?.supplementalFiles.push(supplFile);

        this.shellResult?.addedFiles.push(supplFile);
        this.treeService.addFileNode(supplFile);
      }
      const markingsSmc = this.markingsSmc();
      if (markingsSmc != null && markingsSmc.value == null) {
        markingsSmc.value = [];
      }
    }
  }

  async createMarkingFileFromUpload() {
    if (this.editMarkingFile != null && this.editMarking != null) {
      const path = `${FilenameHelper.sanitizeFilename(this.editMarkingFile.name)}`;

      let markingEditFile = this.getMarkingFile(this.editMarking);

      if (markingEditFile == null) {
        markingEditFile = new aas.types.File();
        markingEditFile.idShort = 'MarkingFile';
        markingEditFile.value = `${path}`;
        markingEditFile.contentType = this.editMarkingFile.type;

        markingEditFile.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(
            aas.types.KeyTypes.ConceptDescription,
            'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
          ),
        ]);

        this.editMarking.value?.push(markingEditFile);
      }
      markingEditFile.value = `${path}`;
      markingEditFile.contentType = this.editMarkingFile.type;
      this.storeGeneratorMarkingFile(path, this.editMarkingFile);

      if (
        this.shellResult?.supplementalFiles.find((f) => f.path === path) == null &&
        this.shellResult?.addedFiles.find((f) => f.path === path) == null
      ) {
        const supplFile: SupplementalFile = {
          path: path,
          filename: path,
          fileApiUrl: '',
          contentType: this.editMarkingFile.type,
          file: this.editMarkingFile,
          isLoaded: true,
          isLoading: false,
          isLocal: true,
          fileUrl: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.editMarkingFile)),
          fileResourceUrl: URL.createObjectURL(this.editMarkingFile),
          fileData: null,
          id: null,
          isThumbnail: false,
        };
        this.shellResult?.supplementalFiles.push(supplFile);

        this.shellResult?.addedFiles.push(supplFile);
        this.treeService.addFileNode(supplFile);
      }
    }
  }

  async deleteMarking(marking: any) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_MARKING_Q'),
      })
    ) {
      const markingsSmc = this.markingsSmc();
      if (markingsSmc?.value != null) {
        markingsSmc.value.splice(markingsSmc.value.indexOf(marking), 1);
        this.treeService.refreshMarkingNodes();
      }
    }
  }

  getMarkingName(marking: aas.types.SubmodelElementCollection) {
    const val = marking.value?.find(
      (sme) =>
        SemanticIdHelper.hasSemanticId(
          sme,
          'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingName',
        ) || SemanticIdHelper.hasSemanticId(sme, '0112/2///61987#ABA231#009'),
    ) as aas.types.File;

    return val?.value ?? '';
  }

  getMarkingFile(marking: aas.types.SubmodelElementCollection) {
    const val = marking.value?.find(
      (sme) =>
        SemanticIdHelper.hasSemanticId(
          sme,
          'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
        ) || SemanticIdHelper.hasSemanticId(sme, '0112/2///61987#ABO100#002'),
    ) as aas.types.File;

    return val;
  }

  getMarkingFilename(marking: aas.types.SubmodelElementCollection) {
    const val = this.getMarkingFile(marking);
    return val?.value ?? '';
  }

  getMarkingAdditionalText(marking: any) {
    let val = marking.value?.find((sme: any) => sme.idShort === 'MarkingAdditionalText');
    if (val == null) {
      val = marking.value.find(
        (sme: ISubmodelElement) =>
          SemanticIdHelper.hasSemanticId(
            sme,
            'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingAdditionalText',
          ) || SemanticIdHelper.hasSemanticId(sme, '0112/2///61987#ABB146#007'),
      );
    }

    return val?.value ?? '';
  }

  getMarkingFileIdShort(marking: aas.types.SubmodelElementCollection) {
    const val = marking.value?.find(
      (sme) =>
        SemanticIdHelper.hasSemanticId(
          sme,
          'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
        ) || SemanticIdHelper.hasSemanticId(sme, '0112/2///61987#ABO100#002'),
    ) as aas.types.File;
    const parentIndex = this.markingsSmc()?.value?.indexOf(marking);
    if (this.parentSml) {
      return this.idShortPath + '[' + parentIndex + '].' + val.idShort;
    } else {
      return this.idShortPath + '.' + this.markingsSmc()?.idShort + '.' + val.idShort;
    }
  }

  getMarkingContentType(marking: aas.types.SubmodelElementCollection) {
    const val = marking.value?.find(
      (sme) =>
        SemanticIdHelper.hasSemanticId(
          sme,
          'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
        ) || SemanticIdHelper.hasSemanticId(sme, '0112/2///61987#ABO100#002'),
    ) as aas.types.File;

    return val?.contentType ?? '';
  }

  baseUrl = computed(() => {
    const descriptor = this.v3EditorDataStore
      .editorDescriptor()
      ?.submodelDescriptorEntries?.find((s) => s.oldId === this.submodelIdentifier);
    if (descriptor == null) return '';
    return descriptor.endpoint ?? '';
  });

  startEditMarking(marking: aas.types.SubmodelElementCollection) {
    if (marking == null) return;
    this.editMarking = marking;

    this.editMarkingAdditionalText.set(this.getMarkingAdditionalText(marking));
    this.editMarkingName.set(this.getMarkingName(marking));

    this.showEditMarkingDialog.set(true);
  }

  setMarkingFile(event: FileSelectEvent) {
    this.editMarkingFile = event.files.length > 0 ? event.files[0] : undefined;
  }

  setAdditionalText() {
    const el = this.editMarking?.value?.find(
      (sme: any) =>
        sme.idShort.startsWith('MarkingAdditionalText') ||
        SemanticIdHelper.hasSemanticId(sme, '0112/2///61987#ABB146#007') ||
        SemanticIdHelper.hasSemanticId(
          sme,
          'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingAdditionalText',
        ),
    ) as aas.types.Property;
    if (el != null) {
      el.value = this.editMarkingAdditionalText();
    }
  }
  setMarkingName() {
    const el = this.editMarking?.value?.find(
      (sme: any) =>
        sme.idShort.startsWith('MarkingName') ||
        SemanticIdHelper.hasSemanticId(sme, '0112/2///61987#ABA231#009') ||
        SemanticIdHelper.hasSemanticId(
          sme,
          'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingName',
        ),
    ) as aas.types.Property;
    if (el != null) {
      el.value = this.editMarkingName();
    }
  }

  saveEditedMarking() {
    this.setAdditionalText();
    this.setMarkingName();
    if (this.editMarkingFile != null) {
      this.createMarkingFileFromUpload();
    }
    this.showEditMarkingDialog.set(false);
    this.treeService.refreshMarkingNodes();
    this.editMarking = undefined;
    this.editMarkingAdditionalText.set('');
    this.editMarkingName.set('');
    this.editMarkingFile = undefined;
    this.initFiles();
  }

  private storeGeneratorMarkingFile(path: string, file: File | null | undefined) {
    if (file == null) {
      return;
    }

    const normalizedPath = path.startsWith('/aasx/files/')
      ? path
      : `/aasx/files/${FilenameHelper.sanitizeFilename(path)}`;
    this.generatorStateStore.setFileAttachment(normalizedPath, file);
  }
}
