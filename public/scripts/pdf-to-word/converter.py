from docx import Document # type: ignore
from docx.shared import Pt, Inches # type: ignore
from docx.oxml import OxmlElement # type: ignore
from docx.oxml.ns import qn # type: ignore
from docx.enum.text import WD_ALIGN_PARAGRAPH # type: ignore
import pdfplumber # type: ignore
import pypdf # type: ignore
import io

def rgb_to_hex(rgb_tuple):
    if not rgb_tuple or len(rgb_tuple) < 3:
        return 'FFFFFF'
    r, g, b = rgb_tuple[0], rgb_tuple[1], rgb_tuple[2]
    if isinstance(r, float) and r <= 1.0:
        r, g, b = int(r * 255), int(g * 255), int(b * 255)
    return f"{r:02x}{g:02x}{b:02x}".upper()

def set_cell_background(cell, hex_color):
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    cell._tc.get_or_add_tcPr().append(shd)

def overlap_area(bbox1, bbox2):
    x_left = max(bbox1[0], bbox2[0])
    y_top = max(bbox1[1], bbox2[1])
    x_right = min(bbox1[2], bbox2[2])
    y_bottom = min(bbox1[3], bbox2[3])
    if x_right < x_left or y_bottom < y_top:
        return 0.0
    return (x_right - x_left) * (y_bottom - y_top)

def bbox_area(bbox):
    return max(0, bbox[2] - bbox[0]) * max(0, bbox[3] - bbox[1])

def map_font(font_name):
    if not font_name: return 'Arial'
    font_name = font_name.split('-')[0].split(',')[0]
    if 'Helvetica' in font_name:
        return 'Arial' # Standard mapping for Word
    elif 'Times' in font_name:
        return 'Times New Roman'
    elif 'Courier' in font_name:
        return 'Courier New'
    return font_name

def is_underline(w, lines, rects):
    w_bottom = w['bottom']
    w_x0, w_x1 = w['x0'], w['x1']
    # Check lines
    for l in lines:
        if abs(l['top'] - l['bottom']) < 3: # horizontal
            if 0 <= l['top'] - w_bottom <= 3: # right below word
                if l['x0'] - 2 <= w_x1 and l['x1'] + 2 >= w_x0:
                    return True
    # Check thin rects
    for r in rects:
        if r['bottom'] - r['top'] < 3: # horizontal thin rect
            if 0 <= r['top'] - w_bottom <= 3:
                if r['x0'] - 2 <= w_x1 and r['x1'] + 2 >= w_x0:
                    return True
    return False

