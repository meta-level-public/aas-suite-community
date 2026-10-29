import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ViewerStoreService } from '../viewer-store.service';
import { OpenShellButtonComponent } from './open-shell-button.component';

describe('OpenShellButtonComponent', () => {
  let fixture: ComponentFixture<OpenShellButtonComponent>;
  let viewerStore: ViewerStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OpenShellButtonComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    viewerStore = TestBed.inject(ViewerStoreService);
    fixture = TestBed.createComponent(OpenShellButtonComponent);
  });

  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;

  it('is hidden when the host offers no navigation', () => {
    fixture.componentRef.setInput('aasId', 'urn:test:aas:schaukel');
    fixture.detectChanges();

    expect(button()).toBeNull();
  });

  it('is hidden when there is nothing to open', () => {
    viewerStore.shellNavigator.set(vi.fn());
    fixture.componentRef.setInput('globalAssetId', '  ');
    fixture.detectChanges();

    expect(button()).toBeNull();
  });

  it('opens the referenced AAS via the navigator of the host', () => {
    const navigator = vi.fn();
    viewerStore.shellNavigator.set(navigator);
    fixture.componentRef.setInput('globalAssetId', 'urn:test:asset:schaukel');
    fixture.detectChanges();

    button()?.click();

    expect(navigator).toHaveBeenCalledWith({ aasId: null, globalAssetId: 'urn:test:asset:schaukel' });
  });
});
