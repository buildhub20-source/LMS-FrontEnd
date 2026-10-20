/**
 * Builds CSV text from rows. Values containing commas, quotes or line breaks
 * are quoted, and cells that look like formulas are prefixed with an
 * apostrophe so a spreadsheet does not execute them.
 */
export const toCsv = (headers, rows) => {
  const cell = (value) => {
    if (value === null || value === undefined) return '';
    let text = String(value);
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
};

/** Downloads rows as a CSV file that Excel opens with the right encoding. */
export const downloadCsv = (fileName, headers, rows) => {
  const blob = new Blob(['﻿', toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** A safe file-name fragment from a title. */
export const slug = (text) =>
  String(text || 'export')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'export';
