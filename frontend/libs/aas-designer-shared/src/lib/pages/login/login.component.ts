import { NewsItem } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { SystemConfigurationDto, SystemManagementClient } from '@aas/webapi-client';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ContactFormComponent } from '../../contact/contact-form/contact-form.component';
import { DisclaimerComponent } from '../../disclaimer/disclaimer.component';
import { LoginBrandFooterComponent } from './login-brand-footer/login-brand-footer.component';
import { LoginNewsPanelComponent } from './login-news-panel/login-news-panel.component';
import { LoginSsoComponent } from './login-sso/login-sso.component';
import { LoginService } from './login.service';

@Component({
  selector: 'aas-login-page',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    ButtonModule,
    DisclaimerComponent,
    LoginBrandFooterComponent,
    LoginSsoComponent,
    LoginNewsPanelComponent,
    ContactFormComponent,
  ],
})
export class SharedLoginPageComponent implements OnInit {
  navigateAuthenticated = input.required<() => Promise<void>>();
  showLogo = input(false);
  showSupportActions = input(true);

  private readonly systemManagementClient = inject(SystemManagementClient);
  private readonly route = inject(ActivatedRoute);
  private readonly loginService = inject(LoginService);

  protected readonly portalService = inject(PortalService);
  protected readonly appConfigService = inject(AppConfigService);
  protected readonly router = inject(Router);

  newsItems = signal<NewsItem[]>([]);
  currentNewsIndex = signal(0);
  isAnimating = signal(false);
  activeView = signal<'sso' | 'contact'>('sso');
  topic = signal<'register' | 'other'>('other');
  systemConfiguration = signal<SystemConfigurationDto | null>(null);

  routeId = computed(() => this.route.snapshot.params['id']);
  currentNews = computed(() => {
    const items = this.newsItems();
    const index = this.currentNewsIndex();
    return items.length > 0 ? items[items.length - 1 - index] : null;
  });
  showRegistrationOption = computed(
    () =>
      this.showSupportActions() &&
      this.appConfigService.config.useContactForm !== 'false' &&
      this.systemConfiguration()?.singleTenantMode === false,
  );
  showContactOption = computed(
    () => this.showSupportActions() && this.systemConfiguration()?.singleTenantMode === false,
  );
  hasMultipleNews = computed(() => this.newsItems().length > 1);
  canNavigateBack = computed(() => this.currentNewsIndex() > 0);
  canNavigateForward = computed(() => this.currentNewsIndex() < this.newsItems().length - 1);

  async ngOnInit() {
    if (this.portalService.user != null) {
      await this.navigateAuthenticated()();
      return;
    }

    await this.loadNews();
    await this.loadSystemConfiguration();

    if (this.routeId() === 'register') {
      this.topic.set('register');
      this.activeView.set('contact');
    }
  }

  async loadNews() {
    try {
      const news = await this.loginService.getNews();
      this.newsItems.set(news);
    } catch {
      this.newsItems.set([]);
    }
  }

  async loadSystemConfiguration() {
    try {
      const config = await this.systemManagementClient.systemManagement_GetConfiguration().toPromise();
      this.systemConfiguration.set(config ?? null);
    } catch {
      // keep default behavior when config endpoint is not available
    }
  }

  openContactDialog() {
    this.topic.set('other');
    this.activeView.set('contact');
  }

  openRegistrationDialog() {
    this.topic.set('register');
    this.activeView.set('contact');
  }

  backToSso() {
    this.activeView.set('sso');
  }

  nextNews() {
    if (this.canNavigateForward()) {
      this.triggerAnimation();
      this.currentNewsIndex.update((index) => index + 1);
    }
  }

  previousNews() {
    if (this.canNavigateBack()) {
      this.triggerAnimation();
      this.currentNewsIndex.update((index) => index - 1);
    }
  }

  private triggerAnimation() {
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 600);
  }
}
