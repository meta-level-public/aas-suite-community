import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { HandoverClassificationEntry, HandoverDocumentationService } from '../handover-documentation.service';
import { HandoverStructureMode } from '../structure-mode';

@Component({
  selector: 'aas-handover-doc-classifications',
  templateUrl: './document-classifications.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule],
})
export class DocumentClassificationsComponent {
  // --- Input ---------------------------------------------------------------
  private _document = signal<aas.types.SubmodelElementCollection | undefined>(undefined);
  @Input() set document(val: aas.types.SubmodelElementCollection | undefined) {
    this._document.set(val);
  }
  @Input() submodelVersion?: string;

  // --- Sprache -------------------------------------------------------------
  private lang = signal<string>('en');

  // --- Modus (V1 vs V2) ---------------------------------------------------
  @Input() mode: HandoverStructureMode = HandoverStructureMode.UNKNOWN;

  private handoverSvc = inject(HandoverDocumentationService);

  // Public classification list; parsing lives in the service so the viewer hero uses the same logic
  classifications = computed<HandoverClassificationEntry[]>(() =>
    this.handoverSvc.extractClassifications(this._document(), this.mode, this.lang()),
  );

  // --- Konstruktor --------------------------------------------------------
  constructor(private translate: TranslateService) {
    this.lang.set((this.translate.currentLang || this.translate.getDefaultLang() || 'en').toLowerCase());
    this.translate.onLangChange.subscribe((ev) => this.lang.set(ev.lang.toLowerCase()));
  }
}
