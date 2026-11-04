import type { ReactNode } from 'react';

// Peças simples da área dos pais (visual sóbrio, separado da salinha).

export function Cartao({ titulo, children, className = '' }: { titulo?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 ring-1 ring-slate-200 ${className}`}>
      {titulo && <h2 className="mb-3 text-lg font-bold">{titulo}</h2>}
      {children}
    </section>
  );
}

export function Interruptor({ ligado, aoMudar, rotulo }: { ligado: boolean; aoMudar: () => void; rotulo: string }) {
  return (
    <button
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={aoMudar}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${ligado ? 'bg-folha' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${ligado ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

export function Pilulas<T extends string>({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: { valor: T; rotulo: ReactNode }[];
  valor: T;
  aoMudar: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          type="button"
          key={o.valor}
          aria-pressed={o.valor === valor}
          onClick={() => aoMudar(o.valor)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
            o.valor === valor ? 'bg-grama text-folha-escura ring-folha' : 'bg-slate-50 text-slate-600 ring-slate-200'
          }`}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

export function confirmar(texto: string) {
  return window.confirm(texto);
}
