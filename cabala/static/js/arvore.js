// Árvore da Vida interativa: quatro escalas de cor, rótulos, filtros e camadas.
import { interpretar, preenchimento } from './cores.js';
import { miniatura } from './tarot.js';
import { $app, api, enriquecer, esc, heb, ligarSeg, ornamento, seg } from './util.js';

const POS = { 1: [300, 70], 2: [480, 165], 3: [120, 165], 4: [480, 345], 5: [120, 345],
  6: [300, 445], 7: [480, 625], 8: [120, 625], 9: [300, 725], 10: [300, 860] };
const DAATH = [300, 255];

const SIMBOLOS = { 'Ar': '🜁', 'Água': '🜄', 'Fogo': '🜂', 'Terra': '🜃', 'Mercúrio': '☿', 'Lua': '☽',
  'Vênus': '♀', 'Júpiter': '♃', 'Marte': '♂', 'Sol': '☉', 'Saturno': '♄', 'Áries': '♈', 'Touro': '♉',
  'Gêmeos': '♊', 'Câncer': '♋', 'Leão': '♌', 'Virgem': '♍', 'Libra': '♎', 'Escorpião': '♏',
  'Sagitário': '♐', 'Capricórnio': '♑', 'Aquário': '♒', 'Peixes': '♓' };
// U+FE0E pede a forma de texto do símbolo (sem ele, ♈ vira emoji colorido)
const TEXTO = '︎';
const simbolo = (atrib) => (SIMBOLOS[Object.keys(SIMBOLOS).find((k) => (atrib || '').startsWith(k))] || '·') + TEXTO;
const trunfo = (taro) => (taro || '').split(' ')[0];

const estado = { escala: 'rei', rotulo: 'letra', filtro: 'todos', espada: false, serpente: false, pilares: true };
let linhas = null;

function svgArvore(sel) {
  const vias = linhas.filter((l) => l.de_sefira);
  const sefirot = linhas.filter((l) => l.numero <= 10);
  const corDe = (l) => interpretar(l[estado.escala], l.rainha);
  const defs = [`<filter id="brilho"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    ...sefirot.map((s) => preenchimento(`sef${s.numero}`, corDe(s)))];

  const pilares = !estado.pilares ? '' : [[120, 'Severidade'], [300, 'Equilíbrio'], [480, 'Misericórdia']]
    .map(([x, nome]) => `<rect x="${x - 52}" y="30" width="104" height="880" rx="52" fill="rgba(201,162,74,.04)"
      stroke="rgba(201,162,74,.12)"/><text x="${x}" y="928" text-anchor="middle" class="pilar"
      font-family="Cinzel" font-size="11" letter-spacing="2" fill="rgba(201,162,74,.6)">${nome.toUpperCase()}</text>`).join('');

  const tracos = vias.map((v) => {
    const [x1, y1] = POS[v.de_sefira], [x2, y2] = POS[v.para_sefira];
    const c = corDe(v);
    const apagada = estado.filtro !== 'todos' && v.tipo !== estado.filtro;
    const extra = c.tipo === 'salpicado' ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.cores[1]}"
        stroke-width="5" stroke-dasharray="1.5 9" stroke-linecap="round"/>`
      : c.tipo === 'raiado' ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.cores[1]}"
        stroke-width="4" stroke-dasharray="4 7"/>` : '';
    return `<g class="via ${String(sel) === String(v.numero) ? 'sel' : ''} ${apagada ? 'apagada' : ''}" data-n="${v.numero}">
      <title>${v.numero} · ${esc(v.nome)} · ${esc(v.atribuicao || '')} · ${esc(v.taro || '')}</title>
      <line class="borda" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      <line class="cor" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.cores[0]}"/>${extra}</g>`;
  }).join('');

  const rotulos = vias.map((v) => {
    const [x1, y1] = POS[v.de_sefira], [x2, y2] = POS[v.para_sefira];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const apagada = estado.filtro !== 'todos' && v.tipo !== estado.filtro;
    const txt = { letra: v.letra, numero: v.numero, taro: trunfo(v.taro), atribuicao: simbolo(v.atribuicao) }[estado.rotulo];
    const latim = estado.rotulo !== 'letra';
    return `<g class="via rot ${apagada ? 'apagada' : ''}" data-n="${v.numero}"><circle cx="${mx}" cy="${my}" r="15"/>
      <text x="${mx}" y="${my + 5}" text-anchor="middle" class="${latim ? 'latim' : ''}">${esc(txt)}</text></g>`;
  }).join('');

  const centro = (n) => POS[n];
  const espada = !estado.espada ? '' : `<polyline points="${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => centro(n).join(',')).join(' ')}"
    fill="none" stroke="#ffd36b" stroke-width="4" stroke-linejoin="bevel" filter="url(#brilho)" opacity=".9" pointer-events="none"/>`;
  const meio = (v) => [(POS[v.de_sefira][0] + POS[v.para_sefira][0]) / 2, (POS[v.de_sefira][1] + POS[v.para_sefira][1]) / 2];
  const serpente = !estado.serpente ? '' : `<polyline points="${[...vias].sort((a, b) => b.numero - a.numero)
    .map((v) => meio(v).join(',')).join(' ')}" fill="none" stroke="#4fbf7a" stroke-width="3" stroke-dasharray="7 5"
    stroke-linejoin="round" filter="url(#brilho)" opacity=".85" pointer-events="none"/>`;

  const esferas = sefirot.map((s) => {
    const [x, y] = POS[s.numero];
    return `<g class="sef ${String(sel) === String(s.numero) ? 'sel' : ''}" data-n="${s.numero}">
      <title>${s.numero} · ${esc(s.nome)} · ${esc(s[estado.escala] || '')}</title>
      <circle cx="${x}" cy="${y}" r="42" fill="url(#sef${s.numero})"/>
      <circle class="aro" cx="${x}" cy="${y}" r="46"/>
      <text class="heb-sef" x="${x}" y="${y - 6}" text-anchor="middle">${esc(s.hebraico)}</text>
      <text x="${x}" y="${y + 14}" text-anchor="middle">${s.numero} · ${esc(s.nome.toUpperCase())}</text></g>`;
  }).join('');

  const daath = `<circle cx="${DAATH[0]}" cy="${DAATH[1]}" r="36" fill="none" stroke="rgba(201,162,74,.45)" stroke-dasharray="4 5"/>
    <text x="${DAATH[0]}" y="${DAATH[1] + 4}" text-anchor="middle" font-family="Cinzel" font-size="10" fill="rgba(201,162,74,.6)">DAATH</text>`;

  return `<svg viewBox="0 0 600 945" role="img" aria-label="Árvore da Vida"><defs>${defs.join('')}</defs>
    ${pilares}${daath}${tracos}${espada}${serpente}${rotulos}${esferas}</svg>`;
}

