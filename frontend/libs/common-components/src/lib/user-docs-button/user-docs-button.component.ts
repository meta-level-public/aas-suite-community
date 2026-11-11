import { DOCS_CONTEXT, resolveDocsTopic, UserDocsService } from '@aas/common-services';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

/**
 * Topbar button that opens the page of the user documentation matching the current route.
 * The mapping of routes to pages comes from DOCS_CONTEXT; the button is hidden if no documentation is configured.
 */
@Component({
  selector: 'lib-user-docs-button',
  imports: [TranslateModule, ButtonModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-docs-button.component.html',
})
export class UserDocsButtonComponent {
  private readonly userDocsService = inject(UserDocsService);
  private readonly docsContext = inject(DOCS_CONTEXT);
  private readonly router = inject(Router);

  // The app config is loaded in an app initializer, i.e. before the topbar is rendered
  readonly available = this.userDocsService.isAvailable();

  open() {
    this.userDocsService.open(resolveDocsTopic(this.router.url, this.docsContext));
  }
}
