// Aceita os jeitos comuns de link do YouTube e devolve só o código do vídeo (11 caracteres).
const CODIGO = /^[\w-]{11}$/;

export function extrairIdYoutube(texto: string): string | null {
  const t = texto.trim();
  if (CODIGO.test(t)) return t;
  try {
    const url = new URL(t.startsWith('http') ? t : `https://${t}`);
    const host = url.hostname.replace(/^(www|m|music)\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1, 12);
      return CODIGO.test(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = url.searchParams.get('v');
      if (v && CODIGO.test(v)) return v;
      const m = url.pathname.match(/^\/(shorts|embed|live)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    // Não era um link.
  }
  return null;
}

export function miniatura(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
}

/** Player sem cookies, sem controles do YouTube e sem sugestões; o app controla tudo. */
export function enderecoPlayer(youtubeId: string) {
  const p = new URLSearchParams({
    autoplay: '1',
    controls: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    disablekb: '1',
    fs: '0',
    iv_load_policy: '3',
    enablejsapi: '1',
    origin: window.location.origin,
  });
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${p}`;
}

/** Busca o título pelo nosso servidor (o aparelho não fala com o YouTube para isso). */
export async function buscarTitulo(youtubeId: string): Promise<string | null> {
  try {
    const r = await fetch(`/api/video-info?id=${encodeURIComponent(youtubeId)}`);
    if (!r.ok) return null;
    const j = (await r.json()) as { titulo?: string };
    return j.titulo ?? null;
  } catch {
    return null;
  }
}
