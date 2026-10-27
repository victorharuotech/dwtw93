"""Consultas de alto nível sobre o dicionário."""
from .gematria import gematria, reducao_teosofica


def por_numero(conn, n: int) -> dict:
    """Tudo que o número n "é": palavras, caminho da Árvore e letra."""
    return {
        'numero': n,
        'reducao': reducao_teosofica(n),
        'caminho': conn.execute('SELECT * FROM caminhos WHERE numero = ?', (n,)).fetchone(),
        'letra': conn.execute('SELECT * FROM letras WHERE valor = ? OR valor_final = ?', (n, n)).fetchone(),
        'palavras': conn.execute('SELECT * FROM palavras WHERE valor = ? ORDER BY hebraico', (n,)).fetchall(),
        'notas': conn.execute('SELECT * FROM notas WHERE valor = ? ORDER BY tipo, id', (n,)).fetchall(),
        'palavras_gadol': conn.execute(
            'SELECT * FROM palavras WHERE valor_gadol = ? AND valor_gadol <> valor', (n,)).fetchall(),
    }


def por_palavra(conn, texto: str) -> dict:
    valor = gematria(texto)
    return {
        'texto': texto,
        'valor': valor,
        'valor_gadol': gematria(texto, 'gadol'),
        'equivalentes': por_numero(conn, valor)['palavras'],
    }


def caminho(conn, n: int) -> dict:
    return {
        'caminho': conn.execute('SELECT * FROM caminhos WHERE numero = ?', (n,)).fetchone(),
        'correspondencias': conn.execute(
            'SELECT coluna_id, coluna, valor, original FROM tabela_777 WHERE numero = ? ORDER BY coluna_id',
            (n,)).fetchall(),
    }


def linha(chave: str) -> int:
    """'32bis' / '32 bis' -> 33, '31bis' -> 34, '7' -> 7."""
    chave = chave.replace(' ', '').lower()
    return {'32bis': 33, '31bis': 34}.get(chave) or int(chave)


def colunas(conn) -> list:
    return conn.execute('SELECT id, romano, nome, origem FROM colunas ORDER BY id').fetchall()


def coluna(conn, ref: str) -> list:
    """Uma coluna inteira: por número (15), romano (XV) ou nome ('Tarô')."""
    return conn.execute(
        '''SELECT t.numero, c.chave, t.nome, t.valor FROM tabela_777 t
           JOIN caminhos c ON c.numero = t.numero
           JOIN colunas col ON col.id = t.coluna_id
           WHERE CAST(col.id AS TEXT) = ? OR col.romano = upper(?) OR col.nome = ?
           ORDER BY t.numero''', (ref, ref, ref)).fetchall()


def buscar(conn, termo: str) -> list:
    like = f'%{termo}%'
    return conn.execute(
        '''SELECT * FROM palavras
           WHERE hebraico LIKE ? OR transliteracao LIKE ? OR significado LIKE ? OR original LIKE ?
           ORDER BY valor''', (like, like, like, like)).fetchall()


def agrupar(palavras):
    """Junta linhas com o mesmo hebraico: {hebraico: {'translit', 'valor', 'sentidos': [(texto, fonte, original, referencia)]}}"""
    grupos = {}
    for p in palavras:
        g = grupos.setdefault(p['hebraico'], {'translit': None, 'valor': p['valor'], 'sentidos': []})
        g['translit'] = g['translit'] or p['transliteracao']
        sentido = (p['significado'], p['fonte'], p['original'], p['referencia'])
        if sentido not in g['sentidos']:
            g['sentidos'].append(sentido)
    return grupos
