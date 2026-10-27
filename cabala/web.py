"""Interface web: API JSON sobre consultas.py + página estática (cabala/static)."""
import os
from pathlib import Path

from flask import Flask, g, jsonify, request, send_from_directory

from . import consultas, db, kameas, tarot, temurah
from .gematria import METODOS, gematria, normalizar
from .numeros import propriedades

ESTATICOS = Path(__file__).with_name('static')
app = Flask(__name__, static_folder=None)

# Modo público: esconde os dados com copyright do Hermetic Kabbalah Tarot. Liga com DWTW_PUBLICO=1,
# ou sozinho quando a pasta cabala/dados/privado/ não existe (como no repositório publicado).
PUBLICO = os.environ.get('DWTW_PUBLICO') == '1' or not tarot.tem_hkt()
FONTES_HKT = {'hkt', 'riley', 'inspiira', 'hartmann'}

if not db.BANCO_PADRAO.exists():   # no deploy (gunicorn) o banco é gerado na primeira importação
    db.criar().close()


def conn():
    if 'conn' not in g:   # uma conexão SQLite por requisição
        g.conn = db.conectar()
    return g.conn


@app.teardown_appcontext
def fechar(_):
    if (c := g.pop('conn', None)) is not None:
        c.close()


def linha(row):
    return dict(row) if row is not None else None


def grupos(rows):
    """Palavras agrupadas por hebraico, no formato que o front-end espera."""
    return [{'hebraico': heb, 'valor': x['valor'], 'translit': x['translit'],
             'sentidos': [{'texto': t, 'fonte': f, 'original': o, 'referencia': r} for t, f, o, r in x['sentidos']]}
            for heb, x in consultas.agrupar(rows).items()]


@app.get('/')
def index():
    return send_from_directory(ESTATICOS, 'index.html')


@app.get('/static/<path:arquivo>')
def estatico(arquivo):
    return send_from_directory(ESTATICOS, arquivo)


@app.get('/api/numero/<int:n>')
def api_numero(n):
    r = consultas.por_numero(conn(), n)
    return jsonify({
        'numero': n, 'reducao': r['reducao'], 'propriedades': propriedades(n),
        'caminho': linha(r['caminho']), 'letra': linha(r['letra']),
        'palavras': grupos(r['palavras']), 'gadol': grupos(r['palavras_gadol']),
        'notas': [dict(x) for x in r['notas']],
    })


@app.get('/api/gematria')
def api_gematria():
    texto = normalizar(request.args.get('q', ''))
    metodo = request.args.get('metodo', 'padrao')
    if metodo not in METODOS:
        return jsonify({'erro': f'método desconhecido: {metodo}'}), 400
    if not texto:
        return jsonify({'texto': '', 'valor': 0, 'gadol': 0, 'metodo': metodo, 'equivalentes': []})
    try:
        valor = gematria(texto, metodo)
        letras = [[l, gematria(l, metodo)] for l in texto]
    except NotImplementedError:
        return jsonify({'erro': f'O método "{metodo}" ainda não foi implementado em cabala/gematria.py'}), 501
    # o banco só indexa os valores padrão e gadol
    coluna = {'padrao': 'valor', 'gadol': 'valor_gadol'}.get(metodo)
    equivalentes = conn().execute(f'SELECT * FROM palavras WHERE {coluna} = ? ORDER BY hebraico',
                                  (valor,)).fetchall() if coluna else []
    return jsonify({'texto': texto, 'valor': valor, 'metodo': metodo,
                    'padrao': gematria(texto), 'gadol': gematria(texto, 'gadol'),
                    'letras': letras, 'equivalentes': grupos(equivalentes)})


@app.get('/api/temurah')
def api_temurah():
    texto = normalizar(request.args.get('q', ''))
    cifras = [{'nome': nome, 'texto': f(texto), 'valor': gematria(f(texto))}
              for nome, f in temurah.CIFRAS.items()] if texto else []
    return jsonify({'texto': texto, 'cifras': cifras, 'camaras': temurah.CAMARAS})


@app.get('/api/notariqon')
def api_notariqon():
    iniciais, finais = temurah.notariqon(request.args.get('q', ''))
    return jsonify({'iniciais': iniciais, 'valor_iniciais': gematria(iniciais),
                    'finais': finais, 'valor_finais': gematria(finais)})


