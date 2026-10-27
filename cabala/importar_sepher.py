"""Importa cabala/dados/sepher_sephiroth.tsv (gerado por ferramentas/parse_sepher.py).

Verbetes cujo hebraico não confere com o número (erros do PDF) podem ser consertados
em cabala/dados/correcoes_sepher.tsv; cada correção é conferida pela guematria.
"""
import csv
from pathlib import Path

from .gematria import gematria
from .traducao import carregar_glossario, traduzir

DADOS = Path(__file__).with_name('dados')
FONTE = 'Sepher Sephiroth'


def _ler(nome):
    with open(DADOS / nome, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE))


def carregar_correcoes():
    correcoes = {}
    for c in _ler('correcoes_sepher.tsv'):
        valor = int(c['valor'])
        if gematria(c['correto']) != valor:
            raise ValueError(f"correcoes_sepher.tsv: {c['correto']} vale {gematria(c['correto'])}, "
                             f"não {valor}")
        correcoes[(valor, c['errado'])] = c['correto']
    return correcoes


def importar(conn, adicionar_palavra):
    correcoes = carregar_correcoes()
    glossario = carregar_glossario()
    usadas, notas = set(), []
    for l in _ler('sepher_sephiroth.tsv'):
        valor, heb = int(l['valor']), l['hebraico']
        original = l['significado'] or '—'
        pt = traduzir(original, glossario)
        significado, original = (pt, original) if pt else (original, None)
        if l['metodo'] in ('padrao', 'gadol'):
            # verbete validado: a guematria do hebraico confere com o número do livro
            adicionar_palavra(conn, heb, None, significado, FONTE, original)
        elif (valor, heb) in correcoes:
            usadas.add((valor, heb))
            adicionar_palavra(conn, correcoes[(valor, heb)], None, significado,
                              f'{FONTE} (corrigido; PDF: {heb})', original)
        else:
            notas.append((valor, heb or None, l['significado'], l['metodo'], FONTE))
    conn.executemany('INSERT INTO notas (valor, hebraico, texto, tipo, fonte) VALUES (?,?,?,?,?)', notas)
    return set(correcoes) - usadas   # correções que não encontraram o verbete
