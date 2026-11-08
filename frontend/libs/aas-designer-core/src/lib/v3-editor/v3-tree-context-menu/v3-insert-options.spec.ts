import { SubmodelTemplate } from '@aas-designer-model';
import { CMTypeOption } from '../model/cm-type-option';
import { buildAvailableElements, buildAvailableSubmodelGroups } from './v3-insert-options';

const translate = (key: string) => `t(${key})`;

function template(label: string, group: string, id: number): SubmodelTemplate {
  return Object.assign(new SubmodelTemplate(), { label, group, id, submodelVersion: '1.0' });
}

describe('v3 insert options', () => {
  it('offers only the element types that may be inserted, translated', () => {
    const allowed = [CMTypeOption.Property, CMTypeOption.Range, CMTypeOption.Entity];

    const elements = buildAvailableElements((type) => allowed.includes(type), translate);

    expect(elements.map((e) => e.createElement).sort()).toEqual([...allowed].sort());
    expect(elements.find((e) => e.createElement === CMTypeOption.Range)).toEqual({
      label: 'RANGE',
      translatedLabel: 't(RANGE)',
      description: 'RANGE_DESC',
      createElement: CMTypeOption.Range,
    });
  });

  it('groups the submodel templates and always offers a custom submodel and the IDTA repository', () => {
    const groups = buildAvailableSubmodelGroups(
      [template('ZETA', 'OTHER', 3), template('NAMEPLATE', 'IDTA', 1), template('BOM', '', 2)],
      translate,
    );

    expect(groups.map((g) => g.label)).toEqual([
      't(OTHER)',
      't(INTEGRATED_TEMPLATES)',
      't(IDTA_TEMPLATES_LIVE_FROM_REPO)',
    ]);
    expect(groups[0].submodels.map((s) => s.label)).toEqual(['CUSTOM', 'ZETA']);
    expect(groups[0].submodels[0].createElement).toBe(CMTypeOption.Submodel);
    expect(groups[1].submodels.map((s) => s.label)).toEqual(['BOM', 'NAMEPLATE']);
    expect(groups[1].submodels[0]).toMatchObject({
      createElement: CMTypeOption.SubmodelTemplate,
      description: 'BOM_DESC',
      id: 2,
    });
    expect(groups[2]).toMatchObject({ id: 'IdtaSmtRepo', submodels: [] });
  });

  it('adds a VDMA group only when VDMA templates exist', () => {
    const groups = buildAvailableSubmodelGroups([template('VDMA_TPL', 'VDMA', 5)], translate);

    expect(groups.map((g) => g.label)).toContain('VDMA');
    expect(groups.find((g) => g.label === 'VDMA')?.submodels.map((s) => s.id)).toEqual([5]);
  });
});
