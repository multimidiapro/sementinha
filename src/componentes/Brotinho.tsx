// O mascote: um brotinho num vasinho. Cresce uma folha a cada 3 estrelinhas (até 8 folhas).
type Props = { estrelas?: number; tamanho?: number; className?: string };

const POSICOES_FOLHAS = [
  { y: 58, lado: -1 },
  { y: 58, lado: 1 },
  { y: 46, lado: -1 },
  { y: 40, lado: 1 },
  { y: 30, lado: -1 },
  { y: 24, lado: 1 },
  { y: 16, lado: -1 },
  { y: 12, lado: 1 },
];

export function Brotinho({ estrelas = 0, tamanho = 120, className = '' }: Props) {
  const folhas = Math.min(2 + Math.floor(estrelas / 3), POSICOES_FOLHAS.length);
  const topoCaule = Math.min(...POSICOES_FOLHAS.slice(0, folhas).map((f) => f.y)) - 6;

  return (
    <svg
      viewBox="0 0 100 130"
      width={tamanho}
      height={tamanho * 1.3}
      className={className}
      role="img"
      aria-label="Brotinho, o mascote do Sementinha"
    >
      <g className="anim-balancar">
        <path d={`M50 92 C 48 80, 52 70, 50 ${topoCaule}`} stroke="#3b6d11" strokeWidth="5" fill="none" strokeLinecap="round" />
        {POSICOES_FOLHAS.slice(0, folhas).map((f, i) => (
          <path
            key={i}
            d={`M50 ${f.y} q ${f.lado * 14} -14 ${f.lado * 28} -6 q ${f.lado * -10} 14 ${f.lado * -28} 6 z`}
            fill={i % 2 ? '#639922' : '#97c459'}
            stroke="#3b6d11"
            strokeWidth="1.5"
          />
        ))}
        <circle cx="50" cy={topoCaule} r="5" fill="#97c459" stroke="#3b6d11" strokeWidth="1.5" />
      </g>
      {/* Vasinho com carinha */}
      <path d="M22 92 h56 l-7 34 h-42 z" fill="#ba7517" />
      <rect x="18" y="86" width="64" height="12" rx="6" fill="#854f0b" />
      <circle cx="40" cy="108" r="3.5" fill="#412402" />
      <circle cx="60" cy="108" r="3.5" fill="#412402" />
      <circle cx="41.2" cy="106.8" r="1.1" fill="#fff" />
      <circle cx="61.2" cy="106.8" r="1.1" fill="#fff" />
      <path d="M43 115 q 7 6 14 0" stroke="#412402" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="114" r="3.5" fill="#f0997b" opacity="0.7" />
      <circle cx="67" cy="114" r="3.5" fill="#f0997b" opacity="0.7" />
    </svg>
  );
}
