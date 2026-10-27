// Início: apresentação, conceitos, fontes, manual de uso e quem desenvolveu.
import { $app, api, config, esc, ornamento } from './util.js';

const CONCEITOS = [
  ['Cabala Hermética', '#/arvore',
    'A leitura ocidental da Cabala judaica, misturada à astrologia, à alquimia e ao tarô pelos ocultistas do Renascimento e, depois, pela Golden Dawn. Seu mapa é a Árvore da Vida.'],
  ['Árvore da Vida', '#/arvore',
    'Dez esferas (Sefirot), de Kether, a Coroa, a Malkuth, o Reino, ligadas por 22 caminhos, um para cada letra hebraica. Junto com elas, são os "32 caminhos da sabedoria".'],
  ['Guematria', '#/calc',
    'Cada letra hebraica tem um valor numérico, e palavras de mesmo valor são consideradas relacionadas (isopsefia): אחד (Um) e אהבה (Amor) valem 13. Há vários métodos de contagem: padrão, Gadol, Katan e ordinal.'],
  ['Correspondências (Liber 777)', '#/777',
    'Tábuas que associam a cada Sefirá e a cada caminho um nome divino, um anjo, uma cor, uma pedra, um perfume, um deus de outros panteões… É um dicionário de símbolos organizado pela Árvore.'],
  ['Dicionário por número', '#/numero/418',
    'O Sepher Sephiroth lista palavras hebraicas por valor numérico, do 1 ao 3321. Navegar por ele é ir de número em número, descobrindo as palavras que compartilham o mesmo valor.'],
  ['Temurah e Notariqon', '#/ferramentas',
    'Técnicas de permutação: Temurah troca letras por um alfabeto cifrado (Atbash, Albam, Avgad); Notariqon lê as iniciais ou as finais de uma frase. AGLA, por exemplo, é o Notariqon de "Atah Gibor Le-olam Adonai".'],
  ['Quadrados mágicos e sigilos', '#/sigilos',
    'Os sete Kameas planetários, de Agrippa, são quadrados em que linhas, colunas e diagonais somam o mesmo número. Traçar as letras de um nome sobre eles gera o sigilo desse nome.'],
  ['O Tarô na Árvore', '#/tarot',
    'Os 22 Arcanos Maiores correspondem aos 22 caminhos e às letras hebraicas. Os Menores ocupam as Sefirot: o Ás está em Kether, o Dez em Malkuth, e as cartas da corte, nos quatro mundos.'],
  ['A consulta ao Tarô', '#/consulta',
    'As tiragens de 1 carta, de 3 cartas (passado, presente e futuro) e a Cruz Celta de dez casas. No método europeu, cada casa recebe um Arcano Maior e um Menor; no americano, as 78 cartas vêm misturadas.'],
  ['Runas e horas planetárias', '#/tabuas',
    'O Futhark Antigo, com suas 24 runas em três famílias (Aetts), e as horas planetárias, em que cada hora do dia é regida por um planeta, seguindo a ordem caldeia.'],
];

const FONTES = [
  ['Aleister Crowley', '1875–1947',
    'Ocultista inglês, membro da Golden Dawn desde 1898 e fundador da Thelema. Publicou o <em>Liber 777</em> (1909), a grande tábua de correspondências que estrutura este site, e o <em>Sepher Sephiroth</em> (1912), dicionário de palavras hebraicas por valor numérico, baseado no trabalho de Allan Bennett.'],
  ['Hermetic Order of the Golden Dawn', 'fundada em 1888',
    'Ordem fundada em Londres por William Wynn Westcott, S. L. MacGregor Mathers e William Robert Woodman. Reuniu Cabala, astrologia, tarô, alquimia e magia cerimonial num único sistema, de onde vêm as atribuições usadas aqui: caminhos, escalas de cor, decanatos e o método de traçar sigilos. Entre seus membros estiveram W. B. Yeats, A. E. Waite, Pamela Colman Smith e o próprio Crowley.'],
  ['Marcelo Del Debbio e Rodrigo A. Grola', 'Hermetic Kabbalah Tarot, 2013',
    'Autores brasileiros do <em>Hermetic Kabbalah Tarot</em>, baralho e material de estudo que integram Cabala hermética, tarô, astrologia, runas e geomancia. É deles a equivalência entre os 56 Arcanos Menores e as 56 combinações de três dados.'],
];

