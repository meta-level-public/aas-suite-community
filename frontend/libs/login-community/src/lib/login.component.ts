import { SharedLoginPageComponent } from '@aas/aas-designer-shared';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
        min-width: 0;
        min-height: 0;
      }

      aas-login-page {
        display: block;
        height: 100%;
        width: 100%;
        min-height: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SharedLoginPageComponent],
})
export class AppLoginComponent {
  protected readonly router = inject(Router);

  protected async navigateToInitialRoute() {
    await this.router.navigate(['/shells-list']);
  }
}
