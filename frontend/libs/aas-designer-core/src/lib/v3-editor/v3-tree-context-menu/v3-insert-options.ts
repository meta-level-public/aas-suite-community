import { SubmodelTemplate } from '@aas-designer-model';
import { CMTypeOption } from '../model/cm-type-option';
import { AvailableSubmodel } from './available-submodel';
import { AvailableElementItem } from './dialogs/insert-element/v3-insert-element-dialog.component';

/** Group of the "insert submodel" dialog. */
export interface AvailableSubmodelGroup {
  label: string;
  id?: string;
  submodels: AvailableSubmodel[];
}

type Translate = (key: string) => string;

const ELEMENT_OPTIONS: { label: string; description: string; createElement: CMTypeOption }[] = [
  { label: 'PROPERTY', description: 'PROPERTY_DESC', createElement: CMTypeOption.Property },
  { label: 'MLP', description: 'PROPERTY_DESC', createElement: CMTypeOption.MultiLanguageProperty },
  { label: 'SMC', description: 'SMC_DESC', createElement: CMTypeOption.SubmodelElementCollection },
  { label: 'SML', description: 'SML_DESC', createElement: CMTypeOption.SubmodelElementList },
  { label: 'FILE', description: 'FILE_DESC', createElement: CMTypeOption.File },
  { label: 'BLOB', description: 'BLOB_DESC', createElement: CMTypeOption.Blob },
  { label: 'OPR', description: 'OPR_DESC', createElement: CMTypeOption.Operation },
  { label: 'REF', description: 'REF_DESC', createElement: CMTypeOption.ReferenceElement },
  { label: 'ENTITY', description: 'ENTITYDESC', createElement: CMTypeOption.Entity },
  {
    label: 'RELATIONSHIP_ELEMENT',
    description: 'RELATIONSHIP_ELEMENT_DESC',
    createElement: CMTypeOption.RelationshipElement,
  },
  { label: 'RANGE', description: 'RANGE_DESC', createElement: CMTypeOption.Range },
  {
    label: 'CONTACT_INFORMATION',
    description: 'CONTACT_INFORMATION_DESC',
    createElement: CMTypeOption.ContactInformation,
  },
  {
    label: 'CONCEPT_DESCRIPTION',
    description: 'CONCEPT_DESCRIPTION_DESC',
    createElement: CMTypeOption.ConceptDescription,
  },
];

/** Element types that may be inserted (according to `isInsertAllowed`), sorted by label. */
export function buildAvailableElements(
  isInsertAllowed: (type: CMTypeOption) => boolean,
  translate: Translate,
): AvailableElementItem[] {
  return ELEMENT_OPTIONS.filter((option) => isInsertAllowed(option.createElement))
    .map((option) => ({ ...option, translatedLabel: translate(option.label) }))
    .sort((a, b) => a.label.localeCompare(b.translatedLabel));
}

/**
 * Groups of the submodel dialog: own/other templates (with "custom submodel" first), integrated IDTA templates,
 * VDMA templates (only if available) and the live IDTA repository.
 */
export function buildAvailableSubmodelGroups(
  templates: SubmodelTemplate[],
  translate: Translate,
): AvailableSubmodelGroup[] {
  const toAvailableSubmodel = (tpl: SubmodelTemplate): AvailableSubmodel => ({
    label: tpl.label,
    submodelVersion: tpl.submodelVersion,
    translatedLabel: translate(tpl.label),
    description: tpl.label + '_DESC',
    createElement: CMTypeOption.SubmodelTemplate,
    group: tpl.group,
    id: tpl.id ?? 0,
  });
  const templatesOfGroups = (...groups: string[]) =>
    templates
      .filter((t) => groups.includes(t.group))
      .map(toAvailableSubmodel)
      .sort((a, b) => a.label.localeCompare(b.label));

  const groups: AvailableSubmodelGroup[] = [
    {
      label: translate('OTHER'),
      submodels: [
        {
          label: 'CUSTOM',
          submodelVersion: '',
          translatedLabel: translate('CUSTOM'),
          description: 'CUSTOM_DESC',
          createElement: CMTypeOption.Submodel,
          group: 'OTHER',
          id: 0,
        },
        ...templatesOfGroups('OTHER'),
      ],
    },
    {
      label: translate('INTEGRATED_TEMPLATES'),
      submodels: templatesOfGroups('IDTA', ''),
    },
  ];

  const submodelsVdma = templatesOfGroups('VDMA');
  if (submodelsVdma.length > 0) {
    groups.push({ label: 'VDMA', submodels: submodelsVdma });
  }

  groups.push({
    label: translate('IDTA_TEMPLATES_LIVE_FROM_REPO'),
    id: 'IdtaSmtRepo',
    submodels: [],
  });
  return groups;
}
