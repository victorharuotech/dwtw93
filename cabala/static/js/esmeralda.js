// A Tábua de Esmeralda: a pedra fundamental do projeto, em latim, grego e português.
import { $app, api, esc, ligarSeg, ornamento, seg } from './util.js';

const LINGUAS = { latim: ['Latim', 'la'], grego: ['Grego', 'grc'], portugues: ['Português', 'pt'] };
let mostrar = 'todas';

export async function telaEsmeralda() {
  const versos = await api('/api/esmeralda');
  const colunas = mostrar === 'todas' ? Object.keys(LINGUAS) : [mostrar];
  $app.innerHTML = `
    <div class="esmeralda-topo">
      <p class="lema-latino">Quod est inferius est sicut quod est superius</p>
      <h1>A Tábua de Esmeralda</h1>
      <p class="sub">Tabula Smaragdina · a pedra fundamental de todo este trabalho</p>
    </div>
    <div class="controle"><label>Mostrar</label>${seg('mostrar', [['todas', 'Lado a lado'],
      ...Object.entries(LINGUAS).map(([k, [nome]]) => [k, nome])], mostrar)}</div>
    <div class="cartao tabua">
      <div class="tabua-cabecalho" style="--colunas:${colunas.length}">${colunas.map((c) => `<h3>${LINGUAS[c][0]}</h3>`).join('')}</div>
      ${versos.map((v) => `<div class="versiculo" style="--colunas:${colunas.length}">
        <span class="nverso">${v.verso}</span>
        ${colunas.map((c) => `<p lang="${LINGUAS[c][1]}" class="${c}">${esc(v[c])}</p>`).join('')}
      </div>`).join('')}
    </div>
    ${ornamento('Por que a Tábua é a pedra fundamental')}
    <div class="cartao">
      <p>“O que está embaixo é como o que está em cima”: a frase da Tábua é o princípio que sustenta todo este site.
        As tábuas do <em>Liber 777</em>, a Árvore da Vida, a guematria, os quadrados planetários e o Tarô são formas de
        ler <b>correspondências</b>: a ideia de que um número, uma letra, um planeta, uma cor e uma carta podem
        espelhar a mesma força em planos diferentes.</p>
    </div>
    ${ornamento('Sobre o texto')}
    <div class="cartao notas-texto">
      <p><b>Latim.</b> A versão vulgata medieval (séc. XII), a forma pela qual a Tábua chegou à alquimia europeia.
        Texto em domínio público.</p>
      <p><b>Grego.</b> Não existe original grego conhecido: as versões mais antigas são árabes, dos séculos VI a VIII,
        e um original grego é apenas uma hipótese. O texto desta página é uma <b>versão moderna em grego koiné</b>,
        feita para este projeto a partir do latim, como homenagem à tradição hermética de língua grega.</p>
      <p><b>Português.</b> Tradução feita para este projeto, a partir do latim.</p>
    </div>`;
  ligarSeg($app, (_, v) => { mostrar = v; telaEsmeralda(); });
}
