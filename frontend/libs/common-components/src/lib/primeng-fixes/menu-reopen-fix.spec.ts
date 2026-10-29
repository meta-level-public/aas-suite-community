import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Menu } from 'primeng/menu';
import { beforeEach, describe, expect, it } from 'vitest';
import { patchMenuReopenWhileHiding } from './menu-reopen-fix';

@Component({
  imports: [Menu],
  template: `<button type="button">More</button>
    <p-menu [popup]="true" [model]="[{ label: 'Export' }]" appendTo="body"></p-menu>`,
})
class MenuHostComponent {
  menu = viewChild.required(Menu);
}

type MenuInternals = { onOverlayAfterLeave(): void; onOverlayBeforeEnter(event: { element: HTMLElement }): void };

describe('patchMenuReopenWhileHiding', () => {
  let menu: Menu;
  let internals: MenuInternals;
  let click: Event;

  beforeEach(() => {
    patchMenuReopenWhileHiding();
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(MenuHostComponent);
    fixture.detectChanges();
    menu = fixture.componentInstance.menu();
    internals = menu as unknown as MenuInternals;
    click = { currentTarget: fixture.nativeElement.querySelector('button') } as unknown as Event;
    // open, close and open again before the hide animation has finished
    menu.toggle(click);
    menu.toggle(click);
    menu.toggle(click);
  });

  function enter() {
    const overlay = document.createElement('div');
    internals.onOverlayBeforeEnter({ element: overlay });
    return overlay;
  }

  it('positions the menu when the hide animation ends before it is shown again', () => {
    internals.onOverlayAfterLeave();

    expect(() => enter().remove()).not.toThrow();
  });

  it('keeps the menu in the body when the hide animation ends after it was shown again', () => {
    const overlay = enter();
    internals.onOverlayAfterLeave();

    expect(overlay.parentElement).toBe(document.body);
    overlay.remove();
  });
});
