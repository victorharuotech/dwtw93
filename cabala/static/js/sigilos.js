// Sigilos traçados nos quadrados mágicos planetários (Kameas).
import { $app, adiar, api, esc, heb, ligarSeg, ligarTeclado, numeralHebraico, ornamento, seg,
  teclado } from './util.js';

const TEMAS = {
  escuro: { fundo: '#0d0a08', grade: 'rgba(201,162,74,.35)', numero: 'rgba(236,223,195,.45)',
    marcada: 'rgba(201,162,74,.10)', traco: '#ecc977', brilho: 'rgba(236,201,119,.55)' },
  claro: { fundo: '#f3e9d2', grade: 'rgba(80,55,20,.35)', numero: 'rgba(60,40,15,.45)',
    marcada: 'rgba(120,80,20,.10)', traco: '#5a1a12', brilho: 'rgba(0,0,0,0)' },
};
const opcoes = { numeros: 'arabe', grade: 'sim', fundo: 'escuro' };
let kameas = null;

function desenhar(s) {
  const T = TEMAS[opcoes.fundo];
  const L = 540, M = 20, n = s.n, S = (L - 2 * M) / n;
  const centro = (lin, col) => [M + col * S + S / 2, M + lin * S + S / 2];
  const casas = new Set(s.passos.map((p) => `${p.linha}:${p.coluna}`));
  const partes = [`<rect width="${L}" height="${L}" fill="${T.fundo}"/>`];

  if (opcoes.grade === 'sim') {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = M + j * S, y = M + i * S, v = s.quadrado[i][j];
        if (casas.has(`${i}:${j}`)) partes.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${T.marcada}"/>`);
        partes.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="none" stroke="${T.grade}"/>`);
        if (opcoes.numeros !== 'nada') {
          const rot = opcoes.numeros === 'heb' ? numeralHebraico(v) : v;
          const fonte = opcoes.numeros === 'heb' ? "'Frank Ruhl Libre', serif" : "'Cinzel', serif";
          partes.push(`<text x="${x + S / 2}" y="${y + S / 2 + S * 0.12}" text-anchor="middle" font-family="${fonte}"
            font-size="${S * 0.34}" fill="${T.numero}">${rot}</text>`);
        }
      }
    }
  }

  const pts = s.passos.filter((p) => p.linha !== null).map((p) => centro(p.linha, p.coluna));
  if (pts.length) {
    const traco = `stroke="${T.traco}" stroke-width="${Math.max(2.5, S * 0.06)}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    const linha = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    partes.push(`<polyline points="${linha}" stroke="${T.brilho}" stroke-width="${S * 0.16}" fill="none"
      stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>`);
    partes.push(`<polyline points="${linha}" ${traco}/>`);
    // letras seguidas na mesma casa: um pequeno laço
    for (let k = 1; k < pts.length; k++) {
      if (pts[k][0] === pts[k - 1][0] && pts[k][1] === pts[k - 1][1]) {
        partes.push(`<circle cx="${pts[k][0]}" cy="${pts[k][1] - S * 0.2}" r="${S * 0.2}" ${traco}/>`);
      }
    }
    // início: um círculo; fim: uma barra perpendicular ao último traço
    const [x0, y0] = pts[0];
    partes.push(`<circle cx="${x0}" cy="${y0}" r="${S * 0.15}" ${traco.replace('fill="none"', `fill="${T.fundo}"`)}/>`);
    if (pts.length > 1) {
      const [xa, ya] = pts[pts.length - 2], [xb, yb] = pts[pts.length - 1];
      const comp = Math.hypot(xb - xa, yb - ya) || 1;
      const nx = -(yb - ya) / comp, ny = (xb - xa) / comp, b = S * 0.22;
      partes.push(`<line x1="${xb - nx * b}" y1="${yb - ny * b}" x2="${xb + nx * b}" y2="${yb + ny * b}" ${traco}/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${L}" id="svg-sigilo">${partes.join('')}</svg>`;
}

export async function telaSigilos(planeta = 'saturno', texto = '') {
  kameas = kameas || await api('/api/kameas');
  const k = kameas.find((x) => x.chave === planeta) || kameas[0];
  $app.innerHTML = `
    <h1>Sigilos dos Quadrados Planetários</h1>
    <p class="sub">Escolha o planeta e escreva um nome: cada letra vira um número, e o traço liga as casas do quadrado na ordem das letras.</p>
    <div class="planetas">${kameas.map((x) => `
      <button type="button" data-p="${x.chave}" class="${x.chave === k.chave ? 'on' : ''}">
        <b>${x.simbolo}</b><small>${esc(x.nome)}</small></button>`).join('')}
    </div>
    <div class="sigilo-layout">
      <div>
        <div class="kamea" id="kamea"></div>
        <div class="controle" style="margin-top:12px"><label>Números</label>
          ${seg('numeros', [['arabe', '1 2 3'], ['heb', 'א ב ג'], ['nada', 'Ocultar']], opcoes.numeros)}</div>
        <div class="controle"><label>Grade</label>${seg('grade', [['sim', 'Mostrar'], ['nao', 'Só o sigilo']], opcoes.grade)}</div>
        <div class="controle"><label>Fundo</label>${seg('fundo', [['escuro', 'Escuro'], ['claro', 'Pergaminho']], opcoes.fundo)}
          <button class="botao primario" id="baixar" type="button">Baixar SVG</button></div>
      </div>
      <div>
        <div class="cartao">
          <div class="chips">
            <span class="chip">${k.simbolo} ${esc(k.nome)}</span><span class="chip">${esc(k.sefira)}</span>
            <span class="chip">${k.n}×${k.n}</span><span class="chip">constante ${k.constante}</span>
            <span class="chip">soma ${k.total}</span>
          </div>
          <div class="controle"><label>Nomes</label>${k.nomes.map((x) => `
            <button class="botao" type="button" data-nome="${esc(x.hebraico)}">${esc(x.papel)}: ${esc(x.translit)}</button>`).join('')}</div>
          <input class="entrada-heb" id="nome" dir="rtl" lang="he" value="${esc(texto)}" placeholder="שם">
          ${teclado()}
        </div>
        <div id="passos"></div>
      </div>
    </div>`;

  const $nome = document.getElementById('nome');
  let atual = null;
  const render = () => { if (atual) document.getElementById('kamea').innerHTML = desenhar(atual); };
  const atualizar = adiar(async () => {
    history.replaceState(null, '', `#/sigilos/${k.chave}/${encodeURIComponent($nome.value)}`);
    atual = await api(`/api/sigilo?planeta=${k.chave}&q=${encodeURIComponent($nome.value)}`);
    render();
    document.getElementById('passos').innerHTML = !atual.passos.length ? '' : `
      ${ornamento(`${atual.texto} · ${atual.valor}`)}
      <p class="legenda">Valores maiores que ${k.n * k.n} perdem um zero até caber no quadrado (300 → 30 → 3).</p>
      <table class="passos"><tr><th>#</th><th>Letra</th><th>Valor</th><th>Casa</th></tr>
      ${atual.passos.map((p, i) => `<tr><td class="fraco">${i + 1}</td><td>${heb(p.letra)}</td>
        <td>${p.valor}</td><td>${p.reduzido !== p.valor ? `<b>${p.reduzido}</b>` : p.reduzido}</td></tr>`).join('')}
      </table>
      <p style="margin-top:10px"><a href="#/numero/${atual.valor}">Ver o número ${atual.valor} no dicionário →</a></p>`;
  });

  document.querySelector('.planetas').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-p]');
    if (b) location.hash = `#/sigilos/${b.dataset.p}/${encodeURIComponent($nome.value)}`;
  });
  $app.querySelectorAll('[data-nome]').forEach((b) => b.addEventListener('click', () => {
    $nome.value = b.dataset.nome;
    atualizar();
  }));
  ligarTeclado($app, $nome, atualizar);
  ligarSeg($app, (nome, v) => { opcoes[nome] = v; render(); });
  document.getElementById('baixar').addEventListener('click', () => {
    const svg = document.getElementById('svg-sigilo');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: `sigilo-${k.chave}-${atual?.texto || 'kamea'}.svg` });
    a.click();
    URL.revokeObjectURL(a.href);
  });
  atualizar();
}
