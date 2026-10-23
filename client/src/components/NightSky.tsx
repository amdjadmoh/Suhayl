import { useMemo } from "react";
import { cn } from "@/lib/utils";

/** Small deterministic PRNG so the sky looks the same on every render. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A night sky over a desert horizon, with Suhayl (Canopus) low in the south.
 * Drawn in SVG so it scales cleanly and stays sharp.
 */
export function NightSky({
  className,
  seed = 7,
  starCount = 140,
}: {
  className?: string;
  seed?: number;
  starCount?: number;
}): React.ReactElement {
  const stars = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: starCount }, () => {
      const x = rand() * 1000;
      // More stars higher up, thinning towards the horizon
      const y = Math.pow(rand(), 1.4) * 560;
      const r = rand() < 0.08 ? 1.6 : rand() < 0.35 ? 1.05 : 0.6;
      const o = 0.25 + rand() * 0.6;
      return { x, y, r, o };
    });
  }, [seed, starCount]);

  return (
    <svg
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMax slice"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1230" />
          <stop offset="0.7" stopColor="#13224f" />
          <stop offset="1" stopColor="#223a7a" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4e3b2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4e3b2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="800" fill="url(#sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e9e4d6" opacity={s.o} />
      ))}

      {/* Suhayl, low over the dunes */}
      <g transform="translate(640 560)">
        <circle r="46" fill="url(#glow)" />
        <path
          d="M0 -26C1.6 -6 6 -1.6 26 0 6 1.6 1.6 6 0 26 -1.6 6 -6 1.6 -26 0 -6 -1.6 -1.6 -6 0 -26Z"
          fill="#f4e3b2"
        />
      </g>

      {/* Dunes */}
      <path d="M0 640 C 160 600, 300 606, 430 628 S 720 672, 1000 618 L1000 800 L0 800 Z" fill="#0d1838" />
      <path d="M0 690 C 200 660, 380 680, 560 700 S 860 706, 1000 684 L1000 800 L0 800 Z" fill="#081029" />
    </svg>
  );
}
