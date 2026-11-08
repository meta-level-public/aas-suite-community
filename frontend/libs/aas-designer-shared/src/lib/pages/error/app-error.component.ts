import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '@openng/optimus-ui/button';

@Component({
  selector: 'app-error',
  templateUrl: './app-error.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Button, RouterLink, TranslateModule],
})
export class AppErrorComponent {}
