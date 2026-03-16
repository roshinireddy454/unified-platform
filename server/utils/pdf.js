import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateSummaryPdf({ title, date, fullText, summary, subtitles }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595, pageHeight = 842, margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const fontSize = 11, lineHeight = 17;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const addPageIfNeeded = () => {
    if (y < margin + 40) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  const drawWrappedText = (text, { f = font, size = fontSize, color = rgb(0.1,0.1,0.1), gap = 3 } = {}) => {
    const words = String(text).split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(testLine, size) > maxWidth && line) {
        addPageIfNeeded();
        page.drawText(line, { x: margin, y, size, font: f, color });
        y -= lineHeight;
        line = word;
      } else { line = testLine; }
    }
    if (line) {
      addPageIfNeeded();
      page.drawText(line, { x: margin, y, size, font: f, color });
      y -= lineHeight;
    }
    y -= gap;
  };

  const sectionHeader = (text) => {
    addPageIfNeeded();
    page.drawRectangle({ x: margin - 5, y: y - 4, width: maxWidth + 10, height: 20, color: rgb(0.07,0.13,0.28) });
    page.drawText(text, { x: margin, y, size: 11, font: boldFont, color: rgb(1,1,1) });
    y -= 26;
  };

  // ── Header banner ──
  page.drawRectangle({ x: 0, y: pageHeight - 80, width: pageWidth, height: 80, color: rgb(0.07,0.13,0.28) });
  page.drawText("LearnSphere", { x: margin, y: pageHeight - 35, size: 20, font: boldFont, color: rgb(1,1,1) });
  page.drawText("AI Meeting Summary Report", { x: margin, y: pageHeight - 58, size: 12, font, color: rgb(0.7,0.8,1) });
  y = pageHeight - 100;

  // ── Title block ──
  y -= 10;
  page.drawText(title, { x: margin, y, size: 16, font: boldFont, color: rgb(0.07,0.13,0.28) });
  y -= 22;
  page.drawText(`Date: ${date}`, { x: margin, y, size: 10, font, color: rgb(0.5,0.5,0.5) });
  y -= 25;
  page.drawLine({ start: {x:margin,y}, end: {x:pageWidth-margin,y}, thickness:1, color:rgb(0.8,0.8,0.8) });
  y -= 20;

  // ── AI Summary ──
  if (summary) {
    sectionHeader("AI GENERATED SUMMARY");
    for (const line of summary.split("\n")) {
      if (line.trim()) drawWrappedText(line.trim(), { gap: 4 });
    }
    y -= 12;
  }

  // ── AI Subtitles ──
  if (subtitles) {
    sectionHeader("AI CLEANED SUBTITLES / TRANSCRIPT");
    for (const line of subtitles.split("\n")) {
      if (line.trim()) drawWrappedText(line.trim(), { size: 10, color: rgb(0.25,0.25,0.25), gap: 2 });
    }
    y -= 12;
  }

  // ── Raw Transcript ──
  sectionHeader("FULL RAW TRANSCRIPT");
  for (const para of (fullText || "").split("\n")) {
    if (para.trim()) drawWrappedText(para.trim(), { gap: 5 });
  }

  return await pdfDoc.save();
}

export function generateSummaryFromTranscript(text) {
  if (!text) return "";
  const sentences = text.split(".").map(s => s.trim()).filter(Boolean);
  const keywords = ["learn","topic","important","definition","means","process","system",
    "example","today","we will","objective","goal","concept","understand"];
  const important = sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k)));
  const final = important.length > 0 ? important.slice(0, 6) : sentences.slice(0, 4);
  return final.map(s => `• ${s}.`).join("\n");
}
