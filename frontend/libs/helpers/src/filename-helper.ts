import * as aas from '@aas-core-works/aas-core3.1-typescript';
import './utif-shim';
export class FilenameHelper {
  private static readonly previewImageExtensions = new Set([
    'tif',
    'tiff',
    'jpg',
    'jfif',
    'jpeg',
    'png',
    'gif',
    'svg',
    'bmp',
    'webp',
  ]);

  private static readonly imageMimeTypesByExtension: Record<string, string> = {
    tif: 'image/tiff',
    tiff: 'image/tiff',
    jpg: 'image/jpeg',
    jfif: 'image/jfif',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  static getContentType(file: File | null | undefined) {
    if (file == null) {
      return 'application/octet-stream';
    }

    if (file.type != null && file.type !== '') {
      return file.type;
    }
    const imageContentType = this.getImageContentType(file.name);
    if (imageContentType != null) {
      return imageContentType;
    }
    if (file.name.endsWith('.vec') || file.name.endsWith('.kbl')) {
      return 'application/xml';
    }

    return 'application/octet-stream';
  }
  static isVideo(filename: string | null | undefined) {
    return filename?.toLowerCase().endsWith('.mp4');
  }

  static isMarkdown(filename: string | null | undefined) {
    return filename?.toLowerCase().endsWith('.md');
  }

  static isJson(filename: string | null | undefined) {
    return filename?.toLowerCase().endsWith('.json');
  }

  static isXmlType(filename: string | null | undefined) {
    return (
      filename?.toLowerCase().endsWith('.vec') ||
      filename?.toLowerCase().endsWith('.kbl') ||
      filename?.toLowerCase().endsWith('.xml')
    );
  }

  static isPdf(filename: string | null | undefined) {
    return filename != null && this.getExtension(filename, false) === 'pdf';
  }

  static isZip(filename: string | null | undefined) {
    return filename != null && this.getExtension(filename, false) === 'zip';
  }

  static isImage(filename: string | null | undefined) {
    return this.previewImageExtensions.has(this.getExtension(filename, false));
  }

  static getImageContentType(filename: string | null | undefined) {
    return this.imageMimeTypesByExtension[this.getExtension(filename, false)];
  }

  static isHeicImage(input: string | { name?: string | null; type?: string | null } | null | undefined): boolean {
    if (typeof input === 'string') {
      const extension = this.getExtension(input, false);
      return extension === 'heic' || extension === 'heif';
    }

    if (input == null) {
      return false;
    }

    const normalizedType = `${input.type ?? ''}`.trim().toLowerCase();
    if (normalizedType === 'image/heic' || normalizedType === 'image/heif') {
      return true;
    }

    const extension = this.getExtension(input.name ?? undefined, false);
    return extension === 'heic' || extension === 'heif';
  }

  static isTiffImage(input: string | { name?: string | null; type?: string | null } | null | undefined): boolean {
    if (typeof input === 'string') {
      const extension = this.getExtension(input, false);
      return extension === 'tif' || extension === 'tiff';
    }

    if (input == null) {
      return false;
    }

    const normalizedType = `${input.type ?? ''}`.trim().toLowerCase();
    if (normalizedType === 'image/tif' || normalizedType === 'image/tiff') {
      return true;
    }

    const extension = this.getExtension(input.name ?? undefined, false);
    return extension === 'tif' || extension === 'tiff';
  }

  static isUploadPreviewableImageFile(file: { name?: string | null; type?: string | null } | null | undefined) {
    if (file == null) {
      return false;
    }

    const normalizedType = `${file.type ?? ''}`.trim().toLowerCase();
    if (normalizedType.startsWith('image/')) {
      return true;
    }

    return this.getImageContentType(file.name ?? undefined) != null;
  }

  static async buildPreviewImageBlob(file: File) {
    if (this.isHeicImage(file)) {
      const { heicTo } = await import('heic-to/csp');
      const converted = await heicTo({
        blob: file,
        type: 'image/jpeg',
        quality: 0.9,
      });

      return converted instanceof Blob ? converted : new Blob([converted], { type: 'image/jpeg' });
    }

    if (this.isTiffImage(file)) {
      return await this.buildTiffPreviewBlob(file);
    }

    return file;
  }

  private static async buildTiffPreviewBlob(file: Blob): Promise<Blob> {
    if (typeof document === 'undefined') {
      return file;
    }

    const utifModule: any = await import('utif');
    const UTIF = utifModule?.default ?? utifModule;
    const arrayBuffer = await file.arrayBuffer();
    const ifds = UTIF.decode(arrayBuffer);
    const ifd = ifds?.[0];
    if (ifd == null) {
      return file;
    }

    UTIF.decodeImage(arrayBuffer, ifd);
    const rgba = UTIF.toRGBA8(ifd);
    const width = Number(ifd.width ?? ifd.t256 ?? 0);
    const height = Number(ifd.height ?? ifd.t257 ?? 0);
    if (width <= 0 || height <= 0) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (context == null) {
      return file;
    }

    const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);
    context.putImageData(imageData, 0, 0);

    const pngBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });

    return pngBlob ?? file;
  }

  static isPreviewable(filename: string | null | undefined) {
    return (
      this.isImage(filename) ||
      this.isVideo(filename) ||
      this.isPdf(filename) ||
      this.isZip(filename) ||
      this.isXmlType(filename) ||
      this.isJson(filename)
    );
  }

  static setMimeType(smeArray: any[], field: string, val: any) {
    const el = smeArray.find((sme: any) => sme.idShort === field);
    if (el != null) {
      el.mimeType = val;
    }
  }

  static sanitizeFilename(name: string) {
    // const searchRegExp = /\s/g;
    // const searchRegExpBracket = /[()]/g;
    // const searchRegExpDot = /\./g;

    const splitted = name.split('.');
    const ext = splitted[splitted.length - 1];

    name = name.replace('.' + ext, '');

    name = this.removeSpecialCharacters(name);

    // name = name.replace(/\.[^/.]+$/, '');

    // name = name.replace(searchRegExp, '_');
    // name = name.replace(searchRegExp, '_');
    // name = name.replace(searchRegExpBracket, '_');
    // name = name.replace(searchRegExpDot, '_');

    const regExpÄ = /Ä/gu;
    name = name.replace(regExpÄ, 'Ae');
    const regExpÖ = /Ö/gu;
    name = name.replace(regExpÖ, 'Oe');
    const regExpÜ = /Ü/gu;
    name = name.replace(regExpÜ, 'Ue');
    const regExpä = /ä/gu;
    name = name.replace(regExpä, 'ae');
    const regExpö = /ö/gu;
    name = name.replace(regExpö, 'oe');
    const regExpü = /ü/gu;
    name = name.replace(regExpü, 'ue');

    const regex = /([^a-zA-Z0-9]+)/gu;
    name = name.replace(regex, '_');

    return name + '.' + ext;
  }

  static removeSpecialCharacters(text: string): string {
    return (
      text
        // eslint-disable-next-line no-irregular-whitespace
        ?.replace(/\t|&nbsp;|​/g, ' ')
        // https://de.m.wikipedia.org/wiki/Unicodeblock_Kombinierende_diakritische_Zeichen
        ?.replace(/ä/g, 'ä')
        ?.replace(/ö/g, 'ö')
        ?.replace(/ü/g, 'ü')
        ?.replace(/Ä/g, 'Ä')
        ?.replace(/Ö/g, 'Ö')
        ?.replace(/Ü/g, 'Ü')
        ?.replace(/­/g, '')
    );
  }

  static getExtension(name: string | null | undefined, withDot: boolean = true) {
    if (name == null) return '';

    const splitted = name.split('.');
    const ext = splitted[splitted.length - 1];

    return (withDot ? '.' + ext : ext).toLowerCase();
  }

  static getNameWithoutExt(name: string) {
    const splitted = name.split('.');
    const ext = splitted[splitted.length - 1];

    return name.replace('.' + ext, '');
  }

  static isReferenced(filename: string, env: aas.types.Environment) {
    const counter: number[] = [0];

    env.submodels?.forEach((sm) => {
      this.countRecursive(filename, sm, counter);
    });

    const count = counter.reduce(function (a, b) {
      return a + b;
    });

    return count > 0;
  }

  static countRecursive(idToFind: string, parent: any, counter: number[]) {
    if (parent instanceof aas.types.File && parent.value === idToFind) {
      counter.push(1);
    }
    if (parent instanceof aas.types.SubmodelElementCollection || parent instanceof aas.types.SubmodelElementList) {
      for (const el of parent.value ?? []) {
        this.countRecursive(idToFind, el, counter);
      }
    }
    if (parent instanceof aas.types.Submodel) {
      for (const el of parent.submodelElements ?? []) {
        this.countRecursive(idToFind, el, counter);
      }
    }
  }

  static replaceFileUri(path: string | null | undefined) {
    return path?.replace('file:///aasx', '/aasx')?.replace('file:/aasx', '/aasx');
  }

  static isPreviewableContentType(contentType: string | undefined): any {
    if (contentType == null) return false;
    return (
      this.isImageContentType(contentType) ||
      this.isPdfContentType(contentType) ||
      this.isVideoContentType(contentType) ||
      this.isXmlContentType(contentType)
    );
  }

  static isImageContentType(contentType: string | undefined): any {
    if (contentType == null) return false;
    switch (contentType) {
      case 'image/tif':
      case 'image/tiff':
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/jfif':
      case 'image/png':
      case 'image/gif':
      case 'image/svg+xml':
      case 'image/bmp':
      case 'image/webp':
        return true;
      default:
        return false;
    }
  }

  static isPdfContentType(contentType: string | undefined): any {
    if (contentType == null) return false;
    return contentType === 'application/pdf';
  }

  static isVideoContentType(contentType: string | undefined): any {
    if (contentType == null) return false;
    return contentType === 'video/mp4';
  }

  static isXmlContentType(contentType: string | undefined): any {
    if (contentType == null) return false;
    return contentType === 'application/xml' || contentType === 'text/xml';
  }
}
