"""Quadrados mágicos planetários (Kameas de Agrippa) e traçado de sigilos.

Para traçar um nome, cada letra vira seu valor; se o valor não cabe no quadrado
(maior que n²), corta-se um zero (300 -> 30 -> 3), como na tradição de Agrippa
e da Golden Dawn. A linha liga as casas na ordem das letras.
"""
from .gematria import VALORES, FINAIS, normalizar

# planeta: (nome, símbolo, sefirá, quadrado, inteligência, espírito)
# inteligência e espírito: (hebraico, transliteração)
PLANETAS = {
    'saturno': ('Saturno', '♄', 'Binah', [[4, 9, 2], [3, 5, 7], [8, 1, 6]],
                ('אגיאל', 'Agiel'), ('זאזל', 'Zazel')),
    'jupiter': ('Júpiter', '♃', 'Chesed',
                [[4, 14, 15, 1], [9, 7, 6, 12], [5, 11, 10, 8], [16, 2, 3, 13]],
                ('יהפיאל', 'Yophiel'), ('הסמאל', 'Hismael')),
    'marte': ('Marte', '♂', 'Geburah',
              [[11, 24, 7, 20, 3], [4, 12, 25, 8, 16], [17, 5, 13, 21, 9],
               [10, 18, 1, 14, 22], [23, 6, 19, 2, 15]],
              ('גראפיאל', 'Graphiel'), ('ברצבאל', 'Bartzabel')),
    'sol': ('Sol', '☉', 'Tiphareth',
            [[6, 32, 3, 34, 35, 1], [7, 11, 27, 28, 8, 30], [19, 14, 16, 15, 23, 24],
             [18, 20, 22, 21, 17, 13], [25, 29, 10, 9, 26, 12], [36, 5, 33, 4, 2, 31]],
            ('נכיאל', 'Nakhiel'), ('סורת', 'Sorath')),
    'venus': ('Vênus', '♀', 'Netzach',
              [[22, 47, 16, 41, 10, 35, 4], [5, 23, 48, 17, 42, 11, 29], [30, 6, 24, 49, 18, 36, 12],
               [13, 31, 7, 25, 43, 19, 37], [38, 14, 32, 1, 26, 44, 20], [21, 39, 8, 33, 2, 27, 45],
               [46, 15, 40, 9, 34, 3, 28]],
              ('הגיאל', 'Hagiel'), ('קדמאל', 'Kedemel')),
    'mercurio': ('Mercúrio', '☿', 'Hod',
                 [[8, 58, 59, 5, 4, 62, 63, 1], [49, 15, 14, 52, 53, 11, 10, 56],
                  [41, 23, 22, 44, 45, 19, 18, 48], [32, 34, 35, 29, 28, 38, 39, 25],
                  [40, 26, 27, 37, 36, 30, 31, 33], [17, 47, 46, 20, 21, 43, 42, 24],
                  [9, 55, 54, 12, 13, 51, 50, 16], [64, 2, 3, 61, 60, 6, 7, 57]],
                 ('טיריאל', 'Tiriel'), ('תפתרתרת', 'Taphthartharath')),
    'lua': ('Lua', '☽', 'Yesod',
            [[37, 78, 29, 70, 21, 62, 13, 54, 5], [6, 38, 79, 30, 71, 22, 63, 14, 46],
             [47, 7, 39, 80, 31, 72, 23, 55, 15], [16, 48, 8, 40, 81, 32, 64, 24, 56],
             [57, 17, 49, 9, 41, 73, 33, 65, 25], [26, 58, 18, 50, 1, 42, 74, 34, 66],
             [67, 27, 59, 10, 51, 2, 43, 75, 35], [36, 68, 19, 60, 11, 52, 3, 44, 76],
             [77, 28, 69, 20, 61, 12, 53, 4, 45]],
            ('חשמודאי', 'Chashmodai'), None),
}


def resumo(chave):
    nome, simbolo, sefira, q, intel, espirito = PLANETAS[chave]
    n = len(q)
    return {'chave': chave, 'nome': nome, 'simbolo': simbolo, 'sefira': sefira, 'n': n,
            'quadrado': q, 'constante': n * (n * n + 1) // 2, 'total': n * n * (n * n + 1) // 2,
            'nomes': [{'papel': papel, 'hebraico': h, 'translit': t}
                      for papel, x in (('Inteligência', intel), ('Espírito', espirito)) if x
                      for h, t in [x]]}


def reduzir(valor, maximo):
    """Corta zeros até o valor caber no quadrado: 300 -> 30 -> 3."""
    while valor > maximo and valor % 10 == 0:
        valor //= 10
    return valor


def sigilo(chave, texto):
    """Sequência de casas [(letra, valor, reduzido, linha, coluna)] para traçar o nome."""
    q = PLANETAS[chave][3]
    n = len(q)
    posicao = {q[i][j]: (i, j) for i in range(n) for j in range(n)}
    passos = []
    for letra in normalizar(texto):
        base = FINAIS[letra][0] if letra in FINAIS else letra
        valor = VALORES[base]
        r = reduzir(valor, n * n)
        lin, col = posicao.get(r, (None, None))
        passos.append({'letra': letra, 'valor': valor, 'reduzido': r, 'linha': lin, 'coluna': col})
    return passos
