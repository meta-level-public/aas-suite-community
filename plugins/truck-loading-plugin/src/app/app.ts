import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LabelSheetComponent } from './label-sheet/label-sheet.component';
import { SlotId } from './loading-model';
import { PartSearchComponent } from './part-search/part-search.component';
import { SlotPanelComponent } from './slot-panel/slot-panel.component';
import { TruckBedComponent } from './truck-bed/truck-bed.component';
import { BOX_COUNT, TruckDemoService } from './truck-demo.service';

type View = 'loading' | 'labels' | 'presentation';

const PRESENTATION_REFRESH_MS = 5000;

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    LabelSheetComponent,
    PartSearchComponent,
    SlotPanelComponent,
    TruckBedComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly demo = inject(TruckDemoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly boxCount = BOX_COUNT;
  protected readonly view = signal<View>('loading');
  protected readonly selectedSlot = signal<SlotId | null>(null);
  protected readonly selectedState = computed(
    () => this.demo.slots().find((state) => state.slot === this.selectedSlot()) ?? null,
  );

  private refreshTimer: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    void this.demo.init();
    this.destroyRef.onDestroy(() => this.stopRefresh());
  }

  protected showView(view: View): void {
    this.view.set(view);
    this.stopRefresh();
    if (view === 'presentation') {
      // Im Vorführmodus Änderungen von anderen Geräten (Handy, Tablet) übernehmen.
      this.refreshTimer = setInterval(() => {
        if (!this.demo.busy()) {
          void this.demo.refresh();
        }
      }, PRESENTATION_REFRESH_MS);
    }
  }

  protected selectInfrastructure(id: number): void {
    this.selectedSlot.set(null);
    void this.demo.selectInfrastructure(id);
  }

  private stopRefresh(): void {
    clearInterval(this.refreshTimer);
    this.refreshTimer = undefined;
  }
}
