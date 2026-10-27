"""Formatação da saída no terminal.

Regra de ouro: nada alinhado em colunas depois de um trecho hebraico na mesma linha,
porque o terminal reordena o texto RTL e o preenchimento com espaços deixa de valer.
"""
import os
import shutil
import sys
import textwrap

from .consultas import agrupar

_COR = sys.stdout.isatty() and not os.environ.get('NO_COLOR')


def _estilo(codigo):
    return (lambda s: f'\033[{codigo}m{s}\033[0m') if _COR else (lambda s: s)


negrito, fraco, amarelo, ciano = _estilo('1'), _estilo('2'), _estilo('33'), _estilo('36')
LARGURA = min(shutil.get_terminal_size((90, 20)).columns, 100)
MAX_LINHAS = 3          # textos longos são cortados; None = mostrar tudo


def titulo(texto, extra=''):
    linha = f'═══ {texto} '
    if extra:
        linha += f'{fraco(extra)} '
    print(negrito(linha) + negrito('═' * max(3, LARGURA - len(texto) - len(extra) - 6)))


def secao(nome, qtd=None):
    print(f'\n {ciano(nome)}' + (fraco(f' ({qtd})') if qtd is not None else ''))


def quebrar(texto, recuo, sufixo=''):
    linhas = textwrap.wrap(texto, LARGURA - len(sufixo), initial_indent=recuo,
                           subsequent_indent=recuo + '  ')
    if MAX_LINHAS and len(linhas) > MAX_LINHAS:
        resto = len(linhas) - MAX_LINHAS
        linhas = linhas[:MAX_LINHAS]
        linhas[-1] += ' …' + fraco(f' (+{resto} linhas: --completo)')
    return '\n'.join(linhas) + (f'  {sufixo}' if sufixo else '')


def palavras(rows, mostrar_valor=False):
    for heb, g in agrupar(rows).items():
        cabeca = f'   {fraco(str(g["valor"]).rjust(5))}  ' if mostrar_valor else '   ▸ '
        translit = f'  {fraco("(" + g["translit"] + ")")}' if g['translit'] else ''
        print(f'{cabeca}{negrito(heb)}{translit}')
        for texto, fonte, _original, _referencia in g['sentidos']:
            recuo = ' ' * (12 if mostrar_valor else 7)
            print(quebrar(texto, recuo, fraco(f'· {fonte}')))


def notas(rows):
    comentarios = [n for n in rows if n['tipo'] == 'nota']
    suspeitos = [n for n in rows if n['tipo'] == 'nao_verificado']
    if comentarios:
        secao('Notas', len(comentarios))
        for n in comentarios:
            print(quebrar(f'✎ {n["texto"]}', '   '))
    if suspeitos:
        secao('Não verificados (o hebraico do PDF não soma este número)', len(suspeitos))
        for n in suspeitos:
            print(f'   {amarelo("⚠")} {n["hebraico"] or "?"}')
            if n['texto']:
                print(quebrar(n['texto'], '       '))
