import assert from 'node:assert/strict';
import test from 'node:test';
import { formatOpenDppPassport } from './opendpp-passport';
import { formatPassport } from './passport-view-model';

const context = [
  'https://opendpp-node.eu/contexts/dpp/v1',
  { DigitalProductPassport: 'https://opendpp-node.eu/ns/dpp#DigitalProductPassport' },
];

test('maps OpenDPP battery fields and optional lists', () => {
  const view = formatOpenDppPassport({
    '@context': context, '@type': 'DigitalProductPassport',
    productName: 'Test cell', productId: '123', batteryCategory: 'industrial',
    electrochemicalCapacity: { value: 100, unit: 'Ah' }, stateOfCharge: 0,
    economicOperator: { name: 'Manufacturer' },
    carbonFootprint: { co2eKg: 742, unit: 'kg CO2e' },
    regulatoryCompliance: {
      ceMarking: false,
      certificates: [{ name: 'UN 38.3', issuer: 'Lab', referenceNumber: 'ABC' }],
      declarationOfConformityUrl: 'https://example.com/doc.pdf',
    },
    materialComposition: [{ material: 'Graphite', percentage: 24 }],
  });

  assert.equal(view?.title, 'Test cell');
  assert.deepEqual(view?.groups.find((group) => group.title === 'Batteriedaten')?.fields, [
    { label: 'Kategorie', value: 'industrial' },
    { label: 'Kapazität', value: '100 Ah' },
    { label: 'Ladezustand', value: '0 %' },
  ]);
  assert.deepEqual(view?.groups.find((group) => group.title === 'Konformität')?.fields, [
    { label: 'CE-Kennzeichnung', value: 'Nein' },
  ]);
  assert.equal(view?.documents[0].url, 'https://example.com/doc.pdf');
  assert.equal(view?.claims[0].title, 'UN 38.3');
  assert.equal(view?.materials[0].fields[0].value, '24 %');
  assert.equal(view?.materialChart?.total, 24);
  assert.match(view?.materialChart?.background ?? '', /#dce5e8 24% 100%/);
});

test('shows a complete circle only for a complete composition', () => {
  const base = { '@context': context, '@type': 'DigitalProductPassport' };
  const complete = formatOpenDppPassport({ ...base, materialComposition: [
    { material: 'Cathode', percentage: 32 }, { material: 'Anode', percentage: 24 },
    { material: 'Casing', percentage: 18 }, { material: 'Collector', percentage: 12 },
    { material: 'Electrolyte', percentage: 9 }, { material: 'Binder', percentage: 5 },
  ] });
  assert.equal(complete?.materialChart?.total, 100);
  assert.ok(complete?.materialChart?.background?.startsWith('conic-gradient('));
  assert.ok(!complete?.materialChart?.background?.includes('#dce5e8'));

  const excess = formatOpenDppPassport({ ...base, materialComposition: [
    { material: 'A', percentage: 80 }, { material: 'B', percentage: 30 },
  ] });
  assert.equal(excess?.materialChart?.background, null);
});

test('does not claim unknown or UNTP passports by shape or source URL', () => {
  assert.equal(formatOpenDppPassport({ '@type': 'DigitalProductPassport', productName: 'Unknown' }), null);
  assert.equal(formatOpenDppPassport({ '@context': context, credentialSubject: { name: 'UNTP' } }), null);
  assert.equal(formatOpenDppPassport({ '@context': context, '@type': 'OtherType' }), null);
});

test('uses UNTP mass fractions for the chart without adding recycled fractions', () => {
  const view = formatPassport({ credentialSubject: {
    name: 'Battery', materialProvenance: [
      { name: 'Lithium', massFraction: 0.4, recycledMassFraction: 0.1, mass: { value: 2, unit: 'KGM' } },
      { name: 'Iron', massFraction: 0.6, recycledMassFraction: 0.2 },
    ],
  } });
  assert.equal(view?.materialChart?.total, 100);
  assert.equal(view?.materialChart?.slices[0].percentage, 40);
  assert.equal(view?.materials[0].fields.find((field) => field.label === 'Rezyklatanteil')?.value, '10 %');
  assert.equal(view?.materials[0].fields.find((field) => field.label === 'Masse')?.value, '2 kg');
});

test('does not draw an incomplete UNTP composition as a full circle', () => {
  const view = formatPassport({ credentialSubject: {
    id: 'battery', materialProvenance: [{ name: 'Lithium', massFraction: 0.4 }],
  } });
  assert.equal(view?.materialChart?.total, 40);
  assert.match(view?.materialChart?.background ?? '', /#dce5e8 40% 100%/);
});
