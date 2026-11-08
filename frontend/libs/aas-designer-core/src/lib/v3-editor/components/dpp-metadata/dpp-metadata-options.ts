export type DppGranularity = 'Item' | 'Model' | 'Batch';
export type DppStatus = 'Draft' | 'Active' | 'Suspended' | 'Withdrawn';

/** Select options for the DPP granularity; `label` is a translation key. */
export const DPP_GRANULARITY_OPTIONS: { value: DppGranularity; label: string }[] = [
  { value: 'Item', label: 'DPP_GRANULARITY_ITEM' },
  { value: 'Model', label: 'DPP_GRANULARITY_MODEL' },
  { value: 'Batch', label: 'DPP_GRANULARITY_BATCH' },
];

/** Select options for the DPP status; `label` is a translation key. */
export const DPP_STATUS_OPTIONS: { value: DppStatus; label: string }[] = [
  { value: 'Draft', label: 'DPP_STATUS_DRAFT' },
  { value: 'Active', label: 'DPP_STATUS_ACTIVE' },
  { value: 'Suspended', label: 'DPP_STATUS_SUSPENDED' },
  { value: 'Withdrawn', label: 'DPP_STATUS_WITHDRAWN' },
];
