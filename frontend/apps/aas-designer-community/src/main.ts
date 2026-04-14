import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { getAppConfig } from './app/app.config';

async function initializeApp() {
  await bootstrapApplication(App, getAppConfig());
}

initializeApp();
