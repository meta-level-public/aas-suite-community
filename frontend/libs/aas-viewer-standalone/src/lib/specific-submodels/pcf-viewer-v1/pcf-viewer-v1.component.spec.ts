import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PcfViewerV1Component } from './pcf-viewer-v1.component';

describe('PcfViewerV1Component', () => {
  let component: PcfViewerV1Component;
  let fixture: ComponentFixture<PcfViewerV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PcfViewerV1Component],
    }).compileComponents();

    fixture = TestBed.createComponent(PcfViewerV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
