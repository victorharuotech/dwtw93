"""Importa as colunas transcritas do 777 Revised (cabala/dados/777*.tsv).

Formato de 777.tsv: coluna <TAB> linha <TAB> valor
  - linha: '0'..'32', '32b' (32 bis) ou '31b' (31 bis)
  - nas colunas hebraicas, cada item é 'bruto | transliteração', separados por ' ; ',
    com 'bruto' na fonte legada do PDF (ver fonte777.py). Itens sem ' | ' são texto.
"""
import csv
from pathlib import Path

from .fonte777 import decodificar

DADOS = Path(__file__).with_name('dados')
LINHAS = {**{str(n): n for n in range(33)}, '32b': 33, '31b': 34}


def _ler(nome):
    with open(DADOS / nome, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE))


def _itens_hebraicos(valor):
    """'bruto | translit ; ...' -> [(hebraico, translit) ou (None, texto)]"""
    for item in valor.split(' ; '):
        if ' | ' in item:
            bruto, translit = item.split(' | ', 1)
            yield decodificar(bruto.strip()), translit.strip()
        else:
            yield None, item.strip()


def importar(conn, adicionar_palavra):
    colunas = {int(c['id']): c for c in _ler('777_colunas.tsv')}
    conn.executemany(
        "INSERT INTO colunas (id, romano, nome, nome_original, descricao, origem) VALUES (?,?,?,?,?, '777')",
        [(i, c['romano'], c['titulo_pt'], c['titulo'], f"Liber 777, col. {c['romano']}") for i, c in colunas.items()])

    celulas = {(int(r['coluna']), LINHAS[r['linha']]): r['valor'] for r in _ler('777.tsv')}
    # traduções para o português (777_pt.tsv); o original em inglês fica guardado ao lado
    pt = {(int(r['coluna']), LINHAS[r['linha']]): r['valor'] for r in _ler('777_pt.tsv')}
    nomes = dict(conn.execute('SELECT numero, nome FROM caminhos').fetchall())

    for (col, linha), valor in celulas.items():
        meta = colunas[col]
        if meta['hebraico'] == '1':
            itens = list(_itens_hebraicos(valor))
            exibido = ' ; '.join(f'{h} ({t})' if h else t for h, t in itens)
            chave_trad = (int(meta['traducao']), linha) if meta['traducao'] else None
            traducao = pt.get(chave_trad) or celulas.get(chave_trad)
            for h, t in itens:
                if h:
                    adicionar_palavra(conn, h, t, traducao or f"{meta['titulo_pt']} — {nomes[linha]}",
                                      f"777 col. {meta['romano']}")
        else:
            exibido = valor
        if (col, linha) in pt:
            conn.execute('INSERT INTO correspondencias VALUES (?,?,?,?)', (linha, col, pt[(col, linha)], exibido))
        else:
            conn.execute('INSERT INTO correspondencias VALUES (?,?,?,NULL)', (linha, col, exibido))
    return len(celulas)
