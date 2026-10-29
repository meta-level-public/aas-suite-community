import { Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
import { ViewerStoreService } from '../viewer-store.service';

@Component({
  selector: 'aas-open-shell-button',
  templateUrl: './open-shell-button.component.html',
  // Renders an addon of the surrounding p-inputgroup, so the host must not create its own box
  host: { class: 'contents' },
  imports: [ButtonModule, InputGroupAddon, TooltipModule, TranslateModule],
})
export class OpenShellButtonComponent {
  aasId = input<string | null | undefined>(null);
  globalAssetId = input<string | null | undefined>(null);

  private viewerStore = inject(ViewerStoreService);

  canOpen = computed(
    () => this.viewerStore.shellNavigator() != null && !!(this.aasId()?.trim() || this.globalAssetId()?.trim()),
  );

  open() {
    void this.viewerStore.shellNavigator()?.({ aasId: this.aasId(), globalAssetId: this.globalAssetId() });
  }
}
