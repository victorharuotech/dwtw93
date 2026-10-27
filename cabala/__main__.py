"""Linha de comando: python -m cabala <comando> ..."""
import argparse

from . import consultas, db, saida
from .numeros import propriedades


def cmd_numero(conn, args):
    r = consultas.por_numero(conn, args.n)
    saida.titulo(str(r['numero']), ' · '.join([f'redução {r["reducao"]}', *propriedades(r['numero'])]))
    if r['caminho']:
        c = r['caminho']
        print(f'   Caminho {c["chave"]}: {c["nome"]}  {c["hebraico"]}')
    if r['letra']:
        print(f'   Letra {r["letra"]["nome"]}  {r["letra"]["letra"]}')
    if r['palavras']:
        saida.secao('Palavras', len(saida.agrupar(r['palavras'])))
        saida.palavras(r['palavras'])
    if r['palavras_gadol']:
        saida.secao('Pelo Mispar Gadol (finais 500–900)')
        saida.palavras(r['palavras_gadol'], mostrar_valor=True)
    saida.notas(r['notas'])


def cmd_palavra(conn, args):
    r = consultas.por_palavra(conn, args.texto)
    saida.titulo(f'{r["valor"]}', f'Gadol {r["valor_gadol"]}')
    print(f'   {saida.negrito(r["texto"])}')
    if r['equivalentes']:
        saida.secao('Mesmo valor', len(saida.agrupar(r['equivalentes'])))
        saida.palavras(r['equivalentes'])


def cmd_caminho(conn, args):
    r = consultas.caminho(conn, consultas.linha(args.n))
    c = r['caminho']
    print(f'═══ Caminho {c["chave"]}: {c["nome"]} {c["hebraico"]} ═══')
    if c['de_sefira']:
        print(f'  Liga {c["de_sefira"]} → {c["para_sefira"]}')
    for linha in r['correspondencias']:
        print(f'  {linha["coluna"]:<38} {linha["valor"]}')


def cmd_coluna(conn, args):
    for linha in consultas.coluna(conn, args.ref):
        print(f'  {linha["chave"]:>6}  {linha["nome"]:<16} {linha["valor"]}')


def cmd_colunas(conn, args):
    for c in consultas.colunas(conn):
        print(f'  {c["id"]:>4}  {c["romano"] or "":<9} {c["nome"]}')


def cmd_buscar(conn, args):
    rows = consultas.buscar(conn, args.termo)
    saida.titulo(f'"{args.termo}"', f'{len(rows)} resultados')
    saida.palavras(rows, mostrar_valor=True)


def cmd_adicionar(conn, args):
    db.adicionar_palavra(conn, args.hebraico, args.transliteracao, args.significado, args.fonte)
    conn.commit()
    cmd_palavra(conn, argparse.Namespace(texto=args.hebraico))


def main():
    ap = argparse.ArgumentParser(prog='cabala', description='DWTW93 — dicionário cabalístico (Liber 777 + Sepher Sephiroth)')
    ap.add_argument('--completo', action='store_true', help='não corta textos longos')
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('criar', help='(re)cria o banco a partir dos dados de semente')
    sub.add_parser('numero').add_argument('n', type=int)
    sub.add_parser('palavra').add_argument('texto')
    sub.add_parser('caminho').add_argument('n', help="0-32, '32bis' ou '31bis'")
    sub.add_parser('coluna').add_argument('ref', help='número, romano (XV) ou nome')
    sub.add_parser('colunas')
    w = sub.add_parser('web', help='abre a interface no navegador')
    w.add_argument('--porta', type=int, default=5777)
    w.add_argument('--sem-navegador', action='store_true')
    sub.add_parser('buscar').add_argument('termo')
    p = sub.add_parser('adicionar')
    p.add_argument('hebraico'); p.add_argument('transliteracao'); p.add_argument('significado')
    p.add_argument('--fonte', default='Pessoal')
    args = ap.parse_args()

    if args.cmd == 'criar':
        conn = db.criar()
        n = conn.execute('SELECT COUNT(*) FROM palavras').fetchone()[0]
        print(f'Banco criado em {db.BANCO_PADRAO.name} com {n} palavras.')
        return
    if args.cmd == 'web':
        from . import web   # importa o Flask só quando necessário
        web.rodar(args.porta, abrir=not args.sem_navegador)
        return
    if args.completo:
        saida.MAX_LINHAS = None
    conn = db.conectar()
    globals()[f'cmd_{args.cmd}'](conn, args)


if __name__ == '__main__':
    main()
