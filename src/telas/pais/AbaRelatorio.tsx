import { useState } from 'react';
import { JOGOS, type ItemJogo, type JogoId } from '../../jogos/conteudo.ts';
import { APRENDIDO_COM, NOMES_ATIVIDADES, type AtividadeId, type Dados, type ProgressoItem } from '../../tipos.ts';
import { formatarMinutos, ultimosDias } from '../../util/dia.ts';
import { Cartao, Pilulas } from './ui.tsx';

type Situacao = 'aprendeu' | 'praticando' | 'praticar' | 'nada';

const SITUACOES: Record<Situacao, { rotulo: string; icone: string; cor: string }> = {
  aprendeu: { rotulo: 'Já aprendeu', icone: '⭐', cor: 'bg-grama ring-folha' },
  praticando: { rotulo: 'Praticando', icone: '👍', cor: 'bg-ceu-claro ring-ceu' },
  praticar: { rotulo: 'Precisa praticar', icone: '🌱', cor: 'bg-amber-50 ring-sol' },
  nada: { rotulo: 'Ainda não viu', icone: '·', cor: 'bg-slate-50 ring-slate-200' },
};

function situacao(p?: ProgressoItem): Situacao {
  if (!p || p.acertos + p.erros === 0) return 'nada';
  if (p.seguidos >= APRENDIDO_COM) return 'aprendeu';
  // Precisa praticar quando erra mais do que a metade das vezes que acerta (ex.: 1 acerto e 1 erro).
  if (p.erros * 2 > p.acertos) return 'praticar';
  return 'praticando';
}

export function AbaRelatorio({ dados }: { dados: Dados }) {
  const [perfilId, setPerfilId] = useState(dados.perfilAtivoId ?? dados.perfis[0]?.id ?? '');
  const perfil = dados.perfis.find((p) => p.id === perfilId) ?? dados.perfis[0];
  if (!perfil) return <p className="text-center text-sm text-slate-500">Crie o perfil de uma criança para ver o relatório.</p>;

  const progresso = dados.progresso[perfil.id] ?? {};
  const uso = dados.uso[perfil.id] ?? {};
  const vistos = dados.vistos[perfil.id] ?? {};

  return (
    <>
      {dados.perfis.length > 1 && (
        <Pilulas
          opcoes={dados.perfis.map((p) => ({ valor: p.id, rotulo: `${p.bichinho} ${p.apelido}` }))}
          valor={perfil.id}
          aoMudar={setPerfilId}
        />
      )}

      <Tempo uso={uso} />

      {(Object.keys(JOGOS) as JogoId[]).map((jogo) => (
        <Jogo key={jogo} jogo={jogo} progresso={progresso} />
      ))}

      <Vistos vistos={vistos} dados={dados} />

      <p className="text-center text-xs text-slate-500">
        O relatório é só para você. Não tem nota nem comparação entre irmãos: cada um no seu ritmo.
      </p>
    </>
  );
}

