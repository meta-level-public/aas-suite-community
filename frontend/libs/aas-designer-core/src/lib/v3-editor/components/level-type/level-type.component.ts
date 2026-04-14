import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'aas-level-type',
  imports: [FormsModule, TranslateModule, CheckboxModule, ButtonModule, HelpLabelComponent],
  templateUrl: './level-type.component.html',
})
export class LevelTypeComponent {
  levelType = input.required<aas.types.LevelType | null>();
  levelTypeParent = input.required<aas.types.DataSpecificationIec61360>();

  addLevelType() {
    if (this.levelType() == null) {
      this.levelTypeParent().levelType = new aas.types.LevelType(false, false, false, false);
    }
  }

  removeLevelType() {
    if (this.levelType() != null) {
      this.levelTypeParent().levelType = null;
    }
  }
}
