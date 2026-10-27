// Calculadora: guematria em tempo real, com escolha de método.
import { $app, adiar, api, botaoEstrela, cartoes, esc, favoritos, ligarSeg, ligarTeclado,
  ornamento, seg, teclado } from './util.js';

export const METODOS = [['padrao', 'Padrão'], ['gadol', 'Gadol'], ['katan', 'Katan'], ['ordinal', 'Ordinal']];
let metodo = 'padrao';

export function telaCalc(inicial = '') {
  const favs = favoritos();
  $app.innerHTML = `
    <h1>Calculadora de Guematria</h1>
    <p class="sub">Digite em hebraico ou use o teclado. O valor e as palavras de mesmo número surgem na hora.</p>
    <input class="entrada-heb" id="entrada" dir="rtl" lang="he" value="${esc(inicial)}" autofocus>
    ${teclado()}
    <div class="controle"><label>Método</label>${seg('metodo', METODOS, metodo)}</div>
    <div id="saida"></div>
    ${favs.length ? `${ornamento('Favoritos')}<div class="favoritos">${favs.map((f) => f.tipo === 'numero'
      ? `<a href="#/numero/${f.valor}">${f.valor}</a>`
      : `<a class="heb" dir="rtl" href="#/calc/${encodeURIComponent(f.valor)}">${esc(f.valor)}</a>`).join('')}</div>` : ''}`;

  const $e = document.getElementById('entrada');
  const calcular = adiar(async () => {
    history.replaceState(null, '', `#/calc/${encodeURIComponent($e.value)}`);
    const $s = document.getElementById('saida');
    let r;
    try {
      r = await api(`/api/gematria?metodo=${metodo}&q=${encodeURIComponent($e.value)}`);
    } catch (erro) {
      $s.innerHTML = `<p class="erro">${esc(erro.message)}</p>`;
      return;
    }
    if (!r.valor) { $s.innerHTML = ''; return; }
    const indexado = metodo === 'padrao' || metodo === 'gadol';
    $s.innerHTML = `
      <div class="resultado">
        ${indexado ? `<a class="valor-grande" href="#/numero/${r.valor}">${r.valor}</a>`
                   : `<span class="valor-grande">${r.valor}</span>`}
        ${botaoEstrela({ tipo: 'palavra', valor: r.texto })}
        <div class="fraco">
          ${metodo !== 'padrao' ? `Padrão <a href="#/numero/${r.padrao}">${r.padrao}</a><br>` : ''}
          ${metodo !== 'gadol' ? `Gadol <a href="#/numero/${r.gadol}">${r.gadol}</a>` : ''}
        </div>
        <div class="letras">${r.letras.map(([l, v]) => `<span><b>${l}</b><small>${v}</small></span>`).join('')}</div>
      </div>
      ${indexado ? `${ornamento(`Mesmo valor · ${r.equivalentes.length}`)}${cartoes(r.equivalentes)}`
                 : '<p class="fraco"><em>O dicionário indexa só os valores padrão e gadol.</em></p>'}`;
  });
  ligarTeclado($app, $e, calcular);
  ligarSeg($app, (_, v) => { metodo = v; calcular(); });
  if (inicial) calcular();
}
