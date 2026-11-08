import { SharedLoginPageComponent } from '@aas/aas-designer-shared';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SharedLoginPageComponent],
})
export class AppLoginComponent {
  protected readonly router = inject(Router);

  protected async navigateToInitialRoute() {
    await this.router.navigate(['/shells-list']);
  }
}
