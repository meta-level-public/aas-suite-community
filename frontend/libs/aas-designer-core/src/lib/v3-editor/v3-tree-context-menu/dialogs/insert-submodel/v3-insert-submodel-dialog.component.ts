import { Component, effect, inject, Input, model, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HelpLabelComponent } from '@aas/common-components';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TableRowExpandEvent } from 'primeng/table';
import { SubmodelTemplate } from '@aas-designer-model';
import { CMTypeOption } from '../../../model/cm-type-option';
import { V3EditorService } from '../../../v3-editor.service';
import { AvailableSubmodel } from '../../available-submodel';

@Component({
  selector: 'aas-v3-insert-submodel-dialog',
  templateUrl: './v3-insert-submodel-dialog.component.html',
  styleUrls: ['./v3-insert-submodel-dialog.component.css'],

  imports: [TranslateModule, DialogModule, TableModule, ButtonModule, InputTextModule, HelpLabelComponent],
})
export class V3InsertSubmodelDialogComponent {
  editorService = inject(V3EditorService);
  translate = inject(TranslateService);

  visible = model<boolean>(false);
  isLoading = signal<boolean>(false);

  @Input() availableSubmodels: { label: string; submodels: AvailableSubmodel[]; id?: string }[] = [];

  idtaSmtRepoTemplates = signal<SubmodelTemplate[]>([]);

  // Signal-based result for signal-friendly consumption
  selectedSubmodel = model<AvailableSubmodel | null>(null);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.initIdtaRepoTemplates();
      }
    });
  }

  private initIdtaRepoTemplates() {
    var parent = this.availableSubmodels.find((s) => s.id === 'IdtaSmtRepo');
    if (parent) {
      parent.submodels = [];
      for (const tpl of this.idtaSmtRepoTemplates()) {
        parent.submodels.push({
          label: tpl.name,
          submodelVersion: tpl.submodelVersion,
          translatedLabel: this.translate.instant(tpl.label),
          description: tpl.label,
          createElement: CMTypeOption.RepoSubmodelTemplate,
          group: tpl.group,
          id: tpl.id ?? 0,
          smUrl: tpl.url,
          sourceAasIdShort: tpl.sourceAasIdShort,
        });
      }
      parent.submodels.sort((a, b) => a.label.localeCompare(b.label));
    }
  }

  onHide() {
    this.visible.set(false);
  }

  onApply(element: AvailableSubmodel) {
    this.selectedSubmodel.set(element);
  }

  getEventValue(event: any): string {
    return event?.target?.value ?? '';
  }

  getSourceAasIdShort(element: AvailableSubmodel): string | null {
    if (element.sourceAasIdShort?.trim()) {
      return element.sourceAasIdShort.trim();
    }
    return null;
  }

  async checkForIdtaLive(_event: TableRowExpandEvent) {
    // hier, falls noch nicht geladen, die IDTA-SMTs laden
    var currentTmpl = this.idtaSmtRepoTemplates();
    if (!currentTmpl || (currentTmpl.length === 0 && !this.isLoading())) {
      this.isLoading.set(true);
      var tmpl = await this.editorService.getIdtaSmtRepoTemplates();
      this.idtaSmtRepoTemplates.set(tmpl);
      this.initIdtaRepoTemplates();
    }

    this.isLoading.set(false);
  }
}
