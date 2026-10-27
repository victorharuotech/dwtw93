"""Dados de semente: letras, Árvore da Vida (Liber 777) e léxico inicial (Godwin)."""

# letra, nome, nome hebraico, valor, final, valor final, significado, tipo
LETRAS = [
    ('א', 'Aleph',  'אלף', 1,   None, None, 'Boi',              'mae'),
    ('ב', 'Beth',   'בית', 2,   None, None, 'Casa',             'dupla'),
    ('ג', 'Gimel',  'גימל', 3,  None, None, 'Camelo',           'dupla'),
    ('ד', 'Daleth', 'דלת', 4,   None, None, 'Porta',            'dupla'),
    ('ה', 'He',     'הא', 5,    None, None, 'Janela',           'simples'),
    ('ו', 'Vav',    'ואו', 6,   None, None, 'Prego',            'simples'),
    ('ז', 'Zayin',  'זין', 7,   None, None, 'Espada',           'simples'),
    ('ח', 'Cheth',  'חית', 8,   None, None, 'Cerca',            'simples'),
    ('ט', 'Teth',   'טית', 9,   None, None, 'Serpente',         'simples'),
    ('י', 'Yod',    'יוד', 10,  None, None, 'Mão',              'simples'),
    ('כ', 'Kaph',   'כף', 20,   'ך', 500, 'Palma da mão',     'dupla'),
    ('ל', 'Lamed',  'למד', 30,  None, None, 'Aguilhão',         'simples'),
    ('מ', 'Mem',    'מם', 40,   'ם', 600, 'Água',             'mae'),
    ('נ', 'Nun',    'נון', 50,  'ן', 700, 'Peixe',            'simples'),
    ('ס', 'Samekh', 'סמך', 60,  None, None, 'Esteio',           'simples'),
    ('ע', 'Ayin',   'עין', 70,  None, None, 'Olho',             'simples'),
    ('פ', 'Pe',     'פא', 80,   'ף', 800, 'Boca',             'dupla'),
    ('צ', 'Tzaddi', 'צדי', 90,  'ץ', 900, 'Anzol',            'simples'),
    ('ק', 'Qoph',   'קוף', 100, None, None, 'Nuca',             'simples'),
    ('ר', 'Resh',   'ריש', 200, None, None, 'Cabeça',           'dupla'),
    ('ש', 'Shin',   'שין', 300, None, None, 'Dente',            'mae'),
    ('ת', 'Tav',    'תו', 400,  None, None, 'Cruz / Sinal',     'dupla'),
]

COLUNAS = [
    (1006, 'Atribuição',           'Elemento, planeta ou signo (Sepher Yetzirah / Golden Dawn)'),
    (1007, 'Tarô',                 'Arcano Maior, numeração Golden Dawn; nomes do Thoth entre parênteses'),
    (1009, 'Nota',                 'Observações'),
]

# numero, nome, hebraico, significado, nome divino, arcanjo, coro, esfera mundana, cor
SEFIROT = [
    (1,  'Kether',    'כתר',    'Coroa',         ('אהיה', 'Eheieh'),               ('מטטרון', 'Metatron'),   ('חיות הקדש', 'Chayoth ha-Qadesh'), 'Rashith ha-Gilgalim (Primum Mobile)', 'Brilho'),
    (2,  'Chokmah',   'חכמה',   'Sabedoria',     ('יה', 'Yah'),                    ('רזיאל', 'Ratziel'),     ('אופנים', 'Auphanim'),             'Masloth (Zodíaco)',                   'Azul suave'),
    (3,  'Binah',     'בינה',   'Entendimento',  ('יהוה אלהים', 'YHVH Elohim'),    ('צפקיאל', 'Tzaphqiel'),  ('אראלים', 'Aralim'),               'Shabbathai (Saturno)',                'Carmesim'),
    (4,  'Chesed',    'חסד',    'Misericórdia',  ('אל', 'El'),                     ('צדקיאל', 'Tzadqiel'),   ('חשמלים', 'Chashmalim'),           'Tzedeq (Júpiter)',                    'Violeta profundo'),
    (5,  'Geburah',   'גבורה',  'Severidade',    ('אלהים גבור', 'Elohim Gibor'),   ('כמאל', 'Khamael'),      ('שרפים', 'Seraphim'),              'Madim (Marte)',                       'Laranja'),
    (6,  'Tiphareth', 'תפארת',  'Beleza',        ('יהוה אלוה ודעת', 'YHVH Eloah va-Daath'), ('רפאל', 'Raphael'), ('מלכים', 'Malakim'),        'Shemesh (Sol)',                       'Rosa claro'),
    (7,  'Netzach',   'נצח',    'Vitória',       ('יהוה צבאות', 'YHVH Tzabaoth'),  ('האניאל', 'Haniel'),     ('אלהים', 'Elohim'),                'Nogah (Vênus)',                       'Âmbar'),
    (8,  'Hod',       'הוד',    'Esplendor',     ('אלהים צבאות', 'Elohim Tzabaoth'), ('מיכאל', 'Michael'),   ('בני אלהים', 'Beni Elohim'),       'Kokab (Mercúrio)',                    'Violeta púrpura'),
    (9,  'Yesod',     'יסוד',   'Fundamento',    ('שדי אל חי', 'Shaddai El Chai'), ('גבריאל', 'Gabriel'),    ('כרובים', 'Kerubim'),              'Levanah (Lua)',                       'Índigo'),
    (10, 'Malkuth',   'מלכות',  'Reino',         ('אדני מלך', 'Adonai Melekh'), ('סנדלפון', 'Sandalphon'), ('אשים', 'Ashim'),                 'Cholem ha-Yesodoth (Elementos)',      'Amarelo'),
]

