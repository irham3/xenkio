import pdfplumber

with pdfplumber.open(r'd:\Work\00\xenkio\.next\LRTJ-FR-FOP-003-130.pdf') as pdf:
    # Look at page 2 where the Catatan box is
    p2 = pdf.pages[1]
    
    tables = p2.find_tables()
    print(f"Page 2 default tables found: {len(tables)}")
    for i, t in enumerate(tables):
        print(f"  Table {i}: bbox={t.bbox} rows={len(t.rows)}")
    
    # Try finding explicit rectangles
    print(f"\nRectangles on page 2: {len(p2.rects)}")
    for r in p2.rects:
        # Check if it's a large box (e.g., width > 300, height > 50)
        w = r['width']
        h = r['height']
        if w > 300 and h > 50:
            print(f"  Found large rect: bbox=({r['x0']}, {r['top']}, {r['x1']}, {r['bottom']}) w={w} h={h}")
    
    # Try finding lines that form the Catatan box
    lines = p2.lines
    print(f"\nLines on page 2: {len(lines)}")
    # The catatan box is probably around top=250?
