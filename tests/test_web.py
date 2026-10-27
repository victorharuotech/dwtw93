import pytest

from cabala import web


@pytest.fixture
def cliente():
    return web.app.test_client()


@pytest.mark.parametrize('url', ['/', '/api/numero/418', '/api/gematria?q=אמן', '/api/arvore', '/api/caminho/6',
                                 '/api/tarot', '/api/carta/maior-08', '/api/kameas', '/api/sigilo?planeta=sol&q=סורת',
                                 '/api/temurah?q=ששך', '/api/notariqon?q=אתה גבור', '/api/tabuas', '/api/fontes',
                                 '/api/tabela?cols=2,15', '/api/buscar?q=serpent', '/api/config'])
def test_rotas_respondem(cliente, url):
    assert cliente.get(url).status_code == 200


def test_gematria_ordinal(cliente):
    assert cliente.get('/api/gematria?q=יהוה&metodo=ordinal').json['valor'] == 26


def test_modo_publico_esconde_dados_do_hkt(cliente, monkeypatch):
    monkeypatch.setattr(web, 'PUBLICO', True)
    carta = cliente.get('/api/carta/paus-02').json['carta']
    assert carta['decanato'] == 'Marte em Áries'                 # Golden Dawn, domínio público
    assert carta['dados'] is None and carta['mbti'] is None       # HKT
    assert cliente.get('/api/dados/111').status_code == 404
    assert cliente.get('/api/tabuas').json['geomancia'] == []
    assert not {f['id'] for f in cliente.get('/api/fontes').json} & web.FONTES_HKT


def test_tabua_de_esmeralda_tem_14_versos_em_3_linguas(cliente):
    versos = cliente.get('/api/esmeralda').json
    assert len(versos) == 14 and all(v['latim'] and v['grego'] and v['portugues'] for v in versos)
    assert versos[1]['latim'].startswith('Quod est inferius')


def test_consulta_traz_as_78_cartas(cliente):
    cartas = cliente.get('/api/consulta').json
    assert len(cartas) == 78 and sum(c['arcano'] == 'maior' for c in cartas) == 22


def test_personalidade_da_corte_some_no_modo_publico(cliente, monkeypatch):
    monkeypatch.setattr(web, 'PUBLICO', True)
    rei = next(c for c in cliente.get('/api/consulta').json if c['id'] == 'paus-14')
    assert rei['mbti'] is None
