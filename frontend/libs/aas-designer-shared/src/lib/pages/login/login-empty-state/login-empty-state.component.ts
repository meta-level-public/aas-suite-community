import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';

@Component({
  selector: 'aas-login-empty-state',
  imports: [TranslateModule, ButtonModule],
  templateUrl: './login-empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login-empty-state.component.scss',
})
export class LoginEmptyStateComponent {
  showRegistrationOption = input(false);
  showContactOption = input(false);

  registrationRequested = output<void>();
  contactRequested = output<void>();
}
