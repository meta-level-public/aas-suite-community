import { FileResult, MarkingType, MarkingTypeCatalog } from '@aas/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AasSharedDataService } from '../../../asset-administration-shell-tree/services/aas-shared-data.service';
import { GeneratorStateStore } from '../../../generator/generator-state.store';
import { Marking } from '../../../generator/model/marking';
import { Nameplate } from '../../../generator/model/nameplate';

import { AasConfirmationService, AppConfigService, PortalService } from '@aas/common-services';
import { FilenameHelper } from '@aas/helpers';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep, find } from 'lodash-es';
import { PrimeTemplate } from 'primeng/api';
import { Select } from 'primeng/select';
import { Toolbar } from 'primeng/toolbar';
import { v4 as uuid } from 'uuid';

import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EclassExplanationService } from '../../eclass-explanation/help-explanation.service';

@Component({
  selector: 'aas-markings-edit',
  templateUrl: './markings-edit.component.html',
  imports: [Toolbar, Select, FormsModule, PrimeTemplate, Button, TableModule, InputText, FileUpload, TranslateModule],
})
export class MarkingsEditComponent implements OnChanges {
  selectedMarkingToAdd: MarkingType | undefined;
  editing: boolean = false;
  clonedMarkings: any[] = [];

  @Input() editableNode: any;
  @Input() nameplate: Nameplate | undefined;

  markingName: string = '';

  fileUrls: Map<string, SafeUrl> = new Map<string, SafeUrl>();
  types: { irdi: any; preferredNameEn: any; filename: string; additionalText: string }[] = [];

  constructor(
    protected aasSharedDataService: AasSharedDataService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private confirmationService: AasConfirmationService,
    private translate: TranslateService,
    private appConfigService: AppConfigService,
    private portalService: PortalService,
    private eclassExplanationService: EclassExplanationService,
    private generatorStateStore: GeneratorStateStore,
  ) {}

  ngOnChanges(): void {
    void this.initFiles();
    this.initTypes();
  }

  async initFiles() {
    if (this.nameplate != null) {
      if (this.nameplate.markings == null) this.nameplate.markings = [];
      await Promise.all(this.nameplate.markings.map((marking) => this.initializeMarking(marking)));
    }
    if (this.editableNode != null) {
      if (this.editableNode.value == null) this.editableNode.value = [];
      await Promise.all(this.editableNode.value.map((marking: any) => this.initializeMarking(marking)));
    }

    this.changeDetector.detectChanges();
  }

  private async initializeMarking(marking: any) {
    await Promise.all([this.initFile(marking), marking?.initEclass?.(this.eclassExplanationService)]);
  }

  async initFile(marking: any) {
    let fileName = '';
    let localFile;
    if (this.nameplate != null) {
      fileName = marking.filename;
      localFile = find(this.aasSharedDataService.addedFiles, { filePath: fileName });
      if (localFile == null && marking.file != null) {
        localFile = new FileResult();
        localFile.file = marking.file;
        localFile.contentType = marking.file.type;
      }
    }
    if (this.editableNode != null) {
      fileName = this.getMarkingText(marking, 'MarkingFile');
      localFile = find(this.aasSharedDataService.addedFiles, { filePath: fileName });
    }

    let file: Blob | null = null;
    if (localFile?.file != null) {
      file = new Blob([new Uint8Array(await localFile.file.arrayBuffer())], { type: localFile.contentType });
    }
    if (fileName !== '' && file == null) {
      const url = `${this.appConfigService.config.apiPath}/Aas/GetFileFromAas`;
      file = await lastValueFrom(
        this.http.get<Blob>(url, {
          params: new HttpParams().set('id', this.aasId ?? -1).set('filename', fileName),
          responseType: 'blob' as 'json',
        }),
      );
    }
    if (file != null) {
      this.fileUrls.set(fileName, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)));
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

  get aasId() {
    return parseInt(this.route.snapshot.params['vwsId']);
  }

  onRowEditInit(marking: any) {
    marking.tempId = Math.floor(Math.random() * 12354526589);
    if (this.nameplate != null) {
      this.clonedMarkings.push(cloneDeep(marking));
    } else {
      marking.name = this.getMarkingText(marking, 'MarkingName');
      marking.filename = this.getMarkingText(marking, 'MarkingFile');
      marking.additionalText = this.getMarkingText(marking, 'MarkingAdditionalText');
      this.clonedMarkings.push(cloneDeep(marking));
    }
  }

