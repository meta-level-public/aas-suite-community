export interface AaspeQualifierEntry {
  name: string;
  upgradeFrom?: string[];
  qualifier: AaspeQualifier;
}

export interface AaspeQualifier {
  kind: string;
  semanticId: AaspeSemanticId | null;
  type: string;
  value: string;
  valueId: AaspeSemanticId | null;
}

export interface AaspeSemanticId {
  type: string;
  keys: AaspeKey[];
}

export interface AaspeKey {
  type: string;
  value: string;
}
