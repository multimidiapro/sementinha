import { useCallback, useEffect, useRef, useState } from 'react';
import { Brotinho } from '../componentes/Brotinho.tsx';
import type { ProgressoItem } from '../tipos.ts';
import { falar } from '../util/voz.ts';
import { JOGOS, type ItemJogo, type JogoId } from './conteudo.ts';

const PERGUNTAS_POR_RODADA = 5;
const OPCOES_NA_TELA = 3;

type Props = {
  jogo: JogoId;
  estrelas: number;
  progresso: Record<string, ProgressoItem>;
  aoResponder: (chave: string, certoDePrimeira: boolean, errou: boolean) => void;
  aoGanharEstrela: () => void;
  aoSair: () => void;
};

type Fase = 'pergunta' | 'certo' | 'fim';

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Escolhe o próximo item: o que a criança mais erra aparece mais; o que já aprendeu, menos. Nunca repete o anterior.
function sortearAlvo(itens: ItemJogo[], jogo: JogoId, progresso: Record<string, ProgressoItem>, anterior?: string) {
  const candidatos = itens.filter((i) => i.id !== anterior);
  const pesos = candidatos.map((i) => {
    const p = progresso[`${jogo}:${i.id}`];
    return p ? (1 + p.erros * 2) / (1 + p.seguidos) : 2;
  });
  let sorte = Math.random() * pesos.reduce((a, b) => a + b, 0);
  for (let k = 0; k < candidatos.length; k++) {
    sorte -= pesos[k];
    if (sorte <= 0) return candidatos[k];
  }
  return candidatos[candidatos.length - 1];
}

function montarPergunta(itens: ItemJogo[], alvo: ItemJogo) {
  const outros = embaralhar(itens.filter((i) => i.id !== alvo.id)).slice(0, OPCOES_NA_TELA - 1);
  return embaralhar([alvo, ...outros]);
}

