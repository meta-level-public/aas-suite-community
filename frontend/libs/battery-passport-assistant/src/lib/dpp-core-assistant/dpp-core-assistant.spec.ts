import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DppCoreAssistant } from './dpp-core-assistant';
import { vi } from 'vitest';

describe('DppCoreAssistant', () => {
  let component: DppCoreAssistant;
  let fixture: ComponentFixture<DppCoreAssistant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), DppCoreAssistant],
    }).compileComponents();

    fixture = TestBed.createComponent(DppCoreAssistant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('does not emit while loading', () => {
    const emitSpy = vi.spyOn(component.chooseAssistant, 'emit');
    component.loading = true;

    component.onChoose();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
