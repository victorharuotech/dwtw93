"""Gera o banco completo num diretório temporário e confere a integridade."""
import pytest

from cabala import db
from cabala.gematria import gematria


@pytest.fixture(scope='module')
def conn(tmp_path_factory):
    c = db.criar(tmp_path_factory.mktemp('banco') / 'teste.db')
    yield c
    c.close()


def contar(conn, sql):
    return conn.execute(sql).fetchone()[0]


def test_tamanhos(conn):
    assert contar(conn, 'SELECT COUNT(*) FROM caminhos') == 35
    assert contar(conn, 'SELECT COUNT(*) FROM cartas') == 78
    assert contar(conn, 'SELECT COUNT(*) FROM palavras') > 2400
    assert contar(conn, 'SELECT COUNT(*) FROM correspondencias') == 750   # 704 do 777 + 46 do projeto


def test_todo_valor_guardado_confere_com_a_guematria(conn):
    for heb, valor, gadol in conn.execute('SELECT hebraico, valor, valor_gadol FROM palavras'):
        assert valor == gematria(heb) and gadol == gematria(heb, 'gadol'), heb


def test_777_traduzido_com_original_guardado(conn):
    tiphareth = dict(conn.execute('SELECT coluna_id, valor FROM tabela_777 WHERE numero = 6').fetchall())
    assert tiphareth[3] == 'Beleza' and tiphareth[15] == 'Rosa claro'
    assert contar(conn, "SELECT COUNT(*) FROM correspondencias WHERE original = 'Beauty'") == 1


def test_palavras_ressonantes(conn):
    valor_358 = {h for (h,) in conn.execute('SELECT hebraico FROM palavras WHERE valor = 358')}
    assert {'משיח', 'נחש'} <= valor_358


def test_sefer_yetzirah_com_link_para_o_sefaria(conn):
    n, com_ref = conn.execute(
        "SELECT COUNT(*), SUM(referencia LIKE 'Sefer_Yetzirah.%.%') FROM palavras WHERE fonte = 'Sefer Yetzirah'").fetchone()
    assert n == 750 and com_ref == n
