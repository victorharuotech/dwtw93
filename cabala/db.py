"""Criação e conexão do banco SQLite."""
import sqlite3
from pathlib import Path

from . import dados, importar777, importar_sepher, importar_yetzirah, tarot
from .gematria import gematria

SCHEMA = Path(__file__).with_name('schema.sql')
BANCO_PADRAO = Path(__file__).parent.parent / 'cabala.db'

# Linhas do 777 fora dos 32 caminhos: numero, chave, nome, hebraico, letra
LINHAS_EXTRAS = [
    (0,  '0',      'Ain',  'אין', None),
    (33, '32 bis', 'Tau (Terra)',     'תו', 'ת'),
    (34, '31 bis', 'Shin (Espírito)', 'שין', 'ש'),
]


def conectar(caminho: Path = BANCO_PADRAO) -> sqlite3.Connection:
    conn = sqlite3.connect(caminho)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    # Permite usar gematria() direto no SQL: SELECT gematria('אמן')
    conn.create_function('gematria', 1, gematria, deterministic=True)
    conn.create_function('gematria_m', 2, gematria, deterministic=True)
    return conn


def adicionar_palavra(conn, hebraico, transliteracao, significado, fonte=None, original=None, referencia=None):
    conn.execute(
        '''INSERT OR IGNORE INTO palavras
           (hebraico, transliteracao, significado, original, fonte, referencia, valor, valor_gadol)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (hebraico, transliteracao, significado, original, fonte, referencia,
         gematria(hebraico), gematria(hebraico, 'gadol')),
    )


def criar(caminho: Path = BANCO_PADRAO) -> sqlite3.Connection:
    caminho.unlink(missing_ok=True)
    conn = conectar(caminho)
    conn.executescript(SCHEMA.read_text(encoding='utf-8'))

    conn.executemany('INSERT INTO letras VALUES (?,?,?,?,?,?,?,?)', dados.LETRAS)
    conn.executemany("INSERT INTO colunas (id, nome, descricao, origem) VALUES (?,?,?, 'projeto')",
                     dados.COLUNAS)
    corr = []

    for n, nome, heb, signif, divino, arcanjo, coro, mundana, cor in dados.SEFIROT:
        conn.execute('INSERT INTO caminhos (numero, chave, nome, hebraico) VALUES (?,?,?,?)',
                     (n, str(n), nome, heb))

    letras = {l[0]: l for l in dados.LETRAS}
    for n, letra, de, para, atrib, taro, cor, nota in dados.CAMINHOS_LETRAS:
        _, nome, nome_heb, _, _, _, signif, _ = letras[letra]
        conn.execute('INSERT INTO caminhos VALUES (?,?,?,?,?,?,?)',
                     (n, str(n), nome, nome_heb, letra, de, para))
        corr += [(n, 1006, atrib), (n, 1007, taro)]
        if nota:
            corr.append((n, 1009, nota))

    conn.executemany('INSERT INTO caminhos (numero, chave, nome, hebraico, letra) VALUES (?,?,?,?,?)',
                     LINHAS_EXTRAS)
    conn.executemany('INSERT INTO correspondencias (caminho, coluna, valor) VALUES (?,?,?)', corr)

    # Nomes hebraicos (Sefirot, letras, nomes divinos, anjos) vêm do 777 já com guematria
    importar777.importar(conn, adicionar_palavra)
    sobras = importar_sepher.importar(conn, adicionar_palavra)
    for valor, errado in sorted(sobras):
        print(f'aviso: correção {valor} {errado} não encontrou verbete no Sepher Sephiroth')
    importar_yetzirah.importar(conn, adicionar_palavra)
    tarot.importar(conn)
    for heb, translit, signif in dados.PALAVRAS:
        adicionar_palavra(conn, heb, translit, signif, 'Seleção do projeto')
    conn.commit()
    return conn
