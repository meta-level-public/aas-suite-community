import { MultiLanguagePropertyValue } from '@aas/model';
import {
  DppAssistantFieldDefinition,
  DppAssistantFieldGroupDefinition,
  DppAssistantService,
  DppPcfEntry,
  DppPcfEntryDefinition,
  DppPcfEntryType,
} from 'battery-passport-assistant';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Steps } from 'primeng/steps';
import { Textarea } from 'primeng/textarea';
import { MultilanguagePropertyComponent } from '../structural-elements/multilanguage-property/multilanguage-property.component';

@Component({
  selector: 'aas-pcf-entry-assistant',
  templateUrl: './pcf-entry-assistant.component.html',
  styleUrl: './pcf-entry-assistant.component.scss',
  imports: [
    Button,
    TranslateModule,
    Steps,
    FormsModule,
    InputText,
    InputNumber,
    Textarea,
    Select,
    MultilanguagePropertyComponent,
  ],
})
export class PcfEntryAssistantComponent implements OnChanges {
  @Input({ required: true }) entryType!: DppPcfEntryType;
  @Input({ required: true }) entry!: DppPcfEntry;
  @Input() submodels: any[] = [];
  @Input() conceptDescriptions: any[] = [];
  @Input() saveLabelKey = 'DPP_PCF_SAVE_ENTRY';

  @Output() saveEntry = new EventEmitter<DppPcfEntry>();
  @Output() cancelled = new EventEmitter<void>();

  activeGroupIndex = 0;
  draftEntry!: DppPcfEntry;

  constructor(
    private dppAssistantService: DppAssistantService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entry'] || changes['entryType']) {
      this.draftEntry = {
        id: this.entry?.id ?? `${this.entryType}-${Date.now()}`,
        type: this.entryType,
        values: structuredClone(this.entry?.values ?? {}),
      };
      this.activeGroupIndex = 0;
    }
  }

  get activeDefinition(): DppPcfEntryDefinition {
    return this.dppAssistantService.getPcfEntryDefinition(this.entryType);
  }

  get activeGroup() {
    return this.activeDefinition.groups[this.activeGroupIndex];
  }

  get isLastGroup() {
    return this.activeGroupIndex >= this.activeDefinition.groups.length - 1;
  }

  get groupItems() {
    return this.activeDefinition.groups.map((group, index) => ({
      label: this.translate.instant(group.labelKey),
      command: () => {
        this.activeGroupIndex = index;
      },
    }));
  }

  previous() {
    if (this.activeGroupIndex > 0) {
      this.activeGroupIndex--;
      return;
    }

    this.cancelled.emit();
  }

  next() {
    if (!this.isLastGroup) {
      this.activeGroupIndex++;
      return;
    }

    this.saveEntry.emit({
      id: this.draftEntry.id,
      type: this.draftEntry.type,
      values: structuredClone(this.draftEntry.values),
    });
  }

  getFieldValue(field: DppAssistantFieldDefinition) {
    const current = this.draftEntry.values[field.id];
    if (field.fieldType === 'multilanguage') {
      return this.getMultilanguageFieldValue(field);
    }

    if (typeof current === 'string' || typeof current === 'number') {
      return current;
    }

    return '';
  }

  getFieldOptions(field: DppAssistantFieldDefinition) {
    return this.dppAssistantService
      .getFieldValueOptions(field, this.submodels, this.conceptDescriptions)
      .map((value) => ({ label: value, value }));
  }

  hasFieldOptions(field: DppAssistantFieldDefinition) {
    return this.getFieldOptions(field).length > 0;
  }

  getMultilanguageFieldValue(field: DppAssistantFieldDefinition): MultiLanguagePropertyValue[] {
    const current = this.draftEntry.values[field.id];
    if (Array.isArray(current)) {
      return current as MultiLanguagePropertyValue[];
    }

    const initial = [{ language: 'en', text: '' }];
    this.draftEntry.values[field.id] = initial;
    return initial;
  }

  setFieldValue(field: DppAssistantFieldDefinition, value: string | number | string[] | MultiLanguagePropertyValue[]) {
    this.draftEntry.values[field.id] = value;
  }

  getMultiValueFieldValues(field: DppAssistantFieldDefinition): string[] {
    const current = this.draftEntry.values[field.id];
    if (Array.isArray(current)) {
      if (current.length === 0 || typeof current[0] === 'string') {
        return current.length === 0 ? [''] : (current as string[]);
      }
      return [''];
    }

    if (typeof current === 'string' && current.trim() !== '') {
      const normalized = current
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter((item) => item !== '');
      this.draftEntry.values[field.id] = normalized.length > 0 ? normalized : [''];
      return this.draftEntry.values[field.id] as string[];
    }

    this.draftEntry.values[field.id] = [''];
    return this.draftEntry.values[field.id] as string[];
  }

  setMultiValueFieldValue(field: DppAssistantFieldDefinition, index: number, value: string) {
    const values = [...this.getMultiValueFieldValues(field)];
    values[index] = value;
    this.draftEntry.values[field.id] = values;
  }

  addMultiValueFieldValue(field: DppAssistantFieldDefinition) {
    this.draftEntry.values[field.id] = [...this.getMultiValueFieldValues(field), ''];
  }

  removeMultiValueFieldValue(field: DppAssistantFieldDefinition, index: number) {
    const values = this.getMultiValueFieldValues(field).filter((_, itemIndex) => itemIndex !== index);
    this.draftEntry.values[field.id] = values.length > 0 ? values : [''];
  }

  getGroupDescription(group: DppAssistantFieldGroupDefinition) {
    return group.descriptionKey ?? '';
  }
}
