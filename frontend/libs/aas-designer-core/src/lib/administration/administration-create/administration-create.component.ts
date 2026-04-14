import { Clipboard } from '@angular/cdk/clipboard';

import { DirtyCheckable, Organisation, OrganisationAdminBenutzer } from '@aas-designer-model';
import { AasEmailValidator, CountryCodeComponent } from '@aas/common-components';
import { AppConfigService, NotificationService, ThemeDefinitionService } from '@aas/common-services';
import { AutocompleteOffDirective } from '@aas/helpers';
import { emailRegEx } from '@aas/model';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Toolbar } from 'primeng/toolbar';
import { AuthRoles } from '../../general/model/auth-roles';
import { PasswordComponent } from '../../general/password/password.component';
import { AdministratorService } from '../administrator.service';

@Component({
  selector: 'aas-administration-create',
  templateUrl: './administration-create.component.html',
  imports: [
    FormsModule,
    AutocompleteOffDirective,
    Toolbar,
    Button,
    Button,
    Fieldset,
    InputText,
    CountryCodeComponent,
    Checkbox,
    Select,
    PasswordComponent,
    TranslateModule,
  ],
})
export class AdministrationCreateComponent extends DirtyCheckable implements OnInit {
  @ViewChild('adminOrgaCreateForm') form!: NgForm;
  @Output() showCreateComponent = new EventEmitter<boolean>();

  organisation: Organisation = new Organisation();

  admin: OrganisationAdminBenutzer = new OrganisationAdminBenutzer();

  loading = false;
  emailRegEx = emailRegEx;
  themeOptions: SelectItem[] = [];
  themeSelectionEnabled: boolean;

  constructor(
    private administratorService: AdministratorService,
    private notificationService: NotificationService,
    private clipboard: Clipboard,
    private translate: TranslateService,
    private themeDefinitionService: ThemeDefinitionService,
    appConfigService: AppConfigService,
  ) {
    super();

    this.themeSelectionEnabled = appConfigService.config.defaultTheme != null;
    this.admin.benutzerRollen = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER];
    this.organisation.themeUrl = 'default';
    this.themeOptions.push({ label: this.translate.instant('DEFAULT_THEME'), value: 'default' });
  }

  async ngOnInit() {
    if (this.themeSelectionEnabled) {
      await this.loadThemeOptions();
    }
  }

  close() {
    history.back();
  }

  async save() {
    try {
      this.loading = true;
      await this.createOrganisation();

      this.notificationService.showMessageAlways('SUCCESS_CREATE_ORGANIZATION', 'SUCCESS', 'success', false);
      this.close();
    } catch {
      this.notificationService.showMessageAlways('ERROR_CREATE_ORGANIZATION', 'ERROR', 'error', false);
    } finally {
      this.loading = false;
    }
  }

  private createOrganisation() {
    return this.administratorService.createOrganisation(this.organisation, this.admin);
  }

  setPassword(password: string) {
    this.admin.passwort = password;
  }

  setCountryCode(countryCode: string) {
    this.organisation.laenderCode = countryCode;
  }

  validData() {
    return this.administratorService.organisationValidator(this.organisation, this.admin);
  }

  copyPasswordToClipboard() {
    if (this.admin.passwort !== undefined && this.admin.passwort.length > 0) {
      this.clipboard.copy(this.admin.passwort);
      this.notificationService.showMessageAlways('PASSWORD_COPIED', 'SUCCESS', 'success', false);
    }
  }

  override isDirty() {
    return this.form?.dirty === true && this.form?.submitted === false;
  }

  isValidEmail(email: string) {
    return AasEmailValidator.isValidEmail(email);
  }

  private async loadThemeOptions() {
    try {
      const themes = await this.themeDefinitionService.getThemeDefinitions();
      this.themeOptions = [
        { label: this.translate.instant('DEFAULT_THEME'), value: 'default' },
        ...themes.map((theme) => ({ label: theme.displayName, value: theme.key })),
      ];
    } catch {
      this.themeOptions = [
        { label: this.translate.instant('DEFAULT_THEME'), value: 'default' },
        { label: 'AAS Suite (ML)', value: 'ml' },
        { label: 'AAS Suite (Cobalt)', value: 'cobalt' },
        { label: 'AAS Suite (Evergreen)', value: 'evergreen' },
        { label: 'AAS Suite (Amber)', value: 'amber' },
      ];
    }
  }
}
