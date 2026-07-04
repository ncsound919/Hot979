import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  app.get('/api/news', async (_req, res) => {
    const now = Date.now();
    const twentyFourHours = 86400000;

    try {
      if (now - lastFetchTime > twentyFourHours || cachedNews.length === 0) {
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
    try {
      const targetUrl = req.query.url as string | undefined;
      if (!targetUrl) {
        res.status(400).send('No URL provided');
        return;
      }

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const html = await response.text();

      const baseTag = `<base href="${targetUrl}">`;
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