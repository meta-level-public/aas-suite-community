import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'aas-plugin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly loadedAt = new Date().toLocaleString();
  readonly backendMessage = signal('Loading backend plugin...');

  constructor() {
    void this.loadBackendMessage();
  }

  private async loadBackendMessage() {
    const designerApiPrefix = window.location.pathname.split('/system-management-api/')[0];
    const response = await fetch(`${designerApiPrefix}/plugin-api/hello-world-demo/message`);
    if (!response.ok) {
      this.backendMessage.set('Backend plugin endpoint is not available.');
      return;
    }

    const result = (await response.json()) as { message?: string };
    this.backendMessage.set(result.message ?? 'Backend plugin returned no message.');
  }
}