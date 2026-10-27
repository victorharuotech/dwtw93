"""Temurah (permutação de letras) e Notariqon (acrósticos)."""
from .gematria import FINAIS, VALORES, normalizar

ALEFBEIT = ''.join(VALORES)          # as 22 letras em ordem
FORMA_FINAL = {base: final for final, (base, _) in FINAIS.items()}


def _cifra(mapa):
    def aplicar(texto):
        letras = [FINAIS[l][0] if l in FINAIS else l for l in normalizar(texto)]
        trocadas = [mapa[l] for l in letras]
        if trocadas and trocadas[-1] in FORMA_FINAL:     # última letra volta à forma final
            trocadas[-1] = FORMA_FINAL[trocadas[-1]]
        return ''.join(trocadas)
    return aplicar


# Atbash: א↔ת, ב↔ש ... (primeira com a última)
atbash = _cifra(dict(zip(ALEFBEIT, reversed(ALEFBEIT))))
# Albam: א↔ל, ב↔מ ... (primeira metade com a segunda)
albam = _cifra({**dict(zip(ALEFBEIT[:11], ALEFBEIT[11:])), **dict(zip(ALEFBEIT[11:], ALEFBEIT[:11]))})
# Avgad: cada letra pela seguinte (ת volta a א)
avgad = _cifra(dict(zip(ALEFBEIT, ALEFBEIT[1:] + ALEFBEIT[0])))

CIFRAS = {'Atbash': atbash, 'Albam': albam, 'Avgad': avgad}

# Aiq Beker: as 9 "câmaras" que agrupam as 27 letras (finais = 500..900) de mesma unidade
_TODAS = {**VALORES, **{final: gadol for final, (_, gadol) in FINAIS.items()}}
CAMARAS = [''.join(l for l, v in _TODAS.items() if str(v).rstrip('0') == str(d)) for d in range(1, 10)]


def notariqon(frase):
    """Iniciais e finais de cada palavra: 'אתה גבור לעולם אדני' -> ('אגלא', ...)"""
    palavras = [normalizar(p) for p in frase.split() if normalizar(p)]
    return ''.join(p[0] for p in palavras), ''.join(p[-1] for p in palavras)
