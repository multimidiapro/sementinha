// Jogo da Memória: cartas viradas para baixo. Cada par é uma LETRA e o DESENHO que começa com ela.
// 3 pares (6 cartas) para crianças de 4 e 5 anos.
import { useState } from 'react';
import { falar, parar } from '../util/voz.ts';
import { LETRAS, corDaLetra, letraDe, type Letra } from './letras.ts';
import { Cabecalho, FimDaRodada, embaralhar, useVivo, type PropsBrincadeira } from './partes.tsx';

const PARES = 3;
const INSTRUCAO = 'Vire duas cartas. Ache a letra e o desenho que combinam!';

type Carta = { id: string; letra: Letra; tipo: 'letra' | 'desenho' };

function montarMesa(): Carta[] {
  const letras = embaralhar(LETRAS.filter((l) => l.inicioClaro)).slice(0, PARES);
  return embaralhar(
    letras.flatMap((l) => [
      { id: `${l.letra}-letra`, letra: l, tipo: 'letra' as const },
      { id: `${l.letra}-desenho`, letra: l, tipo: 'desenho' as const },
    ]),
  );
}

export function Memoria({ estrelas, aoGanharEstrela, aoSair }: PropsBrincadeira) {
  const [mesa, setMesa] = useState(montarMesa);
  const [viradas, setViradas] = useState<string[]>([]);
  const [achadas, setAchadas] = useState<string[]>([]);
  const [fim, setFim] = useState(false);
  const vivo = useVivo();

  function sair() {
    parar();
    aoSair();
  }

  function falarCarta(c: Carta) {
    falar(c.tipo === 'letra' ? `Letra ${c.letra.som}.` : `${c.letra.palavra}.`, { interromper: true });
  }

  function tocar(c: Carta) {
    if (fim || viradas.length === 2 || viradas.includes(c.id) || achadas.includes(c.letra.letra)) return;
    const novas = [...viradas, c.id];
    setViradas(novas);

    if (novas.length === 1) return falarCarta(c);

    const primeira = mesa.find((x) => x.id === novas[0])!;
    if (primeira.letra === c.letra) {
      const total = [...achadas, c.letra.letra];
      setAchadas(total);
      setViradas([]);
      falar(`Achou! ${letraDe(c.letra)}`, { interromper: true }).then(() => {
        if (!vivo.current || total.length < PARES) return;
        setFim(true);
        aoGanharEstrela();
        falar('Parabéns! Você ganhou uma estrelinha!');
      });
    } else {
      falarCarta(c);
      setTimeout(() => {
        if (!vivo.current) return;
        setViradas([]);
        falar('Não combinou. Tente de novo!', { interromper: true });
      }, 1600);
    }
  }

  function jogarDeNovo() {
    setMesa(montarMesa());
    setViradas([]);
    setAchadas([]);
    setFim(false);
  }

  return (
    <main className="sem-selecao flex min-h-full flex-col items-center px-5 pb-8 pt-4">
      <Cabecalho aoSair={sair} instrucao={INSTRUCAO} total={PARES} feitas={achadas.length} />

      {fim ? (
        <FimDaRodada estrelas={estrelas} aoJogarDeNovo={jogarDeNovo} aoSair={sair} />
      ) : (
        <>
          <h1 className="mt-6 text-center text-4xl font-black text-folha-escura">Jogo da Memória</h1>
          <div className="mt-6 grid w-full max-w-xl grid-cols-3 gap-4">
            {mesa.map((c) => {
              const aberta = viradas.includes(c.id) || achadas.includes(c.letra.letra);
              const achada = achadas.includes(c.letra.letra);
              return (
                <button
                  key={c.id}
                  onClick={() => tocar(c)}
                  aria-label={aberta ? (c.tipo === 'letra' ? `Letra ${c.letra.letra}` : c.letra.palavra) : 'Carta virada'}
                  className={`flex aspect-[4/5] items-center justify-center rounded-3xl border-b-8 shadow-lg transition active:translate-y-1 active:border-b-4 ${
                    aberta ? 'anim-virar border-black/10 bg-white' : 'border-black/20 bg-folha'
                  } ${achada ? 'ring-8 ring-sol-claro' : ''}`}
                >
                  {!aberta && <span className="text-6xl" aria-hidden="true">🌱</span>}
                  {aberta && c.tipo === 'letra' && (
                    <span className="text-8xl font-black" style={{ color: corDaLetra(c.letra.letra) }}>
                      {c.letra.letra}
                    </span>
                  )}
                  {aberta && c.tipo === 'desenho' && (
                    <span className="flex flex-col items-center">
                      <span className="text-7xl" aria-hidden="true">{c.letra.emoji}</span>
                      <span className="mt-1 text-xl font-black text-folha-escura">{c.letra.palavra}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
