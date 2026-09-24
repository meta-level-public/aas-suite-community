import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app.component';
import { requestContextInterceptor } from './request-context.interceptor';
import { csrfInterceptor } from './csrf.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([requestContextInterceptor, csrfInterceptor]))],
}).catch(console.error);
