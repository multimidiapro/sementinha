import { useEffect, useState } from 'react';
import { apagarTudo, lerDados, novoId, salvarDados } from './dados/armazenamento.ts';
import type { Dados, Perfil } from './tipos.ts';
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

export default function App() {
  const [dados, setDados] = useState<Dados>(lerDados);
  const [tela, setTela] = useState<Tela>(() => telaInicial(dados));

  useEffect(() => salvarDados(dados), [dados]);

  const ativo = dados.perfis.find((p) => p.id === dados.perfilAtivoId) ?? null;

  function mudarPerfil(id: string, mudanca: Partial<Perfil>) {
    setDados((d) => ({ ...d, perfis: d.perfis.map((p) => (p.id === id ? { ...p, ...mudanca } : p)) }));
  }

  if (tela === 'salinha' && ativo) {
    return <Salinha perfil={ativo} aoChamarPais={() => setTela('porta')} />;
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
      aoMudarMinutos={(id, minutosPorDia) => mudarPerfil(id, { minutosPorDia })}
      aoRemover={(id) =>
        setDados((d) => ({
          perfis: d.perfis.filter((p) => p.id !== id),
          perfilAtivoId: d.perfilAtivoId === id ? null : d.perfilAtivoId,
        }))
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
        setDados({ perfis: [], perfilAtivoId: null });
      }}
    />
  );
}
