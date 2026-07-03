import { useEffect, useState } from 'react';
import { Newspaper, ChevronDown, ChevronUp, AlertCircle, ExternalLink, X } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  description?: string;
  imageUrl?: string;
}

const CACHE_KEY = 'mpc_news_cache';

export default function NewsView() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readingUrl, setReadingUrl] = useState<string | null>(null);

  const fetchNews = async (force = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check cache first if not forcing
      if (!force) {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cachedData = JSON.parse(cachedStr);
          if (cachedData && cachedData.timestamp && (Date.now() - cachedData.timestamp < 3600000)) { // 1 hour client cache
            setNews(cachedData.articles);
            setLoading(false);
            return;
          }
        }
      }

      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      const articles = data.articles || [];
      setNews(articles);
      
      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        articles: articles
      }));
    } catch (err) {
      console.error('Failed to fetch news', err);
      // Try to fallback to cache if available
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        setNews(JSON.parse(cachedStr).articles || []);
      } else {
        setError('Unable to load the latest wire. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="h-full flex flex-col relative">
      {readingUrl && (
        <div className="absolute inset-0 z-50 bg-[#181818] rounded-xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
          <div className="h-10 bg-[#121212] flex items-center justify-between px-3 border-b border-white/10 shrink-0">
            <span className="text-[10px] font-mono text-white/50 truncate w-3/4">{readingUrl}</span>
            <button 
              onClick={() => setReadingUrl(null)}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 bg-white relative">
            <iframe 
              src={`/api/proxy?url=${encodeURIComponent(readingUrl)}`} 
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              title="In-App Browser"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase block">The Wire - Hip Hop News</span>
        <button 
          onClick={() => fetchNews(true)}
          disabled={loading}
          className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-white/60 font-bold uppercase disabled:opacity-50 transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-4 overflow-y-auto pr-2 pb-4">
        {error ? (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="text-red-500" size={24} />
            <span className="text-sm text-red-200">{error}</span>
            <button 
              onClick={() => fetchNews(true)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold rounded uppercase tracking-widest transition-colors border border-red-500/50"
            >
              Retry Connection
            </button>
          </div>
        ) : loading && news.length === 0 ? (
          <div className="text-sm text-white/50 font-mono uppercase text-center py-8">Fetching latest headlines...</div>
        ) : news.length === 0 ? (
          <div className="text-sm text-white/50 font-mono uppercase text-center py-8">No news available at the moment.</div>
        ) : (
          news.map((item, index) => {
            const isExpanded = expandedId === item.id;
            
            return (
              <div 
                key={item.id} 
                className={`flex flex-col bg-white/5 rounded-xl border-l-2 ${index === 0 ? 'border-[#9D4EDD]' : 'border-white/20'} overflow-hidden transition-all`}
              >
                <button 
                  onClick={() => toggleExpand(item.id)}
                  className="p-3 text-left w-full hover:bg-white/5 transition-colors flex justify-between items-start gap-2"
                >
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white leading-snug">{item.title}</div>
                    <div className="text-xs text-white/50 flex items-center gap-1 mt-1">
                      <Newspaper size={10} />
                      {item.source} • {item.date}
                    </div>
                  </div>
                  <div className="mt-1 text-white/40">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/5 bg-black/20">
                    {item.imageUrl && (
                      <div className="w-full h-32 md:h-40 rounded-lg overflow-hidden mb-3 bg-[#111]">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                      </div>
                    )}
                    <p className="text-xs text-white/70 leading-relaxed mb-3 line-clamp-4">
                      {item.description || 'No summary available for this article.'}
                    </p>
                    <button 
                      onClick={() => setReadingUrl(item.url)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9D4EDD] uppercase tracking-widest hover:text-white transition-colors bg-[#9D4EDD]/10 px-3 py-1.5 rounded"
                    >
                      Read Full Article <ExternalLink size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
