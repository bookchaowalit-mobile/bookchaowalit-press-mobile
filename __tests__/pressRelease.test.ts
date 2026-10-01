import {
  EMPTY_RELEASE,
  checkRelease,
  formatDateline,
  formatRelease,
  parseIsoDate,
  readinessScore,
  readingMinutes,
  wordCount,
  type Release,
  formatQuote,
} from '../src/lib/pressRelease';

const words = (n: number) => Array.from({length: n}, () => 'word').join(' ');

const complete: Release = {
  headline: 'Acme launches offline snippet manager',
  subheadline: 'Free for students',
  city: 'Bangkok',
  date: '2026-09-30',
  body: words(200),
  quote: 'We built it for ourselves',
  quoteBy: 'Jane Doe, CEO of Acme',
  boilerplate: words(20),
  contactName: 'Press Office',
  contactEmail: 'press@example.com',
};

describe('text helpers', () => {
  it('counts words and reading time', () => {
    expect(wordCount('  one two\nthree  ')).toBe(3);
    expect(wordCount('   ')).toBe(0);
    expect(readingMinutes('')).toBe(0);
    expect(readingMinutes('short')).toBe(1);
    expect(readingMinutes(words(600))).toBe(3);
  });

  it('parses only real calendar dates', () => {
    expect(parseIsoDate('2026-09-30')).toEqual({year: 2026, month: 9, day: 30});
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('30/09/2026')).toBeNull();
  });

  it('formats datelines', () => {
    expect(formatDateline('Bangkok', '2026-09-30')).toBe(
      'BANGKOK, September 30, 2026 —',
    );
    expect(formatDateline('', '2026-01-05')).toBe('January 5, 2026 —');
    expect(formatDateline('', 'nope')).toBe('');
  });
});

describe('checkRelease', () => {
  it('passes a complete release', () => {
    const checks = checkRelease(complete);
    expect(checks.filter(c => !c.ok)).toEqual([]);
    expect(readinessScore(checks)).toBe(100);
  });

  it('scores an empty release at 0', () => {
    expect(readinessScore(checkRelease(EMPTY_RELEASE))).toBe(0);
  });

  it('flags shouty headlines, short bodies, bad dates and emails', () => {
    const failing = checkRelease({
      ...complete,
      headline: 'ACME LAUNCHES THING',
      body: words(20),
      date: '2026-13-01',
      contactEmail: 'press@',
    })
      .filter(c => !c.ok)
      .map(c => c.id);
    expect(failing).toEqual(['headline-case', 'dateline', 'body', 'contact']);
  });

  it('rejects exclamation marks', () => {
    const check = checkRelease({...complete, headline: 'We did it, finally!'});
    expect(check.find(c => c.id === 'headline-case')?.ok).toBe(false);
  });
});

describe('formatRelease', () => {
  it('lays out a full release', () => {
    const text = formatRelease({...complete, body: 'Acme today announced X.'});
    expect(text).toBe(
      [
        'FOR IMMEDIATE RELEASE',
        'Acme launches offline snippet manager\nFree for students',
        'BANGKOK, September 30, 2026 — Acme today announced X.',
        '“We built it for ourselves,” said Jane Doe, CEO of Acme.',
        complete.boilerplate,
        'Media contact: Press Office, press@example.com',
        '###',
      ].join('\n\n'),
    );
  });

  it('omits empty sections and strips existing quote marks', () => {
    expect(formatRelease({...EMPTY_RELEASE, quote: '"Hello"'})).toBe(
      'FOR IMMEDIATE RELEASE\n\n“Hello”\n\n###',
    );
  });
});

describe('pass 3 edge cases', () => {
  it('does not produce ".," or double periods around quotes', () => {
    expect(formatQuote('We are thrilled.', 'Jane Doe')).toBe('“We are thrilled,” said Jane Doe.');
    expect(formatQuote('Can you believe it?', 'Jane Doe')).toBe('“Can you believe it?” said Jane Doe.');
    expect(formatQuote('Wow!', 'Jane Doe, CEO of Acme Inc.')).toBe('“Wow!” said Jane Doe, CEO of Acme Inc.');
    expect(formatQuote('“Plain”', 'Ann')).toBe('“Plain,” said Ann.');
    expect(formatQuote('Solo.', '')).toBe('“Solo.”');
  });
  it('counts headline characters as readers do', () => {
    const release = {...EMPTY_RELEASE, headline: '🚀🚀🚀🚀🚀 Launch'};
    const check = checkRelease(release).find(c => c.id === 'headline')!;
    expect(check.hint).toBe('12 characters');
    const decomposed = checkRelease({...EMPTY_RELEASE, headline: 'Cafe\u0301 opens'}).find(c => c.id === 'headline')!;
    expect(decomposed.hint).toBe('10 characters');
  });
  it('pluralises the word-count hint', () => {
    expect(checkRelease({...EMPTY_RELEASE, body: 'one'}).find(c => c.id === 'body')!.hint).toBe('1 word');
  });
});
