import { useState } from 'react'
import './App.css'

function App() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [pixelId, setPixelId] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Em produção (na Cloudflare), coloque a URL real do Worker
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      
      const res = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl, slug, pixelId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar o link.');
      
      // O Worker já devolve a URL gerada final
      setGeneratedLink(data.generatedUrl);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
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

          <div className="form-group">
            <label className="form-label" htmlFor="slug">Slug Personalizado (Opcional)</label>
            <input 
              id="slug"
              type="text" 
              className="form-input" 
              placeholder="Ex: metodo-secador" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pixelId">Pixel do Facebook ID (Opcional)</label>
            <input 
              id="pixelId"
              type="text" 
              className="form-input" 
              placeholder="1234567890123" 
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Gerando Magia...' : 'Gerar Link Camuflado'}
          </button>
        </form>

        {generatedLink && (
          <div className="result-panel">
            <div className="result-title">Seu link está pronto!</div>
            <div className="result-link">{generatedLink}</div>
            <button type="button" className="btn-copy" onClick={copyToClipboard}>
              Copiar Link
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
