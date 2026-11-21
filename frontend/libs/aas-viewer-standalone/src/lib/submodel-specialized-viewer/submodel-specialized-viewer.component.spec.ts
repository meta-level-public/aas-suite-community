import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SubmodelSpecializedViewerComponent } from './submodel-specialized-viewer.component';

function emptySubmodel() {
  const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
  property.idShort = 'Title';
  const submodel = new aas.types.Submodel('urn:test:submodel');
  submodel.submodelElements = [property];
  return { submodel, property };
}

describe('SubmodelSpecializedViewerComponent', () => {
  it('notices when an empty submodel is filled in place', () => {
    const { submodel, property } = emptySubmodel();
    const component = new SubmodelSpecializedViewerComponent();
    component.submodel = submodel;
    component.ngOnChanges();
    expect(component.hasValues).toBe(false);

    property.value = 'Betriebsanleitung';
    component.ngDoCheck();

    expect(component.hasValues).toBe(true);
  });
});
