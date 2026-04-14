import { AssetAdministrationShell } from '@aas-core-works/aas-core3.1-typescript/types';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AasViewerStandaloneComponent } from '@aas/aas-viewer-standalone';
import { AasViewerClient } from '@aas/webapi-client';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-instance-viewer',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ToolbarModule,
    InputTextModule,
    AasViewerStandaloneComponent,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './instance-viewer.component.html',
})
export class InstanceViewerComponent {
  aasId = signal('');
  url = signal('');
  inputUrl = model('');

  http = inject(HttpClient);
  translate = inject(TranslateService);
  viewerClient = inject(AasViewerClient);

  async loadData() {
    let inputUrl = this.inputUrl();
    if (!inputUrl.endsWith('/aas')) {
      inputUrl += '/aas';
    }
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      inputUrl = 'http://' + inputUrl;
    }
    this.url.set(inputUrl);

    const res = await lastValueFrom(this.http.get<AssetAdministrationShell>(inputUrl));

    this.aasId.set(res.id);
  }

  descriptor = computed(async () => {
    return await lastValueFrom(this.viewerClient.aasViewer_GetViewerDescriptor(this.aasId()));
  });
}
