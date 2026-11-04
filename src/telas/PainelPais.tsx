import { useState, type FormEvent } from 'react';
import { BICHINHOS, OPCOES_MINUTOS, type Perfil } from '../tipos.ts';

type Props = {
  perfis: Perfil[];
  perfilAtivoId: string | null;
  aoCriar: (p: Omit<Perfil, 'id' | 'estrelas'>) => void;
  aoMudarMinutos: (id: string, minutos: number) => void;
  aoRemover: (id: string) => void;
  aoComecar: (id: string) => void;
  aoApagarTudo: () => void;
};

export function PainelPais({ perfis, perfilAtivoId, aoCriar, aoMudarMinutos, aoRemover, aoComecar, aoApagarTudo }: Props) {
  const [mostrarForm, setMostrarForm] = useState(perfis.length === 0);

  return (
    <main className="min-h-full bg-slate-100 font-sans text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-5 py-4">
          <span className="text-2xl" aria-hidden="true">🌱</span>
          <div>
            <p className="text-lg font-bold leading-tight">Sementinha</p>
            <p className="text-sm text-slate-500">Área dos pais</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        {perfis.length > 0 && (
          <section>
            <h2 className="text-xl font-bold">Quem vai brincar agora?</h2>
            <p className="mt-1 text-sm text-slate-500">Você escolhe. A criança não troca de perfil sozinha.</p>
            <ul className="mt-3 space-y-3">
              {perfis.map((p) => (
                <CartaoPerfil
                  key={p.id}
                  perfil={p}
                  ativo={p.id === perfilAtivoId}
                  aoComecar={() => aoComecar(p.id)}
                  aoMudarMinutos={(m) => aoMudarMinutos(p.id, m)}
                  aoRemover={() => aoRemover(p.id)}
                />
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          {mostrarForm ? (
            <FormPerfil
              primeiro={perfis.length === 0}
              aoSalvar={(p) => {
                aoCriar(p);
                setMostrarForm(false);
              }}
              aoCancelar={perfis.length ? () => setMostrarForm(false) : undefined}
            />
          ) : (
            <button onClick={() => setMostrarForm(true)} className="w-full rounded-xl py-2 text-base font-semibold text-folha-escura">
              + Adicionar criança
            </button>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 text-sm leading-relaxed ring-1 ring-slate-200">
          <h2 className="text-base font-bold">🔐 Tranque o aparelho na salinha</h2>
          <p className="mt-1 text-slate-600">
            O Sementinha esconde os botões de sair, mas só o próprio aparelho bloqueia o botão "início". Ligue uma vez:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            <li>
              <b>Android:</b> Configurações → Segurança → <i>Fixar app</i> (ou <i>Fixação de tela</i>). Depois, nos apps recentes, toque no ícone do Sementinha → <i>Fixar</i>.
            </li>
            <li>
              <b>iPhone/iPad:</b> Ajustes → Acessibilidade → <i>Acesso Guiado</i>. Depois, aperte 3 vezes o botão lateral com o Sementinha aberto.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 text-sm leading-relaxed ring-1 ring-slate-200">
          <h2 className="text-base font-bold">🛡️ Privacidade</h2>
          <p className="mt-1 text-slate-600">
            Sem propaganda, sem chat e sem rastreador. Da criança, só guardamos apelido, bichinho e estrelinhas. Por enquanto tudo fica
            <b> só neste aparelho</b>.
          </p>
          <button
            onClick={() => {
              if (confirm('Apagar todos os perfis e o progresso deste aparelho? Não dá para desfazer.')) aoApagarTudo();
            }}
            className="mt-3 rounded-lg px-3 py-2 font-semibold text-red-700 ring-1 ring-red-200 active:bg-red-50"
          >
            Apagar tudo
          </button>
        </section>
      </div>
    </main>
  );
}

function CartaoPerfil({
  perfil,
  ativo,
  aoComecar,
  aoMudarMinutos,
  aoRemover,
}: {
  perfil: Perfil;
  ativo: boolean;
  aoComecar: () => void;
  aoMudarMinutos: (m: number) => void;
  aoRemover: () => void;
}) {
  return (
    <li className={`rounded-2xl bg-white p-4 ring-1 ${ativo ? 'ring-2 ring-folha' : 'ring-slate-200'}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-grama text-3xl" aria-hidden="true">
          {perfil.bichinho}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{perfil.apelido}</p>
          <p className="text-sm text-slate-500">⭐ {perfil.estrelas} estrelinhas{ativo ? ' · brincando agora' : ''}</p>
        </div>
        <button onClick={aoComecar} className="rounded-xl bg-folha px-5 py-3 text-base font-bold text-white active:bg-folha-escura">
          {ativo ? 'Voltar' : 'Começar'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          Tempo por dia
          <select
            value={perfil.minutosPorDia}
            onChange={(e) => aoMudarMinutos(Number(e.target.value))}
            className="rounded-lg bg-slate-50 px-2 py-1 ring-1 ring-slate-200"
          >
            {OPCOES_MINUTOS.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            if (confirm(`Remover o perfil de ${perfil.apelido}? O progresso será apagado.`)) aoRemover();
          }}
          className="rounded-lg px-2 py-1 text-slate-500 active:bg-slate-100"
        >
          Remover
        </button>
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
