import { useEffect, useState } from 'react';
import { lerMiniatura } from '../dados/arquivos.ts';
import type { Video } from '../tipos.ts';
import { miniatura } from '../util/youtube.ts';

/** Foto do vídeo: do aparelho (arquivo) ou do YouTube. */
export function Miniatura({ video, className = '' }: { video: Video; className?: string }) {
  const [url, setUrl] = useState<string | null>(video.origem === 'youtube' ? miniatura(video.youtubeId) : null);

  useEffect(() => {
    if (video.origem !== 'arquivo') return;
    let endereco: string | null = null;
    let cancelado = false;
    lerMiniatura(video.id)
      .then((b) => {
        if (cancelado || !b) return;
        endereco = URL.createObjectURL(b);
        setUrl(endereco);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
      if (endereco) URL.revokeObjectURL(endereco);
    };
  }, [video]);

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-folha text-5xl text-white ${className}`} aria-hidden="true">
        ▶
      </div>
    );
  }
  return <img src={url} alt="" draggable={false} className={`object-cover ${className}`} />;
}
