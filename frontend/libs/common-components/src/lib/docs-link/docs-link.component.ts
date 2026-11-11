import { DocsTopic, UserDocsService } from '@aas/common-services';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Inline link to a page of the user documentation, e.g. in dialogs or empty states.
 * Pass the page created with docsTopic, optionally with a heading anchor such as designer/pcn#eingehende-mitteilungen.
 * The link is hidden if no documentation is configured for the installation.
 */
@Component({
  selector: 'lib-docs-link',
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docs-link.component.html',
})
export class DocsLinkComponent {
  private readonly userDocsService = inject(UserDocsService);

  readonly topic = input.required<DocsTopic>();
  /** Translation key of the link text */
  readonly label = input('MORE_IN_USER_DOCUMENTATION');

  // The app config is loaded in an app initializer, i.e. before any view using this link is rendered
  readonly url = computed(() => this.userDocsService.urlFor(this.topic()));
}
