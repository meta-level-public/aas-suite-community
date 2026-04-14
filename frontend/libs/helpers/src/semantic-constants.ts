// Centralized semantic ID constants for handover documentation structures (V1 + V2)
// Grouped logically to keep component code clean.

export const HandoverSemantics = {
  // Submodel semantic
  SUBMODEL_V3: '0173-1#01-AHF578#003',

  // Containers / Document Collections
  CONTAINER_V2: '0173-1#02-ABI500#003',
  DOCUMENT_V2: '0173-1#02-ABI500#003/0173-1#01-AHF579#003',
  DOCUMENT_V2_VARIANT_LEGACY: '0173-1#02-ABI500#001/0173-1#01-AHF579#001*01',
  DOCUMENT_ID_LIST_V2: '0173-1#02-ABI501#003',
  DOCUMENT_CLASSIFICATION_LIST_V2: '0173-1#02-ABI502#003',

  // Legacy document semantics
  DOCUMENT_V1_A: '0173-1#02-ABI500#001/0173-1#01-AHF579#001',
  DOCUMENT_V1_B: '0173-1#02-ABH990#001',

  // Version structures
  VERSION_LIST_V2: '0173-1#02-ABI503#003',
  VERSION_SINGLE_V1: '0173-1#02-ABI503#001/0173-1#01-AHF582#001',
  VERSION_SINGLE_V1_VARIANT: '0173-1#02-ABI503#003/0173-1#01-AHF582#003*01',

  // File group semantics
  FILE_LIST_V2: '0173-1#02-ABK126#002',
  FILE_DIGITAL_LEGACY: '0173-1#02-ABK126#003',
  FILE_PREVIEW_LEGACY: '0173-1#02-ABK127#002',
  FILE_GENERIC_LEGACY: '0173-1#02-ABK126#003',

  // Title / Metadata semantics (optional future use)
  TITLE_LEGACY: '0173-1#02-ABH998#001',
} as const;

// Convenient grouped arrays for detection
export const HandoverSemanticGroups = {
  LEGACY_DOCUMENTS: [
    '0173-1#02-ABI500#001/0173-1#01-AHF579#001',
    '0173-1#02-ABH990#001',
    '0173-1#02-ABI500#003/0173-1#01-AHF579#003',
    '0173-1#02-ABI500#003/0173-1#01-AHF579#003*01',
  ],
  LEGACY_VERSION_SINGLE: [
    '0173-1#02-ABI503#001/0173-1#01-AHF582#001',
    '0173-1#02-ABI503#003/0173-1#01-AHF582#003*01',
    '0173-1#02-ABI503#001/0173-1#01-AHF582#001*01',
  ],
  LEGACY_FILE_SEMANTICS: [
    '0173-1#02-ABI505#001/0173-1#01-AHF584#001',
    '0173-1#02-ABI504#001/0173-1#01-AHF583#001',
    '0173-1#02-ABK126#003',
  ],
};

export type HandoverSemanticKey = keyof typeof HandoverSemantics;
