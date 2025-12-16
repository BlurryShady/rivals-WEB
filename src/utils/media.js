import { API_ROOT } from '../api/client';

const normalizeCloudinaryUrl = (url) => {
  // converts .../upload/v123/... -> .../upload/...
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace(/\/image\/upload\/v\d+\//, '/image/upload/');
};

export const buildMediaUrl = (path) => {
  if (!path) return null;

  if (path.startsWith('http')) {
    return normalizeCloudinaryUrl(path);
  }

  return `${API_ROOT}${path}`;
};

export const resolveHeroArtwork = (hero) => {
  if (!hero) return null;
  return buildMediaUrl(hero.banner) || buildMediaUrl(hero.image);
};
