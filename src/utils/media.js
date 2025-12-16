import { API_ROOT } from "../api/client";

/**
 * Accepts:
 * - full URLs (https://...)
 * - relative paths (/media/..., /heroes/..., etc.) for local dev
 * - null/undefined
 */
export const buildMediaUrl = (value) => {
  if (!value) return null;
  if (typeof value !== "string") return null;

  // already absolute (Cloudinary, etc.)
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  // relative -> prefix with API_ROOT (local dev / legacy)
  return `${API_ROOT}${value.startsWith("/") ? "" : "/"}${value}`;
};

/**
 * Resolve the best hero artwork, compatible with BOTH shapes:
 * - new API: hero.banner_url / hero.image_url
 * - old API: hero.banner / hero.image
 * - nested team member: { hero: {...} }
 */
export const resolveHeroArtwork = (maybeHero) => {
  if (!maybeHero) return null;

  const hero = maybeHero.hero || maybeHero;

  return (
    buildMediaUrl(hero.banner_url) ||
    buildMediaUrl(hero.image_url) ||
    buildMediaUrl(hero.banner) ||
    buildMediaUrl(hero.image) ||
    null
  );
};
