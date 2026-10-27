from cabala.numeros import fatores, propriedades, triangular


def test_fatores():
    assert fatores(358) == [2, 179] and fatores(64) == [2] * 6


def test_triangulares_do_sepher_sephiroth():
    assert triangular(666) == 36 and triangular(903) == 42 and triangular(418) is None


def test_propriedades():
    assert propriedades(13) == ['primo']
    assert propriedades(36) == ['2² × 3²', '6²', 'Σ(1–8)']
