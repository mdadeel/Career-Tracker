import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { validateFile, parseResumeFile } from "../lib/resumeParser";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { execSync } from "child_process";

const TMP_DIR = path.join(os.tmpdir(), "resume-parser-test");

beforeAll(async () => {
  await fs.mkdir(TMP_DIR, { recursive: true });
});

afterAll(async () => {
  await fs.rm(TMP_DIR, { recursive: true, force: true });
});

describe("validateFile", () => {
  it("accepts PDF", () => {
    expect(validateFile("application/pdf", 1000)).toBeNull();
  });

  it("accepts DOCX", () => {
    expect(validateFile("application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1000)).toBeNull();
  });

  it("accepts TXT", () => {
    expect(validateFile("text/plain", 1000)).toBeNull();
  });

  it("rejects unsupported types", () => {
    const err = validateFile("image/png", 1000);
    expect(err).toContain("Unsupported");
  });

  it("rejects files over 5MB", () => {
    const err = validateFile("application/pdf", 6 * 1024 * 1024);
    expect(err).toContain("too large");
  });
});

describe("parseResumeFile", () => {
  it("extracts text from a plain TXT file", async () => {
    const txtPath = path.join(TMP_DIR, "test-resume.txt");
    await fs.writeFile(txtPath, "Hello World\nThis is a test resume.\nSkills: TypeScript, React");

    const text = await parseResumeFile(txtPath, "text/plain");
    expect(text).toContain("Hello World");
    expect(text).toContain("TypeScript");
  });

  it("extracts text from a PDF", async () => {
    const pdfPath = path.join(TMP_DIR, "test-resume.pdf");

    // Minimal PDF using standard Helvetica font
    const pdfContent = [
      "%PDF-1.4",
      "1 0 obj",
      "<< /Type /Catalog /Pages 2 0 R >>",
      "endobj",
      "2 0 obj",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "endobj",
      "3 0 obj",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]",
      "   /Resources << /Font << /F1 4 0 R >> >>",
      "   /Contents 5 0 R >>",
      "endobj",
      "4 0 obj",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      "endobj",
      "5 0 obj",
      "<< /Length 44 >>",
      "stream",
      "BT /F1 12 Tf 100 700 Td (Hello from PDF Resume!) Tj ET",
      "endstream",
      "endobj",
      "xref",
      "0 6",
      "0000000000 65535 f ",
      "0000000009 00000 n ",
      "0000000058 00000 n ",
      "0000000115 00000 n ",
      "0000000266 00000 n ",
      "0000000347 00000 n ",
      "trailer",
      "<< /Size 6 /Root 1 0 R >>",
      "startxref",
      "430",
      "%%EOF",
    ].join("\n");

    await fs.writeFile(pdfPath, pdfContent, "utf-8");

    const text = await parseResumeFile(pdfPath, "application/pdf");
    expect(text).toContain("Hello from PDF Resume");
  });

  it("extracts text from a DOCX file", async () => {
    const docxPath = path.join(TMP_DIR, "test-resume.docx");

    const docXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Hello from DOCX Resume!</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Skills: Node.js, Python</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const docxBuildDir = path.join(TMP_DIR, "docx-build");
    const wordDir = path.join(docxBuildDir, "word");
    const relsDir = path.join(docxBuildDir, "_rels");

    await fs.mkdir(wordDir, { recursive: true });
    await fs.mkdir(relsDir, { recursive: true });

    await fs.writeFile(path.join(wordDir, "document.xml"), docXml);
    await fs.writeFile(path.join(relsDir, ".rels"), rels);
    await fs.writeFile(path.join(docxBuildDir, "[Content_Types].xml"), contentTypes);

    execSync(
      `cd "${docxBuildDir}" && zip -r "${docxPath}" .`,
      { stdio: "pipe" }
    );

    const text = await parseResumeFile(docxPath, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(text).toContain("Hello from DOCX Resume");
    expect(text).toContain("Node.js");
  });

  it("returns empty string for empty content", async () => {
    const txtPath = path.join(TMP_DIR, "empty.txt");
    await fs.writeFile(txtPath, "");
    const text = await parseResumeFile(txtPath, "text/plain");
    expect(text).toBe("");
  });
});
