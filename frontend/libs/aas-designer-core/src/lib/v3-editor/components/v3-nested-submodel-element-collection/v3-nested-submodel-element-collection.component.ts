import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AasConfirmationService } from '@aas/common-services';
import { InstanceHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { Component, forwardRef, Input, QueryList, ViewChildren } from '@angular/core';
import { V3TreeService } from '../../v3-tree/v3-tree.service';

import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { FileContentEditorComponent } from '../v3-file-editor/file-content-editor/file-content-editor.component';
import { V3MlpCurrentEditorComponent } from '../v3-mlp-current-editor/v3-mlp-current-editor.component';
import { PropertyValueEditorComponent } from '../v3-property-editor/property-value-editor/property-value-editor.component';

@Component({
  selector: 'aas-v3-nested-submodel-element-collection',
  templateUrl: './v3-nested-submodel-element-collection.component.html',
  styleUrls: ['./v3-nested-submodel-element-collection.component.css'],
  imports: [
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    PropertyValueEditorComponent,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    TranslateModule,
    V3MlpCurrentEditorComponent,
    FileContentEditorComponent,
    Button,
    Select,
  ],
})
export class V3NestedSubmodelElementCollectionComponent {
  @Input({ required: true }) collection:
    | aas.types.SubmodelElementCollection
    | aas.types.SubmodelElementList
    | undefined
    | null;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) repositoryUrl: string = '';
  @Input() withIdShort: boolean = true;

  visible: boolean = true;
  expandedPanels: number[] = [];
  pageSizeOptions = [25, 50, 100, 250].map((value) => ({ label: `${value}`, value }));
  pageSize = 25;
  currentPage = 0;
  @ViewChildren(forwardRef(() => V3NestedSubmodelElementCollectionComponent))
  nestedCollections!: QueryList<V3NestedSubmodelElementCollectionComponent>;

  InstanceHelper = InstanceHelper;

  constructor(
    public treeService: V3TreeService,
    private confirmationService: AasConfirmationService,
    private translate: TranslateService,
  ) {}

  get items() {
    return this.collection?.value ?? [];
  }

  get totalItems() {
    return this.items.length;
  }

  get currentPageIndex() {
    return Math.min(this.currentPage, Math.max(this.totalPages - 1, 0));
  }

  get totalPages() {
    return this.totalItems === 0 ? 1 : Math.ceil(this.totalItems / this.pageSize);
  }

  get pageStart() {
    return this.totalItems === 0 ? 0 : this.currentPageIndex * this.pageSize;
  }

  get pageEnd() {
    return Math.min(this.pageStart + this.pageSize, this.totalItems);
  }

  get visibleItems() {
    return this.items.slice(this.pageStart, this.pageEnd);
  }

  get canGoToPreviousPage() {
    return this.currentPageIndex > 0;
  }

  get canGoToNextPage() {
    return this.currentPageIndex < this.totalPages - 1;
  }

  refresh() {
    this.visible = false;
    setTimeout(() => {
      this.visible = true;
      this.collapseAll();
    });
  }

  get isEclass() {
    const isclassificationElement = this.collection?.semanticId?.keys?.some((k) =>
      k.value.startsWith('https://admin-shell.io/ZVEI/TechnicalData/ProductClassificationItem/1/1'),
    );
    if (!isclassificationElement) return false;

    const classificationSystem = this.collection?.value?.find((v) =>
      v.semanticId?.keys?.some(
        (k) => k.value === 'https://admin-shell.io/ZVEI/TechnicalData/ProductClassificationSystem/1/1',
      ),
    ) as aas.types.Property;
    return classificationSystem?.value?.toLowerCase().includes('eclass');
  }

  getItemTitle(item: aas.types.ISubmodelElement, index: number): string {
    const absoluteIndex = this.pageStart + index;
    if (!this.withIdShort) {
      return `Element ${absoluteIndex + 1}`;
    }

    return item.idShort?.trim() ? item.idShort : `Element ${absoluteIndex + 1}`;
  }

  expandAll() {
    this.expandedPanels = this.visibleItems.map((_, index) => index);
    // Wait for newly expanded panel content to render nested accordions, then expand them too.
    setTimeout(() => {
      this.nestedCollections?.forEach((child) => {
        if (child !== this) {
          child.expandAll();
        }
      });
    });
  }

  collapseAll() {
    this.expandedPanels = [];
    this.nestedCollections?.forEach((child) => {
      if (child !== this) {
        child.collapseAll();
      }
    });
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.collapseAll();
  }

  goToPreviousPage() {
    if (!this.canGoToPreviousPage) {
      return;
    }

    this.currentPage = this.currentPageIndex - 1;
    this.collapseAll();
  }

  goToNextPage() {
    if (!this.canGoToNextPage) {
      return;
    }

    this.currentPage = this.currentPageIndex + 1;
    this.collapseAll();
  }

  async clearAllChildren() {
    if (this.collection == null || this.totalItems === 0) {
      return;
    }

    const accepted = await this.confirmationService.confirm({
      message: this.translate.instant('NESTED_COLLECTION_CLEAR_ALL_CONFIRM'),
      header: this.translate.instant('CONFIRM'),
    });

    if (!accepted) {
      return;
    }

    this.collection.value = null;
    this.currentPage = 0;
    this.collapseAll();
    this.refresh();
    this.treeService.refreshWholeTree();
  }
}
