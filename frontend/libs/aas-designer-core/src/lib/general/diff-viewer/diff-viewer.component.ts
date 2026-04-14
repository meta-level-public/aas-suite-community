import { Component, input, Input } from '@angular/core';
import { NgxObjectDiffComponent } from './ngx-object-diff/ngx-object-diff.component';
import { NgxObjectDiffService } from './ngx-object-diff/ngx-object-diff.service';

@Component({
  selector: 'aas-diff-viewer',
  templateUrl: './diff-viewer.component.html',
  imports: [NgxObjectDiffComponent],
})
export class DiffViewerComponent {
  @Input() object1: any;
  @Input() object2: any;
  showFullObject = input(true);
  showChanges = input(true);
  object1View: any;
  object2View: any;
  diffValueChanges: any;
  diffView: string | null = null;

  constructor(private objectDiff: NgxObjectDiffService) {}

  diff() {
    if (this.object1 != null && this.object2 != null) {
      // This is required only if you want to show a JSON formatted view of your object
      this.object1View = this.objectDiff.objToJsonView(this.object1);
      this.object2View = this.objectDiff.objToJsonView(this.object2);

      // you can directly diff your objects js now or parse a Json to object and diff
      const diff = this.objectDiff.diff(this.object1, this.object2);
      // you can directly diff your objects including prototype properties and inherited properties using `diff` method
      // const diffAll = this.objectDiff.diff(this.object1, this.object2);

      // gives a full object view with Diff highlighted
      this.diffView = this.objectDiff.toJsonView(diff);
      // gives object view with only Diff highlighted
      this.diffValueChanges = this.objectDiff.toJsonDiffView(diff);
    }
  }
}
