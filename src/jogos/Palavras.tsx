// Monta Palavras: aparece o desenho e as sílabas embaralhadas; a criança toca nelas na ordem certa.
// Cada sílaba tem a sua pronúncia escrita para a voz ("BO" de bola é "bó", de bolo é "bô").
import { useEffect, useRef, useState } from 'react';
import { falar, parar } from '../util/voz.ts';
import { Cabecalho, FimDaRodada, comemorar, embaralhar, useVivo, type PropsBrincadeira } from './partes.tsx';

type Silaba = { texto: string; som: string };
export type Palavra = { id: string; palavra: string; emoji: string; silabas: Silaba[] };

const s = (texto: string, som: string): Silaba => ({ texto, som });

export const PALAVRAS: Palavra[] = [
  { id: 'bola', palavra: 'Bola', emoji: '⚽', silabas: [s('BO', 'bó'), s('LA', 'lá')] },
  { id: 'casa', palavra: 'Casa', emoji: '🏠', silabas: [s('CA', 'cá'), s('SA', 'zá')] },
  { id: 'gato', palavra: 'Gato', emoji: '🐱', silabas: [s('GA', 'gá'), s('TO', 'tu')] },
  { id: 'pato', palavra: 'Pato', emoji: '🦆', silabas: [s('PA', 'pá'), s('TO', 'tu')] },
  { id: 'sapo', palavra: 'Sapo', emoji: '🐸', silabas: [s('SA', 'sá'), s('PO', 'pu')] },
  { id: 'vaca', palavra: 'Vaca', emoji: '🐄', silabas: [s('VA', 'vá'), s('CA', 'cá')] },
  { id: 'uva', palavra: 'Uva', emoji: '🍇', silabas: [s('U', 'u'), s('VA', 'vá')] },
  { id: 'lua', palavra: 'Lua', emoji: '🌙', silabas: [s('LU', 'lu'), s('A', 'á')] },
  { id: 'dado', palavra: 'Dado', emoji: '🎲', silabas: [s('DA', 'dá'), s('DO', 'du')] },
  { id: 'bolo', palavra: 'Bolo', emoji: '🎂', silabas: [s('BO', 'bô'), s('LO', 'lu')] },
  { id: 'foca', palavra: 'Foca', emoji: '🦭', silabas: [s('FO', 'fó'), s('CA', 'cá')] },
  { id: 'mala', palavra: 'Mala', emoji: '🧳', silabas: [s('MA', 'má'), s('LA', 'lá')] },
];

const PALAVRAS_POR_RODADA = 4;
const INSTRUCAO = 'Toque nos pedacinhos na ordem certa para montar a palavra!';

function pedido(p: Palavra) {
  return `Vamos montar a palavra ${p.palavra.toLowerCase()}!`;
}

