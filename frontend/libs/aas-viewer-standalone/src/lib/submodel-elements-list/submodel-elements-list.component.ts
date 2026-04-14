import {
  Component,
  ComponentRef,
  Input,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  inject,
  AfterViewInit,
  ViewContainerRef,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'aas-submodel-elements-list',
  templateUrl: './submodel-elements-list.component.html',
  styleUrls: ['./submodel-elements-list.component.css'],
  imports: [],
})
export class SubmodelElementsListComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) elements: any[] = [];
  @Input({ required: true }) idShortPath: string = '';
  @Input({ required: true }) submodelId: string = '';
  @Input() withIdShort: boolean = true;
  @Input() fallbackLabel?: string;

  @ViewChildren('container', { read: ViewContainerRef }) containers!: QueryList<ViewContainerRef>;

  private cdr = inject(ChangeDetectorRef);
  private componentRefs: ComponentRef<any>[] = [];

  async ngAfterViewInit() {
    // Dynamically load GenericViewerComponent to avoid circular dependency
    const { GenericViewerComponent } = await import('../generic-viewer/generic-viewer.component');

    this.containers.forEach((container, index) => {
      const el = this.elements[index];
      const componentRef = container.createComponent(GenericViewerComponent);
      componentRef.setInput('rowData', el);
      componentRef.setInput('idShortPath', this.buildIdShortPath(el, index));
      componentRef.setInput('submodelId', this.submodelId);
      if (this.fallbackLabel) {
        componentRef.setInput('fallbackLabel', this.fallbackLabel + ' ' + (index + 1));
      }
      this.componentRefs.push(componentRef);
    });

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.componentRefs.forEach((ref) => ref.destroy());
  }

  buildIdShortPath(el: any, index: number): string {
    if (this.withIdShort) {
      return this.idShortPath === '' ? (el.idShort ?? '') : this.idShortPath + '.' + el.idShort;
    } else {
      return this.idShortPath === ''
        ? '[' + index + ']' + (el.idShort ? '.' + el.idShort : '')
        : this.idShortPath + '[' + index + ']' + (el.idShort ? '.' + el.idShort : '');
    }
  }
}