# numero, letra, de, para, atribuição, tarô, cor, nota
CAMINHOS_LETRAS = [
    (11, 'א', 1, 2,  'Ar',          '0 O Louco',                      'Amarelo pálido brilhante', None),
    (12, 'ב', 1, 3,  'Mercúrio',    'I O Mago',                       'Amarelo', None),
    (13, 'ג', 1, 6,  'Lua',         'II A Sacerdotisa',               'Azul', None),
    (14, 'ד', 2, 3,  'Vênus',       'III A Imperatriz',               'Verde esmeralda', None),
    (15, 'ה', 2, 6,  'Áries',       'IV O Imperador',                 'Escarlate', 'Crowley troca He/Tzaddi: "Tzaddi não é a Estrela" (AL I:57)'),
    (16, 'ו', 2, 4,  'Touro',       'V O Hierofante',                 'Vermelho alaranjado', None),
    (17, 'ז', 3, 6,  'Gêmeos',      'VI Os Amantes',                  'Laranja', None),
    (18, 'ח', 3, 5,  'Câncer',      'VII O Carro',                    'Âmbar', None),
    (19, 'ט', 4, 5,  'Leão',        'VIII A Força (XI Luxúria)',      'Amarelo esverdeado', None),
    (20, 'י', 4, 6,  'Virgem',      'IX O Eremita',                   'Verde amarelado', None),
    (21, 'כ', 4, 7,  'Júpiter',     'X A Roda da Fortuna',            'Violeta', None),
    (22, 'ל', 5, 6,  'Libra',       'XI A Justiça (VIII Ajustamento)', 'Verde esmeralda', None),
    (23, 'מ', 5, 8,  'Água',        'XII O Enforcado',                'Azul profundo', None),
    (24, 'נ', 6, 7,  'Escorpião',   'XIII A Morte',                   'Azul esverdeado', None),
    (25, 'ס', 6, 9,  'Sagitário',   'XIV A Temperança (Arte)',        'Azul', None),
    (26, 'ע', 6, 8,  'Capricórnio', 'XV O Diabo',                     'Índigo', None),
    (27, 'פ', 7, 8,  'Marte',       'XVI A Torre',                    'Escarlate', None),
    (28, 'צ', 7, 9,  'Aquário',     'XVII A Estrela',                 'Violeta', 'Crowley troca He/Tzaddi: "Tzaddi não é a Estrela" (AL I:57)'),
    (29, 'ק', 7, 10, 'Peixes',      'XVIII A Lua',                    'Carmesim (ultravioleta)', None),
    (30, 'ר', 8, 9,  'Sol',         'XIX O Sol',                      'Laranja', None),
    (31, 'ש', 8, 10, 'Fogo (e Espírito)', 'XX O Julgamento (O Aeon)', 'Laranja escarlate brilhante', None),
    (32, 'ת', 9, 10, 'Saturno (e Terra)', 'XXI O Mundo (O Universo)', 'Índigo', None),
]

# hebraico, transliteração, significado
PALAVRAS = [
    ('אחד', 'Echad', 'Um, Unidade'),
    ('אהבה', 'Ahavah', 'Amor'),
    ('יהוה', 'YHVH', 'Tetragrammaton'),
    ('הטבע', 'ha-Teva', 'A Natureza'),
    ('משיח', 'Mashiach', 'Messias'),
    ('נחש', 'Nachash', 'Serpente'),
    ('יין', 'Yayin', 'Vinho'),
    ('סוד', 'Sod', 'Segredo, mistério'),
    ('אור', 'Aur', 'Luz'),
    ('אין סוף', 'Ain Soph', 'Sem Limite'),
    ('רז', 'Raz', 'Segredo'),
    ('אמן', 'Amen', 'Amém'),
    ('מלאך', 'Malakh', 'Anjo, mensageiro'),
    ('אילן', 'Ilan', 'Árvore'),
    ('שלום', 'Shalom', 'Paz'),
    ('עשו', 'Esav', 'Esaú'),
    ('תורה', 'Torah', 'Lei'),
    ('אדם', 'Adam', 'Homem'),
    ('מה', 'Mah', 'O quê?'),
    ('חיים', 'Chayim', 'Vida'),
    ('חכם', 'Chakham', 'Sábio'),
    ('ברית', 'Berith', 'Aliança'),
    ('אגלא', 'AGLA', 'Notariqon de Atah Gibor Le-olam Adonai'),
    ('אברהם', 'Avraham', 'Abraão'),
    ('רחם', 'Rechem', 'Útero; compaixão'),
]
