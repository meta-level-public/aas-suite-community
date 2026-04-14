import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-notfound',
  templateUrl: './app.notfound.component.html',
  imports: [Button, RouterLink, TranslateModule],
})
export class AppNotfoundComponent {}
