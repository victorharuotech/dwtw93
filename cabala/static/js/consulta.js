// Consulta ao Tarô: 1 carta, 3 cartas e Cruz Celta, pelos métodos europeu e americano.
//   europeu:   Maiores e Menores em dois montes; cada casa recebe 1 Arcano Maior + 1 Arcano Menor
//   americano: as 78 cartas misturadas num monte só; uma carta por casa
import { img } from './tarot.js';
import { $app, api, esc, ligarSeg, ornamento, seg } from './util.js';

// Posições em "unidades de carta": x em larguras, y em alturas. 'deitada' = carta cruzada.
const TIRAGENS = {
  uma: {
    nome: '1 carta',
    casas: [['A carta', 'A resposta direta, o conselho ou a energia do momento para a sua pergunta.']],
    posicoes: [[0, 0]],
    explicacao: 'A tiragem mais simples: uma resposta para uma pergunta objetiva, ou uma orientação para o dia.',
  },
  tres: {
    nome: '3 cartas',
    casas: [['Passado', 'O que trouxe você até aqui: as causas e influências que já agiram.'],
      ['Presente', 'A situação como ela é agora: o centro da questão.'],
      ['Futuro', 'A tendência: para onde as coisas caminham se nada mudar.']],
    posicoes: [[0, 0], [1.35, 0], [2.7, 0]],
    explicacao: 'Três casas lidas da esquerda para a direita, como uma linha do tempo. A do meio é o eixo da leitura; as laterais mostram de onde a situação vem e para onde vai.',
  },
  cruz: {
    nome: 'Cruz Celta',
    // ordem original de A. E. Waite, The Pictorial Key to the Tarot (1910)
    casas: [
      ['O que cobre', 'A situação atual: a atmosfera em que a questão vive.'],
      ['O que cruza', 'O obstáculo ou a força que atravessa a situação, para o bem ou para o mal.'],
      ['O que coroa', 'O objetivo consciente: o melhor que se pode alcançar nessas circunstâncias.'],
      ['O que está embaixo', 'A base da questão: o que já foi vivido e agora sustenta a situação.'],
      ['O que está atrás', 'O passado recente: a influência que está indo embora.'],
      ['O que está à frente', 'O futuro próximo: a influência que começa a agir.'],
      ['O consulente', 'A posição ou a atitude de quem pergunta.'],
      ['A casa', 'O ambiente: as pessoas e as circunstâncias ao redor.'],
      ['Esperanças e medos', 'O que se deseja e o que se teme (muitas vezes, a mesma coisa).'],
      ['O desfecho', 'O resultado para onde tudo converge.'],
    ],
    posicoes: [[1.55, 1.1], [1.55, 1.1, 'deitada'], [1.55, 0], [1.55, 2.2], [0, 1.1], [3.1, 1.1],
      [4.8, 3.3], [4.8, 2.2], [4.8, 1.1], [4.8, 0]],
    explicacao: 'A tiragem clássica de dez casas, na ordem publicada por A. E. Waite em <em>The Pictorial Key to the Tarot</em> (1910). Seis formam a cruz, à esquerda: o centro (1), o que o cruza (2), o que coroa (3), a base (4), o passado (5) e o futuro (6). As outras quatro formam o bastão, à direita, lido de baixo para cima (7 a 10). A cruz mostra a situação; o bastão mostra a pessoa diante dela e o desfecho.',
  },
};
const METODOS = {
  europeu: {
    nome: 'Europeu',
    texto: '<b>Método europeu</b> — os 22 Arcanos Maiores e os 56 Arcanos Menores são embaralhados em <b>dois montes separados</b>, e cada casa recebe <b>um Arcano Maior e um Arcano Menor</b>. O Maior mostra o tema: a força arquetípica em jogo naquela casa. O Menor mostra como essa força se manifesta no cotidiano: o terreno, o detalhe, a ação concreta. Leia os dois juntos, como substantivo e adjetivo.',
  },
  americano: {
    nome: 'Americano',
    texto: '<b>Método americano</b> — as <b>78 cartas são embaralhadas juntas</b>, num monte só, e cada casa recebe uma carta. Aqui a proporção também fala: um Arcano Maior pesa mais e indica que a questão toca forças maiores que a vontade pessoal; uma tiragem só de Menores fala de assuntos do dia a dia, que estão nas suas mãos.',
  },
};

// casas: lista de { maior, menor } (europeu) ou { carta } (americano)
const estado = { tiragem: 'tres', metodo: 'europeu', pergunta: '', casas: [], reveladas: new Set() };
let baralho = null;