export function Palavras({ estrelas, aoResponder, aoGanharEstrela, aoSair }: PropsBrincadeira) {
  const [lista, setLista] = useState(() => embaralhar(PALAVRAS).slice(0, PALAVRAS_POR_RODADA));
  const [numero, setNumero] = useState(0);
  const palavra = lista[numero];
  const [pecas, setPecas] = useState(() => embaralhar(palavra.silabas.map((s, i) => ({ ...s, ordem: i }))));
  const [colocadas, setColocadas] = useState(0);
  const [tremendo, setTremendo] = useState<number | null>(null);
  const [errouNessa, setErrouNessa] = useState(false);
  const [fim, setFim] = useState(false);
  const vivo = useVivo();

  const falado = useRef<Palavra | null>(null);
  useEffect(() => {
    if (fim || falado.current === palavra) return;
    falado.current = palavra;
    falar(pedido(palavra));
  }, [palavra, fim]);

  function sair() {
    parar();
    aoSair();
  }

  function irPara(n: number, l = lista) {
    setNumero(n);
    setPecas(embaralhar(l[n].silabas.map((s, i) => ({ ...s, ordem: i }))));
    setColocadas(0);
    setErrouNessa(false);
  }

  function tocar(peca: Silaba & { ordem: number }) {
    if (fim || colocadas >= palavra.silabas.length || peca.ordem < colocadas) return;
    if (peca.ordem === colocadas) {
      const agora = colocadas + 1;
      setColocadas(agora);
      if (agora < palavra.silabas.length) {
        falar(peca.som, { interromper: true });
        return;
      }
      // Palavra completa: fala as sílabas e a palavra inteira.
      aoResponder(`palavras:${palavra.id}`, !errouNessa, false);
      const soletrado = palavra.silabas.map((x) => x.som).join('... ');
      comemorar(`${soletrado}... ${palavra.palavra}! Muito bem!`).then(() => {
        if (!vivo.current) return;
        if (numero + 1 >= lista.length) {
          setFim(true);
          aoGanharEstrela();
          falar('Parabéns! Você ganhou uma estrelinha!');
        } else irPara(numero + 1);
      });
    } else {
      if (!errouNessa) aoResponder(`palavras:${palavra.id}`, false, true);
      setErrouNessa(true);
      setTremendo(peca.ordem);
      setTimeout(() => setTremendo(null), 450);
      const certa = palavra.silabas[colocadas];
      falar(`Esse é o ${peca.som}. Agora vem o ${certa.som}.`, { interromper: true });
    }
  }

  function jogarDeNovo() {
    const nova = embaralhar(PALAVRAS).slice(0, PALAVRAS_POR_RODADA);
    setLista(nova);
    setFim(false);
    irPara(0, nova);
  }

  const completa = colocadas >= palavra.silabas.length;

  return (
    <main className="sem-selecao flex min-h-full flex-col items-center px-5 pb-8 pt-4">
      <Cabecalho
        aoSair={sair}
        aoRepetir={() => falar(pedido(palavra), { interromper: true })}
        instrucao={INSTRUCAO}
        total={lista.length}
        feitas={fim ? lista.length : numero + (completa ? 1 : 0)}
      />

      {fim ? (
        <FimDaRodada estrelas={estrelas} aoJogarDeNovo={jogarDeNovo} aoSair={sair} />
      ) : (
        <>
          <button
            key={palavra.id}
            onClick={() => falar(palavra.palavra, { interromper: true })}
            aria-label={palavra.palavra}
            className={`anim-aparecer mt-6 flex h-40 w-40 items-center justify-center rounded-[2rem] bg-white text-8xl shadow-lg ${completa ? 'anim-pular ring-8 ring-sol-claro' : ''}`}
          >
            {palavra.emoji}
          </button>

          {/* Espaços da palavra */}
          <div className="mt-8 flex gap-4">
            {palavra.silabas.map((sil, i) => (
              <span
                key={i}
                className={`flex h-24 w-28 items-center justify-center rounded-3xl text-5xl font-black sm:h-28 sm:w-32 sm:text-6xl ${
                  i < colocadas ? 'anim-festa bg-folha text-white shadow-lg' : 'border-4 border-dashed border-broto text-broto'
                }`}
              >
                {i < colocadas ? sil.texto : '?'}
              </span>
            ))}
          </div>

          {completa && <p className="anim-festa mt-4 text-4xl font-black text-folha-escura">{palavra.palavra.toUpperCase()}</p>}

          {/* Pedacinhos para tocar */}
          <div className="mt-8 flex flex-wrap justify-center gap-5">
            {pecas.map((p) =>
              p.ordem < colocadas ? (
                <span key={p.ordem} className="h-24 w-28 sm:h-28 sm:w-32" aria-hidden="true" />
              ) : (
                <button
                  key={p.ordem}
                  onClick={() => tocar(p)}
                  aria-label={`Sílaba ${p.texto}`}
                  className={`flex h-24 w-28 items-center justify-center rounded-3xl border-b-8 border-black/15 bg-sol text-5xl font-black text-white shadow-lg active:translate-y-1 active:border-b-4 sm:h-28 sm:w-32 sm:text-6xl ${
                    tremendo === p.ordem ? 'anim-tremer' : ''
                  }`}
                >
                  {p.texto}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </main>
  );
}
