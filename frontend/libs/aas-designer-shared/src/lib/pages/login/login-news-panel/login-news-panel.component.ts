import { NewsItem } from '@aas-designer-model';
import { DateProxyPipe } from '@aas/common-pipes';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { LoginEmptyStateComponent } from '../login-empty-state/login-empty-state.component';

@Component({
  selector: 'aas-login-news-panel',
  templateUrl: './login-news-panel.component.html',
  styleUrl: './login-news-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, ButtonModule, EditorModule, DateProxyPipe, LoginEmptyStateComponent],
})
export class LoginNewsPanelComponent {
  news = input.required<NewsItem | null>();
  isAnimating = input(false);
  hasMultipleNews = input(false);
  currentNewsIndex = input(0);
  totalNewsCount = input(0);
  canNavigateBack = input(false);
  canNavigateForward = input(false);
  showRegistrationOption = input(false);
  showContactOption = input(false);

  previousRequested = output<void>();
  nextRequested = output<void>();
  registrationRequested = output<void>();
  contactRequested = output<void>();

  requestPrevious() {
    this.previousRequested.emit();
  }

  requestNext() {
    this.nextRequested.emit();
  }

  requestRegistration() {
    this.registrationRequested.emit();
  }

  requestContact() {
    this.contactRequested.emit();
  }
}