function embaralhar(lista) {
  const ids = lista.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {          // Fisher–Yates
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function tirar() {
  const n = TIRAGENS[estado.tiragem].casas.length;
  if (estado.metodo === 'europeu') {
    const maiores = embaralhar(baralho.filter((c) => c.arcano === 'maior'));
    const menores = embaralhar(baralho.filter((c) => c.arcano === 'menor'));
    estado.casas = Array.from({ length: n }, (_, i) => ({ maior: maiores[i], menor: menores[i] }));
  } else {
    estado.casas = embaralhar(baralho).slice(0, n).map((carta) => ({ carta }));
  }
  estado.reveladas = new Set();
}

const cartasDa = (casa) => [casa.maior, casa.menor, casa.carta].filter(Boolean);

function mesa() {
  const { casas, posicoes } = TIRAGENS[estado.tiragem];
  const par = estado.casas[0]?.maior;           // europeu: a casa mostra Maior + Menor
  const largura = Math.max(...posicoes.map(([x]) => x)) + (par ? 1.35 : 1);
  const altura = Math.max(...posicoes.map(([, y]) => y)) + 1.05;
  return `<div class="mesa" style="--cols:${largura}; --rows:${altura}">${casas.map((_, i) => {
    const [x, y, deitada] = posicoes[i];
    const casa = estado.casas[i];
    const aberta = casa && estado.reveladas.has(i);
    const lamina = (id, classe) => `<span class="${classe}">${aberta ? `<img src="${img(id)}" alt="">` : '<span class="verso"></span>'}</span>`;
    return `<button type="button" class="lamina ${deitada ? 'deitada' : ''} ${casa?.maior ? 'com-par' : ''}" data-i="${i}"
      style="--x:${x}; --y:${y}" ${casa ? '' : 'disabled'} title="${i + 1}. ${esc(casas[i][0])}">
      ${casa ? cartasDa(casa).map((id, k) => lamina(id, k === 0 ? 'frente' : 'par')).join('') : '<span class="verso vazio"></span>'}
      <span class="casa-num">${i + 1}</span></button>`;
  }).join('')}</div>`;
}

function cartaLida(id, rotulo) {
  const c = baralho.find((x) => x.id === id);
  return `<div class="carta-lida">
    <a href="#/tarot/${c.id}"><img src="${img(c.id)}" alt="${esc(c.nome)}"></a>
    <div>${rotulo ? `<span class="chip">${rotulo}</span>` : ''}
      <h3><a href="#/tarot/${c.id}">${esc(c.nome)}</a></h3>
      <p><em>${esc(c.titulo)}</em></p><p>${esc(c.palavras)}</p>
      ${c.mbti ? `<p class="personalidade">Personalidade: <b>${esc(c.mbti)}</b> — ${esc(c.mbti_titulo)}</p>` : ''}
      <p class="fraco">${esc(c.resumo)}</p></div>
  </div>`;
}

function leitura() {
  if (!estado.casas.length) return '';
  const { casas } = TIRAGENS[estado.tiragem];
  return `${ornamento('A leitura')}<ol class="leitura">${casas.map(([nome, texto], i) => {
    const casa = estado.casas[i];
    const corpo = !estado.reveladas.has(i)
      ? '<p class="fraco"><em>Ainda virada. Clique na casa, na mesa, para revelar.</em></p>'
      : casa.maior ? cartaLida(casa.maior, 'Arcano Maior · o tema') + cartaLida(casa.menor, 'Arcano Menor · o detalhe')
        : cartaLida(casa.carta);
    return `<li class="cartao">
      <div class="casa"><span class="casa-num">${i + 1}</span><div><h3>${esc(nome)}</h3><p class="fraco">${esc(texto)}</p></div></div>
      ${corpo}</li>`;
  }).join('')}</ol>`;
}

function desenhar() {
  document.getElementById('mesa-area').innerHTML = `
    ${estado.pergunta && estado.casas.length ? `<p class="pergunta">“${esc(estado.pergunta)}”</p>` : ''}
    ${mesa()}
    ${estado.casas.length && estado.reveladas.size < estado.casas.length
      ? '<div class="controle centro"><button class="botao" type="button" id="revelar">Revelar todas</button></div>' : ''}
    ${leitura()}`;
  document.getElementById('explicacao').innerHTML = `
    <p>${TIRAGENS[estado.tiragem].explicacao}</p><p>${METODOS[estado.metodo].texto}</p>`;
  document.getElementById('revelar')?.addEventListener('click', () => {
    estado.casas.forEach((_, i) => estado.reveladas.add(i));
    desenhar();
  });
}

export async function telaConsulta() {
  baralho = baralho || await api('/api/consulta');
  $app.innerHTML = `
    <h1>Consulta ao Tarô</h1>
    <p class="sub">Concentre-se na sua pergunta, escolha a tiragem e o método, e embaralhe. As cartas vêm viradas: revele uma casa de cada vez.</p>
    <div class="controle"><label>Tiragem</label>${seg('tiragem', Object.entries(TIRAGENS).map(([k, t]) => [k, t.nome]), estado.tiragem)}</div>
    <div class="controle"><label>Método</label>${seg('metodo', Object.entries(METODOS).map(([k, m]) => [k, m.nome]), estado.metodo)}</div>
    <div class="controle"><label>Pergunta</label>
      <input id="pergunta" class="campo" placeholder="Opcional — fica só na sua tela" value="${esc(estado.pergunta)}">
      <button class="botao primario" type="button" id="tirar">Embaralhar e tirar</button></div>
    <div class="cartao explicacao" id="explicacao"></div>
    <div id="mesa-area"></div>
    <p class="credito">Títulos das cartas: Golden Dawn (<em>Book T</em>). Palavras-chave: seleção do projeto.
      Imagens: Rider-Waite-Smith (1909). Cruz Celta: A. E. Waite, <em>The Pictorial Key to the Tarot</em> (1910).
      Personalidades das cartas da corte: Hermetic Kabbalah Tarot, segundo Jana Riley (quando disponíveis).
      O tarô é aqui uma ferramenta de reflexão e estudo simbólico. <a href="#/creditos">Créditos</a></p>`;

  ligarSeg($app, (nome, v) => {
    estado[nome] = v;
    estado.casas = [];                   // nova tiragem ou novo método: a mesa recomeça
    estado.reveladas = new Set();
    desenhar();
  });
  document.getElementById('pergunta').addEventListener('input', (ev) => { estado.pergunta = ev.target.value; });
  document.getElementById('tirar').addEventListener('click', () => { tirar(); desenhar(); });
  document.getElementById('mesa-area').addEventListener('click', (ev) => {
    const b = ev.target.closest('.lamina');
    if (!b || b.disabled) return;
    estado.reveladas.add(Number(b.dataset.i));
    desenhar();
  });
  desenhar();
}
