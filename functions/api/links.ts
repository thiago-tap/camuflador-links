export async function onRequestPost(context) {
  const { request, env } = context;
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const body = await request.json();
    let { originalUrl, slug, pixelId } = body;

    if (!originalUrl) {
      return new Response(JSON.stringify({ error: "URL original é obrigatória" }), { status: 400, headers });
    }

    // Gerar slug aleatório se não for fornecido
    if (!slug || slug.trim() === "") {
      slug = Math.random().toString(36).substring(2, 8);
    }

    const data = {
      targetUrl: originalUrl,
      pixelId: pixelId || null,
      createdAt: new Date().toISOString()
    };

    // Salvar no KV Binder (precisa ser configurado no painel da Cloudflare)
    if (!env.LINKS_KV) {
      return new Response(JSON.stringify({ error: "Erro de configuração: KV LINKS_KV não vinculado." }), { status: 500, headers });
    }

    await env.LINKS_KV.put(slug, JSON.stringify(data));

    const url = new URL(request.url);
    return new Response(JSON.stringify({
      success: true,
      slug,
      generatedUrl: `${url.origin}/${slug}`
    }), { headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
