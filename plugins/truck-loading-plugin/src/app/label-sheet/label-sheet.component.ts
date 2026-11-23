import { Component, effect, inject, signal } from '@angular/core';
import QRCode from 'qrcode';

import { TruckDemoService } from '../truck-demo.service';

interface Label {
  key: string;
  title: string;
  subtitle: string;
  url: string;
  qr: string;
  kind: 'truck' | 'box';
}

/**
 * Druckansicht für QR-Etiketten. Maße in Millimetern:
 * Kisten 18 × 24 mm (Seitenfläche 22 × 40 mm), Lkw 30 × 38 mm.
 * Der QR-Code führt zum Viewer der jeweiligen AAS.
 */
@Component({
  selector: 'app-label-sheet',
  templateUrl: './label-sheet.component.html',
  styleUrl: './label-sheet.component.scss',
})
export class LabelSheetComponent {
  private readonly demo = inject(TruckDemoService);

  protected readonly labels = signal<Label[]>([]);

  constructor() {
    effect(() => {
      const infrastructureId = this.demo.infrastructureId();
      const truck = this.demo.truck();
      const boxes = this.demo.boxes();
      if (infrastructureId === null) {
        this.labels.set([]);
        return;
      }
      const entries: Omit<Label, 'qr'>[] = [
        ...(truck
          ? [
              {
                key: truck.id,
                title: 'Demo-Lkw',
                subtitle: 'Ladung als AAS',
                url: this.demo.viewerLink(infrastructureId, truck.id),
                kind: 'truck' as const,
              },
            ]
          : []),
        ...boxes.map((box) => ({
          key: box.aasId,
          title: box.label,
          subtitle: 'Kiste',
          url: this.demo.viewerLink(infrastructureId, box.aasId),
          kind: 'box' as const,
        })),
      ];
      void this.render(entries);
    });
  }

  protected print(): void {
    window.print();
  }

  private renderToken = 0;

  private async render(entries: Omit<Label, 'qr'>[]): Promise<void> {
    const token = ++this.renderToken;
    const labels = await Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        qr: await QRCode.toDataURL(entry.url, { margin: 0, scale: 10, errorCorrectionLevel: 'M' }),
      })),
    );
    if (token === this.renderToken) {
      this.labels.set(labels);
    }
  }
}
