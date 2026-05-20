import { NotificationService } from '@aas/common-services';
import { BenutzerInfrastrukturRechtDto, InfrastrukturRechteClient, InfraUserRechtDto } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, inject, input, OnChanges, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

export type InfraRechteMode = 'user' | 'infra';

@Component({
  selector: 'aas-infrastruktur-rechte',
  templateUrl: './infrastruktur-rechte.component.html',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    ProgressSpinnerModule,
  ],
})
export class InfrastrukturRechteComponent implements OnChanges {
  infraRechteClient = inject(InfrastrukturRechteClient);
  notificationService = inject(NotificationService);

  /** Modus: 'user' zeigt alle Infras für einen User; 'infra' zeigt alle User für eine Infra */
  mode = input.required<InfraRechteMode>();
  organisationId = input.required<number>();
  userId = input<number | undefined>(undefined);
  infraId = input<number | undefined>(undefined);

  cancelled = output<void>();
  saved = output<void>();

  loading = signal(false);
  saving = signal(false);
  isDirty = signal(false);
  userRechteDraft = signal<BenutzerInfrastrukturRechtDto[]>([]);
  infraRechteDraft = signal<InfraUserRechtDto[]>([]);

  private userRechteBackup: BenutzerInfrastrukturRechtDto[] = [];
  private infraRechteBackup: InfraUserRechtDto[] = [];

  async ngOnChanges() {
    await this.load();
  }

  async load() {
    const orgId = this.organisationId();
    if (!orgId) return;

    this.loading.set(true);
    try {
      if (this.mode() === 'user') {
        const uid = this.userId();
        if (!uid) return;
        const result = await new Promise<BenutzerInfrastrukturRechtDto[]>((resolve, reject) => {
          this.infraRechteClient.infrastrukturRechte_GetUserInfraRechte(orgId, uid).subscribe({
            next: (r) => resolve(r),
            error: (e) => reject(e),
          });
        });
        this.userRechteBackup = result.map((r) => new BenutzerInfrastrukturRechtDto(r));
        this.userRechteDraft.set(result.map((r) => new BenutzerInfrastrukturRechtDto(r)));
      } else {
        const iid = this.infraId();
        if (!iid) return;
        const result = await new Promise<InfraUserRechtDto[]>((resolve, reject) => {
          this.infraRechteClient.infrastrukturRechte_GetInfraUserRechte(orgId, iid).subscribe({
            next: (r) => resolve(r),
            error: (e) => reject(e),
          });
        });
        this.infraRechteBackup = result.map((r) => new InfraUserRechtDto(r));
        this.infraRechteDraft.set(result.map((r) => new InfraUserRechtDto(r)));
      }
    } finally {
      this.loading.set(false);
    }
  }

  async saveAll() {
    const orgId = this.organisationId();
    if (!orgId) return;

    this.saving.set(true);
    try {
      if (this.mode() === 'user') {
        const uid = this.userId();
        if (!uid) return;
        await Promise.all(
          this.userRechteDraft().map((recht) => {
            if (!recht.infrastrukturId) return Promise.resolve();
            return new Promise<void>((resolve, reject) => {
              this.infraRechteClient
                .infrastrukturRechte_UpsertUserInfraRecht(orgId, uid, recht.infrastrukturId, recht)
                .subscribe({ next: () => resolve(), error: (e) => reject(e) });
            });
          }),
        );
      } else {
        const iid = this.infraId();
        if (!iid) return;
        await Promise.all(
          this.infraRechteDraft().map((recht) => {
            if (!recht.benutzerId) return Promise.resolve();
            const dto = new BenutzerInfrastrukturRechtDto({
              infrastrukturId: iid,
              darfLesen: recht.darfLesen,
              darfSchreiben: recht.darfSchreiben,
              darfMarktPublizieren: recht.darfMarktPublizieren,
            });
            return new Promise<void>((resolve, reject) => {
              this.infraRechteClient
                .infrastrukturRechte_UpsertUserInfraRecht(orgId, recht.benutzerId, iid, dto)
                .subscribe({ next: () => resolve(), error: (e) => reject(e) });
            });
          }),
        );
      }
      this.isDirty.set(false);
      this.userRechteBackup = this.userRechteDraft().map((r) => new BenutzerInfrastrukturRechtDto(r));
      this.infraRechteBackup = this.infraRechteDraft().map((r) => new InfraUserRechtDto(r));
      this.notificationService.showMessageAlways('SUCCESS_UPDATE', 'SUCCESS', 'success', false);
      this.saved.emit();
    } finally {
      this.saving.set(false);
    }
  }

  onDarfSchreibenChange(recht: BenutzerInfrastrukturRechtDto | InfraUserRechtDto, checked: boolean) {
    if (checked) {
      recht.darfLesen = true;
    }
    this.isDirty.set(true);
  }

  markDirty() {
    this.isDirty.set(true);
  }

  cancel() {
    this.userRechteDraft.set(this.userRechteBackup.map((r) => new BenutzerInfrastrukturRechtDto(r)));
    this.infraRechteDraft.set(this.infraRechteBackup.map((r) => new InfraUserRechtDto(r)));
    this.isDirty.set(false);
    this.cancelled.emit();
  }
}
