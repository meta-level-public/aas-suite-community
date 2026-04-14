import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { ChangeIdsRequest, IdModification, ShellsClient } from '@aas/webapi-client';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { lastValueFrom } from 'rxjs';
import { PortalService } from '@aas/common-services';
import { V3EditorDataStoreService } from '../../v3-editor-data-store.service';

export interface IdToCheck {
  id: string;
  idShort: string;
  type: 'AAS' | 'SM';
  tagSeverity: string;
  newId: string;
  changeId: boolean;
  version: string;
  newVersion: string;
  revision: string;
  newRevision: string;
  useRelease: boolean;
  domain: string;
  // creator auch?
  isUnique?: boolean;
}
@Component({
  selector: 'aas-id-validator',
  imports: [
    FormsModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    FloatLabelModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './id-validator.component.html',
})
export class IdValidatorComponent {
  shellResult = signal<ShellResult | null>(null);

  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  shellClient = inject(ShellsClient);
  notificationService = inject(NotificationService);

  editorDataSore = inject(V3EditorDataStoreService);

  scheme = model<string>('https://');
  authority = model<string>(PortalService.getOrganisationIriPrefix().replace('https://', '').replace('http://', ''));
  authoritySeparator = model<'/' | ':'>('/');
  subunit = model<string>('');
  subunitSeparator = model<'/' | ':'>('/');
  domain = model<string>('USE_ID_SHORT');
  domainSeparator = model<'/' | ':'>('/');
  releaseSeparator = model<'/' | ':'>('/');
  element = model<string>('');
  elementSeparator = model<'/' | ':' | '#'>('/');

  effectCalculateNewIds = effect(() => {
    // trigger ...
    this.scheme();
    this.authority();
    this.subunit();
    this.domain();
    this.element();
    this.authoritySeparator();
    this.subunitSeparator();
    this.domainSeparator();
    this.releaseSeparator();
    this.elementSeparator();

    this.calculateNewIds();
  });

  calculateNewIds() {
    const idsToCheck = this.idsToCheck();
    idsToCheck.forEach((idToCheck) => {
      if (idToCheck.changeId === false) {
        idToCheck.newId = idToCheck.id;
      } else {
        const newId = this.calculateNewId(idToCheck);
        idToCheck.newId = newId;
      }
    });
  }

  calculateNewId(idToCheck: IdToCheck) {
    const parts = [];
    if (this.scheme() !== '') {
      parts.push(this.scheme());
    }
    if (this.authority() !== '') {
      parts.push(this.authority());
    }
    if (this.subunit() !== '') {
      parts.push(this.subunitSeparator());
      parts.push(this.subunit());
    }
    if (this.domain() === 'USE_ID_SHORT') {
      parts.push(this.domainSeparator());
      parts.push(idToCheck.idShort);
    } else if (this.domain() === 'INPUT') {
      parts.push(this.domainSeparator());
      parts.push(idToCheck.domain);
    }
    if (idToCheck.useRelease) {
      parts.push(this.releaseSeparator());
      parts.push(idToCheck.newVersion);
      parts.push(this.releaseSeparator());
      parts.push(idToCheck.newRevision);
    }
    if (this.element() !== '') {
      parts.push(this.elementSeparator());
      parts.push(this.element());
    }

    return parts.join('');
  }

  constructor() {
    this.shellResult.set(this.config.data.shellResult);
  }

  idsToCheck = computed(() => {
    const shellResult = this.shellResult();
    if (!shellResult) {
      return [];
    }

    const idsToCheck: IdToCheck[] = [];

    shellResult.v3Shell?.assetAdministrationShells?.forEach((aas) => {
      idsToCheck.push({
        id: aas.id,
        idShort: aas.idShort ?? '',
        type: 'AAS',
        tagSeverity: 'info',
        newId: '',
        changeId: false,
        version: aas.administration?.version ?? '',
        newVersion: aas.administration?.version ?? '1',
        revision: aas.administration?.revision ?? '',
        newRevision: aas.administration?.revision ?? '0',
        useRelease: false,
        domain: '',
      });

      aas.submodels?.forEach((smRef) => {
        const sm = shellResult.v3Shell?.submodels?.find((s) => s.id === smRef.keys[0].value);

        if (sm) {
          idsToCheck.push({
            id: sm.id,
            idShort: sm.idShort ?? '',
            type: 'SM',
            tagSeverity: 'success',
            newId: '',
            changeId: false,
            version: sm.administration?.version ?? '',
            newVersion: sm.administration?.version ?? '1',
            revision: sm.administration?.revision ?? '',
            newRevision: sm.administration?.revision ?? '0',
            useRelease: true,
            domain: '',
          });
        }
      });
    });

    return idsToCheck;
  });

  async save() {
    // todo: speichern durchführen
    const modifications: IdModification[] = [];
    const idsToCheck = this.idsToCheck();
    idsToCheck.forEach((idToCheck) => {
      const mod = new IdModification();

      if (idToCheck.changeId) {
        mod.oldId = idToCheck.id;
        mod.newId = idToCheck.newId;
        mod.newVersion = idToCheck.newVersion;
        mod.newRevision = idToCheck.newRevision;
        mod.type = idToCheck.type;
      }

      modifications.push(mod);
    });

    let problemFound = false;
    const res = await lastValueFrom(this.shellClient.shells_CheckChangeAllIds(modifications));
    res.forEach((mod) => {
      const id = idsToCheck.find((idToCheck) => idToCheck.id === mod.oldId);
      if (id) {
        id.isUnique = mod.isUnique;
        if (!mod.isUnique) {
          problemFound = true;
        }
      }
    });

    if (problemFound) {
      this.notificationService.showMessageAlways('NONUNIQUE_ID_FOUND', 'ERROR', 'error', true);
    } else {
      const request = new ChangeIdsRequest();
      request.modifications = modifications;
      request.editorDescriptor = this.editorDataSore.editorDescriptor();
      const _res = await lastValueFrom(this.shellClient.shells_ChangeAllIds(request));
      this.ref.close({ action: 'reroute', id: idsToCheck.find((idToCheck) => idToCheck.type === 'AAS')?.newId });
    }
  }

  increaseMajor() {
    const idsToCheck = this.idsToCheck();
    idsToCheck.forEach((idToCheck) => {
      idToCheck.newVersion = (parseInt(idToCheck.version !== '' ? idToCheck.version : '0') + 1).toString();
      idToCheck.newRevision = '0';
    });
    this.calculateNewIds();
  }

  increaseMinor() {
    const idsToCheck = this.idsToCheck();
    idsToCheck.forEach((idToCheck) => {
      if (idToCheck.version === '') {
        idToCheck.newVersion = '0';
      } else {
        idToCheck.newVersion = idToCheck.version;
      }
      idToCheck.newRevision = (parseInt(idToCheck.revision !== '' ? idToCheck.revision : '0') + 1).toString();
    });
    this.calculateNewIds();
  }

  async checkIdUniqueness() {
    const modifications: IdModification[] = [];
    const idsToCheck = this.idsToCheck();
    idsToCheck.forEach((idToCheck) => {
      const mod = new IdModification();

      if (idToCheck.changeId) {
        mod.oldId = idToCheck.id;
        mod.newId = idToCheck.newId;
        mod.newVersion = idToCheck.newVersion;
        mod.newRevision = idToCheck.newRevision;
        mod.type = idToCheck.type;
        modifications.push(mod);
      }
    });

    let problemFound = false;
    const res = await lastValueFrom(this.shellClient.shells_CheckChangeAllIds(modifications));
    res.forEach((mod) => {
      const id = idsToCheck.find((idToCheck) => idToCheck.id === mod.oldId);
      if (id) {
        id.isUnique = mod.isUnique;
        if (!mod.isUnique) {
          problemFound = true;
        }
      }
    });

    if (problemFound) {
      this.notificationService.showMessageAlways('NONUNIQUE_ID_FOUND', 'ERROR', 'error', true);
    } else {
      this.notificationService.showMessageAlways('ID_CHECK_OK', 'ID_CHECK', 'success', false);
    }

    // alert('NOT_IMPLEMENTED_YET');
  }
}
