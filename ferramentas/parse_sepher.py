"""Converte as linhas extraídas do PDF do Sepher Sephiroth em verbetes.

Uso:
    swift ferramentas/linhas_pdf.swift "Liber Sepher Sephiroth.pdf" > linhas.tsv
    python3 ferramentas/parse_sepher.py linhas.tsv > cabala/dados/sepher_sephiroth.tsv

Layout do livro: duas colunas por página; o número fica na borda direita de cada
coluna e os verbetes (inglês/latim à esquerda, hebraico à direita) vêm abaixo dele.
O hebraico está na fonte legada (ver cabala/fonte777.py). Cada verbete é validado:
o trecho hebraico tem de somar exatamente o número sob o qual está.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from cabala.fonte777 import decodificar, decodificar_embutido  # noqa: E402
from cabala.gematria import gematria  # noqa: E402

PRIMEIRA_PAGINA = 17
TOPO = 770                     # acima disto: cabeçalho e número de página
MEIO = 296                     # x que separa as duas colunas
ZONA_NUMERO = {'E': (262, 292), 'D': (510, 542)}
NUMERO = re.compile(r'^(?P<prefixo>.*?)\s*(?P<n>\d+)$')
HEBRAICO = set('abgdhwvzjfyikl]m\\n}sop[x{qrct')


def ler(caminho):
    for linha in open(caminho, encoding='utf-8'):
        pag, x0, y0, x1, texto = linha.rstrip('\n').split('\t', 4)
        yield int(pag), int(x0), int(y0), int(x1), texto.strip()


def eh_numero(col, x1, texto):
    lo, hi = ZONA_NUMERO[col]
    return lo <= x1 <= hi and NUMERO.match(texto)


def separar(texto, n):
    """Acha o sufixo de tokens cujo hebraico decodificado vale n. -> (ingles, bruto, metodo)"""
    tokens = texto.split()
    for k in range(1, len(tokens) + 1):
        bruto = ' '.join(tokens[-k:])
        if set(bruto) - HEBRAICO - set(' :"\''):
            break  # entrou num token com caracteres que não são da fonte hebraica
        heb = decodificar(bruto)
        if gematria(heb) == n:
            return ' '.join(tokens[:-k]), bruto, 'padrao'
        if gematria(heb, 'gadol') == n:
            return ' '.join(tokens[:-k]), bruto, 'gadol'
    return texto, None, None


def verbetes(caminho):
    # 1. agrupa por (página, coluna), junta segmentos na mesma altura
    colunas = {}
    for pag, x0, y0, x1, texto in ler(caminho):
        if pag < PRIMEIRA_PAGINA or y0 > TOPO:
            continue
        col = 'E' if x1 < MEIO else 'D'
        colunas.setdefault((pag, col), []).append((y0, x0, x1, texto))

    atual, ultimo = None, None   # número corrente; último verbete (para linhas de continuação)
    for (pag, col) in sorted(colunas, key=lambda k: (k[0], k[1] != 'E')):
        linhas = sorted(colunas[(pag, col)], key=lambda l: (-l[0], l[1]))
        grupos = []  # [(y, [segmentos])]
        for y, x0, x1, texto in linhas:
            m = eh_numero(col, x1, texto)
            if m:
                grupos.append((y, 'num', int(m['n'])))
            elif grupos and grupos[-1][1] == 'txt' and abs(grupos[-1][0] - y) <= 3:
                grupos[-1][2].append(texto)
            else:
                grupos.append((y, 'txt', [texto]))
        # números antes do texto da mesma altura
        grupos.sort(key=lambda g: (-g[0] if g[1] == 'num' else -g[0] + 0.5))

        for _, tipo, valor in grupos:
            if tipo == 'num':
                if atual is None or atual < valor <= atual + 60:
                    atual, ultimo = valor, None
                continue
            if atual is None:
                continue
            texto = ' '.join(valor)
            if len(texto) <= 1:
                continue  # glifo decorativo solto
            ingles, bruto, metodo = separar(texto, atual)
            if bruto:
                ultimo = {'valor': atual, 'bruto': bruto, 'ingles': ingles, 'metodo': metodo}
                yield ultimo
            elif len(valor) > 1 and not set(valor[-1]) - HEBRAICO - set(' :"\''):
                # tem um bloco hebraico separado, mas a soma não confere (erro no PDF);
                # as linhas seguintes sem hebraico continuam o texto dele
                ultimo = {'valor': atual, 'bruto': valor[-1], 'ingles': ' '.join(valor[:-1]),
                          'metodo': 'nao_verificado'}
                yield ultimo
            elif ultimo is not None and ultimo['valor'] == atual:
                ultimo['ingles'] = f"{ultimo['ingles']} {texto}".strip()
            else:
                # nota sobre o número; as linhas seguintes sem hebraico a continuam
                ultimo = {'valor': atual, 'bruto': None, 'ingles': texto, 'metodo': None}
                yield ultimo


def main():
    itens = list(verbetes(sys.argv[1]))  # materializa: continuações alteram itens já emitidos
    print('valor\thebraico\tsignificado\tmetodo')
    for v in itens:
        heb = decodificar(v['bruto']) if v['bruto'] else ''
        texto = decodificar_embutido(v['ingles'])  # hebraico codificado no meio do texto
        print(f"{v['valor']}\t{heb}\t{texto}\t{v['metodo'] or 'nota'}")
    contagem = {}
    for v in itens:
        contagem[v['metodo'] or 'nota'] = contagem.get(v['metodo'] or 'nota', 0) + 1
    print(contagem, file=sys.stderr)


if __name__ == '__main__':
    main()
