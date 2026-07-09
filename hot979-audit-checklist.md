# HOT 97.9 Web App — Production Readiness Checklist

> **Stack:** React + TypeScript (Vite) · Node.js/Express server · Monorepo (`apps/web`, `packages/shared`, `server`)

---

## 1. Stream Configuration
- [ ] Replace `streamUrl` placeholder in `packages/shared/content/station.ts` with your real Icecast/Azuracast/ShoutCast stream URL
- [ ] Update the `<link rel="preconnect">` in `apps/web/index.html` with your actual stream domain
- [ ] Confirm stream URL is accessible over HTTPS (HTTP streams are blocked by browsers on HTTPS pages)
- [ ] Verify the stream produces audio in a browser tab before deploying

## 2. Environment Variables
- [ ] Create a `.env` file from `.env.example` on your server
- [ ] Set `GNEWS_API_KEY`, `WORLDNEWS_API_KEY`, `NEWSAPI_KEY` with valid keys
- [ ] Set `PORT` (default `3000`) and `NODE_ENV=production`
- [ ] Confirm no API keys are committed to the repo (check `.gitignore` covers `.env`)

## 3. Security
- [ ] Confirm `isAllowedProxyUrl()` domain allowlist in `server/index.ts` includes all domains your news providers link to
- [ ] Verify the iframe sandbox in `NewsView.tsx` does NOT have `allow-same-origin` + `allow-scripts` together (**fixed**)
- [ ] Review CORS policy if serving front-end and API from different origins
- [ ] Run `npm audit` and resolve any high/critical vulnerabilities

## 4. Content & Branding
- [ ] Confirm `packages/shared/content/station.ts` values are correct: `callsign`, `frequency`, `name`, `tagline`, `contact`, `socials`
- [ ] Add `promoMessage` string to station config for the footer marquee
- [ ] Confirm `logoUrl` path (`/icons/icon-192.png`) exists in `apps/web/public/icons/`
- [ ] Replace placeholder events in `packages/shared/content/events.ts` with real upcoming events
- [ ] Replace placeholder DJs in `packages/shared/content/djs.ts` with real DJ roster

## 5. PWA & Assets
- [ ] Confirm `apps/web/public/icons/icon-192.png` and `icon-512.png` exist and use actual station branding
- [ ] Confirm `apps/web/public/manifest.webmanifest` exists and has correct `name`, `short_name`, `icons`
- [ ] Test "Add to Home Screen" on both iOS Safari and Android Chrome
- [ ] Verify wake lock works on Android (prevents screen sleep during streaming)
- [ ] Test Media Session controls show up in OS/lock screen on mobile

## 6. News Feed
- [ ] Confirm `/api/news` returns articles in production (check API keys are set)
- [ ] Verify server-side cache TTL (1 hour) matches client-side `localStorage` TTL (1 hour)
- [ ] Add real hip-hop news domains to the proxy allowlist if GNews/WorldNews/TheNewsAPI returns domains not in the current list
- [ ] Test "Read Full Article" iframe view loads correctly for at least 3 article sources

## 7. Rate Limiting & Reliability
- [ ] Confirm rate limiter constants in `server/index.ts` are appropriate for your expected traffic (default: 30 req/min for news, 20 req/min for proxy)
- [ ] Consider adding persistent caching (file or Redis) so server restarts don't clear the news cache
- [ ] Add a `/api/health` endpoint ping to your uptime monitor

## 8. Deployment
- [ ] Run `npm run build` in `apps/web` — confirm no TypeScript errors
- [ ] Run the server with `NODE_ENV=production` and verify static files are served from `dist/`
- [ ] Confirm your hosting platform (DigitalOcean, Railway, etc.) has all env vars set
- [ ] Set up HTTPS — stream must be HTTPS; mixed-content errors will block audio
- [ ] Add a process manager (PM2 or equivalent) with auto-restart on crash

## 9. Cross-Browser & Device Testing
- [ ] Chrome (desktop + Android)
- [ ] Safari (macOS + iOS) — test autoplay restrictions
- [ ] Firefox (desktop)
- [ ] Test play/stop cycle at least 5 times — confirm no stale audio elements
- [ ] Test reconnect logic by simulating a network dropout
- [ ] Test the "Request" pad (tel: deep link) on a real mobile device

## 10. Analytics & Monitoring
- [ ] Add a listener count endpoint or integrate with your streaming host's stats API
- [ ] Set up error tracking (Sentry or equivalent) for the Express server
- [ ] Add client-side error reporting for playback failures

---

_Last updated by automated audit: July 2026_
