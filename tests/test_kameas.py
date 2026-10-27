import pytest

from cabala.gematria import gematria
from cabala.kameas import PLANETAS, reduzir, resumo, sigilo


@pytest.mark.parametrize('chave', PLANETAS)
def test_quadrado_e_magico(chave):
    r = resumo(chave)
    q, n, k = r['quadrado'], r['n'], r['constante']
    assert sorted(x for linha in q for x in linha) == list(range(1, n * n + 1))
    assert all(sum(linha) == k for linha in q)
    assert all(sum(q[i][j] for i in range(n)) == k for j in range(n))
    assert sum(q[i][i] for i in range(n)) == k == sum(q[i][n - 1 - i] for i in range(n))


@pytest.mark.parametrize('chave', PLANETAS)
def test_nomes_valem_numeros_do_quadrado(chave):
    """Agrippa: Inteligências e Espíritos somam a constante, o total ou n² do quadrado."""
    r = resumo(chave)
    for nome in r['nomes']:
        assert gematria(nome['hebraico']) in (r['constante'], r['total'], r['n'] ** 2), nome


def test_sigilo_de_sorath_no_quadrado_do_sol():
    assert gematria('סורת') == 666
    assert [p['reduzido'] for p in sigilo('sol', 'סורת')] == [6, 6, 20, 4]


def test_reducao_corta_zeros():
    assert reduzir(300, 9) == 3 and reduzir(300, 36) == 30 and reduzir(90, 81) == 9
