// Interpreta as descrições de cor do 777 (cols. XV–XVIII) em algo desenhável.
// "White flecked gold"  -> { tipo: 'salpicado', cores: [branco, ouro] }
// "Black rayed yellow"  -> { tipo: 'raiado',    cores: [preto, amarelo] }
// "Citrine, olive, russet, and black" -> { tipo: 'quartos', cores: [4 cores] }

const PALETA = {
  'white brilliance': '#ffffff', 'brilliance': '#fffdf5', 'white': '#f4f1ea', 'grey': '#8a8a8a', 'gray': '#8a8a8a',
  'black': '#0b0b0b', 'pure soft blue': '#8fb8e8', 'sky blue': '#87ceeb', 'sky-blue': '#87ceeb',
  'blue pearl grey': '#a7b4c2', 'cold pale blue': '#b7d3e8', 'deep azure': '#1e4fa0', 'azure': '#3a7bd5',
  'bright blue': '#1e90ff', 'dark vivid blue': '#1036a0', 'deep blue-green': '#0e5e5e', 'deep blue': '#1f3c88',
  'green blue': '#148f8f', 'blue emerald green': '#0f8b74', 'blue black': '#0e1a2b', 'blueish mauve': '#8f7fb8',
  'blue': '#2f6fd6', 'scarlet red': '#d21f2c', 'bright scarlet': '#ff2a2a', 'glowing orange scarlet': '#ff4500',
  'scarlet': '#e0242b', 'venetian red': '#c80815', 'bright red': '#ff1f1f', 'glowing red': '#ff3030',
  'red-russet': '#8b3a1e', 'red orange': '#f0502a', 'reddish grey': '#8e6b6b', 'reddish amber': '#d2691e',
  'red': '#c81e1e', 'yellow (gold)': '#e8b923', 'gold yellow': '#e8b923', 'gold amber': '#d99a1e', 'gold': '#d4af37',
  'bright pale yellow': '#fff3a0', 'pale yellow': '#fff59a', 'yellow, greenish': '#c5d82a',
  'bright yellow green': '#9acd32', 'yellow-brown': '#a8842c', 'yellow': '#f5d300',
  'green, yellowish': '#9acd32', 'early spring green': '#a8d86e', 'emerald green': '#1f9d55', 'emerald': '#1f9d55',
  'pale green': '#a6d8a0', 'green grey': '#7b8c74', 'sea-green': '#2e8b57', 'deep olive-green': '#4b5320',
  'deep warm olive': '#5c5a1f', 'olive': '#6b7a2a', 'green': '#2e8b3e', 'citrine': '#c9b03a',
  'russet': '#80461b', 'rich bright russet': '#a0522d', 'rich salmon': '#f08a73', 'clear pink rose': '#f4a7b9',
  'bright rose of cerise': '#de3163', 'crimson (ultra violet)': '#9b1b5a', 'crimson': '#b0102c',
  'maroon': '#6b1023', 'vermillion': '#e34234', 'orange': '#f08a24', 'rich amber': '#e09a00', 'amber': '#ffbf00',
  'deep violet': '#5b2a86', 'violet purple': '#7f3fbf', 'violet': '#8a2be2', 'very dark purple': '#2e0f3a',
  'deep purple': '#4b1d6b', 'rich purple': '#6a1b9a', 'purple': '#6a2c91', 'pale mauve': '#c8a2c8',
  'deep indigo': '#2b2a6e', 'livid indigo brown': '#3a2f4a', 'indigo': '#3f3f9f', 'plum colour': '#7d3c5b',
  'silver': '#c0c0c0', 'slate grey': '#5f6a72', 'cold dark grey': '#2a2c2e', 'stone colour': '#8b8378',
  'dull brown': '#6b5640', 'very dark brown': '#2b1d14', 'dark brown': '#4a3222', 'dark greenish brown': '#3d3a1e',
  'rich brown': '#6f4423', 'light translucent pinkish brown': '#c99a86', 'new yellow leather': '#c9a45c',
  'buff': '#d9b98c',
};
const CHAVES = Object.keys(PALETA).sort((a, b) => b.length - a.length);   // a mais específica primeiro

export function hex(frase) {
  const f = (frase || '').toLowerCase();
  const k = CHAVES.find((c) => f.includes(c));
  return k ? PALETA[k] : '#777';
}

export function interpretar(texto, rainha) {
  const t = (texto || '').toLowerCase().replace(/\(quartered\)/, '').trim();
  if (t.startsWith('as queen')) {                     // Malkuth, escala do Imperador
    const base = interpretar(rainha);
    return { ...base, salpico: hex('gold') };
  }
  const m = t.match(/^(.*?)[,\s]*\b(flecked|rayed|tinged)\b\s*(?:with\s+)?(.*)$/);
  if (m) {
    const [, base, tipo, resto] = m;
    const extra = resto.split(/,|&|\band\b|\bor\b/).map((s) => s.trim()).filter(Boolean).map(hex);
    if (tipo === 'tinged') return { tipo: 'liso', cores: [mistura(hex(base), extra[0])] };
    return { tipo: tipo === 'flecked' ? 'salpicado' : 'raiado', cores: [hex(base), ...extra] };
  }
  const lista = t.split(/,\s*(?:and\s+)?|\s+and\s+/).map((s) => s.trim()).filter(Boolean);
  if (lista.length >= 4) return { tipo: 'quartos', cores: lista.slice(0, 4).map(hex) };
  return { tipo: 'liso', cores: [hex(t)] };
}

function mistura(a, b = '#ffffff') {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v * 0.7 + y[i] * 0.3).toString(16).padStart(2, '0')).join('')}`;
}

// <defs> com um padrão por Sefirá: salpicos (pontos) ou raios (sol), e quartos para Malkuth
export function preenchimento(id, cor) {
  const [a, b = '#fff', c, d] = cor.cores;
  if (cor.tipo === 'salpicado' || cor.salpico) {
    const fleck = cor.salpico || b;
    const pts = [[3, 4], [11, 2], [7, 9], [14, 12], [2, 13], [10, 15], [16, 6]];
    return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill="${a}"/>${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${fleck}"/>`).join('')}
    </pattern>`;
  }
  if (cor.tipo === 'raiado') {
    const raios = Array.from({ length: 12 }, (_, i) => {
      const ang = (i * Math.PI) / 6;
      return `<line x1=".5" y1=".5" x2="${0.5 + Math.cos(ang) * 0.5}" y2="${0.5 + Math.sin(ang) * 0.5}"
        stroke="${b}" stroke-width=".05"/>`;
    }).join('');
    return `<pattern id="${id}" width="1" height="1" patternContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="${a}"/>${raios}</pattern>`;
  }
  if (cor.tipo === 'quartos') {   // citrino em cima, oliva à direita, castanho à esquerda, preto embaixo
    return `<pattern id="${id}" width="1" height="1" patternContentUnits="objectBoundingBox">
      <polygon points="0,0 1,0 .5,.5" fill="${a}"/><polygon points="1,0 1,1 .5,.5" fill="${b}"/>
      <polygon points="0,0 0,1 .5,.5" fill="${c}"/><polygon points="0,1 1,1 .5,.5" fill="${d}"/></pattern>`;
  }
  return `<pattern id="${id}" width="1" height="1" patternContentUnits="objectBoundingBox">
    <rect width="1" height="1" fill="${a}"/></pattern>`;
}
