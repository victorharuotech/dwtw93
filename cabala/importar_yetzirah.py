"""Importa as palavras do Sefer Yetzirah (cabala/dados/sefer_yetzirah.tsv, gerado por
ferramentas/baixar_sefer_yetzirah.py a partir do Sefaria).

Cada palavra distinta entra no dicionário com o trecho em que aparece pela primeira vez
e a referência da mishnah, que vira um link para o texto no Sefaria.
"""
import csv
from pathlib import Path

from .gematria import normalizar

ARQUIVO = Path(__file__).with_name('dados') / 'sefer_yetzirah.tsv'
FONTE = 'Sefer Yetzirah'


def mishnayot():
    with open(ARQUIVO, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE))


def importar(conn, adicionar_palavra):
    vistas = set()
    for m in mishnayot():
        palavras = [normalizar(t) for t in m['hebraico'].split()]
        palavras = [p for p in palavras if p]
        for i, palavra in enumerate(palavras):
            if len(palavra) < 2 or palavra in vistas:
                continue
            vistas.add(palavra)
            trecho = ' '.join(palavras[max(0, i - 2):i + 3])
            adicionar_palavra(conn, palavra, None, f'«{trecho}»', FONTE,
                              referencia=f"Sefer_Yetzirah.{m['capitulo']}.{m['mishnah']}")
    return len(vistas)
