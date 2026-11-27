/**
 * Ilustração vetorial de reserva, usada só quando a peça ainda não tem foto.
 */
// Ilustração vetorial da peça (placeholder premium até termos fotos reais)
type Props = { category: string; fabric: string; color: string; label: string; className?: string };

function isDark(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 < 120;
}

function Crest({ x, y, color, label, size = 30 }: { x: number; y: number; color: string; label: string; size?: number }) {
  const fs = label.length > 5 ? size * 0.72 : size;
  return (
    <g>
      <text x={x} y={y} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={fs} fill={color} letterSpacing={1}
        style={{ paintOrder: "stroke" }} stroke="rgba(0,0,0,.18)" strokeWidth={0.6}>
        {label}
      </text>
      <g fill={color} transform={`translate(${x} ${y + 16})`}>
        <path d="M-4 0 L0 -4 L4 0 L0 4Z" />
        <path d="M-10 0 q-8 -6 -18 -2 q8 6 18 2z" opacity=".9" />
        <path d="M10 0 q8 -6 18 -2 q-8 6 -18 2z" opacity=".9" />
      </g>
    </g>
  );
}

export function Garment({ category, fabric, color, label, className }: Props) {
  const shade = isDark(fabric) ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)";
  const stroke = isDark(fabric) ? "rgba(0,0,0,.35)" : "rgba(0,0,0,.12)";
  const ink = color === fabric ? (isDark(fabric) ? "#f3ead8" : "#1c2a4f") : color;

  return (
    <svg viewBox="0 0 300 300" className={className} role="img" aria-label={`${category} ${label}`}>
      <defs>
        <radialGradient id="floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,.14)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="272" rx="105" ry="10" fill="url(#floor)" />

      {category === "Boné" ? (
        <g>
          <path d="M70 175 Q70 95 150 92 Q230 95 230 175Z" fill={fabric} stroke={stroke} />
          <path d="M150 92 L150 175" stroke={stroke} />
          <path d="M60 178 Q150 160 245 178 Q262 200 210 206 Q150 196 90 206 Q45 200 60 178Z" fill={fabric} stroke={stroke} />
          <circle cx="150" cy="94" r="5" fill={fabric} stroke={stroke} />
          <Crest x={150} y={148} color={ink} label={label} size={22} />
        </g>
      ) : (
        <g>
          {/* corpo */}
          <path
            d={
              category === "Camiseta"
                ? "M95 60 L125 50 Q150 66 175 50 L205 60 L250 92 L232 128 L208 116 L208 258 L92 258 L92 116 L68 128 L50 92Z"
                : "M95 58 L122 48 Q150 64 178 48 L205 58 L240 80 L262 230 L232 236 L212 128 L212 258 L88 258 L88 128 L68 236 L38 230 L60 80Z"
            }
            fill={fabric}
            stroke={stroke}
            strokeWidth={1.2}
          />
          <path d="M100 70 L100 250" stroke={shade} strokeWidth={14} />
          {/* punhos / barra */}
          {category !== "Camiseta" && (
            <>
              <path d="M88 244 L212 244 L212 258 L88 258Z" fill={shade} />
              <path d="M38 230 L68 236 L66 222 L40 216Z" fill={shade} />
              <path d="M262 230 L232 236 L234 222 L260 216Z" fill={shade} />
            </>
          )}
          {/* gola */}
          {category === "Polo" ? (
            <>
              <path d="M122 48 L150 86 L178 48 L190 58 L160 100 L150 92 L140 100 L110 58Z" fill="#e9dcc0" stroke={stroke} />
              <path d="M150 92 L150 132" stroke={stroke} />
              <circle cx="150" cy="104" r="3" fill="#e9dcc0" />
              <circle cx="150" cy="120" r="3" fill="#e9dcc0" />
            </>
          ) : category === "Jaqueta" ? (
            <>
              <path d="M150 64 L150 258" stroke={stroke} strokeWidth={1.5} />
              {[90, 125, 160, 195, 230].map((y) => <circle key={y} cx="150" cy={y} r="3" fill="#e9dcc0" />)}
              <path d="M122 48 Q150 70 178 48" fill="none" stroke="#e9dcc0" strokeWidth={6} />
            </>
          ) : (
            <path d="M122 48 Q150 72 178 48" fill="none" stroke={shade} strokeWidth={7} />
          )}
          {category === "Moletom" && <path d="M118 210 L182 210 L190 244 L110 244Z" fill="none" stroke={shade} strokeWidth={2} />}
          <Crest x={category === "Jaqueta" ? 118 : 150} y={category === "Jaqueta" ? 118 : 150} color={ink} label={label} size={category === "Jaqueta" ? 18 : 30} />
        </g>
      )}
    </svg>
  );
}
