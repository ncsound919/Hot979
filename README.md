# Hot 97.9 Mobile App

This repository contains the mobile application for **Hot 97.9 FM** — The Triangle's #1 for Hip-Hop & R&B.

## Current Status

We are currently building out the **Web/PWA Shell**. This acts as the foundational layer and SDK prep for our transition to a full React Native (Expo) mobile application. 

The current PWA includes safe-area support, an ambient background treatment, a resilience layer (error boundaries), and a media session integration for background playback to simulate a native app experience on mobile devices.

## Architecture

The project is structured as a monorepo to separate the web shell, the future mobile app, and the shared configurations:

```text
hot979-app/
├── apps/
│   ├── mobile/         # (Coming Soon) React Native / Expo mobile app
│   └── web/            # Current Web PWA shell (Vite + React)
├── packages/
│   └── shared/         # Shared interfaces and station content (types, schedules, events, DJs)
├── server/             # Express backend for proxying API requests and fetching news
└── ...
```

## Features

**Currently Implemented (PWA Shell):**
- **Live Stream / Studio Command Center**: Background audio playback, media session controls (lock screen integration), wake-lock support, and auto-reconnection for Icecast/Shoutcast streams.
- **The Wire (News)**: Aggregated Hip-Hop and Black Culture news from multiple sources (GNews, WorldNews, The News API), proxied through our Express server to avoid CORS issues.

**Roadmap (Mobile App):**
- Home / Dashboard
- Schedule & Programming
- Local Events & Ticket Giveaways
- DJs & Personalities
- Contests
- Photo Galleries

## Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your API keys for the news aggregation:
   ```env
   GNEWS_API_KEY=your_key_here
   WORLDNEWS_API_KEY=your_key_here
   NEWSAPI_KEY=your_key_here
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   This starts the Express server (port 3000 by default) which mounts the Vite middleware for local development.

4. **Build for Production:**
   ```bash
   npm run build
   ```
   This compiles the web app using Vite and bundles the Express server using esbuild into `dist/server.cjs`.

## SDK Prep & Content Strategy

Content elements like schedules, events, and DJ profiles are currently being extracted into the `packages/shared/content` layer. This creates a single source of truth (`StationConfig`) and allows both the current Web PWA and the future React Native app to consume the exact same content models, laying the groundwork for a potential multi-station white-label SDK.
