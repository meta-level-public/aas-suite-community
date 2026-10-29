import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConceptDescriptionService } from '../concept-description.service';
import { SemanticDescriptionPopupComponent } from './semantic-description-popup.component';

const popoversInBody = () => document.body.querySelectorAll('.p-popover').length;

function createPopup() {
  const popup = TestBed.createComponent(SemanticDescriptionPopupComponent);
  popup.componentRef.setInput('semanticId', 'urn:test:semantic:spielgeraete');
  popup.detectChanges();
  return popup;
}

describe('SemanticDescriptionPopupComponent', () => {
  let fixture: ComponentFixture<SemanticDescriptionPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SemanticDescriptionPopupComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        { provide: ConceptDescriptionService, useValue: { loadCD: vi.fn(async () => null) } },
      ],
    });
    fixture = createPopup();
  });

  afterEach(() => {
    document.body.querySelectorAll('.p-popover').forEach((popover) => popover.remove());
  });

  async function openPopover(popup = fixture) {
    const button = popup.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    await vi.waitFor(() => {
      popup.detectChanges();
      expect(popup.componentInstance.popover()?.overlayVisible).toBe(true);
      expect(popoversInBody()).toBeGreaterThan(0);
    });
  }

  it('does not pass the click on the info icon to surrounding elements like an accordion header', async () => {
    const surroundingClick = vi.fn();
    fixture.nativeElement.addEventListener('click', surroundingClick);

    await openPopover();

    expect(surroundingClick).not.toHaveBeenCalled();
  });

  it('closes an open description when another one is opened', async () => {
    const other = createPopup();
    await openPopover(other);

    await openPopover();

    expect(other.componentInstance.popover()?.overlayVisible).toBe(false);
    other.destroy();
  });

  it('removes an open popover from the document when the component is destroyed', async () => {
    await openPopover();

    fixture.destroy();

    expect(popoversInBody()).toBe(0);
  });

  it('removes a closing popover from the document when the component is destroyed', async () => {
    await openPopover();

    // a click outside starts the hide animation, e.g. when selecting another submodel
    document.body.click();
    fixture.detectChanges();
    fixture.destroy();

    expect(popoversInBody()).toBe(0);
  });
});
