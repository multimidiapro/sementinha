import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Miniatura } from '../componentes/Miniatura.tsx';
import { lerVideo } from '../dados/arquivos.ts';
import { CATEGORIAS, type Categoria, type Video } from '../tipos.ts';
import { enderecoPlayer } from '../util/youtube.ts';
import { falar } from '../util/voz.ts';

type Props = {
  videos: Video[];
  aoAssistir: (videoId: string) => void;
  aoSair: () => void;
};

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine);
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);
  return online;
}

// Galeria: fotos grandes, separadas por tipo. Sem internet, só aparecem os vídeos guardados no aparelho.
export function Videos({ videos, aoAssistir, aoSair }: Props) {
  const [tocando, setTocando] = useState<Video | null>(null);
  const online = useOnline();
  const disponiveis = videos.filter((v) => v.origem === 'arquivo' || online);

  if (tocando) {
    const voltar = () => setTocando(null);
    return tocando.origem === 'arquivo' ? (
      <PlayerArquivo video={tocando} aoVoltar={voltar} />
    ) : (
      <PlayerYoutube video={tocando} aoVoltar={voltar} />
    );
  }

  const grupos = (Object.keys(CATEGORIAS) as Categoria[])
    .map((c) => ({ categoria: c, lista: disponiveis.filter((v) => v.categoria === c) }))
    .filter((g) => g.lista.length > 0);

  return (
    <main className="sem-selecao min-h-full px-5 pb-10 pt-4">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <BotaoQuadrado rotulo="Voltar para a salinha" onClick={aoSair}>
          🏠
        </BotaoQuadrado>
        <h1 className="text-4xl font-black text-ceu-escuro">Vídeos</h1>
      </div>

      {grupos.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-6xl" aria-hidden="true">📡</p>
          <p className="mt-3 text-2xl font-bold text-folha-escura">Sem internet agora. Vamos brincar nos jogos?</p>
        </div>
      )}

      <div className="mx-auto mt-6 max-w-6xl space-y-8">
        {grupos.map((g) => (
          <section key={g.categoria}>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-folha-escura">
              <span aria-hidden="true">{CATEGORIAS[g.categoria].icone}</span> {CATEGORIAS[g.categoria].nome}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {g.lista.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    aoAssistir(v.id);
                    setTocando(v);
                  }}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="anim-aparecer group overflow-hidden rounded-3xl border-b-8 border-black/15 bg-white text-left shadow-lg active:translate-y-1 active:border-b-4"
                >
                  <div className="relative">
                    <Miniatura video={v} className="aspect-video w-full" />
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 pl-1 text-3xl text-folha shadow-lg">▶</span>
                    </span>
                  </div>
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

// ---------- Players em tela cheia, com a cara do app ----------
// Tocando: tela limpa, só o vídeo. Um toque pausa e mostra os botões grandes.

type Controle = { pausado: boolean; alternar: () => void };

function Moldura({
  titulo,
  controle,
  progresso,
  aoVoltar,
  children,
}: {
  titulo: string;
  controle: Controle;
  progresso: number;
  aoVoltar: () => void;
  children: ReactNode;
}) {
  return (
    <div className="sem-selecao fixed inset-0 z-50 bg-black">
      {children}
      {/* Película: cobre o vídeo inteiro; a criança só toca no que é do app. */}
      <button aria-label={controle.pausado ? 'Continuar' : 'Pausar'} onClick={controle.alternar} className="absolute inset-0 h-full w-full" />

      {controle.pausado && (
        <div className="anim-aparecer pointer-events-none absolute inset-0 flex flex-col bg-folha-funda/70">
          <div className="pointer-events-auto flex items-center gap-4 p-5">
            <BotaoQuadrado rotulo="Escolher outro vídeo" onClick={aoVoltar}>
              📺
            </BotaoQuadrado>
            <p className="line-clamp-1 text-2xl font-extrabold text-white">{titulo}</p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <button
              onClick={controle.alternar}
              aria-label="Continuar"
              className="pointer-events-auto flex h-32 w-32 items-center justify-center rounded-full border-b-8 border-black/20 bg-sol pl-2 text-6xl text-white shadow-2xl active:translate-y-1"
            >
              ▶
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-white/20">
        <div className="h-full bg-sol transition-[width] duration-500" style={{ width: `${Math.round(progresso * 100)}%` }} />
      </div>
    </div>
  );
}

function TelaFim({ video, aoRepetir, aoVoltar }: { video: Video; aoRepetir: () => void; aoVoltar: () => void }) {
  useEffect(() => {
    falar('Acabou! Quer ver de novo?', { interromper: true });
  }, []);
  return (
    <div className="sem-selecao fixed inset-0 z-50 flex flex-col items-center justify-center bg-grama px-5 text-center">
      <Miniatura video={video} className="aspect-video w-full max-w-md rounded-3xl shadow-lg" />
      <h1 className="mt-6 text-4xl font-black text-folha-escura">Quer ver de novo?</h1>
      <div className="mt-8 flex gap-5">
        <BotaoGrande cor="bg-folha" rotulo="Ver de novo" onClick={aoRepetir}>
          🔁
        </BotaoGrande>
        <BotaoGrande cor="bg-ceu" rotulo="Escolher outro vídeo" onClick={aoVoltar}>
          📺
        </BotaoGrande>
      </div>
    </div>
  );
}

/** Vídeo guardado no aparelho: player nosso, funciona sem internet. */
function PlayerArquivo({ video, aoVoltar }: { video: Video; aoVoltar: () => void }) {
  const tela = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [acabou, setAcabou] = useState(false);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    let endereco: string | null = null;
    lerVideo(video.id)
      .then((b) => {
        if (!b) return setErro(true);
        endereco = URL.createObjectURL(b);
        setUrl(endereco);
      })
      .catch(() => setErro(true));
    return () => {
      if (endereco) URL.revokeObjectURL(endereco);
    };
  }, [video.id]);

  function alternar() {
    const v = tela.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  if (erro) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-grama text-center">
        <p className="text-6xl" aria-hidden="true">😕</p>
        <p className="mt-3 text-2xl font-bold text-folha-escura">Esse vídeo não abriu.</p>
        <div className="mt-6">
          <BotaoGrande cor="bg-ceu" rotulo="Escolher outro vídeo" onClick={aoVoltar}>
            📺
          </BotaoGrande>
        </div>
      </div>
    );
  }

  if (acabou) {
    return (
      <TelaFim
        video={video}
        aoVoltar={aoVoltar}
        aoRepetir={() => {
          setAcabou(false);
          setProgresso(0);
        }}
      />
    );
  }

  return (
    <Moldura titulo={video.titulo} controle={{ pausado, alternar }} progresso={progresso} aoVoltar={aoVoltar}>
      {url && (
        <video
          ref={tela}
          src={url}
          autoPlay
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onPlay={() => setPausado(false)}
          onPause={() => setPausado(true)}
          onEnded={() => setAcabou(true)}
          onTimeUpdate={(e) => setProgresso(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
    </Moldura>
  );
}

/** Vídeo do YouTube: só com internet. Sem controles nem sugestões; o app manda em tudo. */
function PlayerYoutube({ video, aoVoltar }: { video: Extract<Video, { origem: 'youtube' }>; aoVoltar: () => void }) {
  const quadro = useRef<HTMLIFrameElement>(null);
  const [pausado, setPausado] = useState(false);
  const [acabou, setAcabou] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [rodada, setRodada] = useState(0);

  function comando(func: 'playVideo' | 'pauseVideo') {
    quadro.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [], id: 'sementinha', channel: 'widget' }), '*');
  }

  useEffect(() => {
    let duracao = 0;
    function ouvir(e: MessageEvent) {
      if (e.origin !== 'https://www.youtube-nocookie.com' || e.source !== quadro.current?.contentWindow) return;
      try {
        const info = (typeof e.data === 'string' ? JSON.parse(e.data) : e.data)?.info;
        if (!info) return;
        if (info.duration) duracao = info.duration;
        if (info.currentTime !== undefined && duracao) setProgresso(info.currentTime / duracao);
        if (info.playerState === 0) setAcabou(true);
        if (info.playerState === 1) setPausado(false);
        if (info.playerState === 2) setPausado(true);
      } catch {
        // Mensagem que não é do player.
      }
    }
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
  }, []);

  if (acabou) {
    return (
      <TelaFim
        video={video}
        aoVoltar={aoVoltar}
        aoRepetir={() => {
          setAcabou(false);
          setPausado(false);
          setProgresso(0);
          setRodada((r) => r + 1);
        }}
      />
    );
  }

  return (
    <Moldura
      titulo={video.titulo}
      controle={{ pausado, alternar: () => comando(pausado ? 'playVideo' : 'pauseVideo') }}
      progresso={progresso}
      aoVoltar={aoVoltar}
    >
      <iframe
        key={rodada}
        ref={quadro}
        src={enderecoPlayer(video.youtubeId)}
        title={video.titulo}
        onLoad={() =>
          quadro.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'sementinha', channel: 'widget' }), '*')
        }
        allow="autoplay; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full"
      />
    </Moldura>
  );
}

function BotaoQuadrado({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: ReactNode }) {
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
