// Utilitários compartilhados pelas telas.
export const $app = document.getElementById('app');

// Configuração do servidor (ex.: modo público), buscada uma vez só
let _config;
export const config = () => (_config ||= api('/api/config'));

export async function api(url) {
  const r = await fetch(url);
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.erro || `erro ${r.status}`);
  return dados;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ehHebraico = (s) => /[א-ת]/.test(s);
export const ornamento = (titulo) => `<h2><span class="orn">✦</span> ${esc(titulo)} <span class="orn">✦</span></h2>`;

// Hebraico clicável (abre na calculadora), isolado para o bidi não bagunçar a linha
export const heb = (s) =>
  `<a class="heb" dir="rtl" lang="he" href="#/calc/${encodeURIComponent(s)}">${esc(s)}</a>`;

// Escapa, isola trechos hebraicos e liga números ao dicionário (menos "p. 273")
export function enriquecer(texto) {
  return esc(texto)
    .replace(/[א-ת][א-ת :]*[א-ת]|[א-ת]/g,
      (m) => `<span class="heb" dir="rtl" lang="he">${m}</span>`)
    .replace(/(^|[^\w.#&;])(\d{1,4})(?![\d°;])/g, (m, antes, n, pos, todo) =>
      /pp?\.\s*$/.test(todo.slice(Math.max(0, pos - 4), pos + antes.length))
        ? m : `${antes}<a href="#/numero/${n}">${n}</a>`);
}

// Guematria refeita no navegador, independente do servidor: serve de segunda verificação
const VALOR = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, כ: 20, ל: 30, מ: 40, נ: 50, ס: 60,
  ע: 70, פ: 80, צ: 90, ק: 100, ר: 200, ש: 300, ת: 400, ך: 20, ם: 40, ן: 50, ף: 80, ץ: 90 };
const GADOL = { ך: 500, ם: 600, ן: 700, ף: 800, ץ: 900 };

export function conta(hebraico, metodo = 'padrao') {
  const partes = [...hebraico].filter((l) => l in VALOR)
    .map((l) => [l, metodo === 'gadol' && GADOL[l] ? GADOL[l] : VALOR[l]]);
  return { partes, total: partes.reduce((s, [, v]) => s + v, 0) };
}

// 'י 10 + ה 5 + ו 6 + ה 5 = 26 ✓' — a conta mostrada letra por letra
export function verificacao(hebraico, alvo, metodo = 'padrao') {
  const { partes, total } = conta(hebraico, metodo);
  const ok = total === alvo;
  return `<div class="verificacao ${ok ? 'ok' : 'falha'}" title="${ok ? 'A soma confere com o número' : 'A soma não confere'}">
    ${partes.map(([l, v]) => `<span class="termo"><b lang="he">${l}</b>${v}</span>`).join('<span class="mais">+</span>')}
    <span class="igual">= ${total}</span><span class="selo">${ok ? '✓' : '⚠'}</span></div>`;
}

// verificar: { alvo, metodo } mostra a conta de cada palavra contra o número da página
export function cartoes(grupos, mostrarValor = false, verificar = null) {
  if (!grupos.length) return '<p class="fraco"><em>Nenhuma palavra registrada.</em></p>';
  return `<div class="palavras">${grupos.map((g) => `
    <div class="cartao palavra">
      <div class="topo">
        <span>${heb(g.hebraico)} ${g.translit ? `<span class="fraco">${esc(g.translit)}</span>` : ''}</span>
        ${mostrarValor ? `<a class="badge" href="#/numero/${g.valor}">${g.valor}</a>` : ''}
      </div>
      ${verificar ? verificacao(g.hebraico, verificar.alvo, verificar.metodo) : ''}
      <ul>${g.sentidos.map((s) => `
        <li><span class="${s.texto.length > 220 ? 'longo' : ''}"${s.original ? ` title="Original: ${esc(s.original)}"` : ''}>${enriquecer(s.texto)}</span>
            <span class="fonte">— ${s.referencia
              ? `<a href="https://www.sefaria.org/${esc(s.referencia)}" target="_blank" rel="noopener">${esc(s.fonte)} ${esc(s.referencia.split('.').slice(1).join(':'))} ↗</a>`
              : esc(s.fonte)}</span></li>`).join('')}
      </ul>
    </div>`).join('')}</div>`;
}

// Teclado hebraico reutilizável: devolve o HTML; ligarTeclado() conecta a um <input>
export const TECLAS = [['א', 'Aleph'], ['ב', 'Beth'], ['ג', 'Gimel'], ['ד', 'Daleth'], ['ה', 'He'],
  ['ו', 'Vav'], ['ז', 'Zayin'], ['ח', 'Cheth'], ['ט', 'Teth'], ['י', 'Yod'], ['כ', 'Kaph'], ['ך', 'final'],
  ['ל', 'Lamed'], ['מ', 'Mem'], ['ם', 'final'], ['נ', 'Nun'], ['ן', 'final'], ['ס', 'Samekh'], ['ע', 'Ayin'],
  ['פ', 'Pe'], ['ף', 'final'], ['צ', 'Tzaddi'], ['ץ', 'final'], ['ק', 'Qoph'], ['ר', 'Resh'], ['ש', 'Shin'],
  ['ת', 'Tav']];

export const teclado = () => `<div class="teclado">
  ${TECLAS.map(([l, n]) => `<button type="button" data-l="${l}">${l}<small>${n}</small></button>`).join('')}
  <button type="button" class="acao" data-l=" ">espaço</button>
  <button type="button" class="acao" data-acao="apagar">⌫</button>
  <button type="button" class="acao" data-acao="limpar">limpar</button>
</div>`;

export function ligarTeclado(raiz, $input, aoMudar) {
  raiz.querySelector('.teclado').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.acao === 'apagar') $input.value = $input.value.slice(0, -1);
    else if (b.dataset.acao === 'limpar') $input.value = '';
    else $input.value += b.dataset.l;
    $input.focus();
    aoMudar();
  });
  $input.addEventListener('input', aoMudar);
}

