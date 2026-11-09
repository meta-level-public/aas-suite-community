import { DynamicDialogConfig } from '@openng/optimus-ui/dynamicdialog';

/**
 * Dialog settings for an AAS opened via the global `openViewer` event (e.g. a linked AAS from Hierarchical
 * Structures), shared by every place that listens to it.
 *
 * Several listeners can be alive at the same time (the designer's viewer host and every open viewer). The first one
 * claims the event, so a click opens exactly one dialog.
 */
export function claimOpenViewerEvent(event: Event): DynamicDialogConfig {
  event.stopImmediatePropagation();

  return {
    header: 'AAS Viewer',
    width: '75%',
    contentStyle: { overflow: 'auto' },
    styleClass: 'viewerDialog',
    baseZIndex: 10000,
    maximizable: true,
    closable: true,
    closeOnEscape: true,
    data: {
      viewerDescriptor: (event as CustomEvent).detail?.viewerDescriptor,
    },
  };
}
