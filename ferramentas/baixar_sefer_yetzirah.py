"""Baixa o Sefer Yetzirah do Sefaria e grava em cabala/dados/sefer_yetzirah.tsv.

Versões usadas (licenças conferidas na API do Sefaria):
  hebraico: "Sefer Yetzirah, Warsaw 1884"          — domínio público
  inglês:   "Sefaria Community Translation"         — CC0

Uso: python3 ferramentas/baixar_sefer_yetzirah.py [texto.json]
     (com um arquivo, lê o JSON já baixado da API em vez de baixar de novo)
"""
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SAIDA = Path(__file__).parent.parent / 'cabala' / 'dados' / 'sefer_yetzirah.tsv'
VERSOES = ['hebrew|Sefer Yetzirah, Warsaw 1884', 'english|Sefaria Community Translation']


def limpar(texto):
    """Tira notas de rodapé e tags HTML do texto do Sefaria."""
    texto = re.sub(r'<sup class="footnote-marker">.*?</sup>|<i class="footnote">.*?</i>', '', texto, flags=re.S)
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', '', texto)).split())


URL = 'https://www.sefaria.org/api/v3/texts/Sefer_Yetzirah?' + urllib.parse.urlencode(
    [('version', v) for v in VERSOES])


def baixar():
    try:
        with urllib.request.urlopen(URL, timeout=60) as r:
            return json.load(r)
    except urllib.error.URLError as erro:
        sys.exit(f'Não consegui baixar ({erro.reason}).\n'
                 'No Python do python.org para Mac, rode antes o "Install Certificates.command" da pasta do Python,\n'
                 f'ou baixe com: curl -o texto.json "{URL}" e passe o arquivo como argumento.')


def main():
    dados = json.load(open(sys.argv[1], encoding='utf-8')) if len(sys.argv) > 1 else baixar()
    textos = {v['language']: v['text'] for v in dados['versions']}
    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write('capitulo\tmishnah\thebraico\tingles\n')
        for c, (cap_he, cap_en) in enumerate(zip(textos['he'], textos['en']), 1):
            for m, (he, en) in enumerate(zip(cap_he, cap_en), 1):
                f.write(f'{c}\t{m}\t{limpar(he)}\t{limpar(en)}\n')
    print(f'{SAIDA.name}: {sum(len(c) for c in textos["he"])} mishnayot')


if __name__ == '__main__':
    main()
