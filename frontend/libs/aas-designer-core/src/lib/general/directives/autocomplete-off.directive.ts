import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[vwsAutocompleteOff]',
})
export class AutocompleteOffDirective implements OnInit {
  constructor(private el: ElementRef) {
    el.nativeElement.setAttribute('autocomplete', 'new-password');
    el.nativeElement.setAttribute('autocorrect', 'off');
    el.nativeElement.setAttribute('autocapitalize', 'none');
    el.nativeElement.setAttribute('spellcheck', 'false');
  }

  ngOnInit() {
    const innerEl = this.el.nativeElement.children[0]?.children[0];
    if (innerEl != null) {
      innerEl.setAttribute('autocomplete', 'new-password');
      innerEl.setAttribute('autocorrect', 'off');
      innerEl.setAttribute('autocapitalize', 'none');
      innerEl.setAttribute('spellcheck', 'false');
    }
  }
}
