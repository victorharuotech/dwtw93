"""Decodificador da fonte hebraica legada usada no PDF do 777 Revised (Celephaïs Press).

No texto extraído do PDF, o hebraico aparece como letras latinas em ordem visual
(invertida): '\\yhla' -> אלהים, 'twabx hwhy' -> יהוה צבאות.

Símbolos astrológicos da mesma edição (útil ao transcrever novas colunas):
    !=Sol  #=Mercúrio  $=Vênus  %=Marte  &=Júpiter  '=Saturno  ==Lua
    B=Fogo  C=Água  D=Ar  E=Terra
"""
import re

_LATINO = 'abgdhwvzjfyikl]m\\n}sop[x{qrct'
_HEBRAICO = 'אבגדהווזחטייכלךמםנןסעפףצץקרשת'
_MAPA = str.maketrans(_LATINO, _HEBRAICO)


def decodificar(bruto: str) -> str:
    return bruto[::-1].translate(_MAPA)


# --- Hebraico codificado no meio de texto inglês/latino -------------------------------

_LETRAS = set(_LATINO)
_FINAIS = set(']\\}[{')          # no texto invertido, a letra final vem no INÍCIO do token
_ABRE, _FECHA = '(“"‘[', ',.;:)]”"’?!'
_ROMANO = re.compile(r'^[ivxlcdm]+$')
_NUNCA = set('a i of and in to no is an or by as on for at it its i.e viz cf pp col pt'.split())


def _dicionario():
    try:
        with open('/usr/share/dict/words', encoding='utf-8') as f:
            return {w.strip().lower() for w in f}
    except OSError:
        return set()


_INGLES = _dicionario()


def _eh_ingles(palavra):
    """web2 não tem flexões: testa também sem -s, -es, -ed, -ing, -ly."""
    if palavra in _INGLES:
        return True
    return any(palavra.endswith(suf) and palavra[:-len(suf)] in _INGLES
               for suf in ('s', 'es', 'ed', 'd', 'ing', 'ly'))


def _classe(nucleo):
    """'heb' (certamente hebraico), 'talvez' (ambíguo, decide pelo vizinho) ou None."""
    if len(nucleo) < 2 or not set(nucleo) <= _LETRAS or nucleo in _NUNCA:
        return None
    if any(c in _FINAIS for c in nucleo[1:]):
        return None                 # letra final fora do lugar: não é hebraico
    if nucleo[0] in _FINAIS:
        return 'heb'
    if nucleo[0] in 'kmnpx':
        return None                 # terminaria em כ מ נ פ צ sem forma final
    if 'i' in nucleo or 'v' in nucleo:
        return None                 # a fonte usa y/w; i e v quase só aparecem em latim
    if _eh_ingles(nucleo) or _ROMANO.match(nucleo):
        return 'talvez' if len(nucleo) <= 3 else None
    return 'heb'


def _partir(token):
    """-> (pontuação inicial, núcleo, pontuação final).
    '[' seguido de minúscula é a letra ף ('[la' = אלף); senão é colchete ('[Vide')."""
    i, j = 0, len(token)
    while i < j and token[i] in _ABRE:
        if token[i] == '[' and token[i + 1:i + 2].islower():
            break
        i += 1
    while j > i and token[j - 1] in _FECHA:
        j -= 1
    return token[:i], token[i:j], token[j:]


def decodificar_embutido(texto: str) -> str:
    """'418 = tyj = ah tyb, the House' -> '418 = חית = בית הא, the House'"""
    partes = re.split(r'(\s+)', texto)
    toks = [_partir(p) if k % 2 == 0 else p for k, p in enumerate(partes)]
    classes = [_classe(t[1]) if k % 2 == 0 else None for k, t in enumerate(toks)]

    # um ambíguo vira hebraico se estiver colado (sem pontuação) a um hebraico certo
    mudou = True
    while mudou:
        mudou = False
        for k in range(0, len(toks), 2):
            if classes[k] != 'talvez':
                continue
            for viz in (k - 2, k + 2):
                if 0 <= viz < len(toks) and classes[viz] == 'heb':
                    esq, dir_ = (viz, k) if viz < k else (k, viz)
                    if not toks[esq][2] and not toks[dir_][0]:
                        classes[k], mudou = 'heb', True

    saida, k = [], 0
    while k < len(toks):
        if k % 2 or classes[k] != 'heb':
            saida.append(toks[k] if k % 2 else ''.join(toks[k]))
            k += 1
            continue
        fim = k   # estende a corrida de tokens hebraicos sem pontuação entre eles
        while (fim + 2 < len(toks) and classes[fim + 2] == 'heb'
               and not toks[fim][2] and not toks[fim + 2][0]):
            fim += 2
        nucleos = [toks[m][1] for m in range(k, fim + 1, 2)]
        saida.append(toks[k][0] + decodificar(' '.join(nucleos)) + toks[fim][2])
        k = fim + 1
    return ''.join(saida)
