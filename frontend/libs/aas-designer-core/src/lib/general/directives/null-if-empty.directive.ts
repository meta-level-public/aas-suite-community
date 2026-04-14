import { Directive, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[nullIfEmpty]',

  providers: [NgModel],
})
export class NullIfEmptyDirective {
  constructor(private ngModel: NgModel) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      this.ngModel.control.setValue(null);
    }
  }
}
