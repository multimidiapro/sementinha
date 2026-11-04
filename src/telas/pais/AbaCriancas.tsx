import { useState, type FormEvent } from 'react';
import { BICHINHOS, OPCOES_MINUTOS, type Dados, type Perfil } from '../../tipos.ts';
import { chaveDia, formatarMinutos } from '../../util/dia.ts';
import type { AcoesPais } from './PainelPais.tsx';
import { Cartao, confirmar } from './ui.tsx';

export function AbaCriancas({ dados, acoes }: { dados: Dados; acoes: AcoesPais }) {
  const [mostrarForm, setMostrarForm] = useState(dados.perfis.length === 0);
  const hoje = chaveDia();

  return (
    <>
      {dados.perfis.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">Quem vai brincar agora?</h2>
          <p className="mt-1 text-sm text-slate-500">Você escolhe. A criança não troca de perfil sozinha.</p>
          <ul className="mt-3 space-y-3">
            {dados.perfis.map((p) => (
              <CartaoPerfil
                key={p.id}
                perfil={p}
                ativo={p.id === dados.perfilAtivoId}
                usadoHoje={dados.uso[p.id]?.[hoje]?.total ?? 0}
                extraHoje={dados.extras[p.id]?.[hoje] ?? 0}
                acoes={acoes}
              />
            ))}
          </ul>
        </section>
      )}

      <Cartao>
        {mostrarForm ? (
          <FormPerfil
            primeiro={dados.perfis.length === 0}
            aoSalvar={(p) => {
              acoes.criarPerfil(p);
              setMostrarForm(false);
            }}
            aoCancelar={dados.perfis.length ? () => setMostrarForm(false) : undefined}
          />
        ) : (
          <button onClick={() => setMostrarForm(true)} className="w-full rounded-xl py-2 text-base font-semibold text-folha-escura">
            + Adicionar criança
          </button>
        )}
      </Cartao>
    </>
  );
}

function CartaoPerfil({
  perfil,
  ativo,
  usadoHoje,
  extraHoje,
  acoes,
}: {
  perfil: Perfil;
  ativo: boolean;
  usadoHoje: number;
  extraHoje: number;
  acoes: AcoesPais;
}) {
  const limite = (perfil.minutosPorDia + extraHoje) * 60;
  const acabou = usadoHoje >= limite;
  const porcento = Math.min(100, Math.round((usadoHoje / limite) * 100));

  return (
    <li className={`rounded-2xl bg-white p-4 ${ativo ? 'ring-2 ring-folha' : 'ring-1 ring-slate-200'}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-grama text-3xl" aria-hidden="true">
          {perfil.bichinho}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{perfil.apelido}</p>
          <p className="text-sm text-slate-500">⭐ {perfil.estrelas} estrelinhas{ativo ? ' · brincando agora' : ''}</p>
        </div>
        <button onClick={() => acoes.comecar(perfil.id)} className="rounded-xl bg-folha px-5 py-3 text-base font-bold text-white active:bg-folha-escura">
          {ativo ? 'Voltar' : 'Começar'}
        </button>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">
            Hoje: {formatarMinutos(usadoHoje)} de {perfil.minutosPorDia + extraHoje} min
          </span>
          {acabou && <span className="font-semibold text-red-700">Tempo acabou</span>}
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${acabou ? 'bg-red-400' : 'bg-folha'}`} style={{ width: `${porcento}%` }} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          Tempo por dia
          <select
            value={perfil.minutosPorDia}
            onChange={(e) => acoes.mudarMinutos(perfil.id, Number(e.target.value))}
            className="rounded-lg bg-slate-50 px-2 py-1 ring-1 ring-slate-200"
          >
            {OPCOES_MINUTOS.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-1">
          <button onClick={() => acoes.darMinutos(perfil.id, 10)} className="rounded-lg px-2 py-1 font-semibold text-folha-escura ring-1 ring-broto active:bg-grama">
            +10 min hoje
          </button>
          <button
            onClick={() => confirmar(`Remover o perfil de ${perfil.apelido}? O progresso será apagado.`) && acoes.removerPerfil(perfil.id)}
            className="rounded-lg px-2 py-1 text-slate-500 active:bg-slate-100"
          >
            Remover
          </button>
        </div>
      </div>
    </li>
  );
}

function FormPerfil({
  primeiro,
  aoSalvar,
  aoCancelar,
}: {
  primeiro: boolean;
  aoSalvar: (p: Omit<Perfil, 'id' | 'estrelas'>) => void;
  aoCancelar?: () => void;
}) {
  const [apelido, setApelido] = useState('');
  const [bichinho, setBichinho] = useState(BICHINHOS[0]);
  const [minutosPorDia, setMinutos] = useState(30);
  const [erro, setErro] = useState('');

  function salvar(e: FormEvent) {
    e.preventDefault();
    const limpo = apelido.trim();
    if (!limpo) return setErro('Escreva um apelido.');
    aoSalvar({ apelido: limpo, bichinho, minutosPorDia });
  }

  return (
    <form onSubmit={salvar}>
      <h2 className="text-xl font-bold">{primeiro ? 'Bem-vindo! Vamos criar o perfil da criança' : 'Nova criança'}</h2>

      <label className="mt-4 block text-sm font-semibold">
        Apelido
        <input
          value={apelido}
          onChange={(e) => {
            setApelido(e.target.value);
            setErro('');
          }}
          maxLength={20}
          placeholder="Ex.: Juju"
          className="mt-1 block w-full rounded-xl bg-slate-50 px-3 py-3 text-base font-normal ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-folha"
        />
      </label>
      <p className="mt-1 text-xs text-slate-500">Use só um apelido. Não precisa do nome completo.</p>
      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}

      <p className="mt-4 text-sm font-semibold">Bichinho</p>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {BICHINHOS.map((b) => (
          <button
            type="button"
            key={b}
            onClick={() => setBichinho(b)}
            aria-pressed={b === bichinho}
            className={`flex aspect-square items-center justify-center rounded-xl text-3xl ${
              b === bichinho ? 'bg-grama ring-2 ring-folha' : 'bg-slate-50 ring-1 ring-slate-200'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        Tempo de tela por dia
        <select
          value={minutosPorDia}
          onChange={(e) => setMinutos(Number(e.target.value))}
          className="rounded-lg bg-slate-50 px-2 py-1 font-normal ring-1 ring-slate-200"
        >
          {OPCOES_MINUTOS.map((m) => (
            <option key={m} value={m}>
              {m} min
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 flex gap-2">
        <button type="submit" className="flex-1 rounded-xl bg-folha py-3 text-base font-bold text-white active:bg-folha-escura">
          Salvar
        </button>
        {aoCancelar && (
          <button type="button" onClick={aoCancelar} className="rounded-xl px-4 py-3 text-base font-semibold text-slate-600 active:bg-slate-100">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
