export class UrlHelper {
  static appendSlash(u: string) {
    if (u !== '') {
      try {
        const url = new URL(u);
        url.pathname += url.pathname.endsWith('/') ? '' : '/';
        return url.toString();
      } catch {
        if (!u.endsWith('/')) {
          return u + '/';
        }
      }
    }
    return u;
  }

  static openEclass(irdi: string) {
    const url =
      'https://eclass.eu/eclass-standard/content-suche/show?tx_eclasssearch_ecsearch%5Bsearchtxt%5D=' +
      encodeURIComponent(irdi);
    window.open(url, '_blank');
  }

  static openEclassProductclass(productclass: string) {
    productclass = productclass.replaceAll('-', '');
    const url = 'https://eclass.eu/eclass-standard/content-suche/show?tx_eclasssearch_ecsearch%5Bid%5D=' + productclass;
    window.open(url, '_blank');
  }

  static isIecCddId(id: string) {
    return (
      id.match(/^\d{4}\/\d{1,2}\/{3}\d{5}#\w{3}\d{3}#\d{3}$/) != null ||
      id.match(/^\d{4}\/\d{1,2}\/{3}\d{5}#\w{3}\d{3}$/) != null
    );
  }

  static openIecCdd(irdi: string) {
    const iecRegex = /^(\d{4}\/\d{1,2}\/{3}(\d{5})#\w{3}\d{3})#?\d{0,3}$/;
    const matches = irdi.match(iecRegex);

    const url =
      'https://cdd.iec.ch/CDD/IEC' +
      matches?.[2].toUpperCase() +
      '/iec' +
      matches?.[2] +
      '.nsf/PropertiesAllVersions/' +
      matches?.[1].replaceAll('/', '-').replaceAll('#', '%23');

    window.open(url, '_blank');
  }
  static openIecCddUnit(irdi: string) {
    const iecRegex = /^(\d{4}\/\d{1,2}\/{3}(\d{5})#\w{3}\d{3})#?\d{0,3}$/;
    const matches = irdi.match(iecRegex);

    const url =
      'https://cdd.iec.ch/CDD/IEC' +
      matches?.[2].toUpperCase() +
      '/iec' +
      matches?.[2] +
      '.nsf/units/' +
      matches?.[1].replaceAll('/', '-').replaceAll('#', '%23');

    window.open(url, '_blank');
  }

  static isEclassId(id: string) {
    return id.startsWith('0173-1#');
  }
}
