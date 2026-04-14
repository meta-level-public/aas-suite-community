import { FilenameHelper } from '@aas/helpers';
import { PackageMetadata, ShellResult, SupplementalFile } from '@aas/model';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver-es';
import { FileUpload } from 'primeng/fileupload';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3EditorService } from '../../v3-editor.service';
import { V3TreeService } from '../../v3-tree/v3-tree.service';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Image } from 'primeng/image';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';

@Component({
  selector: 'aas-v3-shells',
  templateUrl: './v3-shells.component.html',
  imports: [
    Fieldset,
    FormsModule,
    InputText,
    V3UndoDirective,
    NullIfEmptyDirective,
    Tag,
    Button,
    FileUpload,
    Image,
    Skeleton,
    TranslateModule,
  ],
})
export class V3ShellsComponent implements OnInit {
  @Input() shellParent: V3TreeItem<PackageMetadata> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;

  loading: boolean = false;
  fileData: Blob | null = null;
  fileUrl: SafeResourceUrl | null = null;
  @ViewChild('uploader') uploader: FileUpload | undefined;
  thumbFileName: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    private editorService: V3EditorService,
    private treeService: V3TreeService,
  ) {}

  ngOnInit(): void {
    this.loadFile();
  }

  async loadFile() {
    // check if value starts with file: ( könnte eine absolute ressource sein!)

    const file = this.shellResult?.supplementalFiles.find((f) => f.isThumbnail === true);
    if (file?.file != null) {
      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(await FilenameHelper.buildPreviewImageBlob(file.file)),
      );
      this.thumbFileName = file.filename;
    } else {
      try {
        this.loading = true;
        this.thumbFileName = file?.filename ?? this.thumbFileName;

        const aasIdentifier = this.shellResult?.v3Shell?.assetAdministrationShells?.[0]?.id;
        if (aasIdentifier != null && aasIdentifier !== '') {
          this.fileData = await this.editorService.downloadThumbByAasIdentifier(aasIdentifier);
        } else {
          this.fileData = await this.editorService.downloadThumb(this.shellResult?.id ?? -1);
        }

        if (this.fileData != null) {
          const previewFileName = (file?.filename ?? this.thumbFileName) || 'thumbnail';
          const previewContentType = (file?.contentType ?? this.fileData.type) || 'application/octet-stream';
          const previewBlob = await FilenameHelper.buildPreviewImageBlob(
            new File([this.fileData], previewFileName, {
              type: previewContentType,
            }),
          );
          this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(previewBlob));
        }
      } finally {
        this.loading = false;
      }
    }
  }

  downloadFile() {
    if (this.fileData != null) {
      saveAs(this.fileData, this.thumbFileName);
    }
  }

  async setFile(event: { files: File[] }) {
    const selectedFile = event.files?.[0];
    if (selectedFile == null) {
      return;
    }

    // prüfen ob es ein vorangegangens file in addedFiles gab, dann muss dieses entfernt werden
    const existingFile = this.shellResult?.addedFiles.find((f) => f.isThumbnail === true);
    if (existingFile != null) {
      const indx = this.shellResult?.addedFiles.indexOf(existingFile) ?? -1;
      this.shellResult?.addedFiles.splice(indx, 1);
      const indxSupplementalFile =
        this.shellResult?.supplementalFiles.findIndex((f) => f.isThumbnail && f.isLocal === true) ?? -1;
      if (indxSupplementalFile !== -1) {
        this.shellResult?.supplementalFiles.splice(indxSupplementalFile, 1);
      }
      this.treeService.deleteFileNode(existingFile);
    }
    // prüfen, ob es ein Serverseitiges file gab, dann muss dieses in deleted files
    const supplementalFile = this.shellResult?.supplementalFiles.find(
      (f) => f.isThumbnail === true && f.isLocal !== true,
    );
    if (supplementalFile != null) {
      const indxSupplementalFile = this.shellResult?.supplementalFiles.indexOf(supplementalFile) ?? -1;

      this.shellResult?.supplementalFiles.splice(indxSupplementalFile, 1);
      this.shellResult?.deletedFiles.push(supplementalFile);
      this.treeService.deleteFileNode(supplementalFile);
    }

    let newFileName = selectedFile.name;
    let newFilePath = `file:/aasx/files/${FilenameHelper.sanitizeFilename(newFileName)}`;

    let existing = this.shellResult?.supplementalFiles.filter(
      (f) => f.path === FilenameHelper.replaceFileUri(newFilePath),
    );
    if (existing != null && existing.length !== 0) {
      let isUnique = false;
      let i = 1;
      while (!isUnique) {
        const testFilename = `${FilenameHelper.getNameWithoutExt(newFileName)}${i}${FilenameHelper.getExtension(
          newFileName,
        )}`;
        const testFilePath = `file:/aasx/files/${FilenameHelper.sanitizeFilename(testFilename)}`;
        existing = this.shellResult?.supplementalFiles.filter(
          (file) => file.path === FilenameHelper.replaceFileUri(testFilePath),
        );
        if (existing != null && existing.length !== 0) {
          i++;
        } else {
          isUnique = true;
          newFileName = `${FilenameHelper.getNameWithoutExt(newFileName)}${i}${FilenameHelper.getExtension(
            newFileName,
          )}`;
          newFilePath = `file:/aasx/files/${FilenameHelper.sanitizeFilename(newFileName)}`;
        }
      }
    }

    const userFile: SupplementalFile = {
      contentType: FilenameHelper.getContentType(selectedFile),
      file: selectedFile,
      path: FilenameHelper.replaceFileUri(newFilePath) ?? '',
      filename: FilenameHelper.sanitizeFilename(newFileName),
      fileApiUrl: '',
      isThumbnail: true,
      isLocal: true,
      isLoaded: true,
      isLoading: false,
      fileUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(await FilenameHelper.buildPreviewImageBlob(selectedFile)),
      ),
      fileData: null,
      id: null,
    };

    this.shellResult?.addedFiles.push(userFile);
    this.shellResult?.supplementalFiles.push(userFile);
    this.treeService.addFileNode(userFile);

    this.uploader?.clear();

    this.loadFile();
  }

  getTagSeverity(type: 'PRIVATE' | 'ORGANISATION') {
    if (type === 'PRIVATE') {
      return 'success';
    } else {
      return 'info';
    }
  }
}
