from pathlib import Path

import pytest

from cabala import tarot

IMAGENS = Path(tarot.__file__).with_name('static') / 'cartas' / 'rws'


def test_78_cartas_com_ids_unicos():
    cartas = list(tarot.cartas())
    assert len(cartas) == 78 == len({c['id'] for c in cartas})


def test_toda_carta_tem_imagem():
    faltando = [c['id'] for c in tarot.cartas() if not (IMAGENS / f"{c['id']}.jpg").exists()]
    assert not faltando


def test_maiores_nos_caminhos_e_menores_nas_sefirot():
    cartas = {c['id']: c for c in tarot.cartas()}
    assert cartas['maior-00']['caminho'] == 11 and cartas['maior-08']['caminho'] == 19   # Força = Teth
    assert cartas['paus-01']['sefira'] == 1 and cartas['ouros-10']['sefira'] == 10
    assert cartas['copas-14']['sefira'] == 2 and cartas['copas-14']['subelemento'] == 'Fogo de Água'


@pytest.mark.parametrize('naipe, n, esperado', [
    ('paus', 2, 'Marte em Áries'), ('copas', 4, 'Lua em Câncer'), ('espadas', 5, 'Vênus em Aquário'),
    ('ouros', 10, 'Mercúrio em Virgem'), ('ouros', 1, 'Capricórnio · Touro · Virgem'), ('paus', 12, None),
])
def test_decanatos_da_golden_dawn(naipe, n, esperado):
    assert tarot.decanato(naipe, n) == esperado


@pytest.mark.skipif(not tarot.tem_hkt(), reason='dados privados do HKT ausentes')
def test_regra_reproduz_a_tabela_do_hkt():
    for (naipe, n), h in tarot.hkt_menores().items():
        calculado = tarot.decanato(naipe, n) or ''
        if n == 1:
            assert set(calculado.split(' · ')) == set(h['decanato'].split(' · '))
        else:
            assert calculado == h['decanato']
