"""Os 78 arcanos: regras da Golden Dawn + dados opcionais do Hermetic Kabbalah Tarot.

Os dados do HKT (equivalência em dados, corte <-> MBTI, geomancia) têm copyright e ficam em
cabala/dados/privado/, fora do repositório público. Sem essa pasta, o site funciona sem eles.
"""
import csv
from pathlib import Path

DADOS = Path(__file__).with_name('dados')
PRIVADO = DADOS / 'privado'

# numeração Golden Dawn (Força = VIII, Justiça = XI); caminho = número + 11
MAIORES = ['O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
           'Os Enamorados', 'O Carro', 'A Força', 'O Eremita', 'A Roda da Fortuna', 'A Justiça',
           'O Enforcado', 'A Morte', 'A Temperança', 'O Diabo', 'A Torre', 'A Estrela', 'A Lua',
           'O Sol', 'O Julgamento', 'O Mundo']

NAIPES = {'paus': 'Fogo', 'copas': 'Água', 'espadas': 'Ar', 'ouros': 'Terra'}
# corte: (nome, elemento da carta, Sefirá) — Rei/Chokmah, Rainha/Binah, Príncipe/Tiphareth, Princesa/Malkuth
CORTE = {11: ('Princesa', 'Terra', 10), 12: ('Príncipe', 'Ar', 6), 13: ('Rainha', 'Água', 3), 14: ('Rei', 'Fogo', 2)}
NUMEROS = {1: 'Ás', 2: 'Dois', 3: 'Três', 4: 'Quatro', 5: 'Cinco', 6: 'Seis', 7: 'Sete', 8: 'Oito', 9: 'Nove', 10: 'Dez'}

# --- Decanatos (Golden Dawn) ------------------------------------------------------------
SIGNOS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião',
          'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']
# os 36 decanatos seguem a ordem caldeia, começando por Marte no 1º decanato de Áries
CICLO = ['Marte', 'Sol', 'Vênus', 'Mercúrio', 'Lua', 'Saturno', 'Júpiter']
# signos de cada naipe: cardinal (cartas 2-4), fixo (5-7), mutável (8-10)
SIGNOS_DO_NAIPE = {'paus': ('Áries', 'Leão', 'Sagitário'), 'copas': ('Câncer', 'Escorpião', 'Peixes'),
                   'espadas': ('Libra', 'Aquário', 'Gêmeos'), 'ouros': ('Capricórnio', 'Touro', 'Virgem')}


def decanato(naipe, n):
    """2 de Paus -> 'Marte em Áries'; Ás -> os três signos do elemento; corte -> None."""
    signos = SIGNOS_DO_NAIPE[naipe]
    if n == 1:
        return ' · '.join(signos)
    if not 2 <= n <= 10:
        return None
    signo = signos[(n - 2) // 3]
    planeta = CICLO[(3 * SIGNOS.index(signo) + (n - 2) % 3) % 7]
    return f'{planeta} em {signo}'


# --- Dados opcionais do HKT ---------------------------------------------------------------
def _ler(caminho):
    with open(caminho, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE))


def tem_hkt():
    return (PRIVADO / 'hkt_menores.tsv').exists()


def hkt_menores():
    if not tem_hkt():
        return {}
    return {(h['naipe'], int(h['numero'])): h for h in _ler(PRIVADO / 'hkt_menores.tsv')}


def significados():
    return {s['id']: s for s in _ler(DADOS / 'significados.tsv')}


def cartas():
    sig = significados()
    for carta in _cartas():
        s = sig.get(carta['id'], {})
        yield {**carta, 'titulo': s.get('titulo'), 'palavras': s.get('palavras')}


def _cartas():
    for n, nome in enumerate(MAIORES):
        yield {'id': f'maior-{n:02d}', 'arcano': 'maior', 'numero': n, 'naipe': None, 'nome': nome,
               'caminho': n + 11, 'sefira': None, 'elemento': None, 'subelemento': None,
               'decanato': None, 'dados': None, 'mbti': None, 'mbti_titulo': None}
    hkt = hkt_menores()
    for naipe in NAIPES:
        for n in range(1, 15):
            if n in CORTE:
                titulo, elem_carta, sefira = CORTE[n]
                sub = f'{elem_carta} de {NAIPES[naipe]}'
            else:
                titulo, sefira, sub = NUMEROS[n], n, None
            h = hkt.get((naipe, n), {})
            yield {'id': f'{naipe}-{n:02d}', 'arcano': 'menor', 'numero': n, 'naipe': naipe,
                   'nome': f'{titulo} de {naipe.capitalize()}', 'caminho': None, 'sefira': sefira,
                   'elemento': NAIPES[naipe], 'subelemento': sub, 'decanato': decanato(naipe, n),
                   'dados': h.get('dados') or None, 'mbti': h.get('mbti') or None,
                   'mbti_titulo': h.get('mbti_titulo') or None}


def importar(conn):
    conn.executemany('INSERT INTO fontes VALUES (:id,:titulo,:autores,:ano,:uso,:licenca,:url)',
                     _ler(DADOS / 'fontes.tsv'))
    conn.executemany('''INSERT INTO cartas VALUES (:id,:arcano,:numero,:naipe,:nome,:caminho,:sefira,:elemento,
                        :subelemento,:decanato,:dados,:mbti,:mbti_titulo,:titulo,:palavras)''', list(cartas()))
    if (PRIVADO / 'geomancia.tsv').exists():
        conn.executemany('INSERT INTO geomancia VALUES (:nome,:linhas,:titulo,:planeta,:elemento,:signo,:numero,'
                         ':qualidade,:significado)', _ler(PRIVADO / 'geomancia.tsv'))
    conn.executemany('INSERT INTO runas VALUES (:ordem,:aett,:nome,:runa)', _ler(DADOS / 'runas.tsv'))
    conn.executemany('INSERT INTO tabua_esmeralda VALUES (:verso,:latim,:grego,:portugues)',
                     _ler(DADOS / 'tabua_esmeralda.tsv'))
