import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@analogjs/vitest-angular/setup-zone';
import '@angular/compiler';
import '@angular/platform-browser-dynamic';

setupTestBed({
  zoneless: false,
});
