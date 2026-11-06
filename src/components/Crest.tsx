/**
 * The site's centrepiece: a thin double ring with two laurel branches and a
 * serif monogram. Drawn procedurally so it stays crisp at any size and needs
 * no image file.
 */
const CX = 200;
const CY = 200;

function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
}

function arcPath(r: number, a0: number, a1: number) {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** One laurel branch along the arc from a0 to a1 (degrees, SVG clockwise). */
function Branch({ a0, a1, leaves = 9, r = 146, flip = false }: { a0: number; a1: number; leaves?: number; r?: number; flip?: boolean }) {
  const items = [];
  for (let i = 0; i < leaves; i++) {
    const t = i / (leaves - 1);
    const a = a0 + (a1 - a0) * t;
    const [x, y] = polar(r, a);
    // leaves shrink toward the tip of the branch
    const len = 26 - 10 * t;
    const wid = 7 - 2.5 * t;
    const tangent = a + (flip ? -90 : 90);
    for (const side of [-1, 1]) {
      const rot = tangent + side * 38 * (flip ? -1 : 1);
      items.push(<path key={`${i}-${side}`} d={`M0 0 Q${len / 2} ${-wid} ${len} 0 Q${len / 2} ${wid} 0 0Z`} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)})`} />);
    }
  }
  return (
    <g>
      <path d={arcPath(r, a0, a1)} fill="none" stroke="currentColor" stroke-width="1" />
      <g fill="currentColor" stroke="none">{items}</g>
    </g>
  );
}

export function Crest({ size = 360, letter = 'T' }: { size?: number; letter?: string }) {
  return (
    <svg class="crest" width={size} height={size} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <circle cx={CX} cy={CY} r="192" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55" />
      <circle cx={CX} cy={CY} r="180" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.35" />
      {/* left branch runs from the bottom up the left side; right branch mirrors it */}
      <g opacity="0.9">
        <Branch a0={96} a1={200} />
        <Branch a0={84} a1={-20} flip />
      </g>
      <text x={CX} y={CY + 42} text-anchor="middle" font-family="var(--serif)" font-size="150" font-weight="500" fill="currentColor">
        {letter}
      </text>
    </svg>
  );
}
