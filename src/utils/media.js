import { API_ROOT } from '../api/client';

export const buildMediaUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_ROOT}${path}`;
};

export const resolveHeroArtwork = (hero) => {
  if (!hero) return null;
  return buildMediaUrl(hero.banner) || buildMediaUrl(hero.image);
};
