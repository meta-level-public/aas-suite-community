import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';

import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AppConfigService, EncodingService } from '@aas/common-services';
import { get } from 'lodash-es';
import { lastValueFrom } from 'rxjs';

import {
  buildGeneratorExportPayload,
  GeneratorExportBuilderHooks,
  GeneratorExportState,
} from './generator-export.builder';

export type GeneratorExportServiceHooks = Omit<GeneratorExportBuilderHooks, 'loadExportConceptDescriptions'>;

@Injectable({
  providedIn: 'root',
})
export class GeneratorExportService {
  constructor(
    private readonly http: HttpClient,
    private readonly appConfigService: AppConfigService,
  ) {}

  async populateExportState(
    exportState: GeneratorExportState,
    hooks: GeneratorExportServiceHooks,
    conceptDescriptions: aas.types.ConceptDescription[],
  ) {
    await buildGeneratorExportPayload(exportState, {
      ...hooks,
      loadExportConceptDescriptions: async (state) => this.loadExportConceptDescriptions(state, conceptDescriptions),
    });

    exportState.env = this.applyTemplateFixes(exportState.env);
    this.syncPlainJson(exportState);

    return exportState;
  }

  getVerifiableEnvironment(exportState: GeneratorExportState) {
    const plainJson = `${exportState.formData.get('plainJson') ?? ''}`;

    return this.parseEnvironment(plainJson);
  }

  applyTemplateFixes(env: aas.types.Environment) {
    this.applyKnownTemplateFixes(env);

    return this.parseEnvironment(JSON.stringify(aas.jsonization.toJsonable(env)));
  }

