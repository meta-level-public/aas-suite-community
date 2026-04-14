import { Pipe, PipeTransform } from '@angular/core';
import { filesize } from 'filesize';
import { isNumber } from 'lodash-es';

@Pipe({
  name: 'filesize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  private static transformOne(value: number, options?: any) {
    if (isNumber(value)) {
      return filesize(value, options);
    }
    return value;
  }

  transform(value: number | number[], options?: any) {
    if (Array.isArray(value)) {
      return value.map((val) => FileSizePipe.transformOne(val, options));
    }

    return FileSizePipe.transformOne(value, options);
  }
}
