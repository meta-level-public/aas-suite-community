import { claimOpenViewerEvent } from './aas-viewer-dialog.config';

describe('claimOpenViewerEvent', () => {
  it('opens a closable dialog with the viewer descriptor of the event', () => {
    const descriptor = { aasId: 'urn:smartcar:aas:type:dht11:01' };

    const config = claimOpenViewerEvent(new CustomEvent('openViewer', { detail: { viewerDescriptor: descriptor } }));

    expect(config.closable).toBe(true);
    expect(config.closeOnEscape).toBe(true);
    expect(config.data?.viewerDescriptor).toBe(descriptor);
  });

  it('lets only the first listener open a dialog', () => {
    const configs: unknown[] = [];
    const first = (event: Event) => configs.push(claimOpenViewerEvent(event));
    const second = (event: Event) => configs.push(claimOpenViewerEvent(event));
    window.addEventListener('openViewer', first);
    window.addEventListener('openViewer', second);

    try {
      window.dispatchEvent(new CustomEvent('openViewer', { detail: { viewerDescriptor: {} } }));
    } finally {
      window.removeEventListener('openViewer', first);
      window.removeEventListener('openViewer', second);
    }

    expect(configs).toHaveLength(1);
  });
});
