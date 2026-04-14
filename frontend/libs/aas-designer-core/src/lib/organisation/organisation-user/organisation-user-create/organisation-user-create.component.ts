import { emailRegEx } from '@aas/model';
import { Component, input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageModule } from 'primeng/message';
import { DirtyCheckable } from '@aas-designer-model';
import { UserInvitation } from '@aas-designer-model';
import { OrganisationService } from '../../organisation.service';

@Component({
  selector: 'aas-organisation-user-create',
  templateUrl: './organisation-user-create.component.html',
  imports: [
    FormsModule,
    MessageModule,
    InputTextModule,
    FieldsetModule,
    TranslateModule,
    KeyFilterModule,
    CheckboxModule,
  ],
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
