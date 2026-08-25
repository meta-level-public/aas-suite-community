import { normalizePluginRoute, PluginMenuItem, PluginRegistryService } from '@aas/common-services';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-plugin-host',
  templateUrl: './plugin-host.component.html',
  styleUrls: ['./plugin-host.component.scss', '../../../host.scss'],
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PluginHostComponent {
  private readonly pluginRegistry = inject(PluginRegistryService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  readonly plugin = computed(() => this.resolvePlugin());
  readonly pluginUrl = computed(() => {
    const plugin = this.plugin();
    return plugin == null ? null : this.sanitizer.bypassSecurityTrustResourceUrl(plugin.entryPointUrl);
  });

  private resolvePlugin(): PluginMenuItem | null {
    const route = normalizePluginRoute(this.router.url.split('?')[0].split('#')[0]);
    return this.pluginRegistry.findByRoute(route);
  }
}
