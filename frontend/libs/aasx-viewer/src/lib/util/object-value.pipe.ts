import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectValue' })
export class ObjectValuePipe implements PipeTransform {
  transform(input: any): any[] {
    if (!this.isObject(input)) {
      return [];
    }
    return Object.values(input);
  }

  private isObject(value: any): boolean {
    return value != null && typeof value === 'object';
  }
}
