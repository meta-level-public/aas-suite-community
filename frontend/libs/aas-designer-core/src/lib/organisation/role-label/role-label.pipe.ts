import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Translation key of the display name of a role, e.g. ROLE_ORGA_ADMIN */
export function roleLabelKey(role: string) {
  return `ROLE_${role}`;
}

/**
 * Shows roles with their translated name instead of the technical one (ORGA_ADMIN, BENUTZER, ...).
 * A list of roles is joined with commas. Roles without translation keep their technical name.
 * Impure like the translate pipe, so the names follow a language switch.
 */
@Pipe({ name: 'roleLabel', pure: false })
export class RoleLabelPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(roles: string | string[] | null | undefined): string {
    if (roles == null) {
      return '';
    }
    if (Array.isArray(roles)) {
      return roles.map((role) => this.label(role)).join(', ');
    }
    return this.label(roles);
  }

  private label(role: string) {
    const key = roleLabelKey(role);
    const label = this.translate.instant(key);
    return typeof label === 'string' && label !== '' && label !== key ? label : role;
  }
}
