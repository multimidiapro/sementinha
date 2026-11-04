// Motor dos jogos de "toque no certo": vogais, cores, alfabeto e som inicial.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProgressoItem } from '../tipos.ts';
import { falar, parar } from '../util/voz.ts';
import { JOGOS, type ItemJogo, type JogoId } from './conteudo.ts';
import { Cabecalho, FimDaRodada, comemorar, embaralhar, useVivo, type PropsBrincadeira } from './partes.tsx';

const PERGUNTAS_POR_RODADA = 5;
const OPCOES_NA_TELA = 3;

type Fase = 'pergunta' | 'certo' | 'fim';

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

export function Jogo({ jogo, estrelas, progresso, aoResponder, aoGanharEstrela, aoSair }: PropsBrincadeira & { jogo: JogoId }) {
  const { titulo, itens, instrucao } = JOGOS[jogo];
  const progressoRef = useRef(progresso);
  progressoRef.current = progresso;

  const [numero, setNumero] = useState(0);
  const [alvo, setAlvo] = useState(() => sortearAlvo(itens, jogo, progresso));
  const [opcoes, setOpcoes] = useState(() => montarPergunta(itens, alvo));
  const [fase, setFase] = useState<Fase>('pergunta');
  const [errouNessa, setErrouNessa] = useState(false);
  const [tremendo, setTremendo] = useState<string | null>(null);
  const vivo = useVivo();

  function sair() {
    parar();
    aoSair();
  }

  // Ao aparecer cada pergunta, o app fala o pedido (uma vez só, mesmo que a tela redesenhe).
  const pedidoFalado = useRef<ItemJogo | null>(null);
  useEffect(() => {
    if (fase !== 'pergunta' || pedidoFalado.current === alvo) return;
    pedidoFalado.current = alvo;
    falar(alvo.fala);
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
      // Espera o elogio terminar antes da próxima pergunta.
      comemorar(`Isso! ${alvo.reforco}`).then(() => vivo.current && proxima());
    } else {
      if (!errouNessa) aoResponder(`${jogo}:${alvo.id}`, false, true);
      setErrouNessa(true);
      setTremendo(item.id);
      setTimeout(() => setTremendo(null), 450);
      falar(`${item.nome} ${alvo.fala}`, { interromper: true });
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
      <Cabecalho
        aoSair={sair}
        aoRepetir={() => falar(alvo.fala, { interromper: true })}
        instrucao={instrucao}
        total={PERGUNTAS_POR_RODADA}
        feitas={fase === 'fim' ? PERGUNTAS_POR_RODADA : numero + (fase === 'certo' ? 1 : 0)}
      />

      {fase === 'fim' ? (
        <FimDaRodada estrelas={estrelas} aoJogarDeNovo={jogarDeNovo} aoSair={sair} />
      ) : (
        <>
          {alvo.figura && (
            <button
              onClick={() => falar(alvo.fala, { interromper: true })}
              aria-label={alvo.palavra}
              className="anim-aparecer mt-4 flex h-36 w-36 items-center justify-center rounded-[2rem] bg-white text-8xl shadow-lg"
            >
              {alvo.figura}
            </button>
          )}
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
                  aria-label={item.rotulo ?? item.palavra}
                  className={`relative flex aspect-square items-center justify-center rounded-[2rem] border-b-8 border-black/15 shadow-lg transition active:translate-y-1 active:border-b-4 ${
                    tremendo === item.id ? 'anim-tremer' : ''
                  } ${acertou ? 'anim-pular ring-8 ring-sol-claro' : ''} ${apagado ? 'opacity-30' : ''}`}
                  style={{ background: item.cor ?? '#ffffff' }}
                >
                  {item.rotulo && <span className="text-[min(22vw,9rem)] font-black leading-none text-folha-escura">{item.rotulo}</span>}
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
