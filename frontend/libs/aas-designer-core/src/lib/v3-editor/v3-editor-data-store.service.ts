import { Injectable, signal } from '@angular/core';
import { EditorDescriptor } from '@aas/webapi-client';

@Injectable({
  providedIn: 'root',
})
export class V3EditorDataStoreService {
  editorDescriptor = signal<EditorDescriptor | undefined>(undefined);
}
