import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileComponent } from './profile.component';
import { ProfileService } from './profile.service';

describe('ProfileComponent profile image', () => {
  const user = { name: 'Muster', vorname: 'Kim', loginName: 'kim@example.com', profilbildBase64: 'data:old' };
  const profileService = { checkEmail: vi.fn().mockResolvedValue(true), saveProfile: vi.fn().mockResolvedValue(true) };

  function createComponent() {
    TestBed.configureTestingModule({
      providers: [
        { provide: ProfileService, useValue: profileService },
        { provide: NotificationService, useValue: { showMessageAlways: vi.fn() } },
        { provide: PortalService, useValue: { user: { ...user }, saveUser: vi.fn() } },
        { provide: AppConfigService, useValue: { config: {} } },
      ],
    });
    const component = TestBed.runInInjectionContext(
      () =>
        new ProfileComponent(
          TestBed.inject(ProfileService),
          TestBed.inject(NotificationService),
          TestBed.inject(PortalService),
          TestBed.inject(AppConfigService),
        ),
    );
    component.ngOnInit();
    return component;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('enables saving if only the image was deleted', () => {
    const component = createComponent();
    expect(component.profilbildChanged).toBe(false);

    component.deleteProfileImage();

    expect(component.profilbildChanged).toBe(true);
  });

  it('restores the previous image when the chosen file is removed', () => {
    const component = createComponent();
    (component as unknown as { profilbildBeforeSelection: string }).profilbildBeforeSelection = 'data:old';
    component.profile.profilbildBase64 = 'data:new';

    component.discardSelectedProfilbild();

    expect(component.profile.profilbildBase64).toBe('data:old');
    expect(component.profilbildChanged).toBe(false);
  });

  it('keeps a deleted image deleted if no file was chosen', () => {
    const component = createComponent();
    component.deleteProfileImage();

    component.discardSelectedProfilbild();

    expect(component.profile.profilbildBase64).toBe('');
  });

  it('takes the saved image as new reference', async () => {
    const component = createComponent();
    component.profile.profilbildBase64 = 'data:new';

    await component.save();

    expect(profileService.saveProfile).toHaveBeenCalled();
    expect(component.profilbildChanged).toBe(false);
  });
});
