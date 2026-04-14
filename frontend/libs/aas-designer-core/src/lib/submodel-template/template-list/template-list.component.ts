import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService } from '@aas/common-services';
import { AasMetamodelVersion } from '@aas/model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Textarea } from 'primeng/textarea';
import { SubmodelTemplate } from '@aas-designer-model';
import { SubmodelTemplateService } from '../submodel-template.service';

@Component({
  selector: 'aas-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [
    Button,
    Button,
    TableModule,
    PrimeTemplate,
    Menu,
    Dialog,
    FileUpload,
    FormsModule,
    InputText,
    Select,
    Textarea,
    TranslateModule,
    DateProxyPipe,
  ],
})
export class TemplateListComponent implements OnInit {
  templates: SubmodelTemplate[] = [];
  loading: boolean = false;
  menuItems: MenuItem[] = [];
  loadingDownload: boolean = false;
  displayUploadDialog: boolean = false;

  name: string = '';
  filename: string = '';
  semanticIds: string = '';
  label: string = '';
  version: AasMetamodelVersion = AasMetamodelVersion.V3;
  group = '';
  versionOptions: AasMetamodelVersion[] = [AasMetamodelVersion.V2, AasMetamodelVersion.V3];
  file: File | null = null;
  files: File[] = [];
  displayEditDialog: boolean = false;
  displayBulkDialog: boolean = false;
  editSmt: SubmodelTemplate | null = null;

  @ViewChild('bulkUploader') bulkFileUpload: FileUpload | undefined;
  @ViewChild('uploader') uploader: FileUpload | undefined;

  constructor(
    private submodelTemplateService: SubmodelTemplateService,
    private translate: TranslateService,
    private confirmationService: AasConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.templates = await this.submodelTemplateService.getAll();
    } finally {
      this.loading = false;
    }
  }

  onShowActions(submodelTemplate: SubmodelTemplate) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: () => {
          this.showEditDialog(submodelTemplate);
        },
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          if (submodelTemplate.id != null) {
            this.deleteSubmodelTemplate(submodelTemplate.id);
          }
        },
      },
      {
        label: this.translate.instant('DOWNLOAD'),
        icon: 'pi pi-download',
        command: () => {
          if (submodelTemplate.id != null) {
            this.download(submodelTemplate.id);
          }
        },
      },
    ];
  }

  fileSelected(event: { files: File[] }) {
    this.file = event.files[0];
    this.filename = event.files[0].name;
  }

  async doUpload() {
    if (this.file != null) {
      try {
        this.loading = true;
        await this.submodelTemplateService.upload(
          this.file,
          this.filename,
          this.name,
          this.label,
          this.semanticIds,
          this.version,
          this.group,
        );

        // erstmal komplette tabelle, später vielleicht anhand der id
        this.loadData();
        this.displayUploadDialog = false;
        this.uploader?.clear();
      } finally {
        this.loading = false;
      }
    }
  }

  bulkFileSelected(event: { files: File[]; currentFiles: File[] }) {
    this.files = event.currentFiles;
  }

  async doBulkUpload() {
    try {
      this.loading = true;
      await this.submodelTemplateService.bulkUpload(this.files, this.version, this.group);

      // erstmal komplette tabelle, später vielleicht anhand der id
      await this.loadData();
      this.displayBulkDialog = false;
      this.bulkFileUpload?.clear();
    } finally {
      this.loading = false;
    }
  }

  async deleteSubmodelTemplate(id: number) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_SUBMODEL_TEMPLATE_Q'),
      })
    ) {
      await this.submodelTemplateService.delete(id);
      this.loadData();
    }
  }

  async download(id: number) {
    try {
      this.loadingDownload = true;
      const response = await this.submodelTemplateService.download(id);

      let fileName = 'file';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = fileNameRegex.exec(contentDisposition);
        if (matches?.[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      const fileContent = response.body;
      const blob = new Blob([fileContent], {
        type: 'application/octet-stream',
      });

      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;

      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } finally {
      this.loadingDownload = false;
    }
  }

  showUploadDialog() {
    this.displayUploadDialog = true;
    this.file = null;
    this.filename = '';
    this.label = '';
    this.name = '';
    this.semanticIds = '';
  }

  showEditDialog(smt: SubmodelTemplate) {
    this.displayEditDialog = true;
    this.editSmt = smt;
  }

  async doEdit() {
    if (this.editSmt != null) {
      try {
        this.loading = true;
        await this.submodelTemplateService.edit(this.editSmt);

        // erstmal komplette tabelle, später vielleicht anhand der id
        this.loadData();
        this.displayEditDialog = false;
      } finally {
        this.loading = false;
      }
    }
  }
}
