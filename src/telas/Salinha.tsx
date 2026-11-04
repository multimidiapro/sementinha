import { useEffect, useState } from 'react';
import { Brotinho } from '../componentes/Brotinho.tsx';
import type { Perfil, ProgressoItem } from '../tipos.ts';
import { falar } from '../util/voz.ts';
import { travarSalinha } from '../util/travar.ts';
import { Jogo } from '../jogos/Jogo.tsx';
import type { JogoId } from '../jogos/conteudo.ts';

type Props = {
  perfil: Perfil;
  progresso: Record<string, ProgressoItem>;
  aoResponder: (chave: string, certoDePrimeira: boolean, errou: boolean) => void;
  aoGanharEstrela: () => void;
  aoChamarPais: () => void;
};

const ATIVIDADES: { id: string; jogo?: JogoId; titulo: string; desenho: string; fundo: string; fala: string }[] = [
  { id: 'vogais', jogo: 'vogais', titulo: 'Vogais', desenho: 'AEIOU', fundo: 'bg-folha', fala: 'Vamos brincar com as vogais!' },
  { id: 'cores', jogo: 'cores', titulo: 'Cores', desenho: '🎨', fundo: 'bg-sol', fala: 'Vamos brincar com as cores!' },
  { id: 'videos', titulo: 'Vídeos', desenho: '▶', fundo: 'bg-ceu', fala: 'Vídeos! Já, já tem vídeo aqui.' },
];

export function Salinha({ perfil, progresso, aoResponder, aoGanharEstrela, aoChamarPais }: Props) {
  const [tocado, setTocado] = useState<string | null>(null);
  const [jogo, setJogo] = useState<JogoId | null>(null);

  // A trava fica ligada a salinha inteira, inclusive dentro dos jogos.
  useEffect(() => travarSalinha(), []);

  function tocar(id: string, fala: string, jogoId?: JogoId) {
    setTocado(id);
    falar(fala);
    window.setTimeout(() => {
      setTocado(null);
      if (jogoId) setJogo(jogoId);
    }, 650);
  }

  if (jogo) {
    return (
      <Jogo
        jogo={jogo}
        estrelas={perfil.estrelas}
        progresso={progresso}
        aoResponder={aoResponder}
        aoGanharEstrela={aoGanharEstrela}
        aoSair={() => setJogo(null)}
      />
    );
  }

  return (
    <main className="sem-selecao relative flex min-h-full flex-col items-center justify-center px-5 py-10">
      {/* Única saída da salinha: o cadeado dos pais. Pequeno e no canto, para a criança não tocar sem querer. */}
      <button
        onClick={aoChamarPais}
        aria-label="Área dos pais"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-xl text-folha-escura/60"
      >
        🔒
      </button>

      <button
        onClick={() => falar(`Oi, ${perfil.apelido}! Vamos aprender brincando?`)}
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
        {ATIVIDADES.map((a, i) => (
          <button
            key={a.id}
            onClick={() => tocar(a.id, a.fala, a.jogo)}
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
