import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from './semantic-id-helper';

/** Generische Hilfsfunktionen zur Extraktion von Werten aus SubmodelElementCollections */
export class AasExtractHelper {
  /** Findet den Property.value Text für eine Semantik oder erste gefundene aus einer Liste. */
  static findProperty(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantic: string,
  ): string | undefined;
  static findProperty(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantics: string[],
  ): string | undefined;
  static findProperty(
    collection: aas.types.SubmodelElementCollection | undefined,
    semanticOrArray: string | string[],
  ): string | undefined {
    if (Array.isArray(semanticOrArray)) {
      for (const sem of semanticOrArray) {
        const v = this.findProperty(collection, sem);
        if (v !== undefined) return v;
      }
      return undefined;
    }
    const semantic = semanticOrArray;
    if (!collection?.value) return undefined;
    const prop = collection.value.find(
      (p): p is aas.types.Property => p instanceof aas.types.Property && SemanticIdHelper.hasSemanticId(p, semantic),
    );
    return prop?.value ?? undefined;
  }

  /** Liefert den ersten gefundenen Wert einer Semantik aus mehreren Varianten (Deprecated: direkt findProperty mit string[] nutzen). */
  static findFirstProperty(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantics: string[],
  ): string | undefined {
    return this.findProperty(collection, semantics);
  }

  /** MultiLanguageProperty mit Semantik extrahieren (Sprach-Fallback: current -> en -> erster). */
  static findMLP(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantic: string,
    currentLang?: string,
  ): string | undefined;
  static findMLP(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantics: string[],
    currentLang?: string,
  ): string | undefined;
  static findMLP(
    collection: aas.types.SubmodelElementCollection | undefined,
    semanticOrArray: string | string[],
    currentLang?: string,
  ): string | undefined {
    if (Array.isArray(semanticOrArray)) {
      for (const sem of semanticOrArray) {
        const v = this.findMLP(collection, sem, currentLang);
        if (v !== undefined) return v;
      }
      return undefined;
    }
    const semantic = semanticOrArray;
    if (!collection?.value) return undefined;
    const mlp = collection.value.find(
      (p): p is aas.types.MultiLanguageProperty =>
        p instanceof aas.types.MultiLanguageProperty && SemanticIdHelper.hasSemanticId(p, semantic),
    );
    if (!mlp?.value?.length) return undefined;
    const lang = (currentLang || 'en').toLowerCase();
    const exact = mlp.value.find((v) => v.language?.toLowerCase() === lang)?.text;
    if (exact) return exact;
    const english = mlp.value.find((v) => v.language?.toLowerCase().startsWith('en'))?.text;
    return english || mlp.value[0].text;
  }

  /** Versucht mehrere Semantiken für MLP nacheinander. */
  static findFirstMLP(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantics: string[],
    currentLang?: string,
  ): string | undefined;
  static findFirstMLP(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantics: string,
    currentLang?: string,
  ): string | undefined;
  static findFirstMLP(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantics: (string | string[])[],
    currentLang?: string,
  ): string | undefined;
  static findFirstMLP(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantics: string | string[] | (string | string[])[],
    currentLang?: string,
  ): string | undefined {
    if (typeof semantics === 'string' || (Array.isArray(semantics) && semantics.every((s) => typeof s === 'string'))) {
      // semantics ist entweder einzelner String oder flache string[] Liste
      const list = typeof semantics === 'string' ? [semantics] : (semantics as string[]);
      for (const sem of list) {
        const val = this.findMLP(collection, sem, currentLang);
        if (val !== undefined) return val;
      }
      return undefined;
    }
    // semantics ist eine Liste aus string oder string[] Varianten
    const variants = semantics as (string | string[])[];
    for (const variant of variants) {
      const val = this.findMLP(collection, variant as any, currentLang);
      if (val !== undefined) return val;
    }
    return undefined;
  }

  /** Prüft, ob eine Collection mindestens ein Element mit einer Semantik aus semantics besitzt. */
  static containsAny(collection: aas.types.SubmodelElementCollection | undefined, semantics: string[]): boolean {
    if (!collection?.value?.length) return false;
    return collection.value.some((inner) => semantics.some((sem) => SemanticIdHelper.hasSemanticId(inner as any, sem)));
  }

  static findCollection(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantic: string,
  ): aas.types.SubmodelElementCollection | undefined {
    if (!collection?.value?.length) return undefined;
    return collection.value.find(
      (c): c is aas.types.SubmodelElementCollection =>
        c instanceof aas.types.SubmodelElementCollection && SemanticIdHelper.hasSemanticId(c, semantic),
    );
  }

  static findCollections(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantic: string,
  ): aas.types.SubmodelElementCollection[] | undefined {
    if (!collection?.value?.length) return undefined;
    return collection.value.filter(
      (c): c is aas.types.SubmodelElementCollection =>
        c instanceof aas.types.SubmodelElementCollection && SemanticIdHelper.hasSemanticId(c, semantic),
    );
  }

  static findList(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantic: string,
  ): aas.types.SubmodelElementList | undefined {
    if (!collection?.value?.length) return undefined;
    return collection.value.find(
      (c): c is aas.types.SubmodelElementList =>
        c instanceof aas.types.SubmodelElementList && SemanticIdHelper.hasSemanticId(c, semantic),
    );
  }

  static findLists(
    collection: aas.types.SubmodelElementCollection | undefined,
    semantic: string,
  ): aas.types.SubmodelElementList[] | undefined {
    if (!collection?.value?.length) return undefined;
    return collection.value.filter(
      (c): c is aas.types.SubmodelElementList =>
        c instanceof aas.types.SubmodelElementList && SemanticIdHelper.hasSemanticId(c, semantic),
    );
  }
}
