import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'aas-plugin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly loadedAt = new Date().toLocaleString();
}