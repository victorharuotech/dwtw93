// Tabela de correspondências: colunas do 777 lado a lado.
import { $app, api, enriquecer, esc } from './util.js';

export async function tela777(cols) {
  const escolhidas = (cols || '2,14,15').split(',').filter(Boolean).map(Number);
  const [colunas, t] = await Promise.all([api('/api/colunas'), api(`/api/tabela?cols=${escolhidas.join(',')}`)]);
  const nomes = Object.fromEntries(colunas.map((c) => [c.id, c]));
  $app.innerHTML = `
    <h1>Tabela de Correspondências</h1>
    <p class="sub">Escolha até oito colunas para comparar, como nas tábuas do Liber 777.</p>
    <div class="seletor">${colunas.map((c) => `
      <label class="${escolhidas.includes(c.id) ? 'on' : ''}" title="${esc(c.nome)}">
        <input type="checkbox" value="${c.id}" ${escolhidas.includes(c.id) ? 'checked' : ''}>
        ${c.romano ? `<b>${esc(c.romano)}</b> ` : ''}${esc(c.nome)}</label>`).join('')}
    </div>
    <div class="tabela-wrap"><table class="t777">
      <tr><th>Linha</th>${escolhidas.map((id) => `<th>${esc(nomes[id]?.romano || '')} ${esc(nomes[id]?.nome || '')}</th>`).join('')}</tr>
      ${t.linhas.map((l) => `<tr>
        <td><a href="#/arvore/${l.numero}">${esc(l.chave)}</a> <span class="fraco">${esc(l.nome)}</span></td>
        ${escolhidas.map((id) => `<td>${enriquecer(t.celulas[`${l.numero}:${id}`] || '')}</td>`).join('')}
      </tr>`).join('')}
    </table></div>`;
  document.querySelector('.seletor').addEventListener('change', () => {
    const ids = [...document.querySelectorAll('.seletor input:checked')].map((i) => i.value).slice(0, 8);
    location.hash = `#/777/${ids.join(',')}`;
  });
}