@app.get('/api/kameas')
def api_kameas():
    return jsonify([kameas.resumo(k) for k in kameas.PLANETAS])


@app.get('/api/sigilo')
def api_sigilo():
    chave = request.args.get('planeta', 'saturno')
    if chave not in kameas.PLANETAS:
        return jsonify({'erro': 'planeta desconhecido'}), 400
    texto = request.args.get('q', '')
    return jsonify({**kameas.resumo(chave), 'texto': normalizar(texto), 'valor': gematria(texto),
                    'passos': kameas.sigilo(chave, texto)})


@app.get('/api/arvore')
def api_arvore():
    # cores nas quatro escalas (777, cols. XV-XVIII), atribuição e tarô (colunas do projeto)
    rows = conn().execute('''SELECT c.numero, c.chave, c.nome, c.hebraico, c.letra, c.de_sefira,
                                    c.para_sefira, l.tipo,
                                    (SELECT COALESCE(original, valor) FROM correspondencias WHERE caminho = c.numero AND coluna = 15) AS rei,
                                    (SELECT COALESCE(original, valor) FROM correspondencias WHERE caminho = c.numero AND coluna = 16) AS rainha,
                                    (SELECT COALESCE(original, valor) FROM correspondencias WHERE caminho = c.numero AND coluna = 17) AS imperador,
                                    (SELECT COALESCE(original, valor) FROM correspondencias WHERE caminho = c.numero AND coluna = 18) AS imperatriz,
                                    (SELECT valor FROM correspondencias WHERE caminho = c.numero AND coluna = 1006) AS atribuicao,
                                    (SELECT valor FROM correspondencias WHERE caminho = c.numero AND coluna = 1007) AS taro
                             FROM caminhos c LEFT JOIN letras l ON l.letra = c.letra
                             WHERE c.numero BETWEEN 1 AND 32
                             ORDER BY c.numero''').fetchall()
    return jsonify([dict(r) for r in rows])


def cartas_do_caminho(numero):
    """Arcano maior do caminho (11-32) ou os menores da Sefirá (1-10)."""
    return [dict(c) for c in conn().execute(
        'SELECT id, nome, arcano FROM cartas WHERE caminho = ? OR sefira = ? ORDER BY arcano, naipe, numero',
        (numero, numero)).fetchall()]


@app.get('/api/caminho/<chave>')
def api_caminho(chave):
    r = consultas.caminho(conn(), consultas.linha(chave))
    return jsonify({'caminho': linha(r['caminho']),
                    'correspondencias': [dict(x) for x in r['correspondencias']],
                    'cartas': cartas_do_caminho(r['caminho']['numero'])})


@app.get('/api/config')
def api_config():
    return jsonify({'publico': PUBLICO, 'metodos': metodos_prontos()})


def metodos_prontos():
    """Métodos de guematria que já funcionam (o Katan depende de mispar_katan() em gematria.py)."""
    prontos = []
    for metodo in METODOS:
        try:
            gematria('א', metodo)
            prontos.append(metodo)
        except NotImplementedError:
            pass
    return prontos


@app.get('/api/fontes')
def api_fontes():
    return jsonify([dict(f) for f in conn().execute('SELECT * FROM fontes').fetchall()
                    if not (PUBLICO and f['id'] in FONTES_HKT)])


@app.get('/api/tarot')
def api_tarot():
    return jsonify([dict(c) for c in conn().execute(
        '''SELECT id, arcano, numero, naipe, nome FROM cartas
           ORDER BY arcano = 'menor', instr('paus copas espadas ouros', naipe), numero''').fetchall()])


