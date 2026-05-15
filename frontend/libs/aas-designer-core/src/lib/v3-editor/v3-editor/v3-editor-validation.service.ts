import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { LangStringShortNameTypeIec61360 } from '@aas-core-works/aas-core3.1-typescript/types';
import { NotificationService, PortalService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { get, set } from 'lodash-es';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { IdValidatorComponent } from '../components/id-validator/id-validator.component';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { AasDesignerVerificationError } from './aas-designer-verification-error';

type VerificationError = aas.verification.VerificationError;

@Injectable()
export class V3EditorValidationService {
  private translate = inject(TranslateService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private treeService = inject(V3TreeService);

  private ref: DynamicDialogRef | undefined | null;

  shellResult: ShellResult | undefined;
  hasChanges: () => boolean = () => false;

  validationErrors = signal<AasDesignerVerificationError[]>([]);
  validationErrorCount: number = 0;
  displayValidationResult: boolean = false;
  displayDiff: boolean = false;
  advanced: boolean = false;
  constraintOptions: string[] = [];
  validateMenuItems: MenuItem[] = [];

  readonly actionRequested$ = new Subject<'reset'>();

  destroy(): void {
    if (this.ref) {
      this.ref.close();
    }
  }

  initValidationMenuItems(onDiff: () => void): void {
    this.validateMenuItems = [
      {
        icon: 'pi pi-check-circle',
        command: () => this.validate(),
        label: this.translate.instant('VALIDATE'),
      },
      {
        icon: 'fa-solid fa-spell-check',
        command: () => this.validateIds(),
        label: this.translate.instant('VALIDATE_IDS'),
      },
      {
        icon: 'fa-solid fa-code-compare',
        command: () => onDiff(),
        label: this.translate.instant('DIFF'),
      },
    ];
  }

  async validate(): Promise<void> {
    this.validationErrors.set([]);
    const validationErrors: AasDesignerVerificationError[] = [];
    if (this.shellResult?.v3Shell != null) {
      try {
        const errs = aas.verification.verify(this.shellResult.v3Shell);
        let number = 1;
        this.constraintOptions = [];
        for (const error of errs ?? []) {
          if (error.message.includes('RFC 8089')) continue;
          const myError = new AasDesignerVerificationError(error);
          myError.messageTranslated = this.translate.instant('errorMessages.' + error.message);
          myError.number = number++;
          myError.label = this.getFixErrorLabel(myError);
          myError.allLabel = this.getFixAllErrorsLabel(myError);
          if (
            this.constraintOptions.indexOf(myError.constraint ?? '') === -1 &&
            myError.constraint != null &&
            myError.constraint !== ''
          ) {
            this.constraintOptions.push(myError.constraint);
          }
          validationErrors.push(myError);
        }
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    }
    this.validationErrors.set(validationErrors);
    this.validationErrorCount = this.validationErrors().length;
    if (this.validationErrorCount > 0) this.showValidationResult();
    else this.notificationService.showMessageAlways('NO_ERRORS_FOUND', 'SUCCESS', 'success', false);
  }

  validateIds(): void {
    if (this.hasChanges()) {
      this.notificationService.showMessageAlways('SAVE_BEFORE_VALIDATION', 'HINT', 'info', true);
    } else {
      this.ref = this.dialogService.open(IdValidatorComponent, {
        header: this.translate.instant('ID_VALIDATION'),
        modal: true,
        width: '95%',
        data: {
          shellResult: this.shellResult,
        },
      });

      this.ref?.onClose.subscribe((result: { action: 'reroute' | 'refresh' | 'nothing'; id: string }) => {
        if (result == null) return;
        if (result.action === 'reroute') {
          this.router.navigate(PortalService.buildRepoEditRoute(result.id ?? ''));
        } else if (result.action === 'refresh') {
          this.actionRequested$.next('reset');
        }
      });
    }
  }

  showValidationResult(): void {
    this.displayValidationResult = true;
  }

  isAutoFixable(error: VerificationError): boolean {
    const x = get(this.shellResult?.v3Shell, error.path.toString().substring(1));
    return (
      error.message === 'Embedded data specifications must be either not set or have at least one item.' ||
      error.message === 'Supplemental semantic IDs must be either not set or have at least one item.' ||
      error.message === 'Value must be either not set or have at least one item.' ||
      error.message === 'Concept descriptions must be either not set or have at least one item.' ||
      error.message === 'Description must be either not set or have at least one item.' ||
      error.message === 'String shall have a maximum length of 18 characters.' ||
      (error.message === 'The value must not be empty.' &&
        (error.path.toString().endsWith('dataSpecificationContent.value') ||
          error.path.toString().endsWith('.dataSpecificationContent.sourceOfDefinition') ||
          error.path.toString().endsWith('.category') ||
          error.path.toString().endsWith('.unit') ||
          error.path.toString().endsWith('.symbol') ||
          error.path.toString().endsWith('.valueFormat') ||
          error.path.toString().endsWith('.administration.version') ||
          error.path.toString().endsWith('.text')) &&
        x === '') ||
      (error.message === 'Value must be consistent with the value type.' && x.value === '') ||
      error.message ===
        'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.' ||
      error.message ===
        'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.'
    );
  }

  fixAll(error: VerificationError): void {
    switch (error.message) {
      case 'Embedded data specifications must be either not set or have at least one item.':
        this.fixEmbeddedDataSpecifications(error);
        break;
      case 'Supplemental semantic IDs must be either not set or have at least one item.':
        this.fixSupplementalSemanticIds(error);
        break;
      case 'Description must be either not set or have at least one item.':
        this.fixDescriptionValue(error);
        break;
      case 'Value must be either not set or have at least one item.':
        this.fixValue(error);
        break;
      case 'Concept descriptions must be either not set or have at least one item.':
        if (this.shellResult?.v3Shell != null) this.shellResult.v3Shell.conceptDescriptions = null;
        break;
      case 'The value must not be empty.':
        this.fixNotEmpty(error);
        break;
      case 'Value must be consistent with the value type.':
        this.fixEmpty(error);
        break;
      case 'String shall have a maximum length of 18 characters.':
        this.fixLength(error);
        break;
      case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
        this.fixModelReference(error);
        break;
      case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
        this.fixAllGlobalReference(error);
        break;
    }

    this.validate();
  }

  fixThis(error: VerificationError): void {
    if (this.shellResult?.v3Shell != null) {
      const path = error.path.toString().substring(1);
      const x = get(this.shellResult?.v3Shell, path);
      switch (error.message) {
        case 'Embedded data specifications must be either not set or have at least one item.':
          x.embeddedDataSpecifications = null;
          break;
        case 'Supplemental semantic IDs must be either not set or have at least one item.':
          x.supplementalSemanticIds = null;
          break;
        case 'Concept descriptions must be either not set or have at least one item.':
          this.shellResult.v3Shell.conceptDescriptions = null;
          break;
        case 'Value must be either not set or have at least one item.':
        case 'Description must be either not set or have at least one item.':
        case 'Value must be consistent with the value type.':
          x.value = null;
          break;
        case 'The value must not be empty.':
          if (
            path.toString().endsWith('dataSpecificationContent.value') ||
            path.toString().endsWith('.dataSpecificationContent.sourceOfDefinition') ||
            path.toString().endsWith('.category') ||
            path.toString().endsWith('.unit') ||
            path.toString().endsWith('.valueFormat') ||
            path.toString().endsWith('.administration.version') ||
            path.toString().endsWith('.symbol')
          ) {
            set(this.shellResult?.v3Shell, path, null);
          } else if (path.toString().endsWith('.text')) {
            set(this.shellResult?.v3Shell, path, ' ');
          }
          break;
        case 'String shall have a maximum length of 18 characters.':
          if (x === '') {
            set(this.shellResult?.v3Shell, path, null);
          } else if (x.length > 18) {
            set(this.shellResult?.v3Shell, path, x.substring(0, 18));
          }
          break;
        case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
          set(this.shellResult?.v3Shell, path.toString() + '.type', 0);
          break;
        case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
          if (x.keys != null && x.keys[0] != null) x.keys[0].type = aas.types.KeyTypes.GlobalReference;
          break;
      }
    }
    this.validate();
  }

  getFixAllErrorsLabel(error: any): string {
    let label = 'FIX_ALL';

    switch (error.message) {
      case 'Embedded data specifications must be either not set or have at least one item.':
      case 'Supplemental semantic IDs must be either not set or have at least one item.':
      case 'Concept descriptions must be either not set or have at least one item.':
      case 'Value must be either not set or have at least one item.':
      case 'Description must be either not set or have at least one item.':
      case 'Value must be consistent with the value type.':
      case 'The value must not be empty.':
        label = 'SET_NULL_ALL';
        break;
      case 'String shall have a maximum length of 18 characters.':
        label = 'SHORTEN_ALL';
        break;
      case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
        label = 'SET_TYPE_ALL';
        break;
      case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
        label = 'SET_GLOBAL_REFERENCE_ALL';
        break;
    }

    return label;
  }

  getFixErrorLabel(error: any): string {
    let label = 'FIX_ALL';

    switch (error.message) {
      case 'Embedded data specifications must be either not set or have at least one item.':
      case 'Supplemental semantic IDs must be either not set or have at least one item.':
      case 'Concept descriptions must be either not set or have at least one item.':
      case 'Value must be either not set or have at least one item.':
      case 'Description must be either not set or have at least one item.':
      case 'Value must be consistent with the value type.':
      case 'The value must not be empty.':
        label = 'SET_NULL';
        break;
      case 'String shall have a maximum length of 18 characters.':
        label = 'SHORTEN';
        break;
      case 'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.':
        label = 'SET_TYPE';
        break;
      case 'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.':
        label = 'SET_GLOBAL_REFERENCE';
        break;
    }

    return label;
  }

  private fixSupplementalSemanticIds(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) x.supplementalSemanticIds = null;
        }
      });
  }

  private fixEmbeddedDataSpecifications(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) x.embeddedDataSpecifications = null;
        }
      });
  }

  private fixValue(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) x.value = null;
        }
      });
  }

  private fixDescriptionValue(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path + '.description');
          if (x != null) set(this.shellResult.v3Shell, path + '.description', null);
        }
      });
  }

  private fixEmpty(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x?.value === '') {
            x.value = null;
          }
        }
      });
  }

  private fixLength(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x === '') {
            set(this.shellResult?.v3Shell, path, null);
          }
          if (x !== '' && x.length > 18) {
            set(this.shellResult?.v3Shell, path, x.substring(0, 18));
          }
          if (x instanceof LangStringShortNameTypeIec61360) {
            x.text = x.text.substring(0, 18);
          }
        }
      });
  }

  private fixNotEmpty(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        const path = e.path.toString().substring(1);
        if (
          this.shellResult?.v3Shell != null &&
          (path.endsWith('dataSpecificationContent.value') ||
            path.toString().endsWith('.dataSpecificationContent.sourceOfDefinition') ||
            path.toString().endsWith('.category') ||
            path.toString().endsWith('.unit') ||
            path.toString().endsWith('.valueFormat') ||
            path.toString().endsWith('.administration.version') ||
            path.toString().endsWith('.symbol'))
        ) {
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) set(this.shellResult?.v3Shell, path, null);
        } else if (this.shellResult?.v3Shell != null && path.endsWith('.text')) {
          const x = get(this.shellResult.v3Shell, path);
          if (x != null) set(this.shellResult?.v3Shell, path, ' ');
        }
      });
  }

  private fixModelReference(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const typePath = path + '.type';
          const x = get(this.shellResult.v3Shell, typePath);
          if (x != null) set(this.shellResult?.v3Shell, typePath, 0);
        }
      });
  }

  private fixAllGlobalReference(error: VerificationError): void {
    this.validationErrors()
      .filter((e) => e.message === error.message)
      .forEach((e) => {
        if (this.shellResult?.v3Shell != null) {
          const path = e.path.toString().substring(1);
          const x = get(this.shellResult.v3Shell, path);
          if (x != null && x.keys != null && x.keys[0] != null) x.keys[0].type = aas.types.KeyTypes.GlobalReference;
        }
      });
  }
}
