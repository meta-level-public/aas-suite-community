import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, TreeNode } from 'primeng/api';

import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';
import { HandoverdocumentationDocumentAddonComponent } from '../../v3-editor/addons/handoverdocumentation-document-addon/handoverdocumentation-document-addon.component';
import { GeneratorPageShellComponent } from '../generator-page-shell/generator-page-shell.component';
import { GeneratorService } from '../generator.service';
import { HandoverDocumentsStepComponent } from '../handover-documents-step/handover-documents-step.component';
import { DocumentItem } from '../model/document-item';

@Component({
  selector: 'aas-document',
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
  host: {
    class: 'flex flex-col flex-1',
  },
  imports: [
    Button,
    TranslateModule,
    GeneratorPageShellComponent,
    HandoverDocumentsStepComponent,
    SidebarTreeNavComponent,
  ],
})
export class DocumentComponent implements OnInit {
  readonly documentsNodeKey = 'documents';
  ref: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private generatorService: GeneratorService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    if (this.generatorService.getCurrentGeneratorRootShell() == null) {
      this.router.navigate(['generator', 'select-type']);
    }
  }

  nextPage() {
    this.generatorService.navigateToNextGeneratorFlowStep(this.router, 'document', ['generator', 'confirmation']);
  }

  prevPage() {
    this.generatorService.navigateToPreviousGeneratorFlowStep(this.router, 'document', ['generator', 'nameplate']);
  }

  get documents() {
    return this.generatorService.getCurrentGeneratorDocumentItems();
  }

  get handoverSemanticId() {
    return this.generatorService.getCurrentGeneratorDocumentationSemanticId();
  }

  get documentNodes(): TreeNode[] {
    return [
      {
        key: this.documentsNodeKey,
        label: 'DOCUMENTS',
        data: {
          description: 'BATTERY_PASSPORT_HANDOVER_DOCUMENTS_EXPL',
          descriptionTranslate: true,
        },
        selectable: true,
      },
    ];
  }

  get activeDocumentNodeKey() {
    return this.documentsNodeKey;
  }

  get activeStepPosition() {
    return 0;
  }

  get pageDescriptionKey() {
    return 'BATTERY_PASSPORT_HANDOVER_EXPL';
  }

  get nextLabel() {
    const nextStep = this.generatorService.generatorFlowSteps.find((step) => step.id === 'confirmation');
    if (nextStep?.labelKey != null && nextStep.labelKey !== '') {
      return nextStep.labelKey;
    }

    return 'NEXT';
  }

  getEventValue(event: any): string {
    return event.target.value;
  }

  selectDocumentNode(_node: TreeNode) {}

  delete(documentItem: DocumentItem) {
    this.confirmationService.confirm({
      message: this.translate.instant('REMOVE_DOCUMENT_Q'),
      header: this.translate.instant('CONFIRMATION'),

      accept: async () => {
        this.generatorService.removeDocumentItem(documentItem);
      },
    });
  }

  edit(document: DocumentItem) {
    const index = this.documents.indexOf(document);
    if (index === -1) {
      return;
    }

    this.openDocumentDialog(document, index);
  }

  add() {
    this.openDocumentDialog();
  }

  private openDocumentDialog(document?: DocumentItem, index?: number) {
    this.ref = this.dialogService.open(HandoverdocumentationDocumentAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant(index == null ? 'ADD_DOCUMENT' : 'EDIT'),
      closable: true,
      modal: true,
      data: {
        count: this.documents.length,
        document,
      },
    });

    this.ref?.onClose.subscribe((documentItem: DocumentItem | null) => {
      if (documentItem == null) {
        return;
      }

      this.generatorService.addOrReplaceDocumentItem(documentItem, index);
    });
  }
}
