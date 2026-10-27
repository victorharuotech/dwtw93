// Extrai as linhas de um PDF com coordenadas: pagina, x0, y0, x1, texto (TSV)
// Uso: swift ferramentas/linhas_pdf.swift arquivo.pdf > linhas.tsv
import PDFKit
let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
for i in 0..<doc.pageCount {
  guard let page = doc.page(at: i), let sel = page.selection(for: page.bounds(for: .mediaBox)) else { continue }
  for line in sel.selectionsByLine() {
    let b = line.bounds(for: page)
    let t = (line.string ?? "").replacingOccurrences(of: "\n", with: " ").replacingOccurrences(of: "\t", with: " ")
    if t.trimmingCharacters(in: .whitespaces).isEmpty { continue }
    print("\(i+1)\t\(Int(b.minX))\t\(Int(b.minY))\t\(Int(b.maxX))\t\(t)")
  }
}
