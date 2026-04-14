import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';
import { BatteryEditorTreeItem } from '../battery-editor-field-utils';
import { BatteryEditorSharedFieldComponent } from '../battery-editor-shared-field/battery-editor-shared-field.component';
import {
  GeneratorFileUploadCardComponent,
  type GeneratorFileUploadCardState,
} from '../generator-file-upload-card/generator-file-upload-card.component';
import { GeneratorPageShellComponent } from '../generator-page-shell/generator-page-shell.component';

@Component({
  selector: 'aas-submodel-editor-host',
  templateUrl: './submodel-editor-host.component.html',
  styleUrl: './submodel-editor-host.component.scss',
  imports: [
    Button,
    TranslateModule,
    BatteryEditorSharedFieldComponent,
    GeneratorFileUploadCardComponent,
    GeneratorPageShellComponent,
    SidebarTreeNavComponent,
  ],
})
export class SubmodelEditorHostComponent {
  @Input() titleKey = '';
  @Input() subtitle = '';
  @Input() nodes: TreeNode<BatteryEditorTreeItem<any>>[] = [];
  @Input() activeItemKey: string | null = null;
  @Input() activeItem: BatteryEditorTreeItem<any> | null = null;
  @Input() activeFields: any[] = [];
  @Input() activeStepLabel = '1';
  @Input() unknownDebugJson: string | null = null;
  @Input() unsupportedFieldPaths: string[] = [];
  @Input() referenceTypeOptions: Array<{ label: string; value: number }> = [];
  @Input() keyTypeOptions: Array<{ label: string; value: number }> = [];
  @Input() conceptDescriptions: aas.types.ConceptDescription[] = [];
  @Input() fieldIdPrefix = 'submodel';
  @Input() nextLabel = 'NEXT';
  @Input() fileUploadCardStateFactory: ((field: any) => GeneratorFileUploadCardState) | null = null;

  @Output() nodeSelected = new EventEmitter<TreeNode<BatteryEditorTreeItem<any>>>();
  @Output() prevRequested = new EventEmitter<void>();
  @Output() nextRequested = new EventEmitter<void>();
  @Output() fieldChanged = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<{ field: any; event: any }>();
  @Output() removeRequested = new EventEmitter<any>();

  get showSidebar() {
    return this.nodes.length > 0;
  }

  getFileUploadCardState(field: any) {
    return this.fileUploadCardStateFactory?.(field) ?? null;
  }

  onNodeSelected(node: TreeNode<BatteryEditorTreeItem<any>>) {
    this.nodeSelected.emit(node);
  }

  onPrevRequested() {
    this.prevRequested.emit();
  }

  onNextRequested() {
    this.nextRequested.emit();
  }

  onFieldChanged() {
    this.fieldChanged.emit();
  }

  onFileSelected(field: any, event: any) {
    this.fileSelected.emit({ field, event });
  }

  onRemoveRequested(field: any) {
    this.removeRequested.emit(field);
  }
}
