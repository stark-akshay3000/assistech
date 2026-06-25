from io import BytesIO
from docx import Document
import pdfplumber
import fitz


def extract_pdf_text(file_bytes: bytes) -> str:
    text = ""

    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    return text


def extract_docx_text(file_bytes: bytes) -> str:
    doc = Document(BytesIO(file_bytes))

    return "\n".join(
        para.text
        for para in doc.paragraphs
    )


def extract_pdf_links(file_bytes: bytes) -> list[str]:
    links = []

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")

        for page in doc:
            for link in page.get_links():
                uri = link.get("uri")

                if uri:
                    links.append(uri)

    except Exception:
        pass

    return links