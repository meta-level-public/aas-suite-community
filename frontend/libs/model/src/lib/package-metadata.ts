import * as aas from '@aas-core-works/aas-core3.1-typescript';

export class PackageMetadata {
  filename: string = '';
  freigabeLevel: 'PRIVATE' | 'ORGANISATION' = 'PRIVATE';
  marktGuid: string | undefined;
  fullData: aas.types.Environment | null = null;
  beschreibung: string = '';
}

export class ConceptDescriptionRoot {
  conceptDescriptions: aas.types.ConceptDescription[] = [];
}
