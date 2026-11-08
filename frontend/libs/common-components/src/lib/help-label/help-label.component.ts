import { NotificationService } from '@aas/common-services';
import { HelpTextDto } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { EditorModule } from '@openng/optimus-ui/editor';
import { FloatLabelModule } from '@openng/optimus-ui/floatlabel';
import { PopoverModule } from '@openng/optimus-ui/popover';
import { SelectModule } from '@openng/optimus-ui/select';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { HelpEditModeService } from '../help-service/help-edit-mode.service';
import { HelpService } from '../help-service/help.service';

@Component({
  selector: 'lib-help-label',
  host: {
    '[style.display]': '!showLabel() ? "inline-flex" : null',
    '[style.order]': '!showLabel() ? "1" : null',
    '[style.margin-left]': '!showLabel() ? "0.25rem" : null',
    '[style.flex-shrink]': '!showLabel() ? "0" : null',
  },
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    PopoverModule,
    SelectModule,
    TextareaModule,
    FloatLabelModule,
    DialogModule,
    EditorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-label.component.html',
})
export class HelpLabelComponent {
  for = input<string>('help-label');
  tag = input.required<string>();
  styleClass = input<string>();
  isLabelBold = input<string>();
  showLabel = input<boolean>(true);
  width = input<string>('w-48');

  helpService = inject(HelpService);
  private readonly helpEditMode = inject(HelpEditModeService);

  editDialogVisible = model(false);
  helpDialogVisible = model(false);

  translate = inject(TranslateService);

  languages = signal<{ label: string; code: string }[]>([
    { label: this.translate.instant('ENGLISCH'), code: 'en' },
    { label: this.translate.instant('DEUTSCH'), code: 'de' },
  ]);
  langugage = model<string>(this.translate.currentLang);

  loading = signal(false);

  notificationService = inject(NotificationService);

  calculatedStyle = linkedSignal<string>(() => {
    const styleClass = this.styleClass() ?? '';

    if (!this.showLabel()) {
      return `${styleClass} inline-flex items-center gap-1 h-auto`;
    }

    const widthClass = this.isLabelBold() === 'true' ? '' : this.width();
    return `${styleClass} flex items-center gap-1 ${widthClass} h-12`;
  });

  currentHelpItem = linkedSignal(() => {
    return this.helpService.helpTexts().find((h) => h.tag === this.tag());
  });

  currentHelpEditItem = linkedSignal(() => {
    const item = new HelpTextDto();
    Object.assign(item, this.currentHelpItem());
    item.tag = this.tag();
    return item;
  });

  currentOrgaEditField = linkedSignal(() => {
    return 'orgaText' + this.langugage()[0].toUpperCase() + this.langugage()[1].toLowerCase();
  });
  currentGlobalEditField = linkedSignal(() => {
    return 'globalText' + this.langugage()[0].toUpperCase() + this.langugage()[1].toLowerCase();
  });

  elRef = inject(ElementRef);

  constructor() {
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe((event) => {
      this.langugage.set(event.lang);
    });
  }

  currentGloabalText = computed(() => {
    return (this.currentHelpItem() as any)?.[this.currentGlobalEditField()];
  });
  currentOrgaText = computed(() => {
    return (this.currentHelpItem() as any)?.[this.currentOrgaEditField()];
  });

  showHelp(event: any) {
    // Show help
    this.helpDialogVisible.set(true);
    event.stopPropagation();
  }

  editHelp(event: any) {
    // Show edit
    this.editDialogVisible.set(true);
    event.stopPropagation();
  }

  cancelEditHelp() {
    this.editDialogVisible.set(false);
    const item = new HelpTextDto();
    Object.assign(item, this.currentHelpItem());
    this.currentHelpEditItem.set(item);
  }

  isOrgaEditable() {
    const settings = window.sessionStorage.getItem('CURRENT_ORGA_SETTINGS');
    if (settings) {
      const rollen = JSON.parse(settings).rollen;
      if (rollen.includes('ORGA_HELP_EDITOR')) {
        return true;
      }
    }

    return false;
  }
  isSystemEditable() {
    const user = window.sessionStorage.getItem('auth-user');
    if (user) {
      const userObj = JSON.parse(user);
      const rollen = userObj.rollen;

      if (rollen?.includes('SYSTEM_HELP_EDITOR')) {
        return true;
      }
    }
    return false;
  }

  isEditmode() {
    // Signal read, so the OnPush view updates as soon as the edit mode is toggled
    return this.helpEditMode.isActive();
  }

  async saveHelpText() {
    const helpText = this.currentHelpEditItem();
    if (helpText != null) {
      try {
        this.loading.set(true);
        await lastValueFrom(this.helpService.helpClient.helpInternal_UpdateHelpEntry(helpText));
        this.notificationService.showMessageAlways('SUCCESS_UPDATE', 'SUCCESS', 'success', false);
        this.editDialogVisible.set(false);
        this.helpService.initHelp();
      } finally {
        this.loading.set(false);
      }
    }
  }
}
