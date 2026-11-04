import { useEffect, useRef, useState } from 'react';
import { Brotinho } from '../componentes/Brotinho.tsx';
import type { AtividadeId, Perfil, ProgressoItem, Video } from '../tipos.ts';
import { falar } from '../util/voz.ts';
import { travarSalinha } from '../util/travar.ts';
import { Jogo } from '../jogos/Jogo.tsx';
import type { JogoId } from '../jogos/conteudo.ts';
import { Videos } from './Videos.tsx';

const PASSO_SEGUNDOS = 5;

type Props = {
  perfil: Perfil;
  progresso: Record<string, ProgressoItem>;
  videos: Video[];
  desligados: AtividadeId[];
  segundosRestantes: number;
  aoResponder: (chave: string, certoDePrimeira: boolean, errou: boolean) => void;
  aoGanharEstrela: () => void;
  aoAssistir: (videoId: string) => void;
  aoContarTempo: (atividade: AtividadeId | null, segundos: number) => void;
  aoChamarPais: () => void;
};

const ATIVIDADES: { id: AtividadeId; titulo: string; desenho: string; fundo: string; fala: string }[] = [
  { id: 'vogais', titulo: 'Vogais', desenho: 'AEIOU', fundo: 'bg-folha', fala: 'Vamos brincar com as vogais!' },
  { id: 'cores', titulo: 'Cores', desenho: '🎨', fundo: 'bg-sol', fala: 'Vamos brincar com as cores!' },
  { id: 'videos', titulo: 'Vídeos', desenho: '▶', fundo: 'bg-ceu', fala: 'Vamos ver vídeos!' },
];

export function Salinha(props: Props) {
  const { perfil, progresso, videos, desligados, segundosRestantes, aoResponder, aoGanharEstrela, aoAssistir, aoChamarPais } = props;
  const [tocado, setTocado] = useState<string | null>(null);
  const [aberta, setAberta] = useState<AtividadeId | null>(null);
  const acabouTempo = segundosRestantes <= 0;

  // A trava fica ligada a salinha inteira, inclusive dentro dos jogos e vídeos.
  useEffect(() => travarSalinha(), []);

  // Relógio: a cada 5 segundos com o app na frente, soma o tempo na atividade aberta.
  const contar = useRef(props.aoContarTempo);
  contar.current = props.aoContarTempo;
  const atividadeAgora = useRef<AtividadeId | null>(null);
  atividadeAgora.current = aberta;
  useEffect(() => {
    if (acabouTempo) return;
    const relogio = window.setInterval(() => {
      if (document.visibilityState === 'visible') contar.current(atividadeAgora.current, PASSO_SEGUNDOS);
    }, PASSO_SEGUNDOS * 1000);
    return () => window.clearInterval(relogio);
  }, [acabouTempo]);

  // Avisa uma vez quando falta 1 minuto.
  const avisou = useRef(false);
  useEffect(() => {
    if (!avisou.current && segundosRestantes > 0 && segundosRestantes <= 60) {
      avisou.current = true;
      falar('Falta pouquinho para descansar!');
    }
  }, [segundosRestantes]);

  // Acabou o tempo: fecha o que estiver aberto (inclusive vídeo) e fala uma vez.
  useEffect(() => {
    if (!acabouTempo) return;
    setAberta(null);
    falar(`${perfil.apelido}, hora de descansar! Amanhã a gente brinca mais.`, { interromper: true });
  }, [acabouTempo, perfil.apelido]);

  if (acabouTempo) {
    return <Descanso perfil={perfil} aoChamarPais={aoChamarPais} />;
  }

  const atividades = ATIVIDADES.filter((a) => !desligados.includes(a.id) && (a.id !== 'videos' || videos.length > 0));

  function tocar(id: AtividadeId, fala: string) {
    setTocado(id);
    falar(fala, { interromper: true });
    window.setTimeout(() => {
      setTocado(null);
      setAberta(id);
    }, 650);
  }

  if (aberta === 'videos') {
    return <Videos videos={videos} aoAssistir={aoAssistir} aoSair={() => setAberta(null)} />;
  }

  if (aberta) {
    return (
      <Jogo
        jogo={aberta as JogoId}
        estrelas={perfil.estrelas}
        progresso={progresso}
        aoResponder={aoResponder}
        aoGanharEstrela={aoGanharEstrela}
        aoSair={() => setAberta(null)}
      />
    );
  }

  return (
    <main className="sem-selecao relative flex min-h-full flex-col items-center justify-center px-5 py-10">
      <BotaoPais aoChamarPais={aoChamarPais} />

      <button
        onClick={() => falar(`Oi, ${perfil.apelido}! Vamos aprender brincando?`, { interromper: true })}
        className="mt-2 flex flex-col items-center"
        aria-label="Ouvir o Brotinho"
      >
        <Brotinho estrelas={perfil.estrelas} tamanho={140} />
      </button>

      <h1 className="mt-1 text-center text-4xl font-black text-folha-escura">
        Oi, {perfil.apelido}! <span aria-hidden="true">{perfil.bichinho}</span>
      </h1>
      <p className="mt-1 flex items-center gap-1 text-xl font-bold text-sol-escuro">
        <span aria-hidden="true">⭐</span> {perfil.estrelas}
      </p>

      <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
        {atividades.map((a, i) => (
          <button
            key={a.id}
            onClick={() => tocar(a.id, a.fala)}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`anim-aparecer ${a.fundo} flex aspect-[4/3] flex-col items-center justify-center rounded-[2rem] border-b-8 border-black/15 text-white shadow-lg transition active:translate-y-1 active:border-b-4 sm:aspect-square`}
          >
            <span className={`text-5xl font-black tracking-wider ${tocado === a.id ? 'anim-pular' : ''}`} aria-hidden="true">
              {a.desenho}
            </span>
            <span className="mt-3 text-3xl font-extrabold">{a.titulo}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

// Única saída da salinha: o cadeado dos pais. Pequeno e no canto, para a criança não tocar sem querer.
function BotaoPais({ aoChamarPais }: { aoChamarPais: () => void }) {
  return (
    <button
      onClick={aoChamarPais}
      aria-label="Área dos pais"
      className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-xl text-folha-escura/60"
    >
      🔒
    </button>
  );
}

function Descanso({ perfil, aoChamarPais }: { perfil: Perfil; aoChamarPais: () => void }) {
  return (
    <main className="sem-selecao relative flex min-h-full flex-col items-center justify-center bg-ceu-claro px-5 text-center">
      <BotaoPais aoChamarPais={aoChamarPais} />
      <p className="text-7xl" aria-hidden="true">🌙</p>
      <Brotinho estrelas={perfil.estrelas} tamanho={130} />
      <h1 className="mt-3 text-4xl font-black text-ceu-escuro">Hora de descansar!</h1>
      <p className="mt-2 max-w-md text-2xl font-bold text-ceu-escuro/80">
        Você brincou muito hoje, {perfil.apelido}. Amanhã a gente brinca mais!
      </p>
    </main>
  );
}
