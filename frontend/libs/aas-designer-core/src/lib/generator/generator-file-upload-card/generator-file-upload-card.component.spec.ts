import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { vi } from 'vitest';
import { GeneratorFileUploadCardComponent } from './generator-file-upload-card.component';

describe('GeneratorFileUploadCardComponent', () => {
  async function createComponent(inputs?: Record<string, unknown>) {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), GeneratorFileUploadCardComponent],
    }).compileComponents();

    const fixture: ComponentFixture<GeneratorFileUploadCardComponent> = TestBed.createComponent(
      GeneratorFileUploadCardComponent,
    );

    if (inputs != null) {
      for (const [key, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(key, value);
      }
    }

    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function createDragEvent(files: File[] = []) {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files,
        dropEffect: 'none',
      },
    } as unknown as DragEvent;
  }

  it('emits the first dropped file that matches the accept filter', async () => {
    const { component } = await createComponent({ accept: 'image/*' });
    const emitSpy = vi.spyOn(component.fileSelected, 'emit');
    const heicFile = new File(['preview'], 'preview.heic', { type: 'image/heic' });
    const dragEvent = createDragEvent([heicFile]);

    component.onDrop(dragEvent);

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [heicFile],
        currentFiles: [heicFile],
      }),
    );
    expect(component.dropZoneHovered()).toBe(false);
  });

  it('ignores dropped files that do not match the accept filter', async () => {
    const { component } = await createComponent({ accept: 'image/*' });
    const emitSpy = vi.spyOn(component.fileSelected, 'emit');
    const dragEvent = createDragEvent([new File(['text'], 'notes.txt', { type: 'text/plain' })]);

    component.onDrop(dragEvent);

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.dropZoneHovered()).toBe(false);
  });

  it('tracks hover state while a file is dragged over the card', async () => {
    const { component } = await createComponent();
    const dragEvent = createDragEvent();

    component.onDragOver(dragEvent);
    expect(component.dropZoneHovered()).toBe(true);

    component.onDragLeave(dragEvent);
    expect(component.dropZoneHovered()).toBe(false);
  });
});
