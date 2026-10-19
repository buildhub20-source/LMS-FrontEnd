export function formatSectionTitle(title, index) {
  if (!title) return `Section ${index}: Untitled Section`;
  const cleanTitle = title.replace(/^section\s*\d*\s*:?\s*/i, '').trim();
  return `Section ${index}: ${cleanTitle || title}`;
}
