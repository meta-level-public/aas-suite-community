import { Directive, ElementRef, HostListener } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { AasSharedDataService } from '../../asset-administration-shell-tree/services/aas-shared-data.service';

@Directive({ selector: '[vwsUndo]' })
export class UndoDirective {
  constructor(
    private el: ElementRef,
    private aasSharedDataService: AasSharedDataService,
  ) {}

  @HostListener('change', ['$event'])
  registerUndoStep(_event: any) {
    if (this.aasSharedDataService.currentAas.value != null) {
      this.aasSharedDataService.undoEntries.next({
        aas: cloneDeep(this.aasSharedDataService.currentAas.value),
        selectedUuid: this.aasSharedDataService.currentEditableNode.value.mlGenUuid,
        ts: new Date(),
        id: this.el.nativeElement.value,
        submodel: this.aasSharedDataService.currentEditableNode.value.modelType?.name === 'Submodel' ? true : null,
      });
    }
  }

  @HostListener('ngModelChange', ['$event'])
  registerUndoStep1(event: any) {
    if (
      this.el.nativeElement.localName === 'p-select' ||
      this.el.nativeElement.localName === 'p-select' ||
      this.el.nativeElement.localName === 'p-select' ||
      this.el.nativeElement.localName === 'p-datepicker' ||
      this.el.nativeElement.localName === 'p-checkbox'
    ) {
      setTimeout(() => {
        if (this.aasSharedDataService.currentAas.value != null) {
          this.aasSharedDataService.undoEntries.next({
            aas: cloneDeep(this.aasSharedDataService.currentAas.value),
            selectedUuid: this.aasSharedDataService.currentEditableNode.value.mlGenUuid,
            ts: new Date(),
            id: event,
            submodel: this.aasSharedDataService.currentEditableNode.value.modelType?.name === 'Submodel' ? true : null,
          });
        }
      });
    }
  }
}
