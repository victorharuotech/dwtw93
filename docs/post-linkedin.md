# Post de lançamento — LinkedIn

Anexe `DWTW93-carrossel-linkedin.pdf` como **documento** (o LinkedIn o mostra como carrossel).
Coloque os links (demo e GitHub) no **primeiro comentário**: posts sem link externo no corpo costumam ter mais alcance.

---

Transformei livros esotéricos de mais de cem anos em um site interativo — e usei a própria matemática do assunto para validar os dados. 📜→💻

Apresento o **DWTW93**, um dicionário cabalístico interativo.

O desafio: o *Liber 777* (1909) e o *Sepher Sephiroth* (1912), de Aleister Crowley, só existem como PDFs antigos, com tabelas em duas colunas e o hebraico numa fonte legada, que aparece como letras latinas invertidas.

O que construí:
🔹 Um pipeline de extração que lê as coordenadas de cada linha do PDF, reconstrói o layout e decodifica a fonte antiga (Python + Swift/PDFKit)
🔹 Validação com a própria regra do domínio: na guematria, cada letra hebraica tem um valor, então um verbete só entra no banco se as letras somarem o número sob o qual ele aparece — 2.327 validados e 79 erros do PDF corrigidos
🔹 Um banco SQLite com as tábuas de correspondência (modelo EAV), o Sefer Yetzirah (via Sefaria) e os 78 arcanos do Tarô
🔹 Uma API em Flask e uma interface em JavaScript puro: Árvore da Vida em SVG, consulta ao Tarô (1 carta, 3 cartas e Cruz Celta), sigilos nos quadrados de Agrippa e a Tábua de Esmeralda em latim, grego e português
🔹 77 testes automatizados com pytest

Stack: Python · SQL · Flask · JavaScript · SVG

Todas as fontes estão creditadas no site: Aleister Crowley, a Golden Dawn, Marcelo Del Debbio e Rodrigo A. Grola (Hermetic Kabbalah Tarot) e o Sefaria. Desenvolvido com o Claude Code como assistente de programação.

Projeto pessoal de quem estuda Sistemas de Informação na FIAP e a tradição hermética — "o que está embaixo é como o que está em cima". ✦

#Python #SQL #DataEngineering #ETL #Flask #JavaScript #FIAP #SistemasDeInformação

---

**Primeiro comentário:**

🔗 Demo: https://dwtw93.onrender.com  (o primeiro acesso pode levar ~30 s: o servidor gratuito "acorda")
💻 Código: https://github.com/SEU-USUARIO/dwtw93
