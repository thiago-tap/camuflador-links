export async function onRequestGet(context) {
  const { request, env, params } = context;
  const slug = params.slug;

  if (!slug || slug === "api") {
    return context.next();
  }

  if (!env.LINKS_KV) {
    return new Response("Erro: KV Namespace não configurado.", { status: 500 });
  }

  const rawData = await env.LINKS_KV.get(slug);

  if (!rawData) {
    return new Response("Link não encontrado ou expirado.", { status: 404 });
  }

  const { targetUrl, pixelId } = JSON.parse(rawData);

  // Se não tiver pixel, redireciona direto (302)
  if (!pixelId) {
    return Response.redirect(targetUrl, 302);
  }

  // Se tiver pixel, serve a página de "ponte"
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecionando...</title>
      <meta http-equiv="refresh" content="2;url=${targetUrl}">
      <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      </script>
      <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
      /></noscript>
      <style>
        body { background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
        .loader { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #6366f1; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div style="text-align:center;">
         <div class="loader" style="margin: 0 auto 20px;"></div>
         <p>Aguarde, te levando para a oferta especial...</p>
      </div>
      <script>
        setTimeout(function() {
          window.location.href = "${targetUrl}";
        }, 800);
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
