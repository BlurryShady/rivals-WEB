# Marvel Rivals Builder Frontend

React + Vite single-page app that lets players build six-hero squads, review synergy analysis, browse the community feed, and comment in real time.

## Tech Stack
- React 19 + React Router
- Vite 7
- Tailwind-based custom CSS
- Axios for API calls

## Getting Started
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Visit `http://localhost:5173` and ensure `VITE_API_BASE_URL` points at your running Django backend (default `http://127.0.0.1:8000`).

## Available Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Produce production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run lint` | Run ESLint (optional) |

## Environment Variables (`.env`)
| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for the backend API. Example: `https://api.example.com` |

## Deployment (Netlify example)
1. Set build command to `npm run build` and publish directory to `dist/` (this repo contains frontend only)

2. Add `VITE_API_BASE_URL=https://your-backend-domain` to Netlify environment variables.
3. Enable post-processing (optional) for HTML minification.

## Notes
- Auth state lives in `src/context/AuthContext.jsx`; protecting routes or adding toasts should hook into that context.
- WebSocket clients connect to `/ws/teams/<slug>/comments/` on the backend; ensure the backend exposes that path over HTTPS/WSS in production.
- Static assets such as favicons live in `public/` and are referenced via `/favicon.ico`, etc.


This repository contains the frontend for the Marvel Rivals Builder project, built as a portfolio showcase. Live demo: [rivals.blurryshady.dev](https://rivals.blurryshady.dev).
