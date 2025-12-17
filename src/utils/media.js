import { API_ROOT } from '../api/client';

const normalizeCloudinaryUrl = (url) => {
  if (!url) return url;


  if (url.startsWith('//')) return `https:${url}`;


  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace(/\/image\/upload\/v\d+\//, '/image/upload/');
};

export const buildMediaUrl = (path) => {
  if (!path) return null;


  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return normalizeCloudinaryUrl(path);
  }


  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ROOT}${safePath}`;
};

export const resolveHeroArtwork = (hero) => {
  if (!hero) return null;


  return (
    buildMediaUrl(hero.banner_url) ||
    buildMediaUrl(hero.image_url) ||
    buildMediaUrl(hero.banner) ||
    buildMediaUrl(hero.image)
  );
};