@app.get('/api/consulta')
def api_consulta():
    """As 78 cartas com título, palavras-chave e um resumo das correspondências, para as tiragens."""
    rows = conn().execute('''
        SELECT c.id, c.nome, c.arcano, c.titulo, c.palavras, c.decanato, c.subelemento, c.mbti, c.mbti_titulo,
               k.numero AS caminho, k.nome AS lugar, k.letra,
               (SELECT valor FROM correspondencias WHERE caminho = k.numero AND coluna = 1006) AS atribuicao
        FROM cartas c JOIN caminhos k ON k.numero = COALESCE(c.caminho, c.sefira)''').fetchall()
    cartas = []
    for r in rows:
        if r['arcano'] == 'maior':
            resumo = f"Caminho {r['caminho']} · {r['lugar']} {r['letra']} · {r['atribuicao']}"
        else:
            resumo = f"{r['lugar']} · {r['decanato'] or r['subelemento']}"
        cartas.append({'id': r['id'], 'nome': r['nome'], 'arcano': r['arcano'], 'titulo': r['titulo'],
                       'palavras': r['palavras'], 'resumo': resumo,
                       # corte <-> personalidade (HKT, segundo Jana Riley): oculto no modo público
                       'mbti': None if PUBLICO else r['mbti'], 'mbti_titulo': None if PUBLICO else r['mbti_titulo']})
    return jsonify(cartas)


@app.get('/api/carta/<cid>')
def api_carta(cid):
    c = conn().execute('SELECT * FROM cartas WHERE id = ?', (cid,)).fetchone()
    if c is None:
        return jsonify({'erro': 'carta desconhecida'}), 404
    numero = c['caminho'] or c['sefira']
    r = consultas.caminho(conn(), numero)
    letra = conn().execute('SELECT * FROM letras WHERE letra = ?', (r['caminho']['letra'],)).fetchone()
    carta = dict(c)
    if PUBLICO:
        carta.update(dados=None, mbti=None, mbti_titulo=None)
    return jsonify({'carta': carta, 'caminho': linha(r['caminho']), 'letra': linha(letra),
                    'correspondencias': [dict(x) for x in r['correspondencias']],
                    'irmas': [x for x in cartas_do_caminho(numero) if x['id'] != cid]})


@app.get('/api/dados/<combinacao>')
def api_dados(combinacao):
    """Três dados (em qualquer ordem) -> o Arcano Menor correspondente no HKT."""
    if PUBLICO:
        return jsonify({'erro': 'indisponível no modo público'}), 404
    chave = ''.join(sorted(combinacao))
    c = conn().execute('SELECT id, nome FROM cartas WHERE dados = ?', (chave,)).fetchone()
    return (jsonify(dict(c)) if c else (jsonify({'erro': 'combinação inválida'}), 404))


@app.get('/api/esmeralda')
def api_esmeralda():
    return jsonify([dict(v) for v in conn().execute('SELECT * FROM tabua_esmeralda ORDER BY verso').fetchall()])


@app.get('/api/tabuas')
def api_tabuas():
    geomancia = [] if PUBLICO else [dict(g) for g in conn().execute('SELECT * FROM geomancia').fetchall()]
    return jsonify({'geomancia': geomancia,
                    'runas': [dict(r) for r in conn().execute('SELECT * FROM runas ORDER BY ordem').fetchall()]})


@app.get('/api/colunas')
def api_colunas():
    return jsonify([dict(c) for c in consultas.colunas(conn())])


@app.get('/api/tabela')
def api_tabela():
    """Várias colunas do 777 lado a lado: ?cols=2,14,15"""
    ids = [int(c) for c in request.args.get('cols', '').split(',') if c.strip().isdigit()][:8]
    marcas = ','.join('?' * len(ids)) or 'NULL'
    celulas = conn().execute(
        f'SELECT caminho, coluna, valor, original FROM correspondencias WHERE coluna IN ({marcas})', ids).fetchall()
    linhas = conn().execute('SELECT numero, chave, nome FROM caminhos ORDER BY numero').fetchall()
    return jsonify({'linhas': [dict(l) for l in linhas],
                    'celulas': {f'{c["caminho"]}:{c["coluna"]}': c['valor'] for c in celulas},
                    'originais': {f'{c["caminho"]}:{c["coluna"]}': c['original'] for c in celulas if c['original']}})


@app.get('/api/buscar')
def api_buscar():
    termo = request.args.get('q', '').strip()
    rows = consultas.buscar(conn(), termo)[:300] if len(termo) >= 2 else []
    return jsonify(sorted(grupos(rows), key=lambda x: x['valor']))


def rodar(porta=5777, abrir=True):
    if abrir:
        import threading
        import webbrowser
        threading.Timer(1.0, webbrowser.open, [f'http://127.0.0.1:{porta}/']).start()
    app.run(host='127.0.0.1', port=porta, debug=False)
