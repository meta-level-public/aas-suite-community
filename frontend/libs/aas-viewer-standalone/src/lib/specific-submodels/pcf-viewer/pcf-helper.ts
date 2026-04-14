import { ISubmodelElement, Property, SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';

export class PcfHelper {
  static getPcfEmissionFactorElement(pcf: SubmodelElementCollection | undefined) {
    if (pcf == null) return null;
    const el = pcf.value?.find((e) => this.hasSemanticId(e, 'FL40-1#02-EmFac1#001'));
    return (el as Property) ?? null;
  }
  static getPcfEnergyUsageCumulated(pcf: SubmodelElementCollection | undefined): any {
    if (pcf == null) return null;
    const el = pcf.value?.find((e) => this.hasSemanticId(e, 'FL40-1#02-kwh1#001'));
    return (el as Property)?.value ?? null;
  }
  static getPcfEnergyUsageCumulatedElement(pcf: SubmodelElementCollection | undefined) {
    if (pcf == null) return null;
    const el = pcf.value?.find((e) => this.hasSemanticId(e, 'FL40-1#02-kwh1#001'));
    return (el as Property) ?? null;
  }
  static getPcfEmissionFactor(pcf: SubmodelElementCollection | undefined): any {
    if (pcf == null) return null;
    const el = pcf.value?.find((e) => this.hasSemanticId(e, 'FL40-1#02-EmFac1#001'));
    return (el as Property)?.value ?? null;
  }
  static getPcfAddress(pcf: SubmodelElementCollection | undefined | null) {
    if (pcf == null) return null;
    const el = pcf?.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABI497#001'));
    return (el as SubmodelElementCollection) ?? [];
  }

  static getLat(addr: SubmodelElementCollection | undefined | null) {
    if (addr == null) return null;
    const el = addr.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABH960#001'));

    const val = (el as Property)?.value;
    return val != null && val !== '' ? +val : null;
  }

  static getLng(addr: SubmodelElementCollection | undefined | null) {
    if (addr == null) return null;
    const el = addr.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABH961#001'));

    const val = (el as Property)?.value;
    return val != null && val !== '' ? +val : null;
  }

  static getTcfHandoverAddress(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return null;
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABI498#001'));
    return (el as SubmodelElementCollection) ?? [];
  }
  static getTcfTakeoverAddress(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return null;
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABI499#001'));
    return (el as SubmodelElementCollection) ?? [];
  }

  static hasSemanticId(sme: ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.trim() === semanticId) != null;
  }

  static getStreet(addr: SubmodelElementCollection | undefined | null) {
    if (addr == null) return '';
    const el = addr.value?.find((e) => PcfHelper.hasSemanticId(e, '0173-1#02-ABH956#001'));
    return (el as Property)?.value ?? '';
  }

  static getHousenumber(addr: SubmodelElementCollection | undefined | null) {
    if (addr == null) return '';
    const el = addr.value?.find((e) => PcfHelper.hasSemanticId(e, '0173-1#02-ABH957#001'));
    return (el as Property)?.value ?? '';
  }

  static getZip(addr: SubmodelElementCollection | undefined | null) {
    if (addr == null) return '';
    const el = addr.value?.find((e) => PcfHelper.hasSemanticId(e, '0173-1#02-ABH958#001'));
    return (el as Property)?.value ?? '';
  }

  static getCityTown(addr: SubmodelElementCollection | undefined | null) {
    if (addr == null) return '';
    const el = addr.value?.find((e) => PcfHelper.hasSemanticId(e, '0173-1#02-ABH959#001'));
    return (el as Property)?.value ?? '';
  }

  static getCountryCode(addr: SubmodelElementCollection | undefined | null) {
    if (addr == null) return '';
    const el = addr.value?.find((e) => PcfHelper.hasSemanticId(e, '0173-1#02-AAO259#005'));
    return (el as Property)?.value ?? '';
  }

  static getTcfProcessesForGreenhouseGasEmissionInATransportService(
    element: SubmodelElementCollection | undefined | null,
  ) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG863#001'));
    return (el as Property)?.value ?? '';
  }

  static getTcfQuantityOfMeasureForCalculation(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG862#001'));
    return (el as Property)?.value ?? '';
  }

  static getTcfCalculationMethod(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG859#001'));
    return (el as Property)?.value ?? '';
  }

  static getTcfCo2Eq(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find(
      (e) => this.hasSemanticId(e, '0173-1#02-ABG860#001') || this.hasSemanticId(e, 'FL40-1#02-PCFEq1#001'),
    );
    return (el as Property)?.value ?? '';
  }

  static getTcfReferenceValueForCalculation(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG861#001'));
    return (el as Property)?.value ?? '';
  }

  static getPcfCalculationMethod(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG854#001'));
    return (el as Property)?.value ?? '';
  }

  static getPcfCo2Eq(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG855#001'));
    return (el as Property)?.value ?? '';
  }

  static getPcfCo2EqElement(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return null;
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG855#001'));
    return (el as Property) ?? null;
  }

  static getPcfReferenceValueForCalculation(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG856#001'));
    return (el as Property)?.value ?? '';
  }

  static getPcfQuantityOfMeasureForCalculation(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG857#001'));
    return (el as Property)?.value ?? '';
  }

  static getPcfLifecyclePhase(element: SubmodelElementCollection | undefined | null) {
    if (element == null) return '';
    const el = element.value?.find((e) => this.hasSemanticId(e, '0173-1#02-ABG858#001'));
    return (el as Property)?.value ?? '';
  }
}
