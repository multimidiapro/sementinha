import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CATEGORIAS, type Categoria, type Video } from '../tipos.ts';
import { enderecoPlayer, miniatura } from '../util/youtube.ts';
import { falar } from '../util/voz.ts';

type Props = {
  videos: Video[];
  aoAssistir: (videoId: string) => void;
  aoSair: () => void;
};

export function Videos({ videos, aoAssistir, aoSair }: Props) {
  const [tocando, setTocando] = useState<Video | null>(null);

  if (tocando) {
    return <Player video={tocando} aoVoltar={() => setTocando(null)} />;
  }

  const grupos = (Object.keys(CATEGORIAS) as Categoria[])
    .map((c) => ({ categoria: c, lista: videos.filter((v) => v.categoria === c) }))
    .filter((g) => g.lista.length > 0);

  return (
    <main className="sem-selecao min-h-full px-5 pb-10 pt-4">
      <div className="mx-auto flex max-w-5xl items-center gap-4">
        <BotaoRedondo rotulo="Voltar para a salinha" onClick={aoSair}>
          🏠
        </BotaoRedondo>
        <h1 className="text-4xl font-black text-ceu-escuro">Vídeos</h1>
      </div>

      <div className="mx-auto mt-6 max-w-5xl space-y-8">
        {grupos.map((g) => (
          <section key={g.categoria}>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-folha-escura">
              <span aria-hidden="true">{CATEGORIAS[g.categoria].icone}</span> {CATEGORIAS[g.categoria].nome}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
              {g.lista.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    aoAssistir(v.id);
                    setTocando(v);
                  }}
                  className="anim-aparecer overflow-hidden rounded-3xl border-b-8 border-black/15 bg-white text-left shadow-lg active:translate-y-1 active:border-b-4"
                >
                  <img src={miniatura(v.youtubeId)} alt="" className="aspect-video w-full object-cover" draggable={false} />
                  <p className="line-clamp-2 px-3 py-2 text-base font-bold text-folha-funda">{v.titulo}</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

// O player fica coberto por uma película: a criança não toca em nada do YouTube (logo, título, links).
// Quem manda é o app: pausar, continuar e, no fim, a nossa tela (sem sugestões de outros vídeos).
function Player({ video, aoVoltar }: { video: Video; aoVoltar: () => void }) {
  const quadro = useRef<HTMLIFrameElement>(null);
  const [pausado, setPausado] = useState(false);
  const [acabou, setAcabou] = useState(false);
  const [rodada, setRodada] = useState(0);

  function comando(func: 'playVideo' | 'pauseVideo') {
    quadro.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  }

  useEffect(() => {
    function ouvir(e: MessageEvent) {
      if (e.origin !== 'https://www.youtube-nocookie.com' || e.source !== quadro.current?.contentWindow) return;
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        const estado = msg?.info?.playerState ?? (msg?.event === 'onStateChange' ? msg.info : undefined);
        if (estado === 0) {
          setAcabou(true);
          falar('Acabou! Quer ver de novo?');
        }
      } catch {
        // Mensagem que não é do player.
      }
    }
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
  }, []);

  function aoCarregar() {
    // Pede ao player para avisar quando muda de estado (tocando, pausado, acabou).
    quadro.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'sementinha', channel: 'widget' }), '*');
  }

  if (acabou) {
    return (
      <main className="sem-selecao flex min-h-full flex-col items-center justify-center px-5 text-center">
        <img src={miniatura(video.youtubeId)} alt="" className="w-full max-w-md rounded-3xl shadow-lg" draggable={false} />
        <h1 className="mt-6 text-4xl font-black text-folha-escura">Quer ver de novo?</h1>
        <div className="mt-8 flex gap-5">
          <BotaoGrande
            cor="bg-folha"
            rotulo="Ver de novo"
            onClick={() => {
              setAcabou(false);
              setPausado(false);
              setRodada((r) => r + 1);
            }}
          >
            🔁
          </BotaoGrande>
          <BotaoGrande cor="bg-ceu" rotulo="Escolher outro vídeo" onClick={aoVoltar}>
            📺
          </BotaoGrande>
        </div>
      </main>
    );
  }

  return (
    <main className="sem-selecao flex min-h-full flex-col items-center justify-center bg-folha-funda px-3 py-4">
      <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl bg-black">
        <iframe
          key={rodada}
          ref={quadro}
          src={enderecoPlayer(video.youtubeId)}
          title={video.titulo}
          onLoad={aoCarregar}
          allow="autoplay; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
        {/* Película: qualquer toque no vídeo só pausa ou continua. */}
        <button
          aria-label={pausado ? 'Continuar' : 'Pausar'}
          onClick={() => {
            comando(pausado ? 'playVideo' : 'pauseVideo');
            setPausado(!pausado);
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {pausado && <span className="rounded-full bg-white/90 px-8 py-5 text-6xl shadow-lg">▶</span>}
        </button>
      </div>

      <div className="mt-5 flex gap-5">
        <BotaoGrande cor="bg-ceu" rotulo="Escolher outro vídeo" onClick={aoVoltar}>
          📺
        </BotaoGrande>
        <BotaoGrande
          cor="bg-sol"
          rotulo={pausado ? 'Continuar' : 'Pausar'}
          onClick={() => {
            comando(pausado ? 'playVideo' : 'pauseVideo');
            setPausado(!pausado);
          }}
        >
          {pausado ? '▶' : '⏸'}
        </BotaoGrande>
      </div>
    </main>
  );
}

function BotaoRedondo({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={rotulo} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow active:scale-95">
      {children}
    </button>
  );
}

function BotaoGrande({ cor, rotulo, onClick, children }: { cor: string; rotulo: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={rotulo}
      className={`${cor} flex h-24 w-28 items-center justify-center rounded-3xl border-b-8 border-black/15 text-5xl text-white shadow-lg active:translate-y-1 active:border-b-4`}
    >
      {children}
    </button>
  );
}
