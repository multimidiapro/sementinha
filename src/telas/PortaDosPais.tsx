import { useState } from 'react';

// A "continha": criança de 4 ou 5 anos não resolve uma soma com resultado entre 9 e 18.
function novaConta() {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 3 + Math.floor(Math.random() * 7);
  return { a, b, resultado: a + b };
}

type Props = { aoLiberar: () => void; aoCancelar?: () => void };

export function PortaDosPais({ aoLiberar, aoCancelar }: Props) {
  const [conta, setConta] = useState(novaConta);
  const [resposta, setResposta] = useState('');
  const [errou, setErrou] = useState(false);

  function digitar(n: string) {
    setErrou(false);
    setResposta((r) => (r.length < 2 ? r + n : r));
  }

  function confirmar() {
    if (Number(resposta) === conta.resultado) return aoLiberar();
    setErrou(true);
    setResposta('');
    setConta(novaConta());
  }

  return (
    <main className="sem-selecao flex min-h-full items-center justify-center bg-slate-100 p-5 font-sans text-slate-800">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Área dos pais</p>
        <h1 className="mt-1 text-2xl font-bold">
          Quanto é {conta.a} + {conta.b}?
        </h1>

        <div
          className={`mt-4 flex h-14 items-center justify-center rounded-xl text-3xl font-bold ring-1 ${
            errou ? 'bg-red-50 ring-red-300' : 'bg-slate-50 ring-slate-200'
          }`}
          aria-live="polite"
        >
          {resposta || <span className="text-base font-normal text-slate-400">{errou ? 'Não foi dessa vez. Tente outra.' : 'Digite a resposta'}</span>}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button key={n} onClick={() => digitar(n)} className="h-14 rounded-xl bg-slate-100 text-2xl font-semibold active:bg-slate-200">
              {n}
            </button>
          ))}
          <button onClick={() => setResposta('')} className="h-14 rounded-xl bg-slate-100 text-base font-semibold active:bg-slate-200">
            Apagar
          </button>
          <button onClick={() => digitar('0')} className="h-14 rounded-xl bg-slate-100 text-2xl font-semibold active:bg-slate-200">
            0
          </button>
          <button
            onClick={confirmar}
            disabled={!resposta}
            className="h-14 rounded-xl bg-slate-800 text-base font-semibold text-white disabled:opacity-40"
          >
            Entrar
          </button>
        </div>

        {aoCancelar && (
          <button onClick={aoCancelar} className="mt-4 w-full rounded-xl py-3 text-base font-semibold text-slate-600 active:bg-slate-100">
            Voltar para a salinha
          </button>
        )}
      </div>
    </main>
  );
}