function Tempo({ uso }: { uso: Dados['uso'][string] }) {
  const dias = ultimosDias(7);
  const totais = dias.map((d) => uso[d.chave]?.total ?? 0);
  const maior = Math.max(60, ...totais);
  const semana = totais.reduce((a, b) => a + b, 0);

  const porAtividade = (Object.keys(NOMES_ATIVIDADES) as AtividadeId[]).map((id) => ({
    id,
    segundos: dias.reduce((soma, d) => soma + (uso[d.chave]?.[id] ?? 0), 0),
  }));
  const naTelaInicial = Math.max(0, semana - porAtividade.reduce((a, b) => a + b.segundos, 0));

  return (
    <Cartao titulo="⏱️ Tempo de tela">
      <p className="text-sm text-slate-600">
        Últimos 7 dias: <b>{formatarMinutos(semana)}</b> · média de {formatarMinutos(semana / 7)} por dia
      </p>
      <div className="mt-4 flex h-32 items-end gap-2" role="img" aria-label="Minutos por dia nos últimos 7 dias">
        {dias.map((d, i) => (
          <div key={d.chave} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[11px] text-slate-500">{Math.round(totais[i] / 60)}</span>
            <div className="w-full rounded-t-md bg-folha" style={{ height: `${Math.max(2, (totais[i] / maior) * 96)}px` }} />
            <span className="text-xs font-semibold text-slate-600">{d.rotulo}</span>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-1 text-sm">
        {porAtividade.map((a) => (
          <li key={a.id} className="flex justify-between">
            <span className="text-slate-600">{NOMES_ATIVIDADES[a.id]}</span>
            <span className="font-semibold">{formatarMinutos(a.segundos)}</span>
          </li>
        ))}
        <li className="flex justify-between">
          <span className="text-slate-600">Na tela inicial</span>
          <span className="font-semibold">{formatarMinutos(naTelaInicial)}</span>
        </li>
      </ul>
    </Cartao>
  );
}

function Jogo({ jogo, progresso }: { jogo: JogoId; progresso: Record<string, ProgressoItem> }) {
  const { titulo, itens } = JOGOS[jogo];
  const linhas = itens.map((item) => ({ item, p: progresso[`${jogo}:${item.id}`], s: situacao(progresso[`${jogo}:${item.id}`]) }));
  const nomeItem = (item: ItemJogo) => (jogo === 'vogais' ? item.id.toUpperCase() : item.palavra);
  const aprendeu = linhas.filter((l) => l.s === 'aprendeu').map((l) => nomeItem(l.item));
  const praticar = linhas.filter((l) => l.s === 'praticar').map((l) => nomeItem(l.item));

  return (
    <Cartao titulo={`🎮 ${titulo}`}>
      {linhas.every((l) => l.s === 'nada') ? (
        <p className="text-sm text-slate-500">Ainda não jogou.</p>
      ) : (
        <p className="text-sm text-slate-600">
          {aprendeu.length > 0 && (
            <>
              Já aprendeu: <b>{aprendeu.join(', ')}</b>.{' '}
            </>
          )}
          {praticar.length > 0 && (
            <>
              Precisa praticar: <b>{praticar.join(', ')}</b>.
            </>
          )}
          {aprendeu.length === 0 && praticar.length === 0 && 'Está praticando. Continue assim!'}
        </p>
      )}

      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {linhas.map(({ item, p, s }) => (
          <li key={item.id} className={`flex items-center gap-2 rounded-xl p-2 ring-1 ${SITUACOES[s].cor}`}>
            {jogo === 'vogais' ? (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-2xl font-black text-folha-escura">
                {item.id.toUpperCase()}
              </span>
            ) : (
              <span className="h-10 w-10 shrink-0 rounded-lg" style={{ background: item.cor }} />
            )}
            <div className="min-w-0 text-xs leading-tight">
              <p className="font-bold">
                {SITUACOES[s].icone} {SITUACOES[s].rotulo}
              </p>
              {p && (
                <p className="text-slate-500">
                  {p.acertos} acerto{p.acertos === 1 ? '' : 's'} · {p.erros} erro{p.erros === 1 ? '' : 's'}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Cartao>
  );
}

function Vistos({ vistos, dados }: { vistos: Record<string, number>; dados: Dados }) {
  const lista = Object.entries(vistos)
    .map(([id, vezes]) => ({ video: dados.videos.find((v) => v.id === id), vezes }))
    .filter((x) => x.video)
    .sort((a, b) => b.vezes - a.vezes)
    .slice(0, 5);

  return (
    <Cartao titulo="📺 Vídeos mais vistos">
      {lista.length === 0 ? (
        <p className="text-sm text-slate-500">Ainda não assistiu nenhum vídeo.</p>
      ) : (
        <ol className="space-y-2 text-sm">
          {lista.map(({ video, vezes }) => (
            <li key={video!.id} className="flex justify-between gap-3">
              <span className="line-clamp-1">{video!.titulo}</span>
              <span className="shrink-0 font-semibold">{vezes}×</span>
            </li>
          ))}
        </ol>
      )}
    </Cartao>
  );
}