def convert_pdf_to_word(input_path, output_path):
    doc = Document()
    word_count = 0
    reader = pypdf.PdfReader(input_path)
    
    with pdfplumber.open(input_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            pypdf_page = reader.pages[page_num]
            tables = page.find_tables()
            table_bboxes = [t.bbox for t in tables]
            words = page.extract_words(extra_attrs=['fontname', 'size'])
            rects = page.rects
            pdf_lines = page.lines
            
            elements = []
            
            # 1. Images
            for img in pypdf_page.images:
                elements.append({
                    'type': 'image',
                    'data': img.data,
                    'top': -1
                })
            
            # 2. Tables
            for t in tables:
                elements.append({
                    'type': 'table',
                    'data': t,
                    'top': t.bbox[1],
                    'bbox': t.bbox
                })
                
            # 3. Text & Underline checking
            lines = {}
            for w in words:
                word_count += 1
                w['is_underline'] = is_underline(w, pdf_lines, rects)
                
                in_table = False
                for tb in table_bboxes:
                    if tb[0] <= w['x0'] and tb[1] <= w['top'] and tb[2] >= w['x1'] and tb[3] >= w['bottom']:
                        in_table = True
                        break
                        
                if not in_table:
                    y = round(w['top'] / 4) * 4
                    if y not in lines:
                        lines[y] = []
                    lines[y].append(w)
                    
            for y, line_words in lines.items():
                line_words.sort(key=lambda w: w['x0'])
                elements.append({
                    'type': 'text',
                    'words': line_words,
                    'top': y
                })
                
            elements.sort(key=lambda e: e['top'])
            
            # Build Document
            for e in elements:
                if e['type'] == 'image':
                    img_stream = io.BytesIO(e['data'])
                    p = doc.add_paragraph()
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    r = p.add_run()
                    try:
                        r.add_picture(img_stream, width=Inches(3.0))
                    except Exception:
                        pass
                
                elif e['type'] == 'table':
                    t = e['data']
                    rows = len(t.rows)
                    cols = max((len(row.cells) for row in t.rows), default=0)
                    if cols == 0: continue
                    
                    table_obj = doc.add_table(rows=rows, cols=cols)
                    table_obj.style = 'Table Grid'
                    
                    for i, row in enumerate(t.rows):
                        for j, cell_bbox in enumerate(row.cells):
                            if cell_bbox is None or j >= cols: continue
                            
                            cell = table_obj.cell(i, j)
                            cell.text = ''
                            p = cell.paragraphs[0]
                            
                            cell_bg_hex = None
                            max_overlap = 0
                            for r in rects:
                                color = r.get('non_stroking_color') or r.get('fill')
                                if not color: continue
                                r_bbox = (r['x0'], r['top'], r['x1'], r['bottom'])
                                overlap = overlap_area(cell_bbox, r_bbox)
                                if overlap > max_overlap and overlap > 0.5 * bbox_area(cell_bbox):
                                    max_overlap = overlap
                                    cell_bg_hex = rgb_to_hex(color)
                                    
                            if cell_bg_hex and cell_bg_hex != 'FFFFFF':
                                set_cell_background(cell, cell_bg_hex)
                                
                            cell_words = []
                            for w in words:
                                w_bbox = (w['x0'], w['top'], w['x1'], w['bottom'])
                                overlap = overlap_area(cell_bbox, w_bbox)
                                if overlap > 0.5 * bbox_area(w_bbox):
                                    cell_words.append(w)
                                    
                            cell_lines = {}
                            for cw in cell_words:
                                cy = round(cw['top'] / 4) * 4
                                if cy not in cell_lines:
                                    cell_lines[cy] = []
                                cell_lines[cy].append(cw)
                                
                            sorted_cy = sorted(cell_lines.keys())
                            for k, cy in enumerate(sorted_cy):
                                line_w = cell_lines[cy]
                                line_w.sort(key=lambda w: w['x0'])
                                
                                current_p = p if k == 0 else cell.add_paragraph()
                                
                                if len(line_w) > 0:
                                    center_x = (line_w[0]['x0'] + line_w[-1]['x1']) / 2
                                    cell_center = (cell_bbox[0] + cell_bbox[2]) / 2
                                    if abs(center_x - cell_center) < 10:
                                        current_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                                    else:
                                        # Set exact left indent relative to cell
                                        indent = line_w[0]['x0'] - cell_bbox[0]
                                        if indent > 5:
                                            current_p.paragraph_format.left_indent = Pt(indent)
                                
                                for w in line_w:
                                    run = current_p.add_run(w['text'] + ' ')
                                    run.font.size = Pt(round(w['size']))
                                    run.font.name = map_font(w.get('fontname'))
                                    
                                    font = w.get('fontname', '').lower()
                                    if 'bold' in font or 'heavy' in font or 'black' in font:
                                        run.bold = True
                                    if 'italic' in font or 'oblique' in font:
                                        run.italic = True
                                    if w.get('is_underline'):
                                        run.underline = True
                    
                    doc_p = doc.add_paragraph()
                    doc_p.paragraph_format.space_after = Pt(8)
                    
                elif e['type'] == 'text':
                    p = doc.add_paragraph()
                    
                    if len(e['words']) > 0:
                        # Center vs Indent
                        line_center = (e['words'][0]['x0'] + e['words'][-1]['x1']) / 2
                        if 250 < line_center < 350:
                            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        else:
                            indent = e['words'][0]['x0']
                            if indent > 10:
                                p.paragraph_format.left_indent = Pt(indent)
                            
                    for w in e['words']:
                        run = p.add_run(w['text'] + ' ')
                        run.font.size = Pt(round(w['size']))
                        run.font.name = map_font(w.get('fontname'))
                        
                        font = w.get('fontname', '').lower()
                        if 'bold' in font or 'heavy' in font or 'black' in font:
                            run.bold = True
                        if 'italic' in font or 'oblique' in font:
                            run.italic = True
                        if w.get('is_underline'):
                            run.underline = True
                            
                    p.paragraph_format.space_after = Pt(8)
                    
            if page_num < len(pdf.pages) - 1:
                doc.add_page_break()
                
    doc.save(output_path)
    return str(max(word_count, 1))
