import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DisclaimerComponent } from '../../../disclaimer/disclaimer.component';

@Component({
  selector: 'aas-login-brand-footer',
  templateUrl: './login-brand-footer.component.html',
  styleUrl: './login-brand-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DisclaimerComponent],
})
export class LoginBrandFooterComponent {}
