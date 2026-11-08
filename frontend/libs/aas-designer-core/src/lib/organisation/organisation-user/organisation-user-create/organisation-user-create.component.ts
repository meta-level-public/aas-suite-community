import { DirtyCheckable, UserInvitation } from '@aas-designer-model';
import { emailRegEx } from '@aas/model';
import { Component, input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { KeyFilterModule } from '@openng/optimus-ui/keyfilter';
import { MessageModule } from '@openng/optimus-ui/message';
import { OrganisationService } from '../../organisation.service';

@Component({
  selector: 'aas-organisation-user-create',
  templateUrl: './organisation-user-create.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, MessageModule, InputTextModule, TranslateModule, KeyFilterModule, CheckboxModule],
})
export class OrganisationUserCreateComponent extends DirtyCheckable implements OnInit {
  invitation = input.required<UserInvitation>();

  availableRoles: string[] = [];
  @ViewChild('orgaUserForm') form: NgForm | undefined;

  emailRegEx = emailRegEx;

  constructor(private organisationService: OrganisationService) {
    super();
  }

  async ngOnInit() {
    this.availableRoles = await this.organisationService.getAvailableRoles();
  }

  override isDirty() {
    return this.form?.dirty === true && this.form?.submitted === false;
  }

  isValid() {
    return this.invitation().isValid() && this.form?.valid === true;
  }

  validEmail() {
    return this.invitation().email.match(emailRegEx) != null;
  }
}
