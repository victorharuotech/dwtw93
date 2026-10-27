import pytest

from cabala.gematria import gematria, normalizar, reducao_teosofica


@pytest.mark.parametrize('palavra, valor', [
    ('אחד', 13), ('אהבה', 13), ('יהוה', 26), ('אלהים', 86), ('משיח', 358), ('נחש', 358),
    ('אין סוף', 207), ('אור', 207), ('בולשכין', 418),
])
def test_valores_classicos(palavra, valor):
    assert gematria(palavra) == valor


def test_gadol_conta_finais_de_500_a_900():
    assert gematria('אלהים', 'gadol') == 646        # ם = 600
    assert gematria('ך ם ן ף ץ', 'gadol') == 3500


def test_ordinal_e_a_posicao_no_alefbeit():
    assert gematria('א', 'ordinal') == 1 and gematria('ת', 'ordinal') == 22
    assert gematria('ץ', 'ordinal') == gematria('צ', 'ordinal') == 18


def test_katan_reduz_cada_letra_a_unidade():
    try:
        valor = gematria('משיח', 'katan')
    except NotImplementedError:
        pytest.xfail('mispar_katan() ainda é um TODO(human) em cabala/gematria.py')
    assert valor == 4 + 3 + 1 + 8
    assert gematria('ת', 'katan') == 4 and gematria('ך', 'katan') == 2


def test_normalizar_remove_niqqud_e_pontuacao():
    assert normalizar('שָׁלוֹם, עוֹלָם!') == 'שלוםעולם'


def test_reducao_teosofica():
    assert reducao_teosofica(358) == 7 and reducao_teosofica(9) == 9


def test_metodo_desconhecido():
    with pytest.raises(ValueError):
        gematria('אב', 'inventado')
