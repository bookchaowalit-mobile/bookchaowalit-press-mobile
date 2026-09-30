/** Pure press-release logic (no React Native imports) so it is unit-testable. */

export type Release = {
  headline: string;
  subheadline: string;
  city: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  body: string;
  quote: string;
  quoteBy: string;
  boilerplate: string;
  contactName: string;
  contactEmail: string;
};

export const EMPTY_RELEASE: Release = {
  headline: '',
  subheadline: '',
  city: '',
  date: '',
  body: '',
  quote: '',
  quoteBy: '',
  boilerplate: '',
  contactName: '',
  contactEmail: '',
};

export type Check = {id: string; label: string; ok: boolean; hint: string};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function wordCount(text: string): number {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

/** Reading time at ~200 words per minute, at least 1 minute for non-empty text. */
export function readingMinutes(text: string): number {
  const words = wordCount(text);
  return words === 0 ? 0 : Math.max(1, Math.round(words / 200));
}

/** Parse a strict YYYY-MM-DD calendar date; returns null for impossible dates. */
export function parseIsoDate(
  value: string,
): {year: number; month: number; day: number} | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) {
    return null;
  }
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return {year, month, day};
}

/** AP-style dateline, e.g. "BANGKOK, September 30, 2026 —". */
export function formatDateline(city: string, isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  const place = city.trim().toUpperCase();
  const when = parsed
    ? `${MONTHS[parsed.month - 1]} ${parsed.day}, ${parsed.year}`
    : '';
  return [place, when].filter(Boolean).join(', ') + (place || when ? ' —' : '');
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkRelease(r: Release): Check[] {
  const headline = r.headline.trim();
  const letters = headline.replace(/[^A-Za-z]/g, '');
  const bodyWords = wordCount(r.body);
  return [
    {
      id: 'headline',
      label: 'Headline (10–100 characters)',
      ok: headline.length >= 10 && headline.length <= 100,
      hint: `${headline.length} characters`,
    },
    {
      id: 'headline-case',
      label: 'Headline not in ALL CAPS and without "!"',
      ok:
        headline.length > 0 &&
        !headline.includes('!') &&
        !(letters.length > 3 && letters === letters.toUpperCase()),
      hint: 'Journalists skip shouty headlines',
    },
    {
      id: 'dateline',
      label: 'Dateline with city and a valid date',
      ok: r.city.trim().length > 0 && parseIsoDate(r.date) !== null,
      hint: 'City plus date as YYYY-MM-DD',
    },
    {
      id: 'body',
      label: 'Body of 150–800 words',
      ok: bodyWords >= 150 && bodyWords <= 800,
      hint: `${bodyWords} words`,
    },
    {
      id: 'quote',
      label: 'Quote with attribution',
      ok: r.quote.trim().length > 0 && r.quoteBy.trim().length > 0,
      hint: 'Who said it, and their role',
    },
    {
      id: 'boilerplate',
      label: '"About" boilerplate',
      ok: wordCount(r.boilerplate) >= 15,
      hint: 'At least 15 words about the organisation',
    },
    {
      id: 'contact',
      label: 'Media contact name and valid email',
      ok: r.contactName.trim().length > 0 && EMAIL.test(r.contactEmail.trim()),
      hint: 'Where reporters can follow up',
    },
  ];
}

/** Percentage of checks passed, 0–100. */
export function readinessScore(checks: Check[]): number {
  if (checks.length === 0) {
    return 0;
  }
  return Math.round((checks.filter(c => c.ok).length / checks.length) * 100);
}

/** Plain-text release in the conventional layout, ending with "###". */
export function formatRelease(r: Release): string {
  const parts: string[] = ['FOR IMMEDIATE RELEASE'];
  const heading = [r.headline.trim(), r.subheadline.trim()]
    .filter(Boolean)
    .join('\n');
  if (heading) {
    parts.push(heading);
  }
  const dateline = formatDateline(r.city, r.date);
  const body = r.body.trim();
  if (dateline || body) {
    parts.push([dateline, body].filter(Boolean).join(' '));
  }
  if (r.quote.trim()) {
    const quote = r.quote.trim().replace(/^["“]|["”]$/g, '');
    const by = r.quoteBy.trim();
    parts.push(by ? `“${quote},” said ${by}.` : `“${quote}”`);
  }
  if (r.boilerplate.trim()) {
    parts.push(r.boilerplate.trim());
  }
  const contact = [r.contactName.trim(), r.contactEmail.trim()]
    .filter(Boolean)
    .join(', ');
  if (contact) {
    parts.push(`Media contact: ${contact}`);
  }
  parts.push('###');
  return parts.join('\n\n');
}

export const DRAFT_STORAGE_KEY = 'press.draft.v1';

/** Versioned JSON for the saved draft. */
export function serializeDraft(r: Release): string {
  return JSON.stringify({v: 1, release: r});
}

/**
 * Parses a stored draft; missing, corrupt or foreign data yields null so the
 * app starts from an empty release instead of crashing. Unknown fields are
 * dropped and missing string fields default to ''.
 */
export function parseDraft(raw: string | null): Release | null {
  if (!raw) {
    return null;
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || (data as {v?: unknown}).v !== 1) {
      return null;
    }
    const stored = (data as {release?: unknown}).release;
    if (!stored || typeof stored !== 'object') {
      return null;
    }
    const out = {...EMPTY_RELEASE};
    for (const key of Object.keys(EMPTY_RELEASE) as (keyof Release)[]) {
      const value = (stored as Record<string, unknown>)[key];
      if (value !== undefined && typeof value !== 'string') {
        return null;
      }
      out[key] = value ?? '';
    }
    return out;
  } catch {
    return null;
  }
}
