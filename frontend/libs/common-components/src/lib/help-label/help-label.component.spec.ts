import { NotificationService } from '@aas/common-services';
import { HelpTextDto } from '@aas/webapi-client';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Editor } from '@openng/optimus-ui/editor';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HelpEditModeService } from '../help-service/help-edit-mode.service';
import { HelpService } from '../help-service/help.service';
import { HelpLabelComponent } from './help-label.component';

describe('HelpLabelComponent', () => {
  let fixture: ComponentFixture<HelpLabelComponent>;
  let createdEditors: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Counts editor instances, also those that are created but never displayed
    createdEditors = vi.spyOn(Editor.prototype as any, 'onAfterContentInit');

    const helpText = new HelpTextDto();
    helpText.tag = 'AID_VIEWER_TITLE';
    (helpText as any).globalTextEn = '<p>Title of the interface</p>';
    (helpText as any).globalTextDe = '<p>Titel der Schnittstelle</p>';

    // help editors get an additional edit dialog
    window.sessionStorage.setItem('auth-user', JSON.stringify({ rollen: ['SYSTEM_HELP_EDITOR'] }));

    TestBed.configureTestingModule({
      imports: [HelpLabelComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: HelpService, useValue: { helpTexts: signal([helpText]) } },
        { provide: NotificationService, useValue: { showMessage: vi.fn() } },
      ],
    });
    fixture = TestBed.createComponent(HelpLabelComponent);
    fixture.componentRef.setInput('tag', 'AID_VIEWER_TITLE');
    fixture.componentInstance.langugage.set('en');
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.removeItem('auth-user');
    window.sessionStorage.removeItem('HELP_EDITMODE_ACTIVE');
    document.body.querySelectorAll('.p-dialog-mask, .p-dialog').forEach((dialog) => dialog.remove());
  });

  it('creates no editors while the help dialogs are closed', () => {
    expect(createdEditors).not.toHaveBeenCalled();
  });

  it('shows the help text when the help dialog is opened', async () => {
    fixture.componentInstance.helpDialogVisible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.body.querySelector('p-editor')).not.toBeNull();
    // Quill is loaded lazily by the editor
    await vi.waitFor(() => expect(document.body.textContent).toContain('Title of the interface'), { timeout: 3000 });
  });

  it('shows the edit button as soon as the help edit mode is switched on', async () => {
    const editButton = () => fixture.nativeElement.querySelector('p-button[icon="pi pi-pencil"]');
    expect(editButton()).toBeNull();

    TestBed.inject(HelpEditModeService).setActive(true);
    await fixture.whenStable();
    expect(editButton()).not.toBeNull();
    expect(window.sessionStorage.getItem('HELP_EDITMODE_ACTIVE')).toBe('true');

    TestBed.inject(HelpEditModeService).toggle();
    await fixture.whenStable();
    expect(editButton()).toBeNull();
    expect(window.sessionStorage.getItem('HELP_EDITMODE_ACTIVE')).toBe('false');
  });
});
