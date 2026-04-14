export interface DppAssistantFieldDefinition {
  id: string;
  labelKey: string;
  fieldType: 'text' | 'multilanguage' | 'number' | 'document' | 'select' | 'textarea';
  descriptionKey?: string;
  required?: boolean;
  multiple?: boolean;
  templatePath?: string[];
}

export interface DppAssistantFieldGroupDefinition {
  id: string;
  labelKey: string;
  descriptionKey?: string;
  fields: DppAssistantFieldDefinition[];
}

export interface DppAssistantStepDefinition {
  id: string;
  labelKey: string;
  descriptionKey?: string;
  groups: DppAssistantFieldGroupDefinition[];
}

export interface DppAssistantDefinition {
  id: string;
  titleKey: string;
  descriptionKey: string;
  steps: DppAssistantStepDefinition[];
}

export type DppPcfEntryType = 'product-carbon-footprint' | 'product-or-sector-specific-carbon-footprint';

export interface DppPcfEntryDefinition {
  type: DppPcfEntryType;
  titleKey: string;
  descriptionKey: string;
  groups: DppAssistantFieldGroupDefinition[];
}

export interface DppPcfEntry {
  id: string;
  type: DppPcfEntryType;
  values: Record<string, DppAssistantFieldValue>;
}

export interface DppPcfEntryCollection {
  productCarbonFootprints: DppPcfEntry[];
  productOrSectorSpecificCarbonFootprints: DppPcfEntry[];
}

export type DppAssistantFieldValue = string | number | boolean | string[] | { language: string; text: string }[];
