import { useEffect, useState } from 'react';
import { VAZIO, apagarTudo, lerDados, novoId, salvarDados } from './dados/armazenamento.ts';
import type { Dados, Perfil, ProgressoItem } from './tipos.ts';
import { Salinha } from './telas/Salinha.tsx';
import { PortaDosPais } from './telas/PortaDosPais.tsx';
import { PainelPais } from './telas/PainelPais.tsx';
import { entrarTelaCheia, sairTelaCheia } from './util/travar.ts';
import { falar } from './util/voz.ts';

type Tela = 'salinha' | 'porta' | 'pais';

// Ao abrir: criança escolhida → salinha. Sem perfil nenhum → pais (primeiro uso). Senão → continha.
function telaInicial(d: Dados): Tela {
  if (d.perfilAtivoId && d.perfis.some((p) => p.id === d.perfilAtivoId)) return 'salinha';
  return d.perfis.length === 0 ? 'pais' : 'porta';
}

const SEM_PROGRESSO: Record<string, ProgressoItem> = {};

export default function App() {
  const [dados, setDados] = useState<Dados>(lerDados);
  const [tela, setTela] = useState<Tela>(() => telaInicial(dados));

  useEffect(() => salvarDados(dados), [dados]);

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

  if (tela === 'salinha' && ativo) {
    return (
      <Salinha
        perfil={ativo}
        progresso={dados.progresso[ativo.id] ?? SEM_PROGRESSO}
        aoResponder={(chave, certoDePrimeira, errou) => registrarResposta(ativo.id, chave, certoDePrimeira, errou)}
        aoGanharEstrela={() => mudarPerfil(ativo.id, (p) => ({ estrelas: p.estrelas + 1 }))}
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

  return (
    <PainelPais
      perfis={dados.perfis}
      perfilAtivoId={dados.perfilAtivoId}
      aoCriar={(p) => setDados((d) => ({ ...d, perfis: [...d.perfis, { ...p, id: novoId(), estrelas: 0 }] }))}
      aoMudarMinutos={(id, minutosPorDia) => mudarPerfil(id, () => ({ minutosPorDia }))}
      aoRemover={(id) =>
        setDados((d) => {
          const { [id]: _removido, ...progresso } = d.progresso;
          return {
            perfis: d.perfis.filter((p) => p.id !== id),
            perfilAtivoId: d.perfilAtivoId === id ? null : d.perfilAtivoId,
            progresso,
          };
        })
      }
      aoComecar={(id) => {
        const perfil = dados.perfis.find((p) => p.id === id);
        setDados((d) => ({ ...d, perfilAtivoId: id }));
        entrarTelaCheia();
        if (perfil) falar(`Oi, ${perfil.apelido}! Vamos aprender brincando?`);
        setTela('salinha');
      }}
      aoApagarTudo={() => {
        apagarTudo();
        setDados(VAZIO);
      }}
    />
  );
}
