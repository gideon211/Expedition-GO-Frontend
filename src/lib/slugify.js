export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleMatchesSlug(title, slug) {
  return slugify(title) === slug;
}
