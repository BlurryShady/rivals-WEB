import { API_ROOT } from "../api/client";


const CLOUDINARY_TRANSFORMS = {
  avatar: "f_auto,q_auto,w_220,h_220,c_fill",
  banner: "f_auto,q_auto,w_1020",
};


const normalizeCloudinaryUrl = (url, kind = "default") => {
  if (!url) return url;


  if (url.startsWith("//")) url = `https:${url}`;


  if (!url.includes("res.cloudinary.com")) return url;


  url = url.replace(/\/image\/upload\/v\d+\//, "/image/upload/");


  const transform = CLOUDINARY_TRANSFORMS[kind];
  if (transform && url.includes("/upload/")) {

    const afterUpload = url.split("/upload/")[1] || "";
    const alreadyHasTransform =
      afterUpload.startsWith("f_auto") ||
      afterUpload.startsWith("q_auto") ||
      afterUpload.startsWith("w_") ||
      afterUpload.startsWith("c_");

    if (!alreadyHasTransform) {
      url = url.replace("/upload/", `/upload/${transform}/`);
    }
  }

  return url;
};


export const buildMediaUrl = (path, kind = "default") => {
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return normalizeCloudinaryUrl(path, kind);
  }

  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ROOT}${safePath}`;
};


export const resolveHeroArtwork = (hero) => {
  if (!hero) return null;

  return (
    buildMediaUrl(hero.banner_url, "banner") ||
    buildMediaUrl(hero.image_url, "avatar") ||
    buildMediaUrl(hero.banner, "banner") ||
    buildMediaUrl(hero.image, "avatar")
  );
};


export const buildAvatarUrl = (urlOrPath) => buildMediaUrl(urlOrPath, "avatar");
export const buildBannerUrl = (urlOrPath) => buildMediaUrl(urlOrPath, "banner");
