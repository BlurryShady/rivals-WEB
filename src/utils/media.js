import { API_ROOT } from "../api/client";

export const buildMediaUrl = (value) => {
  if (!value) return null;

  // Already absolute (Cloudinary / external)
  if (typeof value === "string" && value.startsWith("http")) return value;

  // Relative backend media (local/dev)
  return `${API_ROOT}${value}`;
};

export const resolveHeroArtwork = (hero) => {
  if (!hero) return null;

  // NEW fields from your API
  const banner = hero.banner_url ?? hero.banner;
  const image = hero.image_url ?? hero.image;

  return buildMediaUrl(banner) || buildMediaUrl(image);
};
