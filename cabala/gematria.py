"""Motor de guematria hebraica."""
import re

VALORES = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
}

# letra final -> (forma normal, valor no Mispar Gadol)
FINAIS = {'ך': ('כ', 500), 'ם': ('מ', 600), 'ן': ('נ', 700), 'ף': ('פ', 800), 'ץ': ('צ', 900)}

# Mispar Siduri (ordinal): a posição da letra no alefbeit, א=1 ... ת=22
ORDINAL = {letra: i + 1 for i, letra in enumerate(VALORES)}

METODOS = ('padrao', 'gadol', 'katan', 'ordinal')

_NAO_LETRA = re.compile(r'[^א-ת]')  # remove niqqud, espaços, pontuação


def normalizar(texto: str) -> str:
    """Mantém apenas as 27 letras hebraicas (22 + 5 finais)."""
    return _NAO_LETRA.sub('', texto)


def mispar_katan(valor: int) -> int:
    """Reduz o valor de UMA letra à sua unidade (Mispar Katan)."""
    # TODO(human)
    raise NotImplementedError


def valor_letra(letra: str, metodo: str = 'padrao') -> int:
    if letra in FINAIS:
        base, grande = FINAIS[letra]
        if metodo == 'gadol':
            return grande
        letra = base
    if metodo == 'ordinal':
        return ORDINAL[letra]
    valor = VALORES[letra]
    return mispar_katan(valor) if metodo == 'katan' else valor


def gematria(texto: str, metodo: str = 'padrao') -> int:
    if metodo not in METODOS:
        raise ValueError(f'método desconhecido: {metodo!r} (use {METODOS})')
    return sum(valor_letra(l, metodo) for l in normalizar(texto))


def reducao_teosofica(n: int) -> int:
    """Soma os dígitos até restar um só: 358 -> 16 -> 7."""
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n
