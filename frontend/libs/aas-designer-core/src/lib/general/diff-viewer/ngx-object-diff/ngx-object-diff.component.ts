import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngx-object-diff',
  templateUrl: './ngx-object-diff.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./ngx-object-diff.component.scss'],
})
export class NgxObjectDiffComponent {
  @Input() public obj: any;
}
