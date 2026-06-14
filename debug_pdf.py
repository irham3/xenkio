import sys
sys.path.append(r'd:\Work\00\xenkio\public\scripts\pdf-to-word')
from converter import convert_pdf_to_word
from docx import Document

pdf_path = r'd:\Work\00\xenkio\.next\LRTJ-FR-FOP-003-130.pdf'
out_path = r'd:\Work\00\xenkio\debug_out.docx'

try:
    convert_pdf_to_word(pdf_path, out_path)
    print("Conversion successful.")
except Exception as e:
    print(f"Conversion failed: {e}")
    sys.exit(1)

doc = Document(out_path)
print("\nDocument Tables:")
for i, t in enumerate(doc.tables):
    print(f"Table {i}: {len(t.rows)}x{len(t.columns)}")
    for ri, row in enumerate(t.rows):
        row_text = [c.text.strip().replace('\n', ' ')[:15] for c in row.cells]
        print(f"  Row {ri}: {row_text}")
