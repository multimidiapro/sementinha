// Estoura Balões: os balões sobem com letras; a criança estoura o da letra que a voz pediu.
import { useEffect, useRef, useState } from 'react';
import { falar, parar } from '../util/voz.ts';
import { VOGAIS_LETRAS, corDaLetra, letraDe, type Letra } from './letras.ts';
import { Cabecalho, FimDaRodada, comemorar, embaralhar, useVivo, type PropsBrincadeira } from './partes.tsx';

const RODADAS = 5;
const BALOES_NA_TELA = 4;
const INSTRUCAO = 'Escute a letra e estoure o balão que tem ela!';

function pedido(l: Letra) {
  return `Estoure o balão da letra ${l.som}!`;
}

function sortear(anterior?: Letra) {
  const alvo = embaralhar(VOGAIS_LETRAS.filter((l) => l !== anterior))[0];
  const outros = embaralhar(VOGAIS_LETRAS.filter((l) => l !== alvo)).slice(0, BALOES_NA_TELA - 1);
  return { alvo, baloes: embaralhar([alvo, ...outros]) };
}

export function Baloes({ estrelas, aoResponder, aoGanharEstrela, aoSair }: PropsBrincadeira) {
  const [rodada, setRodada] = useState(0);
  const [{ alvo, baloes }, setPergunta] = useState(() => sortear());
  const [estourado, setEstourado] = useState<string | null>(null);
  const [tremendo, setTremendo] = useState<string | null>(null);
  const [errouNessa, setErrouNessa] = useState(false);
  const [fim, setFim] = useState(false);
  const vivo = useVivo();

  const falado = useRef<Letra | null>(null);
  useEffect(() => {
    if (fim || falado.current === alvo) return;
    falado.current = alvo;
    falar(pedido(alvo));
  }, [alvo, fim]);

  function sair() {
    parar();
    aoSair();
  }

  function tocar(l: Letra) {
    if (estourado || fim) return;
    if (l === alvo) {
      aoResponder(`baloes:${l.letra.toLowerCase()}`, !errouNessa, false);
      setEstourado(l.letra);
      comemorar(`Estourou! ${letraDe(l)}`).then(() => {
        if (!vivo.current) return;
        setEstourado(null);
        setErrouNessa(false);
        if (rodada + 1 >= RODADAS) {
          setFim(true);
          aoGanharEstrela();
          falar('Parabéns! Você ganhou uma estrelinha!');
        } else {
          setRodada((r) => r + 1);
          setPergunta(sortear(alvo));
        }
      });
    } else {
      if (!errouNessa) aoResponder(`baloes:${alvo.letra.toLowerCase()}`, false, true);
      setErrouNessa(true);
      setTremendo(l.letra);
      setTimeout(() => setTremendo(null), 450);
      falar(`Esse balão é da letra ${l.som}. ${pedido(alvo)}`, { interromper: true });
    }
  }

  function jogarDeNovo() {
    setRodada(0);
    setFim(false);
    setPergunta(sortear());
  }

  return (
    <main className="sem-selecao relative flex min-h-full flex-col items-center overflow-hidden bg-ceu-claro px-5 pb-8 pt-4">
      <Cabecalho
        aoSair={sair}
        aoRepetir={() => falar(pedido(alvo), { interromper: true })}
        instrucao={INSTRUCAO}
        total={RODADAS}
        feitas={fim ? RODADAS : rodada + (estourado ? 1 : 0)}
      />

      {fim ? (
        <FimDaRodada estrelas={estrelas} aoJogarDeNovo={jogarDeNovo} aoSair={sair} />
      ) : (
        <>
          <h1 className="mt-6 text-center text-4xl font-black text-ceu-escuro sm:text-5xl">
            Estoure o balão com: <span className="text-folha-escura">{alvo.letra}</span>
          </h1>

          <div key={rodada} className="mt-10 grid w-full max-w-4xl flex-1 grid-cols-4 items-end gap-3 sm:gap-6">
            {baloes.map((l, i) => (
              <div key={l.letra} className="anim-subir flex justify-center" style={{ animationDelay: `${i * 120}ms` }}>
                <button
                  onClick={() => tocar(l)}
                  aria-label={`Balão da letra ${l.letra}`}
                  className={`flex flex-col items-center ${estourado === l.letra ? 'anim-estourar' : tremendo === l.letra ? 'anim-tremer' : 'anim-flutuar'}`}
                  style={{ animationDelay: estourado || tremendo ? '0s' : `${i * 0.4}s` }}
                >
                  <span
                    className="relative flex h-32 w-28 items-center justify-center rounded-[50%] text-6xl font-black text-white shadow-lg sm:h-40 sm:w-32 sm:text-7xl"
                    style={{ background: corDaLetra(l.letra) }}
                  >
                    {l.letra}
                    <span className="absolute left-5 top-4 h-6 w-3 rotate-[30deg] rounded-full bg-white/40" aria-hidden="true" />
                  </span>
                  <span className="-mt-1 h-3 w-4 rounded-b-md" style={{ background: corDaLetra(l.letra) }} aria-hidden="true" />
                  <span className="h-16 w-0.5 bg-slate-400" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