export function adiar(fn, ms = 150) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// Botões segmentados: seg('escala', [['rei','Rei'],...], 'rei')
export const seg = (nome, opcoes, atual) => `<div class="seg" data-seg="${nome}">${opcoes.map(([v, r]) =>
  `<button type="button" data-v="${esc(v)}" class="${String(v) === String(atual) ? 'on' : ''}">${r}</button>`).join('')}</div>`;

export function ligarSeg(raiz, aoMudar) {
  raiz.querySelectorAll('.seg').forEach((s) => s.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    s.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    aoMudar(s.dataset.seg, b.dataset.v);
  }));
}

// Favoritos no navegador (conveniência local; o app funciona sem eles)
const CHAVE = 'cabala:favoritos';
export function favoritos() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { return []; }
}
export function alternarFavorito(item) {
  const lista = favoritos();
  const i = lista.findIndex((f) => f.tipo === item.tipo && f.valor === item.valor);
  if (i >= 0) lista.splice(i, 1); else lista.unshift(item);
  try { localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, 60))); } catch { /* sem armazenamento */ }
  return i < 0;
}
export const ehFavorito = (item) => favoritos().some((f) => f.tipo === item.tipo && f.valor === item.valor);

export function botaoEstrela(item) {
  return `<button class="estrela ${ehFavorito(item) ? 'on' : ''}" title="Favoritar"
    data-fav='${esc(JSON.stringify(item))}'>★</button>`;
}
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-fav]');
  if (b) b.classList.toggle('on', alternarFavorito(JSON.parse(b.dataset.fav)));
});

// Numeral hebraico: 15 -> טו, 16 -> טז (evitando as formas do Nome)
export function numeralHebraico(n) {
  let s = '';
  while (n >= 400) { s += 'ת'; n -= 400; }
  if (n >= 100) { s += 'קרש'[Math.floor(n / 100) - 1]; n %= 100; }
  if (n === 15) return `${s}טו`;
  if (n === 16) return `${s}טז`;
  if (n >= 10) { s += 'יכלמנסעפצ'[Math.floor(n / 10) - 1]; n %= 10; }
  if (n > 0) s += 'אבגדהוזחט'[n - 1];
  return s;
}
