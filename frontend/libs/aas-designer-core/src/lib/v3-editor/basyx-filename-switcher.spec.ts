import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ShellResult } from '@aas/model';
import { BasyxFilenameSwitcher } from './basyx-filename-switcher';

describe('BasyxFilenameSwitcher', () => {
  it('updates thumbnail paths alongside the stored filenames', () => {
    const shellResult = new ShellResult();
    const shell = new aas.types.AssetAdministrationShell(
      'aas-id',
      new aas.types.AssetInformation(aas.types.AssetKind.Instance, 'asset-id'),
    );

    shell.assetInformation.defaultThumbnail = new aas.types.Resource('file:/aasx/files/thumb.png', 'image/png');

    shellResult.v3Shell = new aas.types.Environment([shell], []);
    shellResult.supplementalFiles = [
      {
        filename: 'thumb.png',
        path: '/aasx/files/thumb.png',
      },
    ] as never;

    BasyxFilenameSwitcher.switchFilenames({ 'thumb.png': 'thumb-renamed.png' }, shellResult);

    expect(shell.assetInformation.defaultThumbnail?.path).toBe('file:/aasx/files/thumb-renamed.png');
    expect(shellResult.supplementalFiles[0].filename).toBe('thumb-renamed.png');
    expect(shellResult.supplementalFiles[0].path).toBe('/aasx/files/thumb-renamed.png');
  });

  it('ignores supplemental files without a path', () => {
    const shellResult = new ShellResult();
    shellResult.supplementalFiles = [
      {
        filename: 'thumb.png',
        path: undefined,
      },
    ] as never;

    expect(() => {
      BasyxFilenameSwitcher.switchFilenames({ 'thumb.png': 'thumb-renamed.png' }, shellResult);
    }).not.toThrow();

    expect(shellResult.supplementalFiles[0].filename).toBe('thumb-renamed.png');
    expect(shellResult.supplementalFiles[0].path).toBe('');
  });
});
