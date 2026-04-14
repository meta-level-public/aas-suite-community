import { Clipboard } from '@angular/cdk/clipboard';

import { NotificationService } from '@aas/common-services';
import { AutocompleteOffDirective } from '@aas/helpers';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';

@Component({
  selector: 'aas-password',
  templateUrl: './password.component.html',
  imports: [Password, FormsModule, AutocompleteOffDirective, Button, TranslateModule],
})
export class PasswordComponent {
  @Input() passwordInput: string = '';
  @Input() showOptions: boolean = true;
  @Output() passwordOutput = new EventEmitter<string>();

  constructor(
    private notificationService: NotificationService,
    private clipboard: Clipboard,
  ) {}
  setPassword(): void {
    this.passwordOutput.emit(this.passwordInput);
  }

  generatePassword() {
    this.passwordInput = this.createPassword();
    this.setPassword();
  }
  copyPasswordToClipboard() {
    if (this.passwordInput.length > 0) {
      this.clipboard.copy(this.passwordInput);
      this.notificationService.showMessageAlways('PASSWORD_COPIED', 'SUCCESS', 'success', false);
    }
  }

  private createPassword(length = 16): string {
    const numberChars = '0123456789';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÜÖ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyzÄÜÖ';
    const allChars = numberChars + upperChars + lowerChars + ';:?!_-.,&%';
    let randPasswordArray = Array(length);
    randPasswordArray[0] = numberChars;
    randPasswordArray[1] = upperChars;
    randPasswordArray[2] = lowerChars;
    randPasswordArray = randPasswordArray.fill(allChars, 3);
    return this.shuffleArray(
      randPasswordArray.map(function (x) {
        return x[Math.floor(Math.random() * x.length)];
      }),
    ).join('');
  }

  private shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
}
