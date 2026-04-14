import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { Message } from 'primeng/message';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { ErrorHandlingAction, V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3ReferenceComponent } from '../v3-reference/v3-reference.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';
type AssetAdministrationShell = aas.types.AssetAdministrationShell;
type ISubmodelElement = aas.types.ISubmodelElement;
type RelationshipElement = aas.types.RelationshipElement;
type Submodel = aas.types.Submodel;
type VerificationError = aas.verification.VerificationError;

@Component({
  selector: 'aas-v3-relationship-element',
  templateUrl: './v3-relationship-element.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    Message,
    V3LangStringListComponent,
    V3ReferenceComponent,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3RelationshipElementComponent extends V3ComponentBase {
  @Input({ required: true }) relationship: V3TreeItem<RelationshipElement> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;

  info = Info;
  refType = aas.types.ReferenceTypes;

  constructor(private treeService: V3TreeService) {
    super();
  }

  // Key selection & editing are delegated to the generic vws-v3-reference component.

  jump(target: 'first' | 'second') {
    const keys = this.relationship?.content?.[target]?.keys ?? [];
    if (keys.length === 0) return;
    const found = this.resolveModelReferenceTarget(keys);
    if (found != null) this.treeService.selectNodeByElement(found);
  }

  private resolveModelReferenceTarget(
    keys: aas.types.Key[],
  ): ISubmodelElement | Submodel | AssetAdministrationShell | null {
    const firstKey = keys[0]?.value;
    if (!firstKey) return null;

    let current: ISubmodelElement | Submodel | AssetAdministrationShell | null =
      this.shellResult?.v3Shell?.submodels?.find((sm) => sm.id === firstKey || sm.idShort === firstKey) ?? null;
    if (current == null) return null;

    for (const key of keys.slice(1)) {
      const keyValue = key?.value ?? '';
      current = this.findDirectChildByKey(current, keyValue);
      if (current == null) return null;
    }
    return current;
  }

  private findDirectChildByKey(
    parent: ISubmodelElement | Submodel | AssetAdministrationShell,
    keyValue: string,
  ): ISubmodelElement | Submodel | AssetAdministrationShell | null {
    if (parent instanceof aas.types.Submodel) {
      return (parent.submodelElements ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    if (parent instanceof aas.types.SubmodelElementCollection) {
      return (parent.value ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    if (parent instanceof aas.types.Entity) {
      return (parent.statements ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    if (parent instanceof aas.types.SubmodelElementList) {
      const index = Number.parseInt(keyValue, 10);
      if (Number.isInteger(index) && index >= 0) return parent.value?.[index] ?? null;
      return (parent.value ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    if (parent instanceof aas.types.AssetAdministrationShell) {
      const smRef = parent.submodels?.find((el) => el.keys?.[0]?.value === keyValue);
      if (!smRef) return null;
      return this.shellResult?.v3Shell?.submodels?.find((s) => s.id === smRef.keys?.[0]?.value) ?? null;
    }
    return null;
  }

  errorArr: { error: VerificationError; action: ErrorHandlingAction }[] = [];
  get errors() {
    const errors: { error: VerificationError; action: ErrorHandlingAction }[] = [];
    if (this.relationship?.content != null) {
      for (const error of aas.verification.verify(this.relationship.content, true)) {
        errors.push({ error: error, action: this.getAction(error) });
      }
    }

    const diff = JSON.stringify(errors) !== JSON.stringify(this.errorArr);
    if (diff === true) {
      this.errorArr = [...errors];
    }

    return this.errorArr;
  }

  get hasErrors() {
    return this.errorArr.length > 0;
  }
}
