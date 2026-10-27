-- Schema do dicionário cabalístico (estilo Liber 777 + Godwin)
PRAGMA foreign_keys = ON;

-- As 22 letras hebraicas
CREATE TABLE IF NOT EXISTS letras (
    letra        TEXT PRIMARY KEY,
    nome         TEXT NOT NULL,          -- transliteração: Aleph, Beth...
    nome_hebraico TEXT NOT NULL,         -- אלף, בית...
    valor        INTEGER NOT NULL,
    forma_final  TEXT,                   -- ך ם ן ף ץ
    valor_final  INTEGER,                -- 500..900 (Mispar Gadol)
    significado  TEXT,
    tipo         TEXT NOT NULL CHECK (tipo IN ('mae', 'dupla', 'simples'))
);

-- Linhas da Escala-Chave do 777: 0 (Ain), 1-10 Sefirot, 11-32 letras,
-- 33 = "32 bis" (Terra) e 34 = "31 bis" (Espírito)
CREATE TABLE IF NOT EXISTS caminhos (
    numero      INTEGER PRIMARY KEY CHECK (numero BETWEEN 0 AND 34),
    chave       TEXT NOT NULL UNIQUE,    -- como aparece no 777: '0', '11', '32 bis'
    nome        TEXT NOT NULL,
    hebraico    TEXT NOT NULL,
    letra       TEXT REFERENCES letras(letra),
    de_sefira   INTEGER REFERENCES caminhos(numero),
    para_sefira INTEGER REFERENCES caminhos(numero),
    CHECK ((numero <= 10 AND letra IS NULL) OR (numero > 10 AND letra IS NOT NULL))
);

-- As "colunas" do 777 (id = número da coluna no livro) e as do projeto (id >= 1001)
CREATE TABLE IF NOT EXISTS colunas (
    id        INTEGER PRIMARY KEY,
    romano    TEXT,                      -- 'XV', 'CLXXXVII'; NULL nas colunas do projeto
    nome      TEXT NOT NULL UNIQUE,      -- em português
    nome_original TEXT,                  -- título em inglês, como no livro
    descricao TEXT,
    origem    TEXT NOT NULL CHECK (origem IN ('777', 'projeto'))
);

-- Célula da tabela: caminho × coluna → valor
CREATE TABLE IF NOT EXISTS correspondencias (
    caminho INTEGER NOT NULL REFERENCES caminhos(numero),
    coluna  INTEGER NOT NULL REFERENCES colunas(id),
    valor   TEXT NOT NULL,                -- em português
    original TEXT,                        -- texto do 777 em inglês, quando foi traduzido
    PRIMARY KEY (caminho, coluna)
);

-- Léxico guemátrico (estilo Godwin)
CREATE TABLE IF NOT EXISTS palavras (
    id             INTEGER PRIMARY KEY,
    hebraico       TEXT NOT NULL,
    transliteracao TEXT,
    significado    TEXT NOT NULL,        -- em português, quando há tradução
    original       TEXT,                 -- texto da fonte (inglês/latim), quando foi traduzido
    fonte          TEXT,
    referencia     TEXT,                 -- passagem no Sefaria, ex.: 'Sefer_Yetzirah.1.1'
    valor          INTEGER NOT NULL,     -- Mispar Hechrachi (padrão)
    valor_gadol    INTEGER NOT NULL,     -- finais = 500..900
    UNIQUE (hebraico, significado)
);
CREATE INDEX IF NOT EXISTS idx_palavras_valor ON palavras(valor);
CREATE INDEX IF NOT EXISTS idx_palavras_gadol ON palavras(valor_gadol);

