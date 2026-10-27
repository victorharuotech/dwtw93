// Renderiza uma página num WebKit fora da tela e salva PNG (captura) ou PDF (páginas de tamanho fixo).
//
//   swift ferramentas/captura.swift png <url> <saida.png> [largura] [altura] [espera_s] [javascript]
//   (o javascript opcional roda depois de carregar, antes da captura — ex.: clicar num botão)
//   swift ferramentas/captura.swift pdf <arquivo.html> <saida.pdf> <largura> <altura_da_pagina> <n_paginas>
import AppKit
import PDFKit
import WebKit

let args = CommandLine.arguments
guard args.count >= 4 else {
    print("uso: captura.swift png|pdf <origem> <saida> ...")
    exit(1)
}
let modo = args[1], origem = args[2], saida = URL(fileURLWithPath: args[3])
let largura = args.count > 4 ? Double(args[4])! : 1280
let altura = args.count > 5 ? Double(args[5])! : 800
let extra = args.count > 6 ? Double(args[6])! : 2.5      // png: segundos de espera; pdf: nº de páginas

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)

final class Capturador: NSObject, WKNavigationDelegate {
    let web: WKWebView
    let janela: NSWindow

    override init() {
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: largura, height: altura))
        janela = NSWindow(contentRect: web.frame, styleMask: [.borderless], backing: .buffered, defer: false)
        super.init()
        janela.contentView = web
        janela.setFrameOrigin(NSPoint(x: -10000, y: -10000))   // fora da tela
        janela.orderBack(nil)
        web.navigationDelegate = self
        if modo == "png" {
            web.load(URLRequest(url: URL(string: origem)!))
        } else {
            let arquivo = URL(fileURLWithPath: origem)
            web.loadFileURL(arquivo, allowingReadAccessTo: arquivo.deletingLastPathComponent().deletingLastPathComponent())
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // espera fontes, imagens e o JavaScript da página terminarem
        if modo == "png", args.count > 7 {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                webView.evaluateJavaScript(args[7]) { _, _ in }
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + (modo == "png" ? extra : 2.0)) {
            self.modo == "png" ? self.png() : self.pdf(paginas: Int(extra))
        }
    }

    var modo: String { args[1] }

    func png() {
        let config = WKSnapshotConfiguration()
        config.rect = NSRect(x: 0, y: 0, width: largura, height: altura)
        config.snapshotWidth = NSNumber(value: largura)              // em tela retina, já sai em 2x
        web.takeSnapshot(with: config) { imagem, erro in
            guard let imagem, let tiff = imagem.tiffRepresentation,
                  let dados = NSBitmapImageRep(data: tiff)?.representation(using: .png, properties: [:]) else {
                print("erro: \(String(describing: erro))"); exit(1)
            }
            try! dados.write(to: saida)
            print("ok \(saida.lastPathComponent)")
            exit(0)
        }
    }

    func pdf(paginas: Int) {
        let documento = PDFDocument()
        func pagina(_ i: Int) {
            guard i < paginas else {
                documento.write(to: saida)
                print("ok \(saida.lastPathComponent) (\(paginas) páginas)")
                exit(0)
            }
            let config = WKPDFConfiguration()
            config.rect = CGRect(x: 0, y: Double(i) * altura, width: largura, height: altura)
            web.createPDF(configuration: config) { resultado in
                if case .success(let dados) = resultado, let p = PDFDocument(data: dados)?.page(at: 0) {
                    documento.insert(p, at: documento.pageCount)
                }
                pagina(i + 1)
            }
        }
        // a página precisa ter a altura de todos os slides para o WebKit desenhá-los
        janela.setContentSize(NSSize(width: largura, height: altura * Double(paginas)))
        web.frame = NSRect(x: 0, y: 0, width: largura, height: altura * Double(paginas))
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { pagina(0) }
    }
}

let capturador = Capturador()
app.run()
