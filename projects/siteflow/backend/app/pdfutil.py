"""Small PDF writer for the sample specs.

The sample files are original short text, not copied manuals. Helvetica text
is enough for pypdf to extract. This is not a general PDF library.
"""

from __future__ import annotations


def _escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _page_stream(lines: list[str]) -> str:
    commands = ["BT", "/F1 11 Tf", "14 TL", "72 740 Td"]
    for index, line in enumerate(lines):
        shown = _escape(line)
        if index == 0:
            commands.append(f"({shown}) Tj")
        else:
            commands.append(f"T* ({shown}) Tj")
    commands.append("ET")
    return "\n".join(commands)


def build_text_pdf(pages: list[list[str]]) -> bytes:
    if not pages:
        raise ValueError("at least one page is required")

    objects: list[str] = []

    def add(body: str) -> int:
        objects.append(body)
        return len(objects)

    add("<< /Type /Catalog /Pages 2 0 R >>")
    kids = " ".join(f"{4 + index * 2} 0 R" for index in range(len(pages)))
    add(f"<< /Type /Pages /Kids [{kids}] /Count {len(pages)} >>")
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    for lines in pages:
        content_id = len(objects) + 2
        add(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            f"/Contents {content_id} 0 R /Resources << /Font << /F1 3 0 R >> >> >>"
        )
        stream = _page_stream(lines)
        add(f"<< /Length {len(stream)} >>\nstream\n{stream}\nendstream")

    output = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number, body in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{number} 0 obj\n".encode("ascii"))
        output.extend(body.encode("latin-1"))
        output.extend(b"\nendobj\n")

    xref = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        (
            f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref}\n%%EOF\n"
        ).encode("ascii")
    )
    return bytes(output)
