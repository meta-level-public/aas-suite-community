import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-accessdenied',
  templateUrl: './app.accessdenied.component.html',
  imports: [Button, RouterLink, TranslateModule],
})
export class AppAccessdeniedComponent {}