export function Jogo({ jogo, estrelas, progresso, aoResponder, aoGanharEstrela, aoSair }: Props) {
  const { titulo, itens } = JOGOS[jogo];
  const progressoRef = useRef(progresso);
  progressoRef.current = progresso;

  const [numero, setNumero] = useState(0);
  const [alvo, setAlvo] = useState(() => sortearAlvo(itens, jogo, progresso));
  const [opcoes, setOpcoes] = useState(() => montarPergunta(itens, alvo));
  const [fase, setFase] = useState<Fase>('pergunta');
  const [errouNessa, setErrouNessa] = useState(false);
  const [tremendo, setTremendo] = useState<string | null>(null);
  const espera = useRef<number | undefined>(undefined);

  // Saiu do jogo no meio da comemoração: cancela a próxima pergunta.
  useEffect(() => () => window.clearTimeout(espera.current), []);

  // Ao aparecer cada pergunta, o app fala o pedido.
  useEffect(() => {
    if (fase === 'pergunta') falar(alvo.fala);
  }, [alvo, fase]);

  const proxima = useCallback(() => {
    if (numero + 1 >= PERGUNTAS_POR_RODADA) {
      setFase('fim');
      aoGanharEstrela();
      falar('Parabéns! Você ganhou uma estrelinha!');
      return;
    }
    const novo = sortearAlvo(itens, jogo, progressoRef.current, alvo.id);
    setNumero((n) => n + 1);
    setAlvo(novo);
    setOpcoes(montarPergunta(itens, novo));
    setErrouNessa(false);
    setFase('pergunta');
  }, [numero, itens, jogo, alvo.id, aoGanharEstrela]);

  function tocar(item: ItemJogo) {
    if (fase !== 'pergunta') return;
    if (item.id === alvo.id) {
      aoResponder(`${jogo}:${alvo.id}`, !errouNessa, false);
      setFase('certo');
      falar(`Isso! ${alvo.reforco}`);
      espera.current = window.setTimeout(proxima, 2200);
    } else {
      if (!errouNessa) aoResponder(`${jogo}:${alvo.id}`, false, true);
      setErrouNessa(true);
      setTremendo(item.id);
      setTimeout(() => setTremendo(null), 450);
      falar(`${item.nome} ${alvo.fala}`);
    }
  }

  function jogarDeNovo() {
    const novo = sortearAlvo(itens, jogo, progressoRef.current);
    setNumero(0);
    setAlvo(novo);
    setOpcoes(montarPergunta(itens, novo));
    setErrouNessa(false);
    setFase('pergunta');
  }

  return (
    <main className="sem-selecao relative flex min-h-full flex-col items-center px-5 pb-8 pt-4">
      <div className="flex w-full max-w-4xl items-center justify-between">
        <button
          onClick={aoSair}
          aria-label="Voltar para a salinha"
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow active:scale-95"
        >
          🏠
        </button>
        <Bolinhas total={PERGUNTAS_POR_RODADA} feitas={fase === 'fim' ? PERGUNTAS_POR_RODADA : numero + (fase === 'certo' ? 1 : 0)} />
        <button
          onClick={() => falar(alvo.fala)}
          aria-label="Ouvir de novo"
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow active:scale-95"
        >
          🔊
        </button>
      </div>

      {fase === 'fim' ? (
        <div className="anim-festa flex flex-1 flex-col items-center justify-center text-center">
          <Brotinho estrelas={estrelas} tamanho={150} />
          <p className="mt-2 text-6xl" aria-hidden="true">⭐</p>
          <h1 className="mt-2 text-4xl font-black text-folha-escura">Parabéns!</h1>
          <p className="mt-1 text-2xl font-bold text-sol-escuro">Você ganhou uma estrelinha!</p>
          <div className="mt-8 flex gap-4">
            <button onClick={jogarDeNovo} className="rounded-3xl border-b-8 border-black/15 bg-folha px-8 py-5 text-2xl font-extrabold text-white active:translate-y-1 active:border-b-4">
              Jogar de novo
            </button>
            <button onClick={aoSair} className="rounded-3xl border-b-8 border-black/15 bg-ceu px-8 py-5 text-2xl font-extrabold text-white active:translate-y-1 active:border-b-4">
              🏠
            </button>
          </div>
          <Confete />
        </div>
      ) : (
        <>
          <h1 className="mt-6 text-center text-4xl font-black text-folha-escura sm:text-5xl">{alvo.pedido}</h1>
          <p className="mt-1 text-lg font-bold text-folha-escura/60">{titulo}</p>

          <div className="mt-8 grid w-full max-w-4xl grid-cols-3 gap-4 sm:gap-6">
            {opcoes.map((item) => {
              const acertou = fase === 'certo' && item.id === alvo.id;
              const apagado = fase === 'certo' && item.id !== alvo.id;
              return (
                <button
                  key={item.id}
                  onClick={() => tocar(item)}
                  aria-label={item.palavra}
                  className={`relative flex aspect-square items-center justify-center rounded-[2rem] border-b-8 border-black/15 shadow-lg transition active:translate-y-1 active:border-b-4 ${
                    tremendo === item.id ? 'anim-tremer' : ''
                  } ${acertou ? 'anim-pular ring-8 ring-sol-claro' : ''} ${apagado ? 'opacity-30' : ''}`}
                  style={{ background: item.cor ?? '#ffffff' }}
                >
                  {jogo === 'vogais' && (
                    <span className="text-[min(22vw,9rem)] font-black leading-none text-folha-escura">{item.id.toUpperCase()}</span>
                  )}
                </button>
              );
            })}
          </div>

          {fase === 'certo' && (
            <div className="anim-festa mt-8 flex items-center gap-4 rounded-3xl bg-white px-8 py-4 shadow-lg">
              <span className="text-6xl" aria-hidden="true">{alvo.emoji}</span>
              <span className="text-4xl font-black text-folha-escura">{alvo.palavra}</span>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function Bolinhas({ total, feitas }: { total: number; feitas: number }) {
  return (
    <div className="flex gap-2" aria-label={`${feitas} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-5 w-5 rounded-full transition ${i < feitas ? 'bg-sol' : 'bg-white ring-2 ring-broto'}`} />
      ))}
    </div>
  );
}

function Confete() {
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
