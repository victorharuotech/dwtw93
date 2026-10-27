// Créditos: todas as fontes de dados, imagens e tipografia (tabela `fontes`).
import { $app, api, config, esc, ornamento } from './util.js';

export async function telaCreditos() {
  const [fontes, { publico }] = await Promise.all([api('/api/fontes'), config()]);
  $app.innerHTML = `
    <h1>Créditos e Fontes</h1>
    <p class="sub">Este é um projeto de estudo. Cada dado e cada imagem vem de uma das obras abaixo, a quem todo o crédito pertence.</p>
    <div class="fontes">${fontes.map((f) => `
      <div class="cartao">
        <h3>${esc(f.titulo)}</h3>
        <p><b>${esc(f.autores)}</b>${f.ano ? ` · ${esc(f.ano)}` : ''}</p>
        <p><span class="fraco">Usado em:</span> ${esc(f.uso)}</p>
        <p class="fraco"><em>${esc(f.licenca)}</em></p>
        ${f.url ? `<p><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.url)}</a></p>` : ''}
      </div>`).join('')}
    </div>
    ${ornamento('Sobre o uso')}
    <div class="cartao">
      <p>${publico
        ? `Esta é a <b>versão pública</b>: os dados autorais do <b>Hermetic Kabbalah Tarot</b> (Marcelo Del Debbio e
           Rodrigo A. Grola) — equivalência dos Arcanos Menores em dados, corte ↔ personalidade e geomancia — ficam
           ocultos até a autorização dos autores.`
        : `Os dados do <b>Hermetic Kabbalah Tarot</b> (equivalência em dados, corte ↔ personalidade e geomancia)
           pertencem a Marcelo Del Debbio e Rodrigo A. Grola e estão aqui apenas como referência de estudo, com crédito.`}</p>
      <p>O código do projeto (Python, SQL e JavaScript) é original. O hebraico foi extraído dos PDFs com ferramentas
        próprias e validado por guematria.</p>
    </div>`;
}
