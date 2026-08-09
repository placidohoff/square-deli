// Menu item photos come in two shapes right now, during the migration off
// the old backend: a bare local filename (e.g. "chopped.png", served from
// public/images/sandwiches/) for anything not yet re-uploaded, or a full
// Cloudinary URL (e.g. "https://res.cloudinary.com/...") for anything
// edited/uploaded through the new Postgres-backed API. This resolves either
// to a working <img src>, so old and new data both display correctly at
// once instead of one breaking to support the other.
export function resolveImageUrl(image) {
  if (!image) return image;
  return /^https?:\/\//.test(image) ? image : `/images/sandwiches/${image}`;
}
