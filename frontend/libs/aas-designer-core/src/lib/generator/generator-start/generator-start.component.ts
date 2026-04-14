import { BreadcrumbService } from '@aas/aas-designer-shared';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Steps } from 'primeng/steps';
import { filter, Subscription } from 'rxjs';
import { GeneratorService } from '../generator.service';

@Component({
  selector: 'aas-designer-start',
  templateUrl: './generator-start.component.html',
  styleUrls: ['../../../host.scss', './generator-start.component.scss'],
  imports: [Steps, RouterOutlet, TranslateModule],
  host: {
    class: 'flex flex-col flex-1 min-h-0',
  },
})
export class GeneratorStartComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  activeIndex: number = 0;
  showStepper: boolean = true;
  private routerSub?: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private translate: TranslateService,
    private router: Router,
    private generatorService: GeneratorService,
  ) {
    this.breadcrumbService.setItems([{ label: translate.instant('GENERATOR') }]);
  }

  ngOnInit() {
    this.rebuildItems();
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.rebuildItems());
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  private rebuildItems() {
    this.showStepper = !this.router.url.includes('/select-type');

    this.generatorService.rebuildGeneratorFlow();
    this.items = this.generatorService.generatorFlowSteps.map((step) => ({
      label: step.label ?? this.translate.instant(step.labelKey ?? ''),
      routerLink: this.toRouterLink(step.routeCommands),
    }));
  }

  private toRouterLink(routeCommands: Array<string | number>) {
    return routeCommands
      .slice(1)
      .map((segment) => `${segment}`)
      .join('/');
  }
}
