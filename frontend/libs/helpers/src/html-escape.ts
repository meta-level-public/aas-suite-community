const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text so it can be safely embedded in HTML markup (element content and quoted attributes). */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Returns HTML in which every case-insensitive occurrence of `query` in `text` is wrapped in `<mark>`.
 * The text itself is escaped, so the result is safe to bind via `[innerHTML]` even for untrusted values.
 */
export function highlightMatches(text: string, query: string): string {
  if (query === '') {
    return escapeHtml(text);
  }

  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  let html = '';
  let lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    html += escapeHtml(text.slice(lastIndex, match.index)) + `<mark>${escapeHtml(match[0])}</mark>`;
    lastIndex = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(lastIndex));
}
