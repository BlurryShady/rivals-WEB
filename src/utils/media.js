// src/utils/media.js
import { API_ROOT } from "../api/client";

// Accepts: null, relative 
export function buildMediaUrl(path) {
  if (!path) return null;

  // already absolute (Cloudinary, S3, etc.)
  if (/^https?:\/\//i.test(path)) return path;

  // normalize
  const clean = String(path).replace(/^\//, "");

  // if backend returns "media/..." or you stored "heroes/..." etc.
  // choose your preferred base:
  return `${API_ROOT}/${clean}`;
}