  onRowEditSave(marking: any) {
    if (this.editableNode != null) {
      // Werte übernehmen
      const markingFound = this.editableNode.value.find((m: any) => m.tempId === marking.tempId);
      this.setMarkingText(markingFound, 'MarkingName', marking.name);
      // this.setMarkingText(markingFound, 'MarkingFile', marking.filename);
      this.setMarkingText(markingFound, 'MarkingAdditionalText', marking.additionalText);

      this.clonedMarkings = this.clonedMarkings.filter((m) => m.tempId !== marking.tempId);

      delete marking['name'];
      delete marking['filename'];
      delete marking['additionalText'];
      delete marking['tempId'];

      // datei?!?
      const m = marking.value?.find((sme: any) => sme.idShort === 'MarkingFile');
      const mf = markingFound.value?.find((sme: any) => sme.idShort === 'MarkingFile');
      if (m != null) {
        mf.mimeType = m.mimeType;
        mf.value = m.value;
      }
    }
    if (this.nameplate != null) {
      void marking.initEclass(this.eclassExplanationService).then(() => this.changeDetector.detectChanges());
      this.clonedMarkings = this.clonedMarkings.filter((m) => m.tempId !== marking.tempId);
    }
  }

  onRowEditCancel(marking: Marking) {
    if (this.nameplate != null) {
      const markingFound = this.nameplate.markings.find((m: any) => m.tempId === marking.tempId);
      if (markingFound != null) {
        Object.assign(markingFound, marking);
        this.clonedMarkings = this.clonedMarkings.filter((m) => m.tempId !== marking.tempId);
      }
    } else {
      const markingFound = this.editableNode.value.find((m: any) => m.tempId === marking.tempId);
      if (markingFound != null) {
        Object.assign(markingFound, marking);
        this.clonedMarkings = this.clonedMarkings.filter((m) => m.tempId !== marking.tempId);
      }
    }
  }

  async addMarking() {
    if (this.selectedMarkingToAdd != null && this.selectedMarkingToAdd.filename !== '') {
      const blob = await lastValueFrom(
        this.http.get('/assets/markings/' + this.selectedMarkingToAdd.filename, {
          responseType: 'blob' as any,
        }),
      );
      const file = new File([blob], this.selectedMarkingToAdd.filename, {
        type: (blob as any).type,
      });
      const newMarking = new Marking();
      newMarking.filename = `/aasx/files/${this.selectedMarkingToAdd.filename}`;
      newMarking.additionalText = this.selectedMarkingToAdd.additionalText;
      newMarking.name = this.selectedMarkingToAdd.irdi;
      newMarking.file = file;
      newMarking.mimeType = (blob as any).type;
      this.generatorStateStore.setFileAttachment(newMarking.filename, file);

      void newMarking.initEclass(this.eclassExplanationService).then(() => this.changeDetector.detectChanges());
      if (this.nameplate != null && this.selectedMarkingToAdd != null) {
        if (this.nameplate.markings == null) {
          this.nameplate.markings = [];
        }
        this.nameplate.markings.push(newMarking);
      } else {
        this.editableNode.value.push(
          await newMarking.toDto(
            this.editableNode.value.length,
            this.appConfigService.config.apiPath,
            this.portalService.iriPrefix,
            this.http,
          ),
        );

        const fr = new FileResult();
        fr.contentType = file.type;
        fr.file = file;
        fr.fileName = file.name;
        fr.isLocal = true;
        fr.isThumbnail = false;
        fr.mlGenUuid = uuid();
        fr.filePath = newMarking.filename;
        this.aasSharedDataService.addedFiles.push(fr);
        this.aasSharedDataService.currentAas.value?.supplementalFiles.push(fr);

        this.aasSharedDataService.refreshTree.next(true);
        this.aasSharedDataService.selectUuid.next({ uuid: this.editableNode.mlGenUuid, expand: true });
      }

      this.selectedMarkingToAdd = undefined;
      this.initFiles();
    } else if (this.selectedMarkingToAdd != null && this.selectedMarkingToAdd.filename === '') {
      const newMarking = new Marking();
      newMarking.filename = '';
      newMarking.additionalText = this.selectedMarkingToAdd.additionalText;
      newMarking.name = this.selectedMarkingToAdd.irdi;
      newMarking.file = undefined;

      if (this.nameplate != null) {
        if (this.nameplate.markings == null) {
          this.nameplate.markings = [];
        }
        this.nameplate.markings.push(newMarking);
      } else {
        this.editableNode.value.push(
          await newMarking.toDto(
            this.editableNode.value.length,
            this.appConfigService.config.apiPath,
            this.portalService.iriPrefix,
            this.http,
          ),
        );
        this.aasSharedDataService.refreshTree.next(true);
        this.aasSharedDataService.selectUuid.next({ uuid: this.editableNode.mlGenUuid, expand: true });
      }
      this.selectedMarkingToAdd = undefined;
    }
  }

