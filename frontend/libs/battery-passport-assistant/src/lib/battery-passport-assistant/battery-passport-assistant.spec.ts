import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BatteryPassportAssistant } from './battery-passport-assistant';
import { vi } from 'vitest';

describe('BatteryPassportAssistant', () => {
  let component: BatteryPassportAssistant;
  let fixture: ComponentFixture<BatteryPassportAssistant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BatteryPassportAssistant],
    }).compileComponents();

    fixture = TestBed.createComponent(BatteryPassportAssistant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('emits when chosen', () => {
    const emitSpy = vi.spyOn(component.chooseAssistant, 'emit');

    component.onChoose();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('does not emit while loading', () => {
    const emitSpy = vi.spyOn(component.chooseAssistant, 'emit');
    component.loading = true;

    component.onChoose();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
