import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple in-memory cache for news
  let cachedNews: any[] = [];
  let lastFetchTime = 0;

  async function fetchNews() {
    const articles: any[] = [];
    
    // GNews
    try {
      const gnewsKey = process.env.GNEWS_API_KEY || '560ecca5e9e47a2b02bd4e85159b75ad';
      const gnewsRes = await fetch(`https://gnews.io/api/v4/search?q="hip hop" OR "black culture"&lang=en&max=5&apikey=${gnewsKey}`);
      const gnewsData = await gnewsRes.json();
      if (gnewsData.articles) {
        articles.push(...gnewsData.articles.map((a: any) => ({
          id: 'gnews-' + Math.random().toString(),
          title: a.title,
          source: a.source.name,
          url: a.url,
          date: new Date(a.publishedAt).toLocaleDateString(),
          description: a.description || a.content || '',
          imageUrl: a.image || null,
        })));
      }
    } catch (e) {
      console.error('GNews error:', e);
    }

    // World News API
    try {
      const wnewsKey = process.env.WORLDNEWS_API_KEY || 'f9cb2b723de3499e9910c133869b7585';
      const wnewsRes = await fetch(`https://api.worldnewsapi.com/search-news?text=hip+hop+OR+black+culture&api-key=${wnewsKey}&number=5`);
      const wnewsData = await wnewsRes.json();
      if (wnewsData.news) {
        articles.push(...wnewsData.news.map((a: any) => ({
          id: 'wnews-' + a.id,
          title: a.title,
          source: 'WorldNews API',
          url: a.url,
          date: new Date(a.publish_date).toLocaleDateString(),
          description: a.summary || a.text || '',
          imageUrl: a.image || null,
        })));
      }
    } catch (e) {
      console.error('WorldNews error:', e);
    }
    
    // The News API
    try {
      const thenewsapiKey = process.env.NEWSAPI_KEY || 'WrOVcTx018F5iMgq6ns9VriuYApUeF1ebyequ9rw';
      const thenewsapiRes = await fetch(`https://api.thenewsapi.com/v1/news/all?api_token=${thenewsapiKey}&search=hip+hop&language=en&limit=3`);
      const thenewsapiData = await thenewsapiRes.json();
      if (thenewsapiData.data) {
        articles.push(...thenewsapiData.data.map((a: any) => ({
          id: 'thenewsapi-' + a.uuid,
          title: a.title,
          source: a.source,
          url: a.url,
          date: new Date(a.published_at).toLocaleDateString(),
          description: a.description || a.snippet || '',
          imageUrl: a.image_url || null,
        })));
      }
    } catch (e) {
      console.error('The News API error:', e);
    }
    
    return articles;
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/news", async (req, res) => {
    const now = Date.now();
    // Cache for 24 hours (86400000 ms) - a single call a day as requested
    if (now - lastFetchTime > 86400000 || cachedNews.length === 0) {
      cachedNews = await fetchNews();
      lastFetchTime = now;
    }
    res.json({ articles: cachedNews });
  });

  app.get("/api/proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        res.status(400).send('No URL provided');
        return;
      }
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      let html = await response.text();
      
      // Inject base tag so relative links and assets load correctly
      const baseTag = `<base href="${targetUrl}">`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>\n  ${baseTag}`);
      } else {
        html = `<head>\n  ${baseTag}\n</head>\n` + html;
      }
      
      // Remove X-Frame-Options and CSP headers to allow iframing
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      
      res.send(html);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error loading article');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