  private async loadExportConceptDescriptions(
    exportState: GeneratorExportState,
    conceptDescriptions: aas.types.ConceptDescription[],
  ) {
    exportState.env.conceptDescriptions = [];
    conceptDescriptions.forEach((conceptDescription) => {
      exportState.env.conceptDescriptions?.push(this.normalizeConceptDescription(conceptDescription));
    });

    const distinctSemanticIds = [...new Set(exportState.requiredSemanticIds)];
    for (const semanticId of distinctSemanticIds) {
      const cd = await lastValueFrom(
        this.http.get<any>(
          `${this.appConfigService.config.apiPath}/concept-description/${EncodingService.base64urlEncode(semanticId)}`,
        ),
      );
      if (cd != null && cd.id !== '') {
        const jsonString = JSON.stringify(cd);

        const instanceOrErrorPlain = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(jsonString));
        if (instanceOrErrorPlain.value != null) {
          const val = instanceOrErrorPlain.value;
          if (val.embeddedDataSpecifications != null) {
            val.embeddedDataSpecifications.forEach((embeddedDataSpecification) => {
              if ((embeddedDataSpecification.dataSpecificationContent as any).value === '') {
                (embeddedDataSpecification.dataSpecificationContent as any).value = null;
              }
            });
          }
          if (!exportState.env.conceptDescriptions?.some((conceptDescription) => conceptDescription.id === val.id)) {
            exportState.env.conceptDescriptions?.push(val);
          }
        }
      }
    }
  }

  private applyKnownTemplateFixes(env: aas.types.Environment) {
    const verifiableEnv = this.parseEnvironment(JSON.stringify(aas.jsonization.toJsonable(env)));

    for (let attempt = 0; attempt < 3; attempt++) {
      const errors = Array.from(aas.verification.verify(verifiableEnv));
      let changed = false;

      for (const error of errors) {
        if (error.message.endsWith('must specify unique languages.')) {
          changed = this.fixDuplicateLanguageEntries(env, error.path.toString()) || changed;
          changed = this.fixDuplicateLanguageEntries(verifiableEnv, error.path.toString()) || changed;
        }

        if (error.message.startsWith('The value must not be empty.')) {
          changed = this.fixEmptyStringValue(env, error.path.toString()) || changed;
          changed = this.fixEmptyStringValue(verifiableEnv, error.path.toString()) || changed;
        }
      }

      if (!changed) {
        break;
      }
    }
  }

  private fixDuplicateLanguageEntries(env: aas.types.Environment, path: string) {
    const normalizedPath = path.startsWith('.') ? path.substring(1) : path;
    const target = get(env, normalizedPath) as Record<string, unknown> | null | undefined;

    if (target == null || typeof target !== 'object') {
      return false;
    }

    let changed = false;

    Object.entries(target).forEach(([key, value]) => {
      if (!Array.isArray(value) || !this.isLanguageStringCollection(value)) {
        return;
      }

      const deduplicated = this.deduplicateLanguageEntries(value);
      if (deduplicated.length !== value.length) {
        target[key] = deduplicated;
        changed = true;
      }
    });

    return changed;
  }

  private fixEmptyStringValue(env: aas.types.Environment, path: string) {
    const normalizedPath = path.startsWith('.') ? path.substring(1) : path;
    const target = get(env, normalizedPath) as unknown;

    if (this.setPropertyToNullWhenEmpty(target, 'value')) {
      return true;
    }

    if (this.removeEmptyLangStringEntry(env, normalizedPath)) {
      return true;
    }

    const propertySuffix = (['value', 'text'] as const).find((propertyName) =>
      normalizedPath.endsWith(`.${propertyName}`),
    );
    if (propertySuffix == null) {
      return false;
    }

    const parentPath = normalizedPath.slice(0, -`.${propertySuffix}`.length);
    const parentTarget = get(env, parentPath) as unknown;

    if (propertySuffix === 'text') {
      return this.removeEmptyLangStringEntry(env, normalizedPath);
    }

    return this.setPropertyToNullWhenEmpty(parentTarget, propertySuffix);
  }

  private removeEmptyLangStringEntry(env: aas.types.Environment, path: string) {
    if (!path.endsWith('.text')) {
      return false;
    }

    const normalizedPath = path.startsWith('.') ? path.substring(1) : path;
    const entryMatch = normalizedPath.match(/^(.*)\.value\[(\d+)\]\.text$/);
    if (entryMatch == null) {
      return false;
    }

    const [, ownerPath, indexRaw] = entryMatch;
    const index = Number(indexRaw);
    const owner = get(env, ownerPath) as { value?: unknown } | null | undefined;
    const entries = Array.isArray(owner?.value) ? owner.value : null;

    if (entries == null || !Number.isInteger(index) || index < 0 || index >= entries.length) {
      return false;
    }

    const entry = entries[index] as { text?: unknown } | null | undefined;
    if (entry?.text !== '') {
      return false;
    }

    entries.splice(index, 1);
    if (entries.length === 0 && owner != null) {
      owner.value = null;
    }

    return true;
  }

  private setPropertyToNullWhenEmpty(target: unknown, propertyName: 'value' | 'text') {
    if (target == null || typeof target !== 'object' || !(propertyName in target)) {
      return false;
    }

    if ((target as Record<'value' | 'text', unknown>)[propertyName] !== '') {
      return false;
    }

    (target as Record<'value' | 'text', unknown>)[propertyName] = null;
    return true;
  }

  private isLanguageStringCollection(value: unknown[]): value is Array<{ language: string }> {
    return value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry != null &&
        'language' in entry &&
        typeof (entry as { language?: unknown }).language === 'string',
    );
  }

  private deduplicateLanguageEntries<T extends { language: string }>(entries: T[]) {
    const seenLanguages = new Set<string>();

    return entries.filter((entry) => {
      const normalizedLanguage = entry.language.trim().toLowerCase();
      if (seenLanguages.has(normalizedLanguage)) {
        return false;
      }

      seenLanguages.add(normalizedLanguage);
      return true;
    });
  }

  private syncPlainJson(exportState: GeneratorExportState) {
    exportState.formData.delete('plainJson');
    exportState.formData.append('plainJson', JSON.stringify(aas.jsonization.toJsonable(exportState.env)));
  }

  private parseEnvironment(environmentPlain: string) {
    const instanceOrError = aas.jsonization.environmentFromJsonable(JSON.parse(environmentPlain));

    if (instanceOrError.value == null) {
      throw new Error('Failed to deserialize generated environment payload');
    }

    return instanceOrError.value;
  }

  private normalizeConceptDescription(conceptDescription: aas.types.ConceptDescription) {
    if (conceptDescription instanceof aas.types.ConceptDescription) {
      return conceptDescription;
    }

    const instanceOrError = aas.jsonization.conceptDescriptionFromJsonable(
      JSON.parse(JSON.stringify(conceptDescription)),
    );

    if (instanceOrError.value == null) {
      throw new Error('Failed to normalize generator concept description state');
    }

    return instanceOrError.value;
  }
}
