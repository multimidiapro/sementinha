// Alfabeto A–Z: a criança toca nas letrinhas para ouvir o nome e ver a palavra.
// O alvo 🎯 abre o desafio ("Toque na letra bê!").
import { useState } from 'react';
import { falar, parar } from '../util/voz.ts';
import { Jogo } from './Jogo.tsx';
import { LETRAS, corDaLetra, letraDe, type Letra } from './letras.ts';
import { Cabecalho, type PropsBrincadeira } from './partes.tsx';

const INSTRUCAO = 'Toque nas letrinhas para ouvir o nome delas. Quando quiser, toque no alvo para o desafio!';

export function Alfabeto(props: PropsBrincadeira) {
  const [desafio, setDesafio] = useState(false);
  const [escolhida, setEscolhida] = useState<Letra>(LETRAS[0]);
  const [pulo, setPulo] = useState(0);

  if (desafio) return <Jogo jogo="alfabeto" {...props} aoSair={() => setDesafio(false)} />;

  function tocar(l: Letra) {
    setEscolhida(l);
    setPulo((p) => p + 1);
    falar(letraDe(l), { interromper: true });
  }

  return (
    <main className="sem-selecao flex min-h-full flex-col items-center px-4 pb-8 pt-4">
      <Cabecalho
        aoSair={() => {
          parar();
          props.aoSair();
        }}
        instrucao={INSTRUCAO}
      />

      <div className="mt-4 flex w-full max-w-5xl flex-col gap-5 md:flex-row md:items-start">
        {/* Cartão grande da letra escolhida */}
        <button
          key={pulo}
          onClick={() => tocar(escolhida)}
          aria-label={`Ouvir a letra ${escolhida.letra}`}
          className="anim-festa flex shrink-0 items-center gap-5 rounded-[2rem] border-4 border-sol-claro bg-white p-5 shadow-lg md:w-72 md:flex-col"
        >
          <span
            className="flex h-28 w-28 items-center justify-center rounded-3xl text-8xl font-black text-white md:h-40 md:w-40 md:text-9xl"
            style={{ background: corDaLetra(escolhida.letra) }}
          >
            {escolhida.letra}
          </span>
          <span className="flex flex-col items-center">
            <span className="text-7xl" aria-hidden="true">{escolhida.emoji}</span>
            <span className="mt-1 text-3xl font-black text-folha-escura">{escolhida.palavra}</span>
          </span>
        </button>

        <div className="flex-1">
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 sm:gap-3">
            {LETRAS.map((l) => (
              <button
                key={l.letra}
                onClick={() => tocar(l)}
                aria-label={`Letra ${l.letra}`}
                className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-b-4 bg-white shadow active:translate-y-0.5 active:border-b-2 ${
                  escolhida.letra === l.letra ? 'border-sol ring-4 ring-sol-claro' : 'border-black/10'
                }`}
              >
                <span className="text-4xl font-black leading-none" style={{ color: corDaLetra(l.letra) }}>
                  {l.letra}
                </span>
                <span className="text-xl leading-none" aria-hidden="true">{l.emoji}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              falar('Vamos para o desafio!', { interromper: true });
              setDesafio(true);
            }}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-3xl border-b-8 border-black/15 bg-folha py-4 text-3xl font-extrabold text-white shadow-lg active:translate-y-1 active:border-b-4"
          >
            <span aria-hidden="true">🎯</span> Desafio
          </button>
        </div>
      </div>
    </main>
  );
}