-- Comentários sobre um número (ex.: "The Mystic Number of Kether") e verbetes cujo
-- hebraico não confere com o número no PDF de origem, guardados para revisão
CREATE TABLE IF NOT EXISTS notas (
    id       INTEGER PRIMARY KEY,
    valor    INTEGER NOT NULL,
    hebraico TEXT,
    texto    TEXT NOT NULL,
    tipo     TEXT NOT NULL CHECK (tipo IN ('nota', 'nao_verificado')),
    fonte    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notas_valor ON notas(valor);

-- Visão "777": uma linha por caminho com as correspondências achatadas
CREATE VIEW IF NOT EXISTS tabela_777 AS
SELECT c.numero, c.nome, c.hebraico, c.letra, col.id AS coluna_id, col.nome AS coluna, cor.valor, cor.original
FROM caminhos c
JOIN correspondencias cor ON cor.caminho = c.numero
JOIN colunas col ON col.id = cor.coluna;

-- Visão "Godwin": números com mais de uma palavra (as isopsefias interessantes)
CREATE VIEW IF NOT EXISTS numeros_ressonantes AS
SELECT valor, COUNT(*) AS qtd, GROUP_CONCAT(hebraico || ' (' || significado || ')', ' = ') AS palavras
FROM palavras
GROUP BY valor
HAVING COUNT(*) > 1;

-- Créditos: de onde vem cada conjunto de dados e imagens
CREATE TABLE IF NOT EXISTS fontes (
    id      TEXT PRIMARY KEY,
    titulo  TEXT NOT NULL,
    autores TEXT NOT NULL,
    ano     TEXT,
    uso     TEXT NOT NULL,
    licenca TEXT NOT NULL,
    url     TEXT
);

-- Os 78 arcanos. Maiores ligam-se a um caminho (11-32); Menores a uma Sefirá (1-10)
CREATE TABLE IF NOT EXISTS cartas (
    id          TEXT PRIMARY KEY,            -- 'maior-08', 'copas-13'
    arcano      TEXT NOT NULL CHECK (arcano IN ('maior', 'menor')),
    numero      INTEGER NOT NULL,            -- maiores 0-21 (Golden Dawn); menores 1-10, 11-14 = corte
    naipe       TEXT CHECK (naipe IN ('paus', 'copas', 'espadas', 'ouros')),
    nome        TEXT NOT NULL,
    caminho     INTEGER REFERENCES caminhos(numero),
    sefira      INTEGER REFERENCES caminhos(numero),
    elemento    TEXT,
    subelemento TEXT,                         -- corte: 'Fogo de Água' = Rei de Copas
    decanato    TEXT,                         -- HKT p. 15
    dados       TEXT,                         -- HKT p. 17: três dados, ex. '135'
    mbti        TEXT,                         -- HKT, seguindo Jana Riley
    mbti_titulo TEXT,
    titulo      TEXT,                         -- título da Golden Dawn (Book T): 'Senhor da Vitória'
    palavras    TEXT,                         -- palavras-chave para a consulta
    CHECK ((arcano = 'maior' AND caminho IS NOT NULL) OR (arcano = 'menor' AND sefira IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS geomancia (
    nome        TEXT PRIMARY KEY,
    linhas      TEXT NOT NULL,               -- cabeça, pescoço, corpo, pés: 1 = um ponto, 2 = dois
    titulo      TEXT NOT NULL,
    planeta     TEXT,
    elemento    TEXT,
    signo       TEXT,
    numero      INTEGER,
    qualidade   TEXT,
    significado TEXT
);

CREATE TABLE IF NOT EXISTS runas (
    ordem INTEGER PRIMARY KEY,
    aett  TEXT NOT NULL,
    nome  TEXT NOT NULL,
    runa  TEXT NOT NULL
);

-- A Tábua de Esmeralda, pedra fundamental do projeto: latim (vulgata medieval),
-- grego (versão moderna, sem original antigo conhecido) e português (tradução do projeto)
CREATE TABLE IF NOT EXISTS tabua_esmeralda (
    verso     INTEGER PRIMARY KEY,
    latim     TEXT NOT NULL,
    grego     TEXT NOT NULL,
    portugues TEXT NOT NULL
);
