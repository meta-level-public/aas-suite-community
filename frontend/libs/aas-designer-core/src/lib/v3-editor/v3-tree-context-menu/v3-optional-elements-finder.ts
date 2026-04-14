import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AppConfigService } from '@aas/common-services';
import { InstanceHelper } from '@aas/helpers';
import { AasMetamodelVersion } from '@aas/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONPath } from 'jsonpath-plus';
import { lastValueFrom } from 'rxjs';
import { SubmodelResult } from '../../generator/model/submodel-result';

@Injectable({
  providedIn: 'root',
})
export class V3OptionalElementsFinder {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getContactInformationSm() {
    const params = new HttpParams()
      .append('semanticId', 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation')
      .append('idShort', 'ContactInformation')
      .append('version', AasMetamodelVersion.V3);

    const res = await lastValueFrom(
      this.http.get<SubmodelResult>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetByIdentification`, {
        params,
      }),
    );

    const smResult = SubmodelResult.fromDto(res);

    return smResult;
  }

  async getOptionalElements(path: string, submodelId: string, semanticId: string, currentElement: any) {
    const optionalElements: any[] = [];
    const params = new HttpParams()
      .append('semanticId', semanticId)
      .append('idShort', submodelId)
      .append('version', AasMetamodelVersion.V3);

    const res = await lastValueFrom(
      this.http.get<SubmodelResult>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetByIdentification`, {
        params,
      }),
    );

    const shellResult = SubmodelResult.fromDto(res);
    let isBomSubmodel: boolean = false;
    let bomNode: aas.types.Entity | undefined;

    // aktuellen pfad in res finden

