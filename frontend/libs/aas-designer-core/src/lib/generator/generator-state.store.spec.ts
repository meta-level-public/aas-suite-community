import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { GeneratorStateStore } from './generator-state.store';

describe('GeneratorStateStore', () => {
  it('keeps shell submodel references synchronized with the submodel state', () => {
    const store = new GeneratorStateStore();
    const shell = new aas.types.AssetAdministrationShell(
      'urn:test:aas',
      new aas.types.AssetInformation(aas.types.AssetKind.Instance),
    );
    const submodel = new aas.types.Submodel('urn:test:submodel');

    store.initialize(shell, [submodel]);

    expect(store.shell()?.submodels?.[0].keys[0].value).toBe('urn:test:submodel');

    store.setSubmodels([]);

    expect(store.shell()?.submodels).toBeNull();
  });

  it('keeps the asset kind when asset metadata is updated without a kind', () => {
    const store = new GeneratorStateStore();
    store.updateAssetMetadata({ kind: 'Instance' }, 'https://example.com/');

    store.updateAssetMetadata(
      { assetShellId: 'releaseTestPump', assetShellDescription: [{ language: 'en', text: 'Release test pump' }] },
      'https://example.com/',
    );

    expect(store.shell()?.assetInformation.assetKind).toBe(aas.types.AssetKind.Instance);
  });
});