const MANUAL = [
  ['Busca', 'A caixa no topo entende o que você digita: um número abre a página do número, uma palavra em hebraico vai para a calculadora, e uma palavra em português ou inglês busca nos significados.'],
  ['Calculadora', 'Digite em hebraico ou use o teclado na tela. O valor aparece na hora, letra por letra, junto com as palavras de mesmo valor. Troque o método de contagem nos botões e marque favoritos com ★.'],
  ['Números', 'Cada número reúne suas palavras, a fatoração, a redução teosófica e, se houver, o caminho e a letra. Use ← → para folhear e clique em qualquer número citado num texto para ir até ele.'],
  ['Árvore', 'Clique numa Sefirá ou num caminho para ver todas as suas correspondências e as cartas do Tarô ligadas a ele. Troque a escala de cor, os rótulos e as camadas (Pilares, Espada Flamejante, Serpente da Sabedoria).'],
  ['Tarô', 'Filtre por Maiores ou por naipe e clique numa carta: aparecem a letra, o caminho, a Sefirá, o decanato e as cartas da mesma esfera.'],
  ['Consulta', 'Escolha a tiragem (1 carta, 3 cartas ou Cruz Celta) e o método: europeu (um Arcano Maior e um Menor por casa) ou americano (as 78 cartas misturadas). Embaralhe e revele as casas uma a uma: abaixo da mesa aparece a leitura, casa por casa.'],
  ['Sigilos', 'Escolha um planeta, escreva um nome (ou use os botões da Inteligência e do Espírito) e veja o traço sobre o quadrado. Dá para mostrar numerais hebraicos, esconder a grade e baixar o sigilo em SVG.'],
  ['Ferramentas', 'Compare duas palavras em quatro métodos, aplique as cifras de Temurah e extraia o Notariqon de uma frase. O teclado escreve no último campo em que você clicou.'],
  ['Tabela 777', 'Escolha até oito colunas do Liber 777 e compare-as lado a lado, linha por linha da Árvore.'],
];

export async function telaInicio() {
  const [{ publico }, tabua] = await Promise.all([config(), api('/api/esmeralda')]);
  const v2 = tabua.find((v) => v.verso === 2);
  $app.innerHTML = `
    <section class="heroi">
      <img src="/static/img/logo.png" alt="Logo DWTW93: o falcão de Hórus com o disco solar" width="200" height="200">
      <div>
        <h1>DWTW<em>93</em></h1>
        <p class="lema">Um dicionário cabalístico interativo: a Árvore da Vida, a guematria, o Tarô e os sigilos planetários
          num só lugar, construído a partir dos textos clássicos da tradição hermética.</p>
        <div class="controle">
          <a class="botao primario" href="#/calc">Abrir a calculadora</a>
          <a class="botao" href="#/arvore">Explorar a Árvore</a>
          <a class="botao" href="#inicio-manual">Como usar</a>
        </div>
      </div>
    </section>

    ${ornamento('A pedra fundamental')}
    <a class="cartao pedra" href="#/esmeralda">
      <p class="sub">A Tábua de Esmeralda, atribuída a Hermes Trismegisto, é o alicerce de todo este trabalho:</p>
      <div class="tres-linguas">
        <p lang="la">${esc(v2.latim)}</p><p lang="grc">${esc(v2.grego)}</p><p lang="pt">${esc(v2.portugues)}</p>
      </div>
      <span class="abrir">Ler a Tábua completa, em latim, grego e português →</span>
    </a>

    ${ornamento('Os conceitos')}
    <div class="conceitos">${CONCEITOS.map(([t, link, txt]) => `
      <a class="cartao conceito" href="${link}"><h3>${t}</h3><p>${txt}</p><span class="abrir">Abrir →</span></a>`).join('')}
    </div>

    ${ornamento('As fontes')}
    <p class="sub">Todo o conteúdo vem destas obras. A lista completa, com licenças, está em <a href="#/creditos">Créditos</a>.</p>
    <div class="fontes-intro">${FONTES.map(([nome, data, txt]) => `
      <div class="cartao"><h3>${nome}</h3><p class="fraco"><em>${data}</em></p><p>${txt}</p></div>`).join('')}
    </div>
    ${publico ? `<p class="legenda">Nesta versão pública, os dados autorais do Hermetic Kabbalah Tarot ficam ocultos até a
      autorização dos autores.</p>` : ''}

    <div id="inicio-manual">${ornamento('Manual de uso')}</div>
    <div class="manual">${MANUAL.map(([t, txt], i) => `
      <div class="passo"><span class="num">${i + 1}</span><div><h3>${t}</h3><p>${txt}</p></div></div>`).join('')}
    </div>

    ${ornamento('Quem desenvolveu')}
    <div class="cartao autor">
      <img src="/static/img/logo-128.png" alt="" width="72" height="72">
      <div>
        <h3>Victor Haruo</h3>
        <p class="fraco"><em>Magista, estudante de Sistemas de Informação na FIAP e leitor ávido</em></p>
        <p>O DWTW93 nasceu da vontade de juntar dois mundos: o estudo da tradição hermética e a programação. A ideia era
          tirar o <em>Liber 777</em> e o <em>Sepher Sephiroth</em> dos PDFs antigos e transformá-los numa ferramenta
          viva, em que um número leva a uma palavra, a palavra leva a um caminho da Árvore, e o caminho leva a uma carta do Tarô.</p>
        <p>O conceito, a curadoria das fontes e a direção do projeto são de Victor. O código foi desenvolvido com o
          <b>Claude Code</b> como assistente de programação: Python e SQL para extrair e validar os dados, Flask e
          JavaScript para a interface.</p>
      </div>
    </div>`;
  // o link "Como usar" rola até o manual sem trocar de rota
  $app.querySelector('a[href="#inicio-manual"]').addEventListener('click', (ev) => {
    ev.preventDefault();
    document.getElementById('inicio-manual').scrollIntoView({ behavior: 'smooth' });
  });
}
