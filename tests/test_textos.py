"""Decodificação da fonte legada, Temurah, Notariqon e tradução."""
from cabala.fonte777 import decodificar, decodificar_embutido
from cabala.temurah import CAMARAS, albam, atbash, avgad, notariqon
from cabala.traducao import carregar_glossario, traduzir


def test_decodifica_a_fonte_invertida():
    assert decodificar('\\yhla') == 'אלהים'
    assert decodificar('twabx hwhy') == 'יהוה צבאות'
    assert decodificar('[ws }ya') == 'אין סוף'


def test_decodifica_hebraico_no_meio_do_ingles():
    assert decodificar_embutido('418 = tyj = ah tyb, the House') == '418 = חית = בית הא, the House'
    # palavras inglesas e latinas ficam intactas
    assert decodificar_embutido('Spelunca duplex of the world') == 'Spelunca duplex of the world'


def test_temurah():
    assert atbash('ששך') == 'בבל'          # Jeremias 25:26
    assert avgad('יהוה') == 'כוזו'
    assert albam('אב') == 'לם'


def test_notariqon_de_agla():
    assert notariqon('אתה גבור לעולם אדני')[0] == 'אגלא'


def test_aiq_beker_tem_as_27_letras_uma_vez():
    letras = ''.join(CAMARAS)
    assert len(CAMARAS) == 9 and len(letras) == 27 == len(set(letras))


def test_traducao_por_regra_e_por_glossario():
    g = carregar_glossario()
    assert traduzir('Angel of 2nd Dec. a', g) == 'Anjo do 2º decanato de Áries'
    assert traduzir('Night Demon of 3rd Dec. l', g) == 'Demônio noturno do 3º decanato de Peixes'
    assert traduzir('Angel of 9 C.', g) == 'Anjo do 9 de Copas'
    assert traduzir('Qliphoth of Hod', g) == 'Qliphoth de Hod'
    assert traduzir('The Messiah', g) == 'O Messias'
    # alvo desconhecido: melhor não traduzir do que traduzir pela metade
    assert traduzir('Father of Mercy', {}) is None
