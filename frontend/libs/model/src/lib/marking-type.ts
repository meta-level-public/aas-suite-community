export interface MarkingType {
  irdi: string;
  preferredNameEn: string;
  filename: string;
  additionalText: string;
}

export class MarkingTypeCatalog {
  static types: MarkingType[] = [
    {
      irdi: '0173-1#07-AAB047#003',
      preferredNameEn: 'CCC',
      filename: 'ccc-logo.svg',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-DAA603#004',
      preferredNameEn: 'CE',
      filename: 'ce-logo.svg',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-AAA555#001',
      preferredNameEn: 'CECC mark of conformity',
      filename: 'cecc-logo.svg',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-AAU119#001',
      preferredNameEn: 'DGRL',
      filename: '',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-ABC243#001',
      preferredNameEn: 'EAC',
      filename: 'eac-logo.gif',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-WAA099#003',
      preferredNameEn: 'EEx ia',
      filename: 'ex-logo.svg',
      additionalText: 'ia',
    },
    {
      irdi: '0173-1#07-WAA102#003',
      preferredNameEn: 'EExedIIC',
      filename: 'ex-logo.svg',
      additionalText: 'dIIC',
    },
    {
      irdi: '0173-1#07-WAA101#003',
      preferredNameEn: 'EExmII',
      filename: 'ex-logo.svg',
      additionalText: 'mII',
    },
    {
      irdi: '0173-1#07-WAA094#003',
      preferredNameEn: 'Explosion-proof',
      filename: 'ex-logo.svg',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-AAA374#003',
      preferredNameEn: 'GS mark of conformity',
      filename: 'gs-logo.svg',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-AAA375#001',
      preferredNameEn: 'TÜV sign',
      filename: 'tuvsud-logo.svg',
      additionalText: '',
    },
    {
      irdi: '0173-1#07-AAA554#001',
      preferredNameEn: 'VDE mark of conformity',
      filename: 'vde-logo.svg',
      additionalText: '',
    },
  ];
}
