// Peças que todas as brincadeiras usam: cabeçalho (casinha, bolinhas, repetir, Corujinha),
// tela de parabéns com estrelinha, confete e ajudantes.
import { useEffect, useRef, type ReactNode } from 'react';
import { Brotinho } from '../componentes/Brotinho.tsx';
import { falar } from '../util/voz.ts';

export function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Diz se a tela ainda está aberta (para não seguir o jogo depois que a criança saiu). */
export function useVivo() {
  const vivo = useRef(true);
  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);
  return vivo;
}

/** Fala o elogio e espera ele terminar (no mínimo `minimoMs` de festa). */
export function comemorar(texto: string, minimoMs = 1800) {
  const minimo = new Promise((r) => setTimeout(r, minimoMs));
  return Promise.all([falar(texto, { interromper: true }), minimo]).then(() => new Promise((r) => setTimeout(r, 300)));
}

function BotaoTopo({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={rotulo} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow active:scale-95">
      {children}
    </button>
  );
}

export function Cabecalho({
  aoSair,
  aoRepetir,
  instrucao,
  feitas,
  total,
}: {
  aoSair: () => void;
  aoRepetir?: () => void;
  instrucao: string;
  feitas?: number;
  total?: number;
}) {
  return (
    <div className="flex w-full max-w-4xl items-center justify-between gap-3">
      <BotaoTopo rotulo="Voltar para a salinha" onClick={aoSair}>
        🏠
      </BotaoTopo>
      {total ? <Bolinhas total={total} feitas={feitas ?? 0} /> : <span />}
      <div className="flex gap-3">
        <Corujinha instrucao={instrucao} />
        {aoRepetir && (
          <BotaoTopo rotulo="Ouvir de novo" onClick={aoRepetir}>
            🔊
          </BotaoTopo>
        )}
      </div>
    </div>
  );
}

/** A Corujinha explica a brincadeira quando a criança toca nela. */
export function Corujinha({ instrucao }: { instrucao: string }) {
  return (
    <button
      onClick={() => falar(instrucao, { interromper: true })}
      aria-label="Corujinha: como brincar"
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sol-claro text-4xl shadow active:scale-95"
    >
      🦉
    </button>
  );
}

export function Bolinhas({ total, feitas }: { total: number; feitas: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label={`${feitas} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-5 w-5 rounded-full transition ${i < feitas ? 'bg-sol' : 'bg-white ring-2 ring-broto'}`} />
      ))}
    </div>
  );
}

export function FimDaRodada({ estrelas, aoJogarDeNovo, aoSair }: { estrelas: number; aoJogarDeNovo: () => void; aoSair: () => void }) {
  return (
    <div className="anim-festa flex flex-1 flex-col items-center justify-center text-center">
      <Brotinho estrelas={estrelas} tamanho={150} />
      <p className="mt-2 text-6xl" aria-hidden="true">⭐</p>
      <h1 className="mt-2 text-4xl font-black text-folha-escura">Parabéns!</h1>
      <p className="mt-1 text-2xl font-bold text-sol-escuro">Você ganhou uma estrelinha!</p>
      <div className="mt-8 flex gap-4">
        <button onClick={aoJogarDeNovo} className="rounded-3xl border-b-8 border-black/15 bg-folha px-8 py-5 text-2xl font-extrabold text-white active:translate-y-1 active:border-b-4">
          Jogar de novo
        </button>
        <button
          onClick={aoSair}
          aria-label="Voltar para a salinha"
          className="rounded-3xl border-b-8 border-black/15 bg-ceu px-8 py-5 text-2xl font-extrabold text-white active:translate-y-1 active:border-b-4"
        >
          🏠
        </button>
      </div>
      <Confete />
    </div>
  );
}

export function Confete() {
  const pedacos = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      cor: ['#639922', '#ef9f27', '#378add', '#e24b4a', '#7f4fc9'][i % 5],
    })),
  ).current;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {pedacos.map((p, i) => (
        <span
          key={i}
          className="anim-cair absolute top-0 block h-4 w-3 rounded-sm"
          style={{ left: `${p.left}%`, background: p.cor, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}

/** O que toda brincadeira recebe da salinha. */
export type PropsBrincadeira = {
  estrelas: number;
  progresso: Record<string, import('../tipos.ts').ProgressoItem>;
  aoResponder: (chave: string, certoDePrimeira: boolean, errou: boolean) => void;
  aoGanharEstrela: () => void;
  aoSair: () => void;
};
