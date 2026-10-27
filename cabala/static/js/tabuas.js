// Tábuas: geomancia, runas e horas planetárias (dados do Hermetic Kabbalah Tarot).
import { $app, api, esc, ornamento } from './util.js';

// Figura geomântica em SVG: cada linha tem um ponto (1) ou dois (2)
function figura(linhas, tam = 64) {
  const pontos = [...linhas].map((n, i) => {
    const y = 12 + i * 15;
    return n === '1' ? `<circle cx="${tam / 2}" cy="${y}" r="4.5"/>`
      : `<circle cx="${tam / 2 - 11}" cy="${y}" r="4.5"/><circle cx="${tam / 2 + 11}" cy="${y}" r="4.5"/>`;
  }).join('');
  return `<svg class="geo" viewBox="0 0 ${tam} 70" width="${tam}" height="70">${pontos}</svg>`;
}

// Ordem caldeia (do mais lento ao mais rápido); a 1ª hora de cada dia é do regente do dia
const CALDEIA = ['Saturno', 'Júpiter', 'Marte', 'Sol', 'Vênus', 'Mercúrio', 'Lua'];
const DIAS = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];   // domingo..sábado
const SIMB = { Saturno: '♄', Júpiter: '♃', Marte: '♂', Sol: '☉', Vênus: '♀', Mercúrio: '☿', Lua: '☽' };
const regente = (dia, hora) => CALDEIA[(CALDEIA.indexOf(DIAS[dia]) + hora) % 7];

function horasPlanetarias() {
  // como na apostila: aproximação com o nascer do Sol às 06:00 e horas iguais de 60 minutos
  const agora = new Date();
  const desde6 = (agora.getHours() - 6 + 24) % 24;
  const diaPlanetario = (agora.getDay() + (agora.getHours() < 6 ? 6 : 0)) % 7;
  const linhas = Array.from({ length: 24 }, (_, h) => {
    const relogio = `${String((h + 6) % 24).padStart(2, '0')}:00`;
    return `<tr class="${h === desde6 ? 'agora' : ''}"><td>${relogio}</td>${DIAS.map((_, d) => {
      const p = regente(d, h);
      return `<td class="${h === desde6 && d === diaPlanetario ? 'atual' : ''}" title="${p}">${SIMB[p]}︎</td>`;
    }).join('')}</tr>${h === 11 ? `<tr><td colspan="8" class="separador">noite</td></tr>` : ''}`;
  }).join('');
  const atual = regente(diaPlanetario, desde6);
  return `<p>Agora, aproximadamente: hora de <b>${SIMB[atual]}︎ ${atual}</b> no dia de ${DIAS[diaPlanetario]}.</p>
    <div class="tabela-wrap"><table class="t777 horas"><tr><th>Hora</th>${DIAS.map((d) => `<th>${SIMB[d]}︎ ${d}</th>`).join('')}</tr>${linhas}</table></div>`;
}

export async function telaTabuas() {
  const t = await api('/api/tabuas');
  const aetts = [...new Set(t.runas.map((r) => r.aett))];
  $app.innerHTML = `
    <h1>Tábuas</h1>
    <p class="sub">${t.geomancia.length ? 'Geomancia, runas e horas planetárias, como compiladas no Hermetic Kabbalah Tarot.'
      : 'Runas e horas planetárias.'}</p>
    ${!t.geomancia.length ? '' : `${ornamento('As 16 Figuras Geomânticas')}
    <div class="controle"><button class="botao primario" id="gerar" type="button">Lançar uma figura</button>
      <span class="fraco" id="lance-geo"></span></div>
    <div class="geomancia">${t.geomancia.map((g) => `
      <div class="cartao figura" data-linhas="${g.linhas}">
        ${figura(g.linhas)}
        <div><h3>${esc(g.nome)}</h3><p class="fraco"><em>${esc(g.titulo)}</em> · ${esc(g.qualidade)}</p>
        <div class="chips">${[g.planeta, g.elemento, g.signo, g.numero && `nº ${g.numero}`].filter(Boolean)
          .map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
        <p>${esc(g.significado)}</p></div>
      </div>`).join('')}</div>
    <p class="legenda">Linhas, de cima para baixo: cabeça (Fogo), pescoço (Ar), corpo (Água) e pés (Terra).</p>`}

    ${ornamento('Runas · Futhark Antigo')}
    ${aetts.map((a) => `<h3 class="aett">Aett de ${esc(a)}</h3><div class="runas">${t.runas.filter((r) => r.aett === a)
      .map((r) => `<div class="runa"><b>${r.runa}</b><small>${esc(r.nome)}</small></div>`).join('')}</div>`).join('')}

    ${ornamento('Horas Planetárias')}
    ${horasPlanetarias()}

    <p class="credito">${t.geomancia.length ? `Fonte: Hermetic Kabbalah Tarot — Simbologia Básica & Compilações, © 2013 Marcelo Del Debbio e
      Rodrigo A. Grola. Geomancia na tradição de Agrippa e Franz Hartmann.`
      : 'Runas do Futhark Antigo; horas planetárias pela ordem caldeia (tradição astrológica).'} <a href="#/creditos">Créditos</a></p>`;

  document.getElementById('gerar')?.addEventListener('click', () => {
    const linhas = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 2)).join('');
    const alvo = $app.querySelector(`[data-linhas="${linhas}"]`);
    $app.querySelectorAll('.figura').forEach((f) => f.classList.toggle('sel', f === alvo));
    document.getElementById('lance-geo').textContent = `→ ${alvo.querySelector('h3').textContent}`;
    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
