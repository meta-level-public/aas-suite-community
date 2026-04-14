import { Directive, ElementRef, HostListener } from '@angular/core';
import { V3TreeService } from '../../v3-editor/v3-tree/v3-tree.service';

@Directive({
  selector: '[vwsV3Undo]',
  standalone: true,
})
export class V3UndoDirective {
  constructor(
    private el: ElementRef,
    private treeService: V3TreeService,
  ) {}

  @HostListener('change', ['$event'])
  registerUndoStep(_event: any) {
    this.treeService.registerFieldUndoStep();
  }

  @HostListener('ngModelChange', ['$event'])
  registerUndoStep1(_event: any) {
    if (
      this.el.nativeElement.localName === 'p-select' ||
      this.el.nativeElement.localName === 'p-datepicker' ||
      this.el.nativeElement.localName === 'p-checkbox'
    ) {
      setTimeout(() => {
        this.treeService.registerFieldUndoStep();
      });
    }
  }
}
