import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { LookupEntry } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { lastValueFrom, Subscription } from 'rxjs';
import { NullIfEmptyDirective } from '../../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../../general/directives/v3-undo.directive';

@Component({
  selector: 'aas-class-id',
  templateUrl: './class-id.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Select, FormsModule, InputText, V3UndoDirective, NullIfEmptyDirective, TranslateModule],
})
export class ClassIdComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) classId: aas.types.Property | undefined;
  @Input({ required: true }) className: aas.types.MultiLanguageProperty | undefined;
  @Input({ required: true }) isVdiClassId: boolean = false;
  @Input({ required: true }) isIecClassId: boolean = false;

  vdiClasses = signal<LookupEntry[]>([]);
  iecClasses = signal<LookupEntry[]>([]);

  http = inject(HttpClient);
  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];
  classLabel = signal<string>('descriptionEn');

  selectedClassId: string | null = null;

  async ngOnInit() {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.classLabel.set(event.lang === 'de' ? 'descriptionDe' : 'descriptionEn');
        this.sortClasses(this.vdiClasses());
        this.sortClasses(this.iecClasses());
      }),
    );
    this.classLabel.set(this.translate.currentLang === 'de' ? 'descriptionDe' : 'descriptionEn');

    await this.loadClasses();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async loadClasses() {
    this.iecClasses.set(
      await lastValueFrom(this.http.get<LookupEntry[]>('assets/lookups/iec-documentation-classes.json')),
    );
    this.vdiClasses.set(
      await lastValueFrom(this.http.get<LookupEntry[]>('assets/lookups/vdi-documentation-classes.json')),
    );
    this.initSelectedClass();
  }

  ngOnChanges() {
    this.initSelectedClass();
  }

  initSelectedClass() {
    if (this.classId?.value != null && this.iecClasses().length > 0 && this.vdiClasses().length > 0) {
      const val = this.classId.value ?? 'OTHER';
      if (this.isVdiClassId) {
        if (this.vdiClasses().find((o) => o.value === val) != null) {
          this.selectedClassId = this.classId.value;
        } else {
          this.selectedClassId = 'OTHER';
        }
      } else if (this.isIecClassId) {
        if (this.iecClasses().find((o) => o.value === val) != null) {
          this.selectedClassId = this.classId.value;
        } else {
          this.selectedClassId = 'OTHER';
        }
      } else {
        this.selectedClassId = this.classId?.value ?? null;
      }
    }
  }

  sortClasses(classes: LookupEntry[]) {
    classes.sort((a: LookupEntry, b: LookupEntry) => {
      const labelA = (a as any)[this.classLabel()];
      const labelB = (b as any)[this.classLabel()];
      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }
      return 0;
    });
  }

  onClassIdChange() {
    if (
      this.selectedClassId !== 'OTHER' &&
      this.classId != null &&
      this.selectedClassId != null &&
      this.className != null
    ) {
      let valueObject: any;
      if (this.isVdiClassId) {
        valueObject = this.vdiClasses().find((o) => o.value === this.selectedClassId);
      } else if (this.isIecClassId) {
        valueObject = this.iecClasses().find((o) => o.value === this.selectedClassId);
      }

      this.classId.value = valueObject.value;
      this.className.value = [
        new aas.types.LangStringTextType('de', valueObject.descriptionDe),
        new aas.types.LangStringTextType('en', valueObject.descriptionEn),
      ];
    }
  }

  sanitizeValue() {
    if (this.classId?.value === '') this.classId.value = null;
  }
}
