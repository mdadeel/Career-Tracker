import fs from 'fs/promises';
import path from 'path';

export interface ParseResult {
  text: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateFile(mimeType: string, fileSize: number): string | null {
  if (!ALLOWED_MIME.has(mimeType)) {
    return `Unsupported file type "${mimeType}". Accepted: PDF, DOCX, TXT.`;
  }
  if (fileSize > MAX_FILE_SIZE) {
    return `File is too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`;
  }
  return null;
}

function getStandardFontsUrl(): string {
  if (process.env.PDF_STANDARD_FONTS_URL) return process.env.PDF_STANDARD_FONTS_URL;
  try {
    const pdfjsDir = path.dirname(require.resolve('pdfjs-dist/package.json'));
    return 'file://' + path.join(pdfjsDir, 'standard_fonts') + '/';
  } catch {
    return 'https://unpkg.com/pdfjs-dist@5.4.296/standard_fonts/';
  }
}

const STANDARD_FONTS_URL = getStandardFontsUrl();

export async function parseResumeFile(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const { PDFParse } = await import('pdf-parse');
    const buffer = await fs.readFile(filePath);
    const doc = new PDFParse({
      data: new Uint8Array(buffer),
      standardFontDataUrl: STANDARD_FONTS_URL,
    });
    const result = await doc.getText();
    doc.destroy();
    return result.text ?? '';
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return fs.readFile(filePath, 'utf-8');
}
