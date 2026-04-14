import { DirtyCheckable, Organisation } from '@aas-designer-model';
import { ActiveComponentsService } from '@aas/aas-designer-shared';
import { AasEmailValidator, CountryCodeComponent } from '@aas/common-components';
import { AppConfigService, NotificationService, ThemeDefinitionService } from '@aas/common-services';
import { AutocompleteOffDirective } from '@aas/helpers';
import { emailRegEx } from '@aas/model';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate, SelectItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { Tooltip } from 'primeng/tooltip';
import { OrganisationUebersichtBenutzerDto } from '../../organisation/model/organisation-uebersicht-benutzer-dto';
import { OrgaPaymentModelListComponent } from '../../payment/orga-payment-model-list/orga-payment-model-list.component';
import { AdministratorService } from '../administrator.service';

@Component({
  selector: 'aas-administration-edit',
  templateUrl: './administration-edit.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [
    FormsModule,
    AutocompleteOffDirective,
    Toolbar,
    Button,
    Button,
    Tooltip,
    Fieldset,
    InputText,
    CountryCodeComponent,
    Checkbox,
    Select,
    PrimeTemplate,
    OrgaPaymentModelListComponent,
    TableModule,
    TranslateModule,
  ],
})
export class AdministrationEditComponent extends DirtyCheckable implements OnInit, OnDestroy {
  @ViewChild('adminOrgaEditForm') form!: NgForm;
  loading = false;
  emailRegEx = emailRegEx;
  organisation: Organisation | null = null;
  themeOptions: SelectItem[] = [];
  themeSelectionEnabled: boolean;
  orgaUsers: OrganisationUebersichtBenutzerDto[] = [];

  constructor(
    private administratorService: AdministratorService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private activeComponentsService: ActiveComponentsService,
    private themeDefinitionService: ThemeDefinitionService,
    appConfigService: AppConfigService,
  ) {
    super();
    activeComponentsService.register(this);
    this.themeSelectionEnabled = appConfigService.config.defaultTheme != null;
    this.themeOptions.push({ label: translate.instant('DEFAULT_THEME'), value: 'default' });
  }

  ngOnDestroy(): void {
    this.activeComponentsService.unregister(this);
  }

  async ngOnInit() {
    if (this.themeSelectionEnabled) {
      await this.loadThemeOptions();
    }
    this.loadOrga();
    this.orgaUsers = await this.administratorService.getOrgaUsers(this.id);
  }

  async loadOrga() {
    try {
      this.loading = true;
      this.organisation = await this.administratorService.getOrganisation(this.id);

      if (this.organisation.themeUrl === '') this.organisation.themeUrl = 'default';
    } finally {
      this.loading = false;
    }
  }

  get id() {
    return parseInt(this.route.snapshot.params['id']);
  }

  async save() {
    if (this.organisation != null) {
      try {
        this.loading = true;
        const orga = await this.administratorService.updateOrganisation(this.organisation);

        if (orga) {
          this.notificationService.showMessageAlways('SUCCESS_EDIT_ORGANIZATION', 'SUCCESS', 'success', false);
          history.back();
        } else {
          this.notificationService.showMessageAlways('COMMON_ERROR', 'ERROR', 'error', false);
        }
      } finally {
        this.loading = false;
      }
    }
  }

  close(): void {
    history.back();
  }

  setCountryCode(countryCode: string) {
    if (this.organisation != null) this.organisation.laenderCode = countryCode;
  }

  validData() {
    if (this.organisation != null) return this.administratorService.organisationValidator(this.organisation);
    else return false;
  }

  override isDirty() {
    return this.form?.dirty === true && this.form?.submitted === false;
  }

  paymentModelSaved() {
    this.loadOrga();
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