  async deleteMarking(marking: Marking) {
    // unterscheidung ob wir im assistenten oder generisch unterwegs sind!
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_MARKING_Q'),
      })
    ) {
      if (this.nameplate != null) {
        this.nameplate.markings = this.nameplate.markings.filter((m: any) => m !== marking);
      }
      if (this.editableNode != null) {
        this.editableNode.value = this.editableNode.value.filter((m: any) => m !== marking);
      }
    }
  }
  setMarkingFile(event: { files: File[] }, markingElement: any) {
    if (this.nameplate != null) {
      markingElement.file = event.files[0];
      markingElement.filename = `/aasx/files/${FilenameHelper.sanitizeFilename(event.files[0].name)}`;
    }
    if (this.editableNode != null) {
      const aasStructure = this.aasSharedDataService.currentAas.value;
      if (aasStructure != null) {
        const existingFile = this.aasSharedDataService.addedFiles.find((f) => f.filePath === this.editableNode.value);
        if (existingFile != null) {
          const indx = this.aasSharedDataService.addedFiles.indexOf(existingFile);
          this.aasSharedDataService.addedFiles.splice(indx, 1);
          const indxSupplementalFile = aasStructure.supplementalFiles.findIndex(
            (f) => f.filePath === this.editableNode.value && f.isLocal === true,
          );
          if (indxSupplementalFile !== -1) {
            aasStructure.supplementalFiles.splice(indxSupplementalFile, 1);
          }
        }
        // prüfen, ob es ein Serverseitiges file gab, dann muss dieses in deleted files
        const supplementalFile = aasStructure.supplementalFiles.find(
          (f) => f.filePath === this.editableNode.value && f.isLocal !== true,
        );
        if (supplementalFile != null) {
          const indxSupplementalFile = aasStructure.supplementalFiles.indexOf(supplementalFile);

          aasStructure.supplementalFiles.splice(indxSupplementalFile, 1);
          this.aasSharedDataService.removedFiles.push(supplementalFile);
        }

        let newFileName = event.files[0].name;
        let newFilePath = `/aasx/files/${FilenameHelper.sanitizeFilename(newFileName)}`;
        // prüfen, ob mit dem selben Dateinamen bereits eine Datei vorhanden ist!
        const existing = aasStructure.supplementalFiles.filter((f) => f.filePath === newFilePath);
        if (existing != null && existing.length > 0) {
          newFileName = `${FilenameHelper.getNameWithoutExt(newFileName)}${
            existing.length
          }${FilenameHelper.getExtension(newFileName)}`;
          newFilePath = `/aasx/files/${FilenameHelper.sanitizeFilename(newFileName)}`;
        }

        const userFile: FileResult = {
          contentType: event.files[0].type,
          file: event.files[0],
          filePath: newFilePath,
          fileName: FilenameHelper.sanitizeFilename(newFileName),
          size: event.files[0].size.toString(),
          isThumbnail: false,
          modelType: { name: 'SupplementalFile' },
          isLocal: true,
          mlGenUuid: uuid(),
        };

        this.aasSharedDataService.addedFiles.push(userFile);
        aasStructure.supplementalFiles.push(userFile);

        markingElement.value.find((me: any) => me.idShort === 'MarkingFile').mimeType = userFile.contentType;
        markingElement.value.find((me: any) => me.idShort === 'MarkingFile').value = userFile.filePath;

        this.aasSharedDataService.refreshSupplementalFiles.next(true);
        this.initFiles();
      }
    }
  }

  getMarkingText(marking: any, type: string) {
    let m = marking.value?.find((sme: any) => sme.idShort === type);
    if (m != null) return m.value ?? '';
    m = marking.value?.find((sme: any) => sme.idShort.startsWith(type));
    return m?.value ?? '';
  }

  setMarkingText(marking: any, type: string, value: string | undefined) {
    let m = marking.value?.find((sme: any) => sme.idShort === type);
    if (m != null) {
      m.value = value;
    }
    m = marking.value?.find((sme: any) => sme.idShort.startsWith(type));
    if (m != null) {
      m.value = value;
    }
  }

  onModelChange(event: any, marking: any, type: string) {
    const el = marking.value?.find((sme: any) => sme.idShort === type);
    if (el != null) {
      el.value = event.value;
    }
  }
}