export async function telaArvore(sel = '') {
  linhas = linhas || await api('/api/arvore');
  $app.innerHTML = `
    <h1>Árvore da Vida</h1>
    <p class="sub">As dez Sefirot e os vinte e dois caminhos. Clique em qualquer um para abrir suas correspondências.</p>
    <div class="arvore-layout">
      <div>
        <div class="controle"><label>Escala</label>${seg('escala', [['rei', 'Rei'], ['rainha', 'Rainha'],
          ['imperador', 'Imperador'], ['imperatriz', 'Imperatriz']], estado.escala)}</div>
        <div class="controle"><label>Rótulos</label>${seg('rotulo', [['letra', 'Letra'], ['numero', 'Nº'],
          ['taro', 'Tarô'], ['atribuicao', 'Astro']], estado.rotulo)}</div>
        <div class="controle"><label>Destacar</label>${seg('filtro', [['todos', 'Todos'], ['mae', 'Mães · 🜁🜄🜂'],
          ['dupla', `Duplas · ☉${TEXTO}☽${TEXTO}`], ['simples', `Simples · ♈${TEXTO}♉${TEXTO}`]], estado.filtro)}</div>
        <div class="controle"><label>Camadas</label>
          ${[['pilares', 'Pilares'], ['espada', 'Espada Flamejante'], ['serpente', 'Serpente da Sabedoria']]
            .map(([k, r]) => `<button class="botao camada ${estado[k] ? 'primario' : ''}" data-camada="${k}">${r}</button>`).join('')}
        </div>
        <div class="arvore" id="arvore">${svgArvore(sel)}</div>
        <p class="legenda">Escalas de cor do 777 (cols. XV–XVIII): pontos = <em>flecked</em>, tracejado = <em>rayed</em>.</p>
      </div>
      <div class="cartao painel" id="painel"><p class="fraco"><em>Selecione uma Sefirá ou um caminho.</em></p></div>
    </div>`;
  const redesenhar = () => { document.getElementById('arvore').innerHTML = svgArvore(sel); };
  ligarSeg($app, (nome, v) => { estado[nome] = v; redesenhar(); });
  $app.querySelectorAll('[data-camada]').forEach((b) => b.addEventListener('click', () => {
    estado[b.dataset.camada] = !estado[b.dataset.camada];
    b.classList.toggle('primario', estado[b.dataset.camada]);
    redesenhar();
  }));
  document.getElementById('arvore').addEventListener('click', (ev) => {
    const g = ev.target.closest('[data-n]');
    if (g) location.hash = `#/arvore/${g.dataset.n}`;
  });
  if (sel !== '') painelCaminho(sel);
}

async function painelCaminho(chave) {
  const r = await api(`/api/caminho/${encodeURIComponent(chave)}`);
  const c = r.caminho;
  document.getElementById('painel').innerHTML = `
    <h1>${esc(c.chave)} · ${esc(c.nome)} ${heb(c.hebraico)}</h1>
    <p>${c.de_sefira ? `Liga <a href="#/arvore/${c.de_sefira}">${c.de_sefira}</a> ↔ <a href="#/arvore/${c.para_sefira}">${c.para_sefira}</a> · ` : ''}
       <a href="#/numero/${c.numero}">o número ${c.numero}</a></p>
    ${r.cartas.length ? `${ornamento(r.cartas.length === 1 ? 'Arcano' : 'Arcanos')}<div class="minis">${r.cartas.map(miniatura).join('')}</div>` : ''}
    <table class="corr">${r.correspondencias.map((x) => `
      <tr><td>${esc(x.coluna)}</td><td>${enriquecer(x.valor)}</td></tr>`).join('')}
    </table>`;
}
