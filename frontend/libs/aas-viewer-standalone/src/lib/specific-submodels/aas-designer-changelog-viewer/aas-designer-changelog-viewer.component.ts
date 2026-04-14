import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';

type ChangelogEntry = {
  idShort: string;
  dateRaw: string;
  dateDisplay: string;
  user: string;
  action: string;
  comment: string;
};

@Component({
  selector: 'aas-aas-designer-changelog-viewer',
  templateUrl: './aas-designer-changelog-viewer.component.html',
  styleUrls: ['./aas-designer-changelog-viewer.component.css'],
  imports: [CommonModule, InputGroup, InputGroupAddon, InputText, Tag, TranslateModule],
})
export class AasDesignerChangelogViewerComponent implements OnChanges {
  @Input({ required: true }) submodel!: aas.types.Submodel;

  entries: ChangelogEntry[] = [];

  get latestEntry(): ChangelogEntry | null {
    return this.entries[0] ?? null;
  }

  ngOnChanges(): void {
    this.entries = this.extractEntries(this.submodel);
  }

  actionMarkerClass(action: string): string {
    switch (this.normalizedActionKind(action)) {
      case 'create':
        return 'dot-create';
      case 'delete':
        return 'dot-delete';
      case 'warn':
        return 'dot-warn';
      case 'update':
        return 'dot-update';
      default:
        return 'dot-default';
    }
  }

  actionMarkerIcon(action: string): string {
    switch (this.normalizedActionKind(action)) {
      case 'create':
        return 'fa-solid fa-plus';
      case 'delete':
        return 'fa-solid fa-trash';
      case 'warn':
        return 'fa-solid fa-triangle-exclamation';
      case 'update':
        return 'fa-solid fa-pen';
      default:
        return 'fa-solid fa-ellipsis';
    }
  }

  actionSeverity(action: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (this.normalizedActionKind(action)) {
      case 'create':
        return 'success';
      case 'delete':
        return 'danger';
      case 'warn':
        return 'warn';
      case 'update':
        return 'info';
      default:
        return 'secondary';
    }
  }

  private normalizedActionKind(action: string): 'create' | 'update' | 'delete' | 'warn' | 'other' {
    const value = action.trim().toLowerCase();
    if (value.includes('create') || value.includes('add')) return 'create';
    if (value.includes('delete') || value.includes('remove')) return 'delete';
    if (value.includes('warn')) return 'warn';
    if (value.includes('update') || value.includes('edit')) return 'update';
    return 'other';
  }

  private extractEntries(submodel: aas.types.Submodel): ChangelogEntry[] {
    const changes = (submodel.submodelElements ?? []).find(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection && (el.idShort ?? '').toLowerCase() === 'changes',
    );

    const rows = (changes?.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((entry, index) => {
        const dateRaw = this.readProperty(entry.value ?? [], 'Date');
        const parsedDate = this.parseDate(dateRaw);

        return {
          idShort: entry.idShort?.trim() || `Update${index}`,
          dateRaw,
          dateDisplay: parsedDate != null ? parsedDate.toLocaleString() : dateRaw || '-',
          user: this.readProperty(entry.value ?? [], 'User') || '-',
          action: this.readProperty(entry.value ?? [], 'Action') || '-',
          comment: this.readProperty(entry.value ?? [], 'Comment') || '-',
        };
      })
      .sort((a, b) => {
        const ad = this.parseDate(a.dateRaw)?.getTime() ?? 0;
        const bd = this.parseDate(b.dateRaw)?.getTime() ?? 0;
        return bd - ad;
      });

    return rows;
  }

  private parseDate(value: string): Date | null {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private readProperty(elements: aas.types.ISubmodelElement[], idShort: string): string {
    const property = elements.find(
      (el): el is aas.types.Property =>
        el instanceof aas.types.Property && (el.idShort ?? '').toLowerCase() === idShort.toLowerCase(),
    );
    return `${property?.value ?? ''}`.trim();
  }
}
