import { useEffect, useState } from 'react';
import { VAZIO, apagarTudo, lerDados, novoId, salvarDados } from './dados/armazenamento.ts';
import { apagarArquivo, apagarTodosArquivos } from './dados/arquivos.ts';
import type { AtividadeId, Dados, Perfil, ProgressoItem } from './tipos.ts';
import { Salinha } from './telas/Salinha.tsx';
import { PortaDosPais } from './telas/PortaDosPais.tsx';
import { PainelPais, type AcoesPais } from './telas/pais/PainelPais.tsx';
import { entrarTelaCheia, sairTelaCheia } from './util/travar.ts';
import { chaveDia } from './util/dia.ts';
import { falar } from './util/voz.ts';

type Tela = 'salinha' | 'porta' | 'pais';

// Ao abrir: criança escolhida → salinha. Sem perfil nenhum → pais (primeiro uso). Senão → continha.
function telaInicial(d: Dados): Tela {
  if (d.perfilAtivoId && d.perfis.some((p) => p.id === d.perfilAtivoId)) return 'salinha';
  return d.perfis.length === 0 ? 'pais' : 'porta';
}

/** Tira um perfil de todos os registros "por perfil". */
function semPerfil<T>(registro: Record<string, T>, id: string) {
  const { [id]: _removido, ...resto } = registro;
  return resto;
}

const SEM_PROGRESSO: Record<string, ProgressoItem> = {};

export default function App() {
  const [dados, setDados] = useState<Dados>(lerDados);
  const [tela, setTela] = useState<Tela>(() => telaInicial(dados));
  const [hoje, setHoje] = useState(chaveDia);

  useEffect(() => salvarDados(dados), [dados]);

  // Virou o dia com o app aberto: o limite recomeça.
  useEffect(() => {
    const relogio = window.setInterval(() => setHoje(chaveDia()), 60_000);
    return () => window.clearInterval(relogio);
  }, []);

  const ativo = dados.perfis.find((p) => p.id === dados.perfilAtivoId) ?? null;

  function mudarPerfil(id: string, mudanca: (p: Perfil) => Partial<Perfil>) {
    setDados((d) => ({ ...d, perfis: d.perfis.map((p) => (p.id === id ? { ...p, ...mudanca(p) } : p)) }));
  }

  // Guarda acertos e erros de cada item. "Seguidos" só conta acerto de primeira; um erro zera.
  function registrarResposta(perfilId: string, chave: string, certoDePrimeira: boolean, errou: boolean) {
    setDados((d) => {
      const doPerfil = d.progresso[perfilId] ?? {};
      const atual = doPerfil[chave] ?? { acertos: 0, erros: 0, seguidos: 0 };
      const novo: ProgressoItem = errou
        ? { ...atual, erros: atual.erros + 1, seguidos: 0 }
        : { ...atual, acertos: atual.acertos + 1, seguidos: certoDePrimeira ? atual.seguidos + 1 : 0 };
      return { ...d, progresso: { ...d.progresso, [perfilId]: { ...doPerfil, [chave]: novo } } };
    });
  }

  function contarTempo(perfilId: string, atividade: AtividadeId | null, segundos: number) {
    const dia = chaveDia();
    setDados((d) => {
      const doPerfil = d.uso[perfilId] ?? {};
      const atual = doPerfil[dia] ?? { total: 0 };
      const novo = { ...atual, total: atual.total + segundos };
      if (atividade) novo[atividade] = (atual[atividade] ?? 0) + segundos;
      return { ...d, uso: { ...d.uso, [perfilId]: { ...doPerfil, [dia]: novo } } };
    });
  }

  const acoes: AcoesPais = {
    criarPerfil: (p) => setDados((d) => ({ ...d, perfis: [...d.perfis, { ...p, id: novoId(), estrelas: 0 }] })),
    mudarMinutos: (id, minutosPorDia) => mudarPerfil(id, () => ({ minutosPorDia })),
    removerPerfil: (id) =>
      setDados((d) => ({
        ...d,
        perfis: d.perfis.filter((p) => p.id !== id),
        perfilAtivoId: d.perfilAtivoId === id ? null : d.perfilAtivoId,
        progresso: semPerfil(d.progresso, id),
        uso: semPerfil(d.uso, id),
        extras: semPerfil(d.extras, id),
        vistos: semPerfil(d.vistos, id),
      })),
    comecar: (id) => {
      const perfil = dados.perfis.find((p) => p.id === id);
      setDados((d) => ({ ...d, perfilAtivoId: id }));
      entrarTelaCheia();
      if (perfil) falar(`Oi, ${perfil.apelido}! Vamos aprender brincando?`);
      setTela('salinha');
    },
    darMinutos: (id, minutos) =>
      setDados((d) => {
        const doPerfil = d.extras[id] ?? {};
        return { ...d, extras: { ...d.extras, [id]: { ...doPerfil, [hoje]: (doPerfil[hoje] ?? 0) + minutos } } };
      }),
    adicionarVideo: (v) => setDados((d) => ({ ...d, videos: [...d.videos, v] })),
    alternarVideo: (id) => setDados((d) => ({ ...d, videos: d.videos.map((v) => (v.id === id ? { ...v, ativo: !v.ativo } : v)) })),
    removerVideo: (id) => {
      apagarArquivo(id).catch(() => {});
      setDados((d) => ({ ...d, videos: d.videos.filter((v) => v.id !== id) }));
    },
    alternarAtividade: (id) =>
      setDados((d) => ({
        ...d,
        desligados: d.desligados.includes(id) ? d.desligados.filter((x) => x !== id) : [...d.desligados, id],
      })),
    apagarTudo: () => {
      apagarTudo();
      apagarTodosArquivos().catch(() => {});
      setDados(VAZIO);
    },
  };

  if (tela === 'salinha' && ativo) {
    const usado = dados.uso[ativo.id]?.[hoje]?.total ?? 0;
    const extra = dados.extras[ativo.id]?.[hoje] ?? 0;
    return (
      <Salinha
        perfil={ativo}
        progresso={dados.progresso[ativo.id] ?? SEM_PROGRESSO}
        videos={dados.videos.filter((v) => v.ativo)}
        desligados={dados.desligados}
        segundosRestantes={(ativo.minutosPorDia + extra) * 60 - usado}
        aoResponder={(chave, certoDePrimeira, errou) => registrarResposta(ativo.id, chave, certoDePrimeira, errou)}
        aoGanharEstrela={() => mudarPerfil(ativo.id, (p) => ({ estrelas: p.estrelas + 1 }))}
        aoAssistir={(videoId) =>
          setDados((d) => {
            const doPerfil = d.vistos[ativo.id] ?? {};
            return { ...d, vistos: { ...d.vistos, [ativo.id]: { ...doPerfil, [videoId]: (doPerfil[videoId] ?? 0) + 1 } } };
          })
        }
        aoContarTempo={(atividade, segundos) => contarTempo(ativo.id, atividade, segundos)}
        aoChamarPais={() => setTela('porta')}
      />
    );
  }

  if (tela === 'porta') {
    return (
      <PortaDosPais
        aoLiberar={() => {
          sairTelaCheia();
          setTela('pais');
        }}
        aoCancelar={ativo ? () => setTela('salinha') : undefined}
      />
    );
  }

  return <PainelPais dados={dados} acoes={acoes} />;
}
