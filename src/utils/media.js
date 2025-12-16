import { API_ROOT } from "../api/client";

// Accepts: null, relative ("media/..", "/media/..", "heroes/.."), or absolute ("https://...")
export function buildMediaUrl(path) {
  if (!path) return null;

  // Already absolute (Cloudinary, S3, etc.)
  if (/^https?:\/\//i.test(path)) return path;

  const clean = String(path).replace(/^\//, "");
  return `${API_ROOT}/${clean}`;
}

/**
 * Backward-compatible helper used by HomePage.jsx (and maybe elsewhere).
 * Picks the best available hero image/banner field and returns a usable URL.
 */
export function resolveHeroArtwork(hero, kind = "image") {
  if (!hero) return null;

  // Normalize possible backend field names
  const imageCandidate =
    hero.image_url ?? hero.image ?? hero.avatar_url ?? hero.avatar ?? null;

  const bannerCandidate =
    hero.banner_url ?? hero.banner ?? hero.banner_image ?? null;

  const picked = kind === "banner" ? bannerCandidate : imageCandidate;
  return buildMediaUrl(picked);
}
