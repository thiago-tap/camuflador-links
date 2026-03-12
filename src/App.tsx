import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [pixelId, setPixelId] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar histórico ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('link_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Endpoint de produção via Pages Functions (Internal)
      const API_URL = ''; 
      
      const res = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl, slug, pixelId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar o link.');
      
      // O Worker já devolve a URL gerada final
      const newUrl = data.generatedUrl;
      setGeneratedLink(newUrl);

      // Atualizar Histórico
      const newHistory = [{
        id: Date.now(),
        original: originalUrl,
        slug: slug || 'padrão',
        generated: newUrl,
        date: new Date().toLocaleDateString('pt-BR')
      }, ...history].slice(0, 5);
      
      setHistory(newHistory);
      localStorage.setItem('link_history', JSON.stringify(newHistory));

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado para a área de transferência!');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">Camuflador Pro</h1>
        <p className="subtitle">Mágica de redirecionamento e rastreio para Afiliados.</p>
      </header>

      <main className="glass-panel">
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label" htmlFor="originalUrl">Link Original (Hotmart, Kiwify, etc)</label>
            <input 
              id="originalUrl"
              type="url" 
              className="form-input" 
              placeholder="https://pay.hotmart.com/X000000" 
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>

          <div className="row">
            <div className="col form-group">
              <label className="form-label" htmlFor="slug">Slug (Opcional)</label>
              <input 
                id="slug"
                type="text" 
                className="form-input" 
                placeholder="metodo-secador" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="col form-group">
              <label className="form-label" htmlFor="pixelId">Pixel FB (Opcional)</label>
              <input 
                id="pixelId"
                type="text" 
                className="form-input" 
                placeholder="123456789" 
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Gerando Magia...' : '⚡ Gerar Link Camuflado'}
          </button>
        </form>

        {generatedLink && (
          <div className="result-panel">
            <div className="result-title">✨ Seu link está pronto!</div>
            <div className="result-link">{generatedLink}</div>
            <button type="button" className="btn-copy" onClick={() => copyToClipboard(generatedLink)}>
              Copiar Link
            </button>
          </div>
        )}

        {/* Seção de Histórico */}
        {history.length > 0 && (
          <div className="history-section" style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#6366f1', marginBottom: '15px' }}>📌 Links Gerados Recentemente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((item) => (
                <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.generated}</div>
                    <div style={{ fontSize: '0.7rem', color: '#71717a' }}>Slug: {item.slug} | {item.date}</div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.generated)}
                    style={{ background: '#6366f1', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    Copiar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
