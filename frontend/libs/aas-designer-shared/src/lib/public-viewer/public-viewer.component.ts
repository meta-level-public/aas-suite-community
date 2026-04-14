import { AasViewerStandaloneComponent } from '@aas/aas-viewer-standalone';
import { AppConfigService, PortalService } from '@aas/common-services';
import { AasViewerClient, SharedLinksClient, ViewerDescriptor, ViewerResultCode } from '@aas/webapi-client';
import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Password } from 'primeng/password';
import { Skeleton } from 'primeng/skeleton';
import { lastValueFrom } from 'rxjs';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';
import { PublicViewerService } from './public-viewer.service';

@Component({
  selector: 'aas-public-viewer',
  templateUrl: './public-viewer.component.html',
  styleUrls: ['../host.scss', './public-viewer.component.css'],
  imports: [
    Card,
    Password,
    FormsModule,
    Button,
    AasViewerStandaloneComponent,
    Skeleton,
    DisclaimerComponent,
    TranslateModule,
  ],
})
export class PublicViewerComponent implements OnInit, OnDestroy {
  accesscode: string = '';
  aasIdentifier: string | undefined;

  isLoaded: boolean = false;

  resultCode: 'OK' | 'NOTFOUND' | 'EXPIRED' | 'UNKNOWN' | 'WRONG_PASSWORD' = 'UNKNOWN';
  passwordRequired: boolean = false;

  password: string = '';
  loading: boolean = false;
  httpHeader: { key: string; value: string }[] = [];

  sharedLinksClient = inject(SharedLinksClient);
  aasRegistryUrl: string | undefined;

  viewerClient = inject(AasViewerClient);
  descriptor = signal<ViewerDescriptor | null>(null);

  constructor(
    private route: ActivatedRoute,
    private portalService: PortalService,
    private publicViewerService: PublicViewerService,
    public translate: TranslateService,
    public appConfigService: AppConfigService,
    private renderer: Renderer2,
  ) {}

  async ngOnInit() {
    // Set the overflow style of the body element to 'hidden'
    this.renderer.setStyle(document.body, 'overflow-y', 'auto');
    this.renderer.setStyle(document.body, 'overflow-x', 'hidden');

    this.loading = true;

    try {
      this.route.queryParams.subscribe((params) => {
        this.accesscode = params['accesscode'];
      });

      this.httpHeader = [{ key: 'accesscode', value: this.accesscode }];

      const result = await lastValueFrom(this.sharedLinksClient.sharedLinks_CheckValidity(this.accesscode));

      switch (result.resultCode) {
        case ViewerResultCode.OK:
          this.aasIdentifier = result.aasIdentifier;
          this.resultCode = 'OK';
          this.aasRegistryUrl = result.aasRegistryUrl;
          this.passwordRequired = result.loginRequired ?? false;
          if (!result.loginRequired) {
            const loginResult = await this.publicViewerService.login(this.accesscode, '');

            this.portalService.loginStateChanged.subscribe(async () => {
              this.isLoaded = true;
              this.loadViewerDescriptor();
            });
            if (loginResult.orgaSettings.length > 1) {
              alert('OrgaSettings: ' + JSON.stringify(loginResult.orgaSettings));
            } else {
              this.portalService.logIn(loginResult, loginResult.orgaSettings[0], false);
            }
          }
          break;
        case ViewerResultCode.NOTFOUND:
          this.resultCode = 'NOTFOUND';
          break;
        case ViewerResultCode.EXPIRED:
          this.resultCode = 'EXPIRED';
          break;
      }
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    // Reset the overflow style of the body element to its default value
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  async loadViewerDescriptor() {
    const descriptor = await lastValueFrom(this.viewerClient.aasViewer_GetViewerDescriptor(this.aasIdentifier));
    this.descriptor.set(descriptor);
  }

  async login() {
    try {
      const loginResult = await this.publicViewerService.login(this.accesscode, this.password);
      if (loginResult.orgaSettings.length > 1) {
        alert('OrgaSettings: ' + JSON.stringify(loginResult.orgaSettings));
      } else {
        this.portalService.logIn(loginResult, loginResult.orgaSettings[0], false);
        this.loadViewerDescriptor();
      }
      this.isLoaded = true;
      this.resultCode = 'OK';
    } catch {
      this.resultCode = 'WRONG_PASSWORD';
    }
  }

  get logoPath() {
    return this.appConfigService.config.logoPath !== '' && this.appConfigService.config.logoPath != null
      ? this.appConfigService.config.logoPath
      : 'logos/logo_aas-suite.svg';
  }
}
