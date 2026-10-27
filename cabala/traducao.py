"""Tradução dos significados do Sepher Sephiroth para o português.

1. Glossário (cabala/dados/traducoes_sepher.tsv): texto original exato -> português.
2. Regras para os padrões repetidos ("Angel of 2nd Dec. a", "Qliphoth of Hod"...).
Sem tradução, o texto original continua sendo usado.
"""
import csv
import re
from pathlib import Path

ARQUIVO = Path(__file__).with_name('dados') / 'traducoes_sepher.tsv'

# na fonte do Sepher Sephiroth, as letras a..l são os glifos dos signos
GLIFOS = dict(zip('abcdefghijkl', ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra',
                                   'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']))
NAIPES = {'C': 'Copas', 'P': 'Ouros', 'S': 'Espadas', 'W': 'Paus'}
PALAVRAS = {'Mars': 'Marte', 'Water': 'Água', 'Fire': 'Fogo', 'Air': 'Ar', 'Earth': 'Terra', 'Sun': 'Sol',
            'Sol': 'Sol', 'Moon': 'Lua', 'Luna': 'Lua', 'Venus': 'Vênus', 'Mercury': 'Mercúrio',
            'Jupiter': 'Júpiter', 'Saturn': 'Saturno', 'the': 'o'}
PREFIXOS = {'Qliphoth': 'Qliphoth de', 'Archangel': 'Arcanjo de', 'Angel': 'Anjo de', 'Angels': 'Anjos de',
            'Heaven': 'Céu de', 'Earth': 'Terra de', 'Ruler': 'Regente de', 'Father': 'Pai de',
            'Briatic Palace': 'Palácio de Briah de', 'Geomantic Intelligence': 'Inteligência geomântica de'}
QUEM = {'Angel': 'Anjo', 'Day Demon': 'Demônio diurno', 'Night Demon': 'Demônio noturno'}


# glifos de planetas e elementos na mesma fonte (iguais aos do 777)
GLIFOS.update({'!': 'Sol', '#': 'Mercúrio', '$': 'Vênus', '%': 'Marte', '&': 'Júpiter', "'": 'Saturno',
               '=': 'Lua', 'B': 'Fogo', 'C': 'Água', 'D': 'Ar', 'E': 'Terra'})
# só traduzimos alvos feitos destas palavras; qualquer outra coisa mantém o original
NOMES_PROPRIOS = {'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphareth', 'Netzach', 'Hod', 'Jesod',
                  'Yesod', 'Malkuth', 'Daath', 'Atziluth', 'Briah', 'Yetzirah', 'Assiah'}


def _alvo(texto):
    """'Hod of Briah' -> 'Hod de Briah'; 'j' -> 'Capricórnio'; 'Mars' -> 'Marte'. None se não souber."""
    if texto in GLIFOS:
        return GLIFOS[texto]
    palavras = re.findall(r'[A-Za-z]+', texto)
    if re.search(r'[^A-Za-z ,]', texto) or any(
            p not in NOMES_PROPRIOS and p not in PALAVRAS and p not in ('of', 'and') for p in palavras):
        return None
    texto = re.sub(r',? and of ', ' e de ', texto)
    texto = texto.replace(' of ', ' de ').replace(' and ', ' e ')
    return re.sub(r'\b[A-Za-z]+\b', lambda m: PALAVRAS.get(m.group(0), m.group(0)), texto)


REGRAS = [
    (r'^\[Vide (.+)\]$', lambda m: f'[Ver {m[1]}]'),
    (r'^(Angel|Day Demon|Night Demon) of (\d+)(?:st|nd|rd|th) Dec\. ([a-l])$',
     lambda m: f'{QUEM[m[1]]} do {m[2]}º decanato de {GLIFOS[m[3]]}'),
    (r'^Angel of (\d+) ([CPSW])\.$', lambda m: f'Anjo do {m[1]} de {NAIPES[m[2]]}'),
    (r'^A (King|Duke) of Edom(.*)$',
     lambda m: f"Um {'rei' if m[1] == 'King' else 'duque'} de Edom{m[2].replace('[Vide', '[Ver')}"),
    (r'^Tet\. in (.+)$', lambda m: _alvo(m[1]) and f'Tetragrammaton em {_alvo(m[1])}'),
    (r'^(' + '|'.join(sorted(PREFIXOS, key=len, reverse=True)) + r') of (.+?)\.?$',
     lambda m: _alvo(m[2]) and f'{PREFIXOS[m[1]]} {_alvo(m[2])}'),
]


def carregar_glossario():
    if not ARQUIVO.exists():
        return {}
    with open(ARQUIVO, encoding='utf-8', newline='') as f:
        return {r['original']: r['pt'] for r in csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE)}


def traduzir(texto, glossario):
    """Devolve a tradução, ou None quando não houver (aí fica o original)."""
    if texto in glossario:
        return glossario[texto]
    for padrao, montar in REGRAS:
        m = re.match(padrao, texto)
        if m and (traducao := montar(m)):
            return traducao
    return None
