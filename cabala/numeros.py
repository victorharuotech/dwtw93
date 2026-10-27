"""Propriedades aritméticas de um número, como no Sepher Sephiroth ('p', 'S (1—n)')."""
from math import isqrt


def fatores(n: int) -> list[int]:
    """Fatoração em primos: 358 -> [2, 179]."""
    resultado, d = [], 2
    while d * d <= n:
        while n % d == 0:
            resultado.append(d)
            n //= d
        d += 1
    if n > 1:
        resultado.append(n)
    return resultado


def triangular(n: int) -> int | None:
    """Se n = 1 + 2 + ... + k, devolve k (a 'soma mística' do Sepher Sephiroth)."""
    k = (isqrt(8 * n + 1) - 1) // 2
    return k if k * (k + 1) // 2 == n and k > 0 else None


def propriedades(n: int) -> list[str]:
    """Descrições curtas para o cabeçalho de um número."""
    props = []
    if n < 2:
        return props
    fs = fatores(n)
    if len(fs) == 1:
        props.append('primo')
    else:
        expoentes = {}
        for f in fs:
            expoentes[f] = expoentes.get(f, 0) + 1
        sup = str.maketrans('0123456789', '⁰¹²³⁴⁵⁶⁷⁸⁹')
        props.append(' × '.join(f'{f}{str(e).translate(sup)}' if e > 1 else str(f)
                                for f, e in expoentes.items()))
    if (r := isqrt(n)) * r == n:
        props.append(f'{r}²')
    if (k := triangular(n)):
        props.append(f'Σ(1–{k})')
    return props
