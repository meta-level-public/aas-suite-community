import { Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LoadedPart } from '../loading-model';
import { PartCandidate, PartSearchComponent } from '../part-search/part-search.component';
import { BoxState, SlotState, TruckDemoService } from '../truck-demo.service';

/** Details zu einem Stellplatz: Kiste zuordnen, Inhalt ansehen, Teile ein- und ausladen. */
@Component({
  selector: 'app-slot-panel',
  imports: [FormsModule, PartSearchComponent],
  templateUrl: './slot-panel.component.html',
  styleUrl: './slot-panel.component.scss',
})
export class SlotPanelComponent {
  protected readonly demo = inject(TruckDemoService);

  readonly state = input.required<SlotState>();

  /** Kisten, die auf diesen Platz gestellt werden können: die aktuelle und alle abgeladenen. */
  protected readonly selectableBoxes = computed(() => {
    const current = this.state().box;
    return [...(current ? [current] : []), ...this.demo.boxesOffTruck()];
  });

  protected changeBox(aasId: string | null): void {
    const box = this.demo.boxes().find((entry) => entry.aasId === aasId) ?? null;
    void this.demo.setSlot(this.state().slot, box);
  }

  protected load(box: BoxState, candidate: PartCandidate): void {
    void this.demo.loadPart(box, {
      name: candidate.name,
      sourceIdShort: candidate.idShort,
      globalAssetId: candidate.globalAssetId,
      aasId: candidate.aasId,
      infrastructureId: candidate.infrastructureId,
      viewerLink: this.demo.viewerLink(candidate.infrastructureId, candidate.aasId),
      loadedAt: new Date().toISOString(),
    });
  }

  protected unload(box: BoxState, part: LoadedPart): void {
    void this.demo.unloadPart(box, part.idShort);
  }

  protected partLink(part: LoadedPart): string | null {
    if (part.aasId && part.infrastructureId !== undefined) {
      return this.demo.viewerLink(part.infrastructureId, part.aasId);
    }
    return part.viewerLink ?? null;
  }

  protected boxLink(box: BoxState): string | null {
    const infrastructureId = this.demo.infrastructureId();
    return infrastructureId === null ? null : this.demo.viewerLink(infrastructureId, box.aasId);
  }
}
