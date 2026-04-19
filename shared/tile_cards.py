#!/usr/bin/env python3
"""
Tile all pages of a PDF onto A4 sheets with crop/cut marks.

  - Card size is read directly from the first page of the input PDF.
  - All pages tile sequentially; a new A4 sheet starts when one is full.
  - Spacing is distributed equally (left margin = gap = right margin on each axis).

Usage:  python3 tile_cards.py input.pdf output.pdf

Install: pip install pypdf reportlab
"""

import sys
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader, PdfWriter, PageObject, Transformation

A4_W, A4_H  = A4          # 595.28 × 841.89 pt
MARK_LEN    = 10           # crop mark leg length (pt)
MARK_OFFSET =  4           # gap between card edge and start of mark (pt)
MARK_WIDTH  = 0.4          # stroke weight (pt)


# ── Grid geometry ─────────────────────────────────────────────────────────────

def best_grid(cw: float, ch: float) -> tuple[int, int, bool]:
    """Return (cols, rows, rotate) maximising cards per A4 sheet.
    rotate=True means cards are rotated 90° CCW on the page to fit more."""
    cols1, rows1 = max(1, int(A4_W // cw)), max(1, int(A4_H // ch))
    cols2, rows2 = max(1, int(A4_W // ch)), max(1, int(A4_H // cw))
    if cols2 * rows2 > cols1 * rows1:
        return cols2, rows2, True
    return cols1, rows1, False


def card_positions(cols: int, rows: int, cw: float, ch: float) -> list[tuple[float, float]]:
    """
    Return (x, y) bottom-left corners for every slot, with equal spacing
    (margin == gap) on each axis.  Row 0 is at the bottom of the page.
    """
    mx = (A4_W - cols * cw) / (cols + 1)
    my = (A4_H - rows * ch) / (rows + 1)
    return [
        (mx + col * (cw + mx), my + row * (ch + my))
        for row in range(rows)
        for col in range(cols)
    ]


# ── Crop marks ────────────────────────────────────────────────────────────────

def draw_crop_marks(c: canvas.Canvas, x: float, y: float,
                    w: float, h: float) -> None:
    """Draw cut marks around one card whose bottom-left corner is (x, y)."""
    c.setStrokeColorRGB(0, 0, 0)
    c.setLineWidth(MARK_WIDTH)
    o, l = MARK_OFFSET, MARK_LEN

    # Corner L-marks (two legs per corner, pointing away from card)
    c.line(x-o-l, y,     x-o,     y    );  c.line(x,   y-o-l, x,   y-o    )  # BL
    c.line(x+w+o, y,     x+w+o+l, y    );  c.line(x+w, y-o-l, x+w, y-o    )  # BR
    c.line(x-o-l, y+h,   x-o,     y+h  );  c.line(x,   y+h+o, x,   y+h+o+l)  # TL
    c.line(x+w+o, y+h,   x+w+o+l, y+h  );  c.line(x+w, y+h+o, x+w, y+h+o+l)  # TR

    # Determine which axis is the long one so marks are placed correctly
    # regardless of card orientation (portrait or landscape).
    if w >= h:
        # Landscape: top/bottom edges are the long ones (3 marks each);
        #            left/right edges are the short ones (1 centre mark each).
        for f in (0.25, 0.50, 0.75):         # long-edge ticks — top and bottom
            tx = x + w * f
            c.line(tx, y-o-l,   tx, y-o    )
            c.line(tx, y+h+o,   tx, y+h+o+l)
        my = y + h / 2                        # short-edge centre — left and right
        c.line(x-o-l, my, x-o,     my)
        c.line(x+w+o, my, x+w+o+l, my)
    else:
        # Portrait: left/right edges are the long ones (3 marks each);
        #           top/bottom edges are the short ones (1 centre mark each).
        for f in (0.25, 0.50, 0.75):         # long-edge ticks — left and right
            my = y + h * f
            c.line(x-o-l, my, x-o,     my)
            c.line(x+w+o, my, x+w+o+l, my)
        mx = x + w / 2                        # short-edge centre — top and bottom
        c.line(mx, y-o-l, mx, y-o    )
        c.line(mx, y+h+o, mx, y+h+o+l)


def build_overlay(positions: list, cw: float, ch: float) -> io.BytesIO:
    """Return an in-memory A4 PDF containing only the crop marks."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    for x, y in positions:
        draw_crop_marks(c, x, y, cw, ch)
    c.save()
    buf.seek(0)
    return buf


# ── Main ──────────────────────────────────────────────────────────────────────

def main(input_path: str, output_path: str) -> None:
    reader  = PdfReader(input_path)
    n_cards = len(reader.pages)

    # Card dimensions come from the PDF itself — no assumptions about orientation
    cw = float(reader.pages[0].mediabox.width)
    ch = float(reader.pages[0].mediabox.height)

    cols, rows, rotate = best_grid(cw, ch)
    # tw/th = dimensions the card occupies on the page (swapped if rotated)
    tw, th = (ch, cw) if rotate else (cw, ch)

    per_sheet = cols * rows
    positions = card_positions(cols, rows, tw, th)

    # Single-page input → fill the whole sheet with copies of that one card
    if n_cards == 1:
        page_indices = [0] * per_sheet
    else:
        page_indices = list(range(n_cards))

    n_sheets = (len(page_indices) + per_sheet - 1) // per_sheet

    mx = (A4_W - cols * tw) / (cols + 1)
    my = (A4_H - rows * th) / (rows + 1)

    rot_note = " (rotated 90° to maximise fit)" if rotate else ""
    print(f"Card size : {cw:.1f} × {ch:.1f} pt  ({cw/72:.4g}\" × {ch/72:.4g}\")")
    print(f"Grid      : {cols} × {rows} = {per_sheet} cards / sheet{rot_note}")
    print(f"Spacing   : {mx/72:.3f}\" ({mx:.1f} pt) horizontal, "
                      f"{my/72:.3f}\" ({my:.1f} pt) vertical")
    if n_cards == 1:
        print(f"Output    : 1 unique card repeated {per_sheet}× on 1 sheet")
    else:
        print(f"Output    : {n_cards} cards → {n_sheets} sheet(s)")

    # Build the overlay once; it's identical for every sheet
    # Marks are drawn around the tile footprint (tw × th) on the page
    overlay_buf = build_overlay(positions, tw, th)

    writer = PdfWriter()

    for sheet in range(n_sheets):
        out_page = PageObject.create_blank_page(width=A4_W, height=A4_H)

        # Stamp every card that belongs on this sheet
        start = sheet * per_sheet
        for slot, card_idx in enumerate(page_indices[start : start + per_sheet]):
            x, y = positions[slot]
            src  = PdfReader(input_path).pages[card_idx]
            if rotate:
                # 90° CCW rotation: card (cw×ch) placed in footprint (ch×cw).
                # Matrix (a,b,c,d,e,f): point (px,py) → (a·px+c·py+e, b·px+d·py+f)
                # 90° CCW: (px,py) → (-py+x+ch, px+y)  i.e. a=0,b=1,c=-1,d=0,e=x+ch,f=y
                t = Transformation((0, 1, -1, 0, x + ch, y))
            else:
                t = Transformation().translate(x, y)
            out_page.merge_transformed_page(src, t)

        # Lay crop marks on top
        overlay_buf.seek(0)
        out_page.merge_page(PdfReader(overlay_buf).pages[0])

        writer.add_page(out_page)

    with open(output_path, "wb") as fh:
        writer.write(fh)

    print(f"\n✓  Written: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: python3 {sys.argv[0]} input.pdf output.pdf")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
