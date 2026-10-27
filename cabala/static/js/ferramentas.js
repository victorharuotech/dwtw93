// Ferramentas: métodos de guematria, comparação, Temurah e Notariqon.
import { metodosDisponiveis } from './calc.js';
import { $app, adiar, api, esc, heb, ornamento, teclado } from './util.js';

let METODOS = [];
const DESCRICAO = { padrao: 'padrão', gadol: 'Gadol (finais 500–900)', katan: 'Katan (unidades)', ordinal: 'ordinal (posição)' };

async function valores(texto) {
  return Promise.all(METODOS.map(async ([m, nome]) => {
    try {
      return { m, nome, v: (await api(`/api/gematria?metodo=${m}&q=${encodeURIComponent(texto)}`)).valor };
    } catch (erro) {
      return { m, nome, erro: erro.message };
    }
  }));
}
const celula = (x) => x.erro ? `<span class="fraco" title="${esc(x.erro)}">—</span>`
  : (x.m === 'padrao' || x.m === 'gadol') ? `<a href="#/numero/${x.v}">${x.v}</a>` : x.v;

const ferramentas = {
  async metodos(q) {
    if (!q.a) return '';
    const vs = await valores(q.a);
    return `<table class="metodos">${vs.map((x) => `<tr><td>${x.nome}</td><td class="v">${celula(x)}</td></tr>`).join('')}</table>`;
  },
  async comparar(q) {
    if (!q.a || !q.b) return '';
    const [va, vb] = await Promise.all([valores(q.a), valores(q.b)]);
    return `<table class="metodos"><tr><td></td><td class="v">${heb(q.a)}</td><td class="v">${heb(q.b)}</td><td></td></tr>
      ${va.map((x, i) => {
        const y = vb[i], igual = !x.erro && x.v === y.v;
        return `<tr class="${igual ? 'igual' : ''}"><td>${x.nome}</td><td class="v">${celula(x)}</td>
          <td class="v">${celula(y)}</td><td>${igual ? '✦ iguais' : x.erro ? '' : `Δ ${Math.abs(x.v - y.v)}`}</td></tr>`;
      }).join('')}</table>`;
  },
  async temurah(q) {
    if (!q.a) return '';
    const r = await api(`/api/temurah?q=${encodeURIComponent(q.a)}`);
    const presentes = new Set(r.texto);
    return `<table class="metodos">${r.cifras.map((c) => `<tr><td>${c.nome}</td><td>${heb(c.texto)}</td>
      <td class="v"><a href="#/numero/${c.valor}">${c.valor}</a></td></tr>`).join('')}</table>
      <p class="legenda" style="margin-top:12px">Aiq Beker — as nove câmaras (letras de mesma unidade):</p>
      <div class="camaras">${r.camaras.map((cam, i) => `<div>${[...cam].map((l) =>
        `<span class="${presentes.has(l) ? 'on' : ''}">${l}</span>`).join('')}<small>${i + 1}</small></div>`).join('')}</div>`;
  },
  async notariqon(q) {
    if (!q.a) return '';
    const r = await api(`/api/notariqon?q=${encodeURIComponent(q.a)}`);
    return `<table class="metodos">
      <tr><td>Iniciais</td><td>${heb(r.iniciais)}</td><td class="v"><a href="#/numero/${r.valor_iniciais}">${r.valor_iniciais}</a></td></tr>
      <tr><td>Finais</td><td>${heb(r.finais)}</td><td class="v"><a href="#/numero/${r.valor_finais}">${r.valor_finais}</a></td></tr>
    </table>`;
  },
};

const CARTOES = [
  ['metodos', 'Métodos', '', ['יהוה']],   // a descrição depende dos métodos disponíveis
  ['comparar', 'Comparar', 'Duas palavras lado a lado; as linhas douradas marcam onde os valores coincidem.', ['אחד', 'אהבה']],
  ['temurah', 'Temurah', 'Permutações do alfabeto: Atbash (א↔ת), Albam (א↔ל) e Avgad (א→ב).', ['ששך']],
  ['notariqon', 'Notariqon', 'Uma frase reduzida às iniciais e às finais de cada palavra.', ['אתה גבור לעולם אדני']],
];

function listar(itens) {
  return itens.length > 1 ? `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}` : itens.join('');
}

export async function telaFerramentas() {
  METODOS = await metodosDisponiveis();
  CARTOES[0][2] = `O mesmo nome por ${METODOS.length} contagens: ${listar(METODOS.map(([m]) => DESCRICAO[m]))}.`;
  $app.innerHTML = `
    <h1>Ferramentas</h1>
    <p class="sub">O teclado escreve no último campo em que você clicou.</p>
    ${teclado()}
    ${ornamento('Operações')}
    <div class="grade-ferr">${CARTOES.map(([id, titulo, desc, exemplos]) => `
      <div class="cartao" data-ferr="${id}">
        <h3>${titulo}</h3><p class="sub">${desc}</p>
        ${exemplos.map((ex, i) => `<input class="heb-in" dir="rtl" lang="he" data-campo="${'ab'[i]}" value="${esc(ex)}">`).join('')}
        <div class="saida"></div>
      </div>`).join('')}
    </div>`;

  let ultimo = $app.querySelector('.heb-in');
  const atualizar = async (cartao) => {
    const q = Object.fromEntries([...cartao.querySelectorAll('.heb-in')].map((i) => [i.dataset.campo, i.value.trim()]));
    cartao.querySelector('.saida').innerHTML = await ferramentas[cartao.dataset.ferr](q);
  };
  $app.querySelectorAll('[data-ferr]').forEach((cartao) => {
    const disparar = adiar(() => atualizar(cartao), 200);
    cartao.querySelectorAll('.heb-in').forEach((i) => {
      i.addEventListener('input', disparar);
      i.addEventListener('focus', () => { ultimo = i; });
    });
    atualizar(cartao);
  });
  $app.querySelector('.teclado').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !ultimo) return;
    if (b.dataset.acao === 'apagar') ultimo.value = ultimo.value.slice(0, -1);
    else if (b.dataset.acao === 'limpar') ultimo.value = '';
    else ultimo.value += b.dataset.l;
    ultimo.focus();
    ultimo.dispatchEvent(new Event('input'));
  });
}
