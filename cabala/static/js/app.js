// DWTW93 — roteador. Rotas por hash:
// #/inicio #/calc/<texto> #/ferramentas #/numero/<n> #/arvore/<chave> #/sigilos/<planeta>/<texto>
// #/777/<colunas> #/buscar/<termo> #/tarot/<carta> #/consulta #/tabuas #/esmeralda #/creditos
import { telaArvore } from './arvore.js';
import { telaCalc } from './calc.js';
import { telaConsulta } from './consulta.js';
import { telaCreditos } from './creditos.js';
import { telaEsmeralda } from './esmeralda.js';
import { telaFerramentas } from './ferramentas.js';
import { telaInicio } from './inicio.js';
import { telaBuscar, telaNumero } from './numero.js';
import { telaSigilos } from './sigilos.js';
import { telaTabuas } from './tabuas.js';
import { telaTarot } from './tarot.js';
import { tela777 } from './t777.js';
import { $app, ehHebraico, esc } from './util.js';

const TELAS = { inicio: telaInicio, calc: telaCalc, ferramentas: telaFerramentas, numero: telaNumero, arvore: telaArvore,
  sigilos: telaSigilos, 777: tela777, buscar: telaBuscar, tarot: telaTarot, tabuas: telaTabuas,
  creditos: telaCreditos, consulta: telaConsulta, esmeralda: telaEsmeralda };

let abaAtual = null;
async function rotear() {
  const [, aba = 'inicio', ...resto] = location.hash.split('/');
  const args = resto.map(decodeURIComponent);
  document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('ativa', a.dataset.aba === aba));
  try {
    await (TELAS[aba] || telaInicio)(...args);
  } catch (erro) {
    $app.innerHTML = `<p class="erro">${esc(erro.message)}</p>`;
  }
  if (aba !== abaAtual) window.scrollTo(0, 0);
  abaAtual = aba;
}
window.addEventListener('hashchange', rotear);

document.getElementById('busca').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const q = ev.target.q.value.trim();
  if (!q) return;
  if (/^\d+$/.test(q)) location.hash = `#/numero/${q}`;
  else if (ehHebraico(q)) location.hash = `#/calc/${encodeURIComponent(q)}`;
  else location.hash = `#/buscar/${encodeURIComponent(q)}`;
  ev.target.q.value = '';
});

// Textos longos (ex.: o comentário de ABRAHADABRA) abrem ao clicar
$app.addEventListener('click', (ev) => {
  if (ev.target.classList.contains('longo')) ev.target.classList.toggle('aberto');
});

rotear();
