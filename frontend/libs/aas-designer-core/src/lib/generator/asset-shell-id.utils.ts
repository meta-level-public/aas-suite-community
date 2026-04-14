import { MultiLanguagePropertyValue } from '@aas/model';

export function buildAssetShellIdShortSuggestion(
  descriptionValues: MultiLanguagePropertyValue[] | undefined,
  preferredLanguages: string[] = [],
) {
  const preferredText = getPreferredDescriptionText(descriptionValues, preferredLanguages);
  if (preferredText === '' || preferredText.trim().length < 2) {
    return '';
  }

  const normalizedValue = preferredText
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim();

  if (normalizedValue === '') {
    return '';
  }

  const words = normalizedValue
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 8);
  if (words.length === 0) {
    return '';
  }

  const [firstWord, ...remainingWords] = words;
  const candidate = [firstWord.toLowerCase(), ...remainingWords.map((word) => capitalize(word.toLowerCase()))].join('');
  const trimmedCandidate = candidate.slice(0, 60);
  const normalizedCandidate = normalizeAssetShellIdShort(trimmedCandidate);

  return normalizedCandidate;
}

export function normalizeAssetShellIdShort(value: string | null | undefined) {
  let normalizedValue = `${value ?? ''}`
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/-+/g, '-')
    .replace(/^[_-]+/g, '')
    .replace(/-+$/g, '');

  if (normalizedValue === '') {
    return '';
  }

  if (!/^[A-Za-z]/.test(normalizedValue)) {
    normalizedValue = `a${normalizedValue}`;
  }

  normalizedValue = normalizedValue.replace(/-+$/g, '');

  if (normalizedValue.length === 1) {
    normalizedValue = `${normalizedValue}a`;
  }

  return normalizedValue;
}

export function buildAssetShellIdentifier(prefix: string | null | undefined, idShort: string | null | undefined) {
  const normalizedIdShort = normalizeAssetShellIdShort(idShort);
  if (normalizedIdShort === '') {
    return '';
  }

  const normalizedPrefix = `${prefix ?? ''}`.trim().replace(/\/+$/, '');
  const effectivePrefix = normalizedPrefix !== '' ? normalizedPrefix : 'https://example.com';

  return `${effectivePrefix}/ids/aas/${encodeURIComponent(normalizedIdShort)}`;
}

export function buildAssetIdentifier(prefix: string | null | undefined, idShort: string | null | undefined) {
  const normalizedIdShort = normalizeAssetShellIdShort(idShort);
  if (normalizedIdShort === '') {
    return '';
  }

  const normalizedPrefix = `${prefix ?? ''}`.trim().replace(/\/+$/, '');
  const effectivePrefix = normalizedPrefix !== '' ? normalizedPrefix : 'https://example.com';

  return `${effectivePrefix}/ids/asset/${encodeURIComponent(normalizedIdShort)}`;
}

export function buildNextAssetShellIdShortCandidate(value: string | null | undefined) {
  const normalizedValue = normalizeAssetShellIdShort(value);
  if (normalizedValue === '') {
    return '';
  }

  const match = /^(.*?)(\d+)$/.exec(normalizedValue);
  if (match == null) {
    return `${normalizedValue}1`;
  }

  const baseValue = match[1] === '' ? normalizedValue : match[1];
  const currentSequence = Number(match[2]);
  if (!Number.isFinite(currentSequence)) {
    return `${normalizedValue}1`;
  }

  return `${baseValue}${currentSequence + 1}`;
}

function getPreferredDescriptionText(
  descriptionValues: MultiLanguagePropertyValue[] | undefined,
  preferredLanguages: string[],
) {
  if (!descriptionValues || descriptionValues.length === 0) {
    return '';
  }

  const normalizedEntries = descriptionValues
    .map((entry) => ({
      language: `${entry?.language ?? ''}`.trim().toLowerCase(),
      text: `${entry?.text ?? ''}`.trim(),
    }))
    .filter((entry) => entry.text !== '');

  if (normalizedEntries.length === 0) {
    return '';
  }

  const normalizedPreferredLanguages = preferredLanguages
    .map((language) => `${language ?? ''}`.trim().toLowerCase())
    .filter((language, index, values) => language !== '' && values.indexOf(language) === index);

  for (const language of normalizedPreferredLanguages) {
    const matchingEntry = normalizedEntries.find((entry) => entry.language === language);
    if (matchingEntry != null) {
      return matchingEntry.text;
    }
  }

  return normalizedEntries[0]?.text ?? '';
}

function capitalize(value: string) {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}
