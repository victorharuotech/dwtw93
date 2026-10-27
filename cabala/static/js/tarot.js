// Tarô: os 78 arcanos do Rider-Waite-Smith, com correspondências interativas.
import { $app, api, config, enriquecer, esc, heb, ligarSeg, ornamento, seg } from './util.js';

const CREDITO_IMAGENS = 'Rider-Waite-Smith · Pamela Colman Smith & A. E. Waite (1909)';
const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const SIMB_NAIPE = { paus: '🜂', copas: '🜄', espadas: '🜁', ouros: '🜃' };
const estado = { filtro: 'todos' };
let ultimoLance = '';   // sobrevive ao redesenho da tela ao trocar de carta

export const img = (id) => `/static/cartas/rws/${id}.jpg`;

// miniatura clicável de uma carta (usada também na Árvore)
export const miniatura = (c) => `<a class="mini" href="#/tarot/${c.id}" title="${esc(c.nome)}">
  <img src="${img(c.id)}" alt="${esc(c.nome)}" loading="lazy"><span>${esc(c.nome)}</span></a>`;

const dadosHtml = (d) => `<span class="dados" title="${d.split('').join(' · ')}">${d.split('').map((x) => FACES[x]).join('')}</span>`;

async function painel(cid) {
  const r = await api(`/api/carta/${cid}`);
  const c = r.carta, p = r.caminho;
  const linhaCorr = (nome) => r.correspondencias.find((x) => x.coluna === nome)?.valor;
  const chips = [
    c.arcano === 'maior' ? `Caminho ${p.numero}` : `Sefirá ${p.numero}`,
    c.elemento && `${SIMB_NAIPE[c.naipe]}︎ ${c.elemento}`,
    c.subelemento, c.decanato, c.mbti && `${c.mbti} · ${c.mbti_titulo}`,
  ].filter(Boolean);
  const principais = c.arcano === 'maior'
    ? [['Letra', `${heb(r.letra.letra)} ${esc(r.letra.nome)} — ${esc(r.letra.significado)}`],
      ['Valor', `<a href="#/numero/${r.letra.valor}">${r.letra.valor}</a>`],
      ['Atribuição', esc(linhaCorr('Atribuição') || '')],
      ['Caminho', `<a href="#/arvore/${p.numero}">${p.numero}: liga ${p.de_sefira} ↔ ${p.para_sefira}</a>`],
      ['Inteligência', esc(linhaCorr('The Paths of the Sepher Yetzirah') || '')],
      ['Cor (Rei)', esc(linhaCorr('The King Scale of Colour') || '')]]
    : [['Sefirá', `<a href="#/arvore/${p.numero}">${p.numero} · ${esc(p.nome)}</a> ${heb(p.hebraico)}`],
      ['Nome divino', enriquecer(linhaCorr('God-Names in Assiah') || '')],
      ['Arcanjo', enriquecer(linhaCorr('Archangels of Assiah') || '')],
      ['Esfera', esc(linhaCorr('English of Col. VI') || '')],
      ...(c.decanato ? [['Decanato', esc(c.decanato)]] : []),
      ...(c.dados ? [['3 dados (HKT)', dadosHtml(c.dados)]] : []),
      ...(c.mbti ? [['Personalidade', `<b>${esc(c.mbti)}</b> — ${esc(c.mbti_titulo)}`]] : [])];
  const outras = r.correspondencias.filter((x) => !principais.some(([k]) => k === x.coluna));
  document.getElementById('painel-carta').innerHTML = `
    <figure class="carta-grande"><img src="${img(c.id)}" alt="${esc(c.nome)}"></figure>
    <h1>${esc(c.nome)}</h1>
    <div class="chips">${chips.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
    <table class="corr">${principais.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
    ${r.irmas.length ? `${ornamento(c.arcano === 'maior' ? 'Na mesma Sefirá' : `Também em ${p.nome}`)}
      <div class="minis">${r.irmas.map(miniatura).join('')}</div>` : ''}
    <details><summary>Todas as correspondências do 777 (${outras.length})</summary>
      <table class="corr">${outras.map((x) => `<tr><td>${esc(x.coluna)}</td><td>${enriquecer(x.valor)}</td></tr>`).join('')}</table>
    </details>
    <p class="credito">Imagens: ${CREDITO_IMAGENS}.
      ${c.arcano === 'maior' ? 'Correspondências: Liber 777.' : `Decanatos: Golden Dawn.${c.dados
        ? ' Dados e personalidades: Hermetic Kabbalah Tarot © 2013 M. Del Debbio & R. A. Grola (corte ↔ MBTI segundo Jana Riley).' : ''}`}
      <a href="#/creditos">Créditos</a></p>`;
}

export async function telaTarot(cid = '') {
  const [cartas, { publico }] = await Promise.all([api('/api/tarot'), config()]);
  const filtradas = cartas.filter((c) => estado.filtro === 'todos'
    || (estado.filtro === 'maior' ? c.arcano === 'maior' : c.naipe === estado.filtro));
  $app.innerHTML = `
    <h1>Tarô</h1>
    <p class="sub">Os 78 arcanos e suas correspondências: os Maiores nos caminhos da Árvore, os Menores nas Sefirot.</p>
    <div class="controle"><label>Mostrar</label>${seg('filtro', [['todos', 'Todos'], ['maior', 'Maiores'],
      ['paus', 'Paus'], ['copas', 'Copas'], ['espadas', 'Espadas'], ['ouros', 'Ouros']], estado.filtro)}</div>
    ${publico ? '' : `<div class="controle"><label>Sorteio</label>
      <button class="botao primario" id="lancar" type="button">Lançar 3 dados</button><span id="resultado-dados" class="fraco">${ultimoLance}</span></div>`}
    <div class="tarot-layout">
      <div class="minis grade-cartas">${filtradas.map((c) => miniatura(c).replace('class="mini"',
        `class="mini ${c.id === cid ? 'sel' : ''}"`)).join('')}</div>
      <div class="cartao painel" id="painel-carta"><p class="fraco"><em>Escolha uma carta, ou lance os dados.</em></p></div>
    </div>`;
  ligarSeg($app, (nome, v) => {
    estado[nome] = v;
    telaTarot(cid);
  });
  document.getElementById('lancar')?.addEventListener('click', async () => {
    const d = Array.from({ length: 3 }, () => 1 + Math.floor(Math.random() * 6));
    const c = await api(`/api/dados/${d.join('')}`);
    ultimoLance = `${dadosHtml(d.join(''))} → ${esc(c.nome)}`;
    if (location.hash === `#/tarot/${c.id}`) telaTarot(c.id); else location.hash = `#/tarot/${c.id}`;
  });
  if (cid) painel(cid);
}
