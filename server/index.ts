import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (no external dep required)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_NEWS = 30;       // requests per window for /api/news
const RATE_LIMIT_MAX_PROXY = 20;      // requests per window for /api/proxy

function checkRateLimit(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// SSRF guard: only allow https:// URLs pointing to known article domains
// ---------------------------------------------------------------------------
const PROXY_ALLOWED_ORIGINS = new Set([
  // Extend this list with the actual domains returned by your news providers
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'billboard.com',
  'complex.com',
  'essence.com',
  'hotnewhiphop.com',
  'npr.org',
  'pitchfork.com',
  'rollingstone.com',
  'thesource.com',
  'theguardian.com',
  'variety.com',
  'vibe.com',
  'xxlmag.com',
]);

function isAllowedProxyUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') return false;
    // Strip leading 'www.' for comparison
    const hostname = parsed.hostname.replace(/^www\./, '');
    // Allow exact matches and subdomains of allowed origins
    return [...PROXY_ALLOWED_ORIGINS].some(
      (allowed) => hostname === allowed || hostname.endsWith('.' + allowed),
    );
  } catch {
    return false;
  }
}

interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  description?: string;
  imageUrl?: string | null;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  // Cache TTL aligned to client-side TTL (1 hour)
  const ONE_HOUR = 3_600_000;
  let cachedNews: Article[] = [];
  let lastFetchTime = 0;

  async function fetchNews(): Promise<Article[]> {
    const articles: Article[] = [];

    const gnewsKey = process.env.GNEWS_API_KEY;
    const wnewsKey = process.env.WORLDNEWS_API_KEY;
    const thenewsapiKey = process.env.NEWSAPI_KEY;

    if (!gnewsKey || !wnewsKey || !thenewsapiKey) {
      console.warn('Missing one or more news API keys (GNEWS_API_KEY, WORLDNEWS_API_KEY, NEWSAPI_KEY)');
    }

    // GNews
    if (gnewsKey) {
      try {
        const gnewsRes = await fetch(
          `https://gnews.io/api/v4/search?q=%22hip%20hop%22%20OR%20%22black%20culture%22&lang=en&max=5&apikey=${gnewsKey}`,
        );
        const gnewsData = await gnewsRes.json();
        if (gnewsData.articles) {
          articles.push(
            ...gnewsData.articles.map((a: any): Article => ({
              id: 'gnews-' + (a.url || Math.random().toString()),
              title: a.title,
              source: a.source?.name || 'GNews',
              url: a.url,
              date: new Date(a.publishedAt).toLocaleDateString(),
              description: a.description || a.content || '',
              imageUrl: a.image || null,
            })),
          );
        }
      } catch (e) {
        console.error('GNews error:', e);
      }
    }

    // World News API
    if (wnewsKey) {
      try {
        const wnewsRes = await fetch(
          `https://api.worldnewsapi.com/search-news?text=hip+hop+OR+black+culture&api-key=${wnewsKey}&number=5`,
        );
        const wnewsData = await wnewsRes.json();
        if (wnewsData.news) {
          articles.push(
            ...wnewsData.news.map((a: any): Article => ({
              id: 'wnews-' + (a.id || a.url),
              title: a.title,
              source: 'WorldNews API',
              url: a.url,
              date: new Date(a.publish_date).toLocaleDateString(),
              description: a.summary || a.text || '',
              imageUrl: a.image || null,
            })),
          );
        }
      } catch (e) {
        console.error('WorldNews error:', e);
      }
    }

    // The News API
    if (thenewsapiKey) {
      try {
        const thenewsapiRes = await fetch(
          `https://api.thenewsapi.com/v1/news/all?api_token=${thenewsapiKey}&search=hip+hop&language=en&limit=3`,
        );
        const thenewsapiData = await thenewsapiRes.json();
        if (thenewsapiData.data) {
          articles.push(
            ...thenewsapiData.data.map((a: any): Article => ({
              id: 'thenewsapi-' + a.uuid,
              title: a.title,
              source: a.source || 'The News API',
              url: a.url,
              date: new Date(a.published_at).toLocaleDateString(),
              description: a.description || a.snippet || '',
              imageUrl: a.image_url || null,
            })),
          );
        }
      } catch (e) {
        console.error('The News API error:', e);
      }
    }

    return articles;
  }

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/news', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip + ':news', RATE_LIMIT_MAX_NEWS)) {
      res.status(429).json({ articles: [], message: 'Too many requests. Please slow down.' });
      return;
    }

    const now = Date.now();
    try {
      if (now - lastFetchTime > ONE_HOUR || cachedNews.length === 0) {
        cachedNews = await fetchNews();
        lastFetchTime = now;
      }
      if (cachedNews.length === 0) {
        return res.status(502).json({
          articles: [],
          message: 'No news articles available from upstream providers.',
        });
      }
      res.json({ articles: cachedNews });
    } catch (err) {
      console.error('News endpoint error:', err);
      res.status(500).json({ articles: [], message: 'Failed to fetch news.' });
    }
  });

  app.get('/api/proxy', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip + ':proxy', RATE_LIMIT_MAX_PROXY)) {
      res.status(429).send('Too many requests. Please slow down.');
      return;
    }

    try {
      const targetUrl = req.query.url as string | undefined;

      if (!targetUrl) {
        res.status(400).send('No URL provided');
        return;
      }

      // SSRF guard: only allow https URLs from a pre-approved allowlist of article domains
      if (!isAllowedProxyUrl(targetUrl)) {
        res.status(403).send('URL not permitted by proxy allowlist');
        return;
      }

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      const html = await response.text();
      const baseTag = `<base href="${targetUrl}" />`;
      let patchedHtml = html;
      if (patchedHtml.includes('<head>')) {
        patchedHtml = patchedHtml.replace('<head>', `<head>\n  ${baseTag}`);
      } else {
        patchedHtml = `<head>\n  ${baseTag}\n</head>\n` + patchedHtml;
      }
      res.send(patchedHtml);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error loading article');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
