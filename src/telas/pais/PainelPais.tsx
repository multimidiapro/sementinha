import { useState } from 'react';
import type { AtividadeId, Categoria, Dados, Perfil } from '../../tipos.ts';
import { AbaCriancas } from './AbaCriancas.tsx';
import { AbaVideos } from './AbaVideos.tsx';
import { AbaRelatorio } from './AbaRelatorio.tsx';
import { AbaAjustes } from './AbaAjustes.tsx';

/** Tudo o que os pais podem fazer. Quem guarda os dados é o App. */
export type AcoesPais = {
  criarPerfil: (p: Omit<Perfil, 'id' | 'estrelas'>) => void;
  mudarMinutos: (perfilId: string, minutos: number) => void;
  removerPerfil: (perfilId: string) => void;
  comecar: (perfilId: string) => void;
  darMinutos: (perfilId: string, minutos: number) => void;
  adicionarVideo: (v: { youtubeId: string; titulo: string; categoria: Categoria }) => void;
  alternarVideo: (videoId: string) => void;
  removerVideo: (videoId: string) => void;
  alternarAtividade: (id: AtividadeId) => void;
  apagarTudo: () => void;
};

type Aba = 'criancas' | 'videos' | 'relatorio' | 'ajustes';

const ABAS: { id: Aba; rotulo: string; icone: string }[] = [
  { id: 'criancas', rotulo: 'Crianças', icone: '👧' },
  { id: 'videos', rotulo: 'Vídeos', icone: '📺' },
  { id: 'relatorio', rotulo: 'Relatório', icone: '📊' },
  { id: 'ajustes', rotulo: 'Ajustes', icone: '⚙️' },
];

export function PainelPais({ dados, acoes }: { dados: Dados; acoes: AcoesPais }) {
  const [aba, setAba] = useState<Aba>('criancas');

  return (
    <main className="min-h-full bg-slate-100 font-sans text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-5 pt-4">
          <span className="text-2xl" aria-hidden="true">🌱</span>
          <div>
            <p className="text-lg font-bold leading-tight">Sementinha</p>
            <p className="text-sm text-slate-500">Área dos pais</p>
          </div>
        </div>
        <nav className="mx-auto mt-3 flex max-w-2xl px-3" aria-label="Seções">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              aria-current={aba === a.id ? 'page' : undefined}
              disabled={a.id === 'relatorio' && dados.perfis.length === 0}
              className={`flex-1 border-b-2 px-1 pb-3 pt-1 text-sm font-semibold disabled:opacity-40 ${
                aba === a.id ? 'border-folha text-folha-escura' : 'border-transparent text-slate-500'
              }`}
            >
              <span aria-hidden="true">{a.icone}</span> {a.rotulo}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        {aba === 'criancas' && <AbaCriancas dados={dados} acoes={acoes} />}
        {aba === 'videos' && <AbaVideos videos={dados.videos} acoes={acoes} />}
        {aba === 'relatorio' && <AbaRelatorio dados={dados} />}
        {aba === 'ajustes' && <AbaAjustes desligados={dados.desligados} acoes={acoes} />}
      </div>
    </main>
  );
}
