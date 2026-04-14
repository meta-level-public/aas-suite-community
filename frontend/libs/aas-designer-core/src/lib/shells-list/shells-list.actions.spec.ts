import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { SharedLinksClient, ShellsClient } from '@aas/webapi-client';

import { ShellsListActions } from './shells-list.actions';

describe('ShellsListActions', () => {
  let actions: ShellsListActions;

  const shellsClient = {
    shells_Delete: vi.fn(),
    shells_Duplicate: vi.fn(),
    shells_Create: vi.fn(),
    shells_Transfer: vi.fn(),
    shells_GetShellPlain: vi.fn(),
    shells_DeleteShellsBulk: vi.fn(),
    shells_DownloadShellsBulk: vi.fn(),
    shells_Discover: vi.fn(),
    shells_CreateInstance: vi.fn(),
  };

  const sharedLinksClient = {
    sharedLinks_CreateSharedLink: vi.fn(),
  };

  const confirmService = {
    confirm: vi.fn(),
  };

  const notificationService = {
    showMessageAlways: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ShellsListActions,
        { provide: ShellsClient, useValue: shellsClient },
        { provide: SharedLinksClient, useValue: sharedLinksClient },
        { provide: AasConfirmationService, useValue: confirmService },
        { provide: NotificationService, useValue: notificationService },
      ],
    });

    actions = TestBed.inject(ShellsListActions);
  });

  it('deletes a shell only after confirmation', async () => {
    confirmService.confirm.mockResolvedValue(true);
    shellsClient.shells_Delete.mockReturnValue(of(true));

    const result = await actions.deleteShell('shell-1', 'DELETE_SHELL_Q');

    expect(confirmService.confirm).toHaveBeenCalledWith({ message: 'DELETE_SHELL_Q' });
    expect(shellsClient.shells_Delete).toHaveBeenCalledWith('shell-1');
    expect(result).toBe(true);
  });

  it('does not delete a shell when confirmation is rejected', async () => {
    confirmService.confirm.mockResolvedValue(false);

    const result = await actions.deleteShell('shell-1', 'DELETE_SHELL_Q');

    expect(shellsClient.shells_Delete).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('returns null for bulk download without ids and shows a notification', async () => {
    const result = await actions.downloadBulk([]);

    expect(result).toBeNull();
    expect(notificationService.showMessageAlways).toHaveBeenCalledWith('NO_SHELLS_SELECTED', 'ERROR', 'error', false);
    expect(shellsClient.shells_DownloadShellsBulk).not.toHaveBeenCalled();
  });

  it('creates a shared link through the client', async () => {
    sharedLinksClient.sharedLinks_CreateSharedLink.mockReturnValue(of('https://example.test/share'));

    const result = await actions.createSharedLink({ aasIdentifier: 'shell-1' } as any);

    expect(sharedLinksClient.sharedLinks_CreateSharedLink).toHaveBeenCalled();
    expect(result).toBe('https://example.test/share');
  });

  it('creates a new aas and returns the resulting id', async () => {
    shellsClient.shells_Create.mockReturnValue(of({ aasId: 'new-shell-id' }));

    const result = await actions.createNewAas();

    expect(result).toBe('new-shell-id');
  });
});
