import { describe, it, expect } from 'vitest';
import { toCsv, slug } from '../../src/utils/csv';

describe('toCsv', () => {
  it('quotes values with commas, quotes and line breaks', () => {
    const csv = toCsv(['Name', 'Note'], [['Rao, Priya', 'said "hi"\nthen left']]);

    expect(csv).toBe('Name,Note\r\n"Rao, Priya","said ""hi""\nthen left"');
  });

  it('neutralises cells a spreadsheet would run as formulas', () => {
    expect(toCsv(['A'], [['=HYPERLINK("x")'], ['+1'], ['-2'], ['@cmd']])).toBe(
      'A\r\n"\'=HYPERLINK(""x"")"\r\n\'+1\r\n\'-2\r\n\'@cmd',
    );
  });

  it('writes numbers as they are and empty cells for missing values', () => {
    expect(toCsv(['n', 'm', 'k'], [[75.5, null, -3]])).toBe('n,m,k\r\n75.5,,-3');
  });
});

describe('slug', () => {
  it('makes a safe file name fragment', () => {
    expect(slug('React & Node.js: Week 1!')).toBe('react-node-js-week-1');
    expect(slug('')).toBe('export');
  });
});
