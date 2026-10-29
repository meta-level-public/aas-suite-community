import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom } from 'rxjs';
import { DialogFooter } from '../dialog-footer/dialog-footer.component';
import { ShellSelectResult } from './shell-select-result';
import { ShellSelectComponent } from './shell-select.component';

/**
 * Opens the AAS selection dialog for the shells of the current infrastructure.
 * Resolves with the selected shell or null when the dialog was closed without selection.
 */
export async function openShellSelectDialog(
  dialogService: DialogService,
  header: string,
): Promise<ShellSelectResult | null> {
  const ref = dialogService.open(ShellSelectComponent, {
    width: '50%',
    contentStyle: { overflow: 'auto' },
    baseZIndex: 10000,
    maximizable: true,
    header,
    templates: {
      footer: DialogFooter,
    },
    closable: true,
  });

  if (ref == null) return null;
  const result = await firstValueFrom(ref.onClose);
  return result instanceof ShellSelectResult ? result : null;
}
