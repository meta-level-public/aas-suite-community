import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class NgxObjectDiffService {
  private openChar = '{';
  private closeChar = '}';

  constructor(private sanitizer: DomSanitizer) {}

  /* service methods */

  /**
   * @param char
   */
  public setOpenChar(char: string) {
    this.openChar = char;
  }

  /**
   * @param char
   */
  public setCloseChar(char: string) {
    this.closeChar = char;
  }

  /**
   * diff between object a and b
   * @param a
   * @param b
   * @param shallow
   * @param isOwn
   * @return
   */
  public diff(a: any, b: any, shallow?: boolean, isOwn?: boolean) {
    if (a === b) {
      return this.equalObj(a);
    }

    const diffValue: any = {};
    let equal = true;

    for (const key in a) {
      if ((!isOwn && key in b) || (isOwn && typeof b !== 'undefined' && Object.prototype.hasOwnProperty.call(b, key))) {
        if (a[key] === b[key]) {
          diffValue[key] = this.equalObj(a[key]);
        } else {
          if (!shallow && this.isValidAttr(a[key], b[key])) {
            const valueDiff = this.diff(a[key], b[key], shallow, isOwn);
            if (valueDiff.changed === 'equal') {
              diffValue[key] = this.equalObj(a[key]);
            } else {
              equal = false;
              diffValue[key] = valueDiff;
            }
          } else {
            equal = false;
            diffValue[key] = {
              changed: 'primitive change',
              removed: a[key],
              added: b[key],
            };
          }
        }
      } else {
        equal = false;
        diffValue[key] = {
          changed: 'removed',
          value: a[key],
        };
      }
    }

    for (const key in b) {
      if (
        (!isOwn && !(key in a)) ||
        (isOwn && typeof a !== 'undefined' && !Object.prototype.hasOwnProperty.call(a, key))
      ) {
        equal = false;
        diffValue[key] = {
          changed: 'added',
          value: b[key],
        };
      }
    }

    if (equal) {
      return this.equalObj(a);
    } else {
      return {
        changed: 'object change',
        value: diffValue,
      };
    }
  }

  /**
   * compare and build the difference of two objects taking only its own properties into account
   * @param a
   * @param b
   * @param shallow
   */
  public diffOwnProperties(a: any, b: any, shallow?: boolean) {
    return this.diff(a, b, shallow, true);
  }

  /**
   * Convert to a readable xml/html Json structure
   * @param changes
   * @return
   * @param shallow
   */
  public toJsonView(changes: any, shallow?: boolean) {
    return this.formatToJsonXMLString(changes, shallow);
  }

  /**
   * Convert to a readable xml/html Json structure
   * @return
   * @param obj
   * @param shallow
   */
  public objToJsonView(object: any, shallow?: boolean) {
    return this.formatObjToJsonXMLString(object, shallow);
  }

  /**
   * Convert to a readable xml/html Json structure
   * @param changes
   * @return
   * @param shallow
   */
  public toJsonDiffView(changes: any, shallow?: boolean) {
    return this.formatChangesToXMLString(changes, shallow);
  }

  /**
   * Convert to a readable xml/html Json structure
   * Convert to a readable xml/html Json structure
   * @return
   * @param obj
   * @param shallow
   */
  private formatObjToJsonXMLString(obj: any, shallow?: boolean) {
    return this.sanitizer.bypassSecurityTrustHtml(this.inspect(obj, shallow));
  }

  /**
   * Convert to a readable xml/html Json structure
   * @param changes
   * @return
   * @param shallow
   */
  private formatToJsonXMLString(changes: any, shallow?: boolean) {
    const properties = [];

    const diff = changes.value;
    if (changes.changed === 'equal') {
      return this.sanitizer.sanitize(
        SecurityContext.HTML,
        this.sanitizer.bypassSecurityTrustHtml(this.inspect(diff, shallow)),
      );
    }

    for (const key in diff) {
      properties.push(this.formatChange(key, diff[key], shallow));
    }

    return this.sanitizer.sanitize(
      SecurityContext.HTML,
      this.sanitizer.bypassSecurityTrustHtml(
        '<span>' +
          this.openChar +
          '</span>\n<div class="diff-level">' +
          properties.join('<span>,</span>\n') +
          '\n</div><span>' +
          this.closeChar +
          '</span>',
      ),
    );
  }

  private formatChangesToXMLString(changes: any, shallow?: boolean) {
    const properties = [];

    if (changes.changed === 'equal') {
      return '';
    }

    const diff = changes.value;

    for (const key in diff) {
      const changed = diff[key].changed;
      if (changed !== 'equal') properties.push(this.formatChange(key, diff[key], shallow, true));
    }

    return this.sanitizer.sanitize(
      SecurityContext.HTML,
      this.sanitizer.bypassSecurityTrustHtml(
        '<span>' +
          this.openChar +
          '</span>\n<div class="diff-level">' +
          properties.join('<span>,</span>\n') +
          '\n</div><span>' +
          this.closeChar +
          '</span>',
      ),
    );
  }

  /**
   * @param key
   * @param diffItem
   * @returns
   * @param shallow
   * @param diffOnly
   */
  private formatChange(key: any, diffItem: any, shallow?: boolean, diffOnly?: any): any {
    const changed = diffItem.changed;
    let property;
    switch (changed) {
      case 'equal':
        property = this.stringifyObjectKey(this.escapeHTML(key)) + '<span>: </span>' + this.inspect(diffItem.value);
        break;

      case 'removed':
        property =
          '<del class="diff">' +
          this.stringifyObjectKey(this.escapeHTML(key)) +
          '<span>: </span>' +
          this.inspect(diffItem.value) +
          '</del>';
        break;

      case 'added':
        property =
          '<ins class="diff">' +
          this.stringifyObjectKey(this.escapeHTML(key)) +
          '<span>: </span>' +
          this.inspect(diffItem.value) +
          '</ins>';
        break;

      case 'primitive change':
        {
          const prefix = this.stringifyObjectKey(this.escapeHTML(key)) + '<span>: </span>';
          property =
            '<del class="diff diff-key">' +
            prefix +
            this.inspect(diffItem.removed) +
            '</del><span>,</span>\n' +
            '<ins class="diff diff-key">' +
            prefix +
            this.inspect(diffItem.added) +
            '</ins>';
        }
        break;

      case 'object change':
        property = shallow
          ? ''
          : this.stringifyObjectKey(key) +
            '<span>: </span>' +
            (diffOnly ? this.formatChangesToXMLString(diffItem) : this.formatToJsonXMLString(diffItem));
        break;
    }

    return property;
  }

  /**
   * @param obj
   * @return
   * @param shallow
   */
  private inspect(obj: any, shallow?: boolean) {
    return this._inspect('', obj, shallow);
  }

  /**
   * @param accumulator
   * @param obj
   * @see http://jsperf.com/continuation-passing-style/3
   * @return
   * @param shallow
   */
  private _inspect(accumulator: string, obj: any, shallow?: boolean) {
    switch (typeof obj) {
      case 'object':
        {
          if (!obj) {
            accumulator += 'null';
            break;
          }
          if (shallow) {
            accumulator += '[object]';
            break;
          }
          const keys = Object.keys(obj);
          const length = keys.length;
          if (length === 0) {
            accumulator += '<span>' + this.openChar + this.closeChar + '</span>';
          } else {
            accumulator += '<span>' + this.openChar + '</span>\n<div class="diff-level">';
            for (let i = 0; i < length; i++) {
              const key = keys[i];
              accumulator = this._inspect(
                accumulator + this.stringifyObjectKey(this.escapeHTML(key)) + '<span>: </span>',
                obj[key],
              );
              if (i < length - 1) {
                accumulator += '<span>,</span>\n';
              }
            }
            accumulator += '\n</div><span>' + this.closeChar + '</span>';
          }
        }
        break;

      case 'string':
        accumulator += JSON.stringify(this.escapeHTML(obj));
        break;

      case 'undefined':
        accumulator += 'undefined';
        break;

      default:
        accumulator += this.escapeHTML(String(obj));
        break;
    }
    return accumulator;
  }

  /**
   * @param key
   * @return
   */
  private stringifyObjectKey(key: string): string {
    return /^[a-z0-9_$]*$/i.test(key) ? key : JSON.stringify(key);
  }

  /**
   * @param string
   * @return
   */
  private escapeHTML(string: string) {
    return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * @param obj
   * @returns
   */
  private equalObj(obj: any) {
    return {
      changed: 'equal',
      value: obj,
    };
  }

  /**
   * @param a
   * @param b
   * @returns
   */
  private isValidAttr(a: any, b: any): boolean {
    const typeA = typeof a;
    const typeB = typeof b;
    return a && b && (typeA === 'object' || typeA === 'function') && (typeB === 'object' || typeB === 'function');
  }
}
