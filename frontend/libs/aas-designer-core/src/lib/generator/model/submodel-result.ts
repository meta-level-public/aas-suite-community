import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescription, Submodel } from '@aas/model';

export class SubmodelResult {
  submodels: Submodel[] = [];
  conceptDescriptions: ConceptDescription[] = [];

  v3Submodels: aas.types.Submodel[] = [];
  v3ConceptDescriptions: aas.types.ConceptDescription[] = [];

  v3SubmodelsPlain: string[] = [];
  v3ConceptDescriptionsPlain: string[] = [];

  static fromDto(dto: SubmodelResult) {
    const res = new SubmodelResult();

    for (const sm of dto.submodels ?? []) {
      res.submodels.push(Submodel.fromDto(sm));
    }
    for (const cd of dto.conceptDescriptions ?? []) {
      res.conceptDescriptions.push(ConceptDescription.fromDto(cd));
    }

    for (const sm of dto.v3SubmodelsPlain ?? []) {
      const instanceOrErrorPlain = aas.jsonization.submodelFromJsonable(JSON.parse(sm));
      if (instanceOrErrorPlain.value != null) {
        res.v3Submodels.push(instanceOrErrorPlain.value);
      }
    }
    for (const cd of dto.v3ConceptDescriptionsPlain ?? []) {
      const instanceOrErrorPlain = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(cd));
      if (instanceOrErrorPlain.value != null) {
        res.v3ConceptDescriptions.push(instanceOrErrorPlain.value);
      }
    }

    return res;
  }
}
