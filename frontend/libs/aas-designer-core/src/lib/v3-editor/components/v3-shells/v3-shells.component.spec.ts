import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { FilenameHelper } from '@aas/helpers';
import { V3ShellsComponent } from './v3-shells.component';

describe('V3ShellsComponent', () => {
  const sanitizer = {
    bypassSecurityTrustResourceUrl: (value: string) => value,
  };

  const treeService = {
    deleteFileNode: () => undefined,
    addFileNode: () => undefined,
  };

  it('loads the thumbnail via aas identifier when the V3 shell is available', async () => {
    const downloadThumbByAasIdentifier = vi.fn(async () => new Blob(['thumb'], { type: 'image/png' }));
    const downloadThumb = vi.fn(async () => new Blob(['legacy'], { type: 'image/png' }));
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:thumb');

    const component = new V3ShellsComponent(
      sanitizer as never,
      {
        downloadThumbByAasIdentifier,
        downloadThumb,
      } as never,
      treeService as never,
    );

    component.shellResult = {
      id: 0,
      supplementalFiles: [
        {
          filename: 'thumb.png',
          isThumbnail: true,
        },
      ],
      v3Shell: {
        assetAdministrationShells: [
          new aas.types.AssetAdministrationShell(
            'aas-identifier',
            new aas.types.AssetInformation(aas.types.AssetKind.Instance, 'asset-id'),
          ),
        ],
      },
    } as never;

    await component.loadFile();

    expect(downloadThumbByAasIdentifier).toHaveBeenCalledWith('aas-identifier');
    expect(downloadThumb).not.toHaveBeenCalled();
    expect(component.thumbFileName).toBe('thumb.png');
    expect(component.fileUrl).toBe('blob:thumb');

    createObjectUrlSpy.mockRestore();
  });

  it('falls back to the legacy thumbnail endpoint when no aas identifier is available', async () => {
    const downloadThumbByAasIdentifier = vi.fn(async () => new Blob(['thumb'], { type: 'image/png' }));
    const downloadThumb = vi.fn(async () => new Blob(['legacy'], { type: 'image/png' }));
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:legacy');

    const component = new V3ShellsComponent(
      sanitizer as never,
      {
        downloadThumbByAasIdentifier,
        downloadThumb,
      } as never,
      treeService as never,
    );

    component.shellResult = {
      id: 42,
      supplementalFiles: [],
      v3Shell: null,
    } as never;

    await component.loadFile();

    expect(downloadThumb).toHaveBeenCalledWith(42);
    expect(downloadThumbByAasIdentifier).not.toHaveBeenCalled();
    expect(component.fileUrl).toBe('blob:legacy');

    createObjectUrlSpy.mockRestore();
  });

  it('accepts tiff thumbnails as images', () => {
    expect(FilenameHelper.isImage('thumbnail.tiff')).toBe(true);
    expect(FilenameHelper.isImage('thumbnail.tif')).toBe(true);
    expect(FilenameHelper.isImageContentType('image/tiff')).toBe(true);
  });
});
