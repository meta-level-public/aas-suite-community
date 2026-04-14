export class EncodingService {
  static base64urlEncodeBuffer(buffer: ArrayBuffer): string {
    return btoa(Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(''))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  static base64urlDecode(value: string): ArrayBuffer {
    const m = value.length % 4;
    return Uint8Array.from(
      atob(
        value
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(value.length + (m === 0 ? 0 : 4 - m), '='),
      ),
      (c) => c.charCodeAt(0),
    ).buffer;
  }

  static base64urlEncode(stringToEncode: string): string {
    const ab = new TextEncoder().encode(stringToEncode);

    return EncodingService.base64urlEncodeBuffer(ab.buffer);
  }
}