    let parent: any;
    shellResult.v3Submodels?.forEach((sm) => {
      if (sm.idShort === submodelId || sm.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null) {
        const found = JSONPath({
          path,
          json: sm,
          wrap: false,
        });
        if (found != null) {
          // da ists
          parent = found;
        }
      }
    });
    isBomSubmodel =
      semanticId === 'https://admin-shell.io/idta/HierarchicalStructures/1/0/Submodel' ||
      semanticId === 'https://admin-shell.io/idta/HierarchicalStructures/1/1/Submodel';
    if (isBomSubmodel) {
      const entryNode = shellResult.v3Submodels[0].submodelElements?.find(
        (el) =>
          this.hasSemanticId(el, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0') ||
          this.hasSemanticId(el, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/1'),
      ) as aas.types.Entity;
      if (entryNode != null) {
        bomNode = entryNode.statements?.find(
          (el) =>
            this.hasSemanticId(el, 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/0') ||
            this.hasSemanticId(el, 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/1'),
        ) as aas.types.Entity;
      }
    }

    if (parent != null) {
      if (parent instanceof aas.types.Submodel) {
        parent.submodelElements?.forEach((el: any) => {
          if (this.canBeMultiple(el) || (this.isOptional(el) && !this.isIncluded(el, currentElement))) {
            optionalElements.push({
              label: el.idShort,
              data: el,
              type: InstanceHelper.getInstanceName(el),
            });
          }
        });
      }
      if (parent instanceof aas.types.SubmodelElementCollection || parent instanceof aas.types.SubmodelElementList) {
        parent.value?.forEach((el: any) => {
          if (this.canBeMultiple(el) || (this.isOptional(el) && !this.isIncluded(el, currentElement))) {
            optionalElements.push({
              label: el.idShort,
              data: el,
              type: InstanceHelper.getInstanceName(el),
            });
          }
        });
      }
      if (parent instanceof aas.types.Entity) {
        parent.statements?.forEach((el: any) => {
          if (this.canBeMultiple(el) || (this.isOptional(el) && !this.isIncluded(el, currentElement))) {
            optionalElements.push({
              label: el.idShort,
              data: el,
              type: InstanceHelper.getInstanceName(el),
            });
          }
        });
      }
    }

    if (
      (this.hasSemanticId(currentElement, 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/0') ||
        this.hasSemanticId(currentElement, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0')) &&
      bomNode != null &&
      isBomSubmodel &&
      optionalElements.find((oe) =>
        this.hasSemanticId(oe, 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/0'),
      ) == null
    ) {
      if (optionalElements.find((e) => e.label === 'Node') == null)
        optionalElements.push({
          label: 'Node',
          data: bomNode,
          type: InstanceHelper.getInstanceName(bomNode),
        });
    }

    return optionalElements;
  }

  async getRequiredElements(path: string, submodelId: string, semanticId: string, currentElement: any) {
    const optionalElements: any[] = [];
    const params = new HttpParams()
      .append('semanticId', encodeURIComponent(semanticId))
      .append('idShort', submodelId)
      .append('version', AasMetamodelVersion.V3);

    const res = await lastValueFrom(
      this.http.get<SubmodelResult>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetByIdentification`, {
        params,
      }),
    );

    const shellResult = SubmodelResult.fromDto(res);

    // aktuellen pfad in res finden

    let parent: any;
    shellResult.v3Submodels?.forEach((sm) => {
      if (sm.idShort === submodelId || sm.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null) {
        const found = JSONPath({
          path,
          json: sm,
          wrap: false,
        });
        if (found != null) {
          // da ists
          parent = found;
        }
      }
    });

    if (parent != null) {
      if (parent instanceof aas.types.Submodel) {
        parent.submodelElements?.forEach((el: any) => {
          if (this.isRequired(el) && !this.isIncluded(el, currentElement)) {
            optionalElements.push({
              label: el.idShort,
              data: el,
              type: InstanceHelper.getInstanceName(el),
            });
          }
        });
      }
      if (parent instanceof aas.types.SubmodelElementCollection || parent instanceof aas.types.SubmodelElementList) {
        parent.value?.forEach((el: any) => {
          if (this.isRequired(el) && !this.isIncluded(el, currentElement)) {
            optionalElements.push({
              label: el.idShort,
              data: el,
              type: InstanceHelper.getInstanceName(el),
            });
          }
        });
      }
      if (parent instanceof aas.types.Entity) {
        parent.statements?.forEach((el: any) => {
          if (this.isRequired(el) && !this.isIncluded(el, currentElement)) {
            optionalElements.push({
              label: el.idShort,
              data: el,
              type: InstanceHelper.getInstanceName(el),
            });
          }
        });
      }
    }

    return optionalElements;
  }

  canBeMultiple(el: any) {
    let multiplicityValue = el.qualifiers?.find((q: any) => q.type?.toLowerCase() === 'multiplicity')?.value;
    if (multiplicityValue == null)
      multiplicityValue = el.qualifiers?.find((q: any) => q.type?.toLowerCase() === 'cardinality')?.value;
    return multiplicityValue === 'ZeroToMany' || multiplicityValue === 'OneToMany';
  }

  isOptional(el: any) {
    let multiplicityValue = el.qualifiers?.find((q: any) => q.type?.toLowerCase() === 'multiplicity')?.value;
    if (multiplicityValue == null)
      multiplicityValue = el.qualifiers?.find((q: any) => q.type?.toLowerCase() === 'cardinality')?.value;
    return multiplicityValue === 'ZeroToOne';
  }

  isRequired(el: any) {
    let multiplicityValue = el.qualifiers?.find((q: any) => q.type?.toLowerCase() === 'multiplicity')?.value;
    if (multiplicityValue == null)
      multiplicityValue = el.qualifiers?.find((q: any) => q.type?.toLowerCase() === 'cardinality')?.value;
    return multiplicityValue === 'One' || multiplicityValue === 'OneToMany';
  }

  isIncluded(el: any, parent: any) {
    let found = false;
    if (parent instanceof aas.types.Submodel) {
      parent.submodelElements?.forEach((pel: any) => {
        if (pel.idShort === el.idShort) {
          found = true;
        }
      });
    }
    if (parent instanceof aas.types.SubmodelElementCollection || parent instanceof aas.types.SubmodelElementList) {
      parent.value?.forEach((pel: any) => {
        if (pel.idShort === el.idShort) {
          found = true;
        }
      });
    }
    if (parent instanceof aas.types.Entity) {
      parent.statements?.forEach((pel: any) => {
        if (pel.idShort === el.idShort) {
          found = true;
        }
      });
    }
    return found;
  }

  hasSemanticId(sme: aas.types.ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }
}
