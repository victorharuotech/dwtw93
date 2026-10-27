// Página de um número: como uma entrada do Sepher Sephiroth / Godwin.
import { $app, api, botaoEstrela, cartoes, conta, enriquecer, esc, heb, ligarSeg, ornamento, seg } from './util.js';

let verificar = true;

export async function telaNumero(n) {
  n = Math.max(1, parseInt(n, 10) || 1);
  const r = await api(`/api/numero/${n}`);
  const notas = r.notas.filter((x) => x.tipo === 'nota');
  const suspeitos = r.notas.filter((x) => x.tipo === 'nao_verificado');
  // segunda verificação, no navegador: toda palavra listada precisa somar exatamente n
  const conferem = r.palavras.filter((p) => conta(p.hebraico).total === n).length
    + r.gadol.filter((p) => conta(p.hebraico, 'gadol').total === n).length;
  const total = r.palavras.length + r.gadol.length;
  $app.innerHTML = `
    <div class="cab-numero">
      <span class="valor-grande">${n}</span>
      ${botaoEstrela({ tipo: 'numero', valor: n })}
      <div>
        <div class="chips">${[`redução ${r.reducao}`, ...r.propriedades].map((p) => `<span class="chip">${esc(p)}</span>`).join('')}</div>
        ${r.caminho ? `<div>Caminho <a href="#/arvore/${r.caminho.numero}">${esc(r.caminho.chave)} · ${esc(r.caminho.nome)}</a> ${heb(r.caminho.hebraico)}</div>` : ''}
        ${r.letra ? `<div>Letra ${esc(r.letra.nome)} ${heb(r.letra.letra)}</div>` : ''}
      </div>
      <div class="navnum">
        <a href="#/numero/${Math.max(1, n - 1)}">← ${Math.max(1, n - 1)}</a>
        <form id="irnum"><input class="campo num" type="number" min="1" value="${n}"></form>
        <a href="#/numero/${n + 1}">${n + 1} →</a>
      </div>
    </div>
    ${ornamento(`Palavras · ${r.palavras.length}`)}
    ${total ? `<div class="controle resumo-verificacao">
      <span class="${conferem === total ? 'ok' : 'falha'}">${conferem === total
        ? `✓ As ${total} palavras somam exatamente ${n}`
        : `⚠ ${total - conferem} de ${total} palavras não somam ${n}`}</span>
      <label>Verificação</label>${seg('verificar', [['sim', 'Mostrar a conta'], ['nao', 'Ocultar']], verificar ? 'sim' : 'nao')}</div>` : ''}
    ${cartoes(r.palavras, false, verificar && { alvo: n, metodo: 'padrao' })}
    ${r.gadol.length ? `${ornamento('Pelo Mispar Gadol')}
      <p class="legenda">Contando as letras finais com os valores de 500 a 900.</p>
      ${cartoes(r.gadol, true, verificar && { alvo: n, metodo: 'gadol' })}` : ''}
    ${notas.length ? `${ornamento('Notas')}${notas.map((x) => `<div class="nota">✎ ${enriquecer(x.texto)}</div>`).join('')}` : ''}
    ${suspeitos.length ? `${ornamento('Não verificados')}
      <p class="legenda">O hebraico destes verbetes, como está no PDF, não soma ${n}.</p>
      ${suspeitos.map((x) => `<div class="nota aviso">⚠ ${x.hebraico ? heb(x.hebraico) : ''} ${enriquecer(x.texto)}</div>`).join('')}` : ''}`;
  ligarSeg($app, (_, v) => { verificar = v === 'sim'; telaNumero(n); });
  document.getElementById('irnum').addEventListener('submit', (ev) => {
    ev.preventDefault();
    location.hash = `#/numero/${ev.target.querySelector('input').value}`;
  });
}

export async function telaBuscar(termo) {
  const r = await api(`/api/buscar?q=${encodeURIComponent(termo)}`);
  $app.innerHTML = `<h1>“${esc(termo)}”</h1><p class="sub">${r.length} palavras</p>${cartoes(r, true)}`;
}
