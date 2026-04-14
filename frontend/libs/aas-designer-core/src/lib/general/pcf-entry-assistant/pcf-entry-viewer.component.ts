import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import {
  DppAssistantFieldGroupDefinition,
  DppAssistantService,
  DppPcfEntry,
  DppPcfEntryType,
} from 'battery-passport-assistant';

@Component({
  selector: 'aas-pcf-entry-viewer',
  imports: [CommonModule, TranslateModule, Button],
  templateUrl: './pcf-entry-viewer.component.html',
  styleUrl: './pcf-entry-viewer.component.scss',
})
export class PcfEntryViewerComponent {
  @Input({ required: true }) entryType!: DppPcfEntryType;
  @Input({ required: true }) entries: DppPcfEntry[] = [];
  @Input() showEditActions = false;
  @Output() editRequested = new EventEmitter<number>();

  constructor(private dppAssistantService: DppAssistantService) {}

  get definition() {
    return this.dppAssistantService.getPcfEntryDefinition(this.entryType);
  }

  getFieldValue(entry: DppPcfEntry, fieldId: string): string {
    const value = entry.values[fieldId];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '';
      }

      if (typeof value[0] === 'string') {
        return (value as string[]).filter((item) => item.trim() !== '').join(', ');
      }

      return (value as { language: string; text: string }[])
        .filter((item) => item.text.trim() !== '')
        .map((item) => `${item.language}: ${item.text}`)
        .join(' | ');
    }

    return value == null ? '' : `${value}`.trim();
  }

  hasVisibleValues(entry: DppPcfEntry, fieldIds: string[]): boolean {
    return fieldIds.some((fieldId) => this.getFieldValue(entry, fieldId) !== '');
  }

  hasVisibleFields(entry: DppPcfEntry, group: DppAssistantFieldGroupDefinition): boolean {
    return this.hasVisibleValues(
      entry,
      group.fields.map((field) => field.id),
    );
  }

  edit(index: number) {
    this.editRequested.emit(index);
  }
}
