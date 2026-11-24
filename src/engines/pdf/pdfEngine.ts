import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PdfAnnotation, StoredFont } from '../../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function hexToRgb(hex = '#1D4ED8') {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(isNaN(r) ? 0.11 : r, isNaN(g) ? 0.31 : g, isNaN(b) ? 0.85 : b);
}

function isAsciiOnly(text: string): boolean {
  return /^[\x20-\x7E\r\n]*$/.test(text);
}

async function renderTextToPngBytes(
  text: string,
  fontFamily: string,
  fontSize: number,
  color: string,
  backgroundColor?: string
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const scale = 2;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontSize * scale}px "${fontFamily}", Cairo, Arial, sans-serif`;
  const lines = text.split('\n');
  const maxWidth = Math.max(...lines.map((l) => ctx.measureText(l).width), 40 * scale);
  const lineH = fontSize * 1.45 * scale;
  canvas.width = Math.ceil(maxWidth + 16 * scale);
  canvas.height = Math.ceil(lines.length * lineH + 12 * scale);

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.font = `${fontSize * scale}px "${fontFamily}", Cairo, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  const isRtl = /[\u0600-\u06FF]/.test(text);
  ctx.direction = isRtl ? 'rtl' : 'ltr';
  ctx.textAlign = isRtl ? 'right' : 'left';
  const drawX = isRtl ? canvas.width - 8 * scale : 8 * scale;

  lines.forEach((line, idx) => {
    ctx.fillText(line, drawX, 6 * scale + idx * lineH);
  });

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, width: canvas.width / scale, height: canvas.height / scale };
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function createBlankPdfBlob(title = 'New PDF', pageCount = 1): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(title);
  pdfDoc.setCreator('AMR DOCS');
  for (let i = 0; i < pageCount; i++) {
    pdfDoc.addPage([595.28, 841.89]); // A4
  }
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function loadPdfDocument(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return loadingTask.promise;
}

let activeRenderTask: pdfjsLib.RenderTask | null = null;

export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.4
): Promise<{ width: number; height: number; textContent: string }> {
  if (activeRenderTask) {
    try {
      activeRenderTask.cancel();
    } catch {
      // Ignore already finished task
    }
    activeRenderTask = null;
  }
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const ctx = canvas.getContext('2d')!;
  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

  activeRenderTask = page.render({
    canvasContext: ctx,
    transform,
    viewport,
  });
  try {
    await activeRenderTask.promise;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'RenderingCancelledException') {
      return { width: viewport.width, height: viewport.height, textContent: '' };
    }
    throw err;
  } finally {
    activeRenderTask = null;
  }

  let textContent = '';
  try {
    const tc = await page.getTextContent();
    textContent = tc.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();
  } catch {
    textContent = '';
  }

  return { width: viewport.width, height: viewport.height, textContent };
}

export async function applyAnnotationsAndSavePdf(
  originalBlob: Blob,
  annotations: PdfAnnotation[],
  availableFonts: StoredFont[],
  options?: { addPageNumbers?: boolean; compress?: boolean }
): Promise<Blob> {
  const arrayBuffer = await originalBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  pdfDoc.registerFontkit(fontkit);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const embeddedCustomFonts = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>>();

  const pages = pdfDoc.getPages();

  for (const ann of annotations) {
    const page = pages[ann.pageIndex];
    if (!page) continue;
    const { width: pw, height: ph } = page.getSize();
    const px = ann.x * pw;
    const py = ph - ann.y * ph; // PDF origin is bottom-left
    const color = hexToRgb(ann.color || '#1D4ED8');

    if (ann.type === 'text' || ann.type === 'textbox' || ann.type === 'date' || ann.type === 'note') {
      const textVal = ann.text || '';
      if (!textVal) continue;
      const fontSize = ann.fontSize || 14;
      const customFontObj = availableFonts.find((f) => f.family === ann.fontFamily && (f.data || f.publicUrl));

      if (ann.backgroundColor) {
        const bw = (ann.width || 0.25) * pw;
        const bh = (ann.height || 0.06) * ph;
        page.drawRectangle({
          x: px,
          y: py - bh,
          width: bw,
          height: bh,
          color: hexToRgb(ann.backgroundColor),
          borderColor: ann.type === 'note' ? rgb(0.92, 0.7, 0.03) : undefined,
          borderWidth: ann.type === 'note' ? 1 : 0,
        });
      }

      if (customFontObj && (customFontObj.data || customFontObj.publicUrl)) {
        let embedded = embeddedCustomFonts.get(customFontObj.family);
        if (!embedded) {
          const fontBytes = customFontObj.data
            ? customFontObj.data
            : await fetch(customFontObj.publicUrl!).then((r) => r.arrayBuffer());
          embedded = await pdfDoc.embedFont(fontBytes);
          embeddedCustomFonts.set(customFontObj.family, embedded);
        }
        page.drawText(textVal, {
          x: px + 4,
          y: py - fontSize - 4,
          size: fontSize,
          font: embedded,
          color,
        });
      } else if (isAsciiOnly(textVal)) {
        page.drawText(textVal, {
          x: px + 4,
          y: py - fontSize - 4,
          size: fontSize,
          font: helvetica,
          color,
        });
      } else {
        // Render Arabic / Unicode text cleanly via canvas PNG so glyphs shape properly
        const png = await renderTextToPngBytes(
          textVal,
          ann.fontFamily || 'Cairo',
          fontSize,
          ann.color || '#0F2942',
          ann.backgroundColor
        );
        const img = await pdfDoc.embedPng(png.bytes);
        page.drawImage(img, {
          x: px,
          y: py - png.height,
          width: png.width,
          height: png.height,
        });
      }
    } else if (ann.type === 'highlight' || ann.type === 'rect') {
      const rw = (ann.width || 0.2) * pw;
      const rh = (ann.height || 0.04) * ph;
      page.drawRectangle({
        x: px,
        y: py - rh,
        width: rw,
        height: rh,
        color: ann.type === 'highlight' ? hexToRgb(ann.color || '#FACC15') : undefined,
        opacity: ann.type === 'highlight' ? ann.opacity ?? 0.35 : 1,
        borderColor: ann.type === 'rect' ? color : undefined,
        borderWidth: ann.type === 'rect' ? ann.strokeWidth || 2 : 0,
      });
    } else if (ann.type === 'underline' || ann.type === 'strike') {
      const lw = (ann.width || 0.2) * pw;
      page.drawLine({
        start: { x: px, y: py },
        end: { x: px + lw, y: py },
        thickness: ann.strokeWidth || 2,
        color,
      });
    } else if (ann.type === 'circle') {
      const rw = ((ann.width || 0.12) * pw) / 2;
      const rh = ((ann.height || 0.12) * ph) / 2;
      page.drawEllipse({
        x: px + rw,
        y: py - rh,
        xScale: rw,
        yScale: rh,
        borderColor: color,
        borderWidth: ann.strokeWidth || 2,
      });
    } else if (ann.type === 'arrow') {
      const x2 = (ann.x2 ?? ann.x + 0.15) * pw;
      const y2 = ph - (ann.y2 ?? ann.y) * ph;
      page.drawLine({
        start: { x: px, y: py },
        end: { x: x2, y: y2 },
        thickness: ann.strokeWidth || 2.5,
        color,
      });
    } else if (ann.type === 'freehand' && ann.points && ann.points.length > 1) {
      for (let i = 1; i < ann.points.length; i++) {
        const p1 = ann.points[i - 1];
        const p2 = ann.points[i];
        page.drawLine({
          start: { x: p1.x * pw, y: ph - p1.y * ph },
          end: { x: p2.x * pw, y: ph - p2.y * ph },
          thickness: ann.strokeWidth || 2,
          color,
        });
      }
    } else if ((ann.type === 'image' || ann.type === 'signature') && ann.imageDataUrl) {
      try {
        const bytes = dataUrlToBytes(ann.imageDataUrl);
        const isJpg = ann.imageDataUrl.includes('image/jpeg') || ann.imageDataUrl.includes('image/jpg');
        const img = isJpg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
        const iw = (ann.width || 0.25) * pw;
        const ih = (ann.height || 0.12) * ph;
        page.drawImage(img, {
          x: px,
          y: py - ih,
          width: iw,
          height: ih,
          rotate: degrees(ann.rotation || 0),
        });
      } catch {
        // Skip invalid image bytes
      }
    }
  }

  if (options?.addPageNumbers) {
    pages.forEach((p, idx) => {
      const { width } = p.getSize();
      p.drawText(`${idx + 1} / ${pages.length}`, {
        x: width / 2 - 15,
        y: 18,
        size: 10,
        font: helvetica,
        color: rgb(0.4, 0.45, 0.55),
      });
    });
  }

  const savedBytes = await pdfDoc.save({ useObjectStreams: options?.compress ?? true });
  return new Blob([savedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function rotatePdfPage(blob: Blob, pageIndex: number, angleDelta = 90): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(await blob.arrayBuffer());
  const page = pdfDoc.getPage(pageIndex);
  const current = page.getRotation().angle;
  page.setRotation(degrees((current + angleDelta) % 360));
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function deletePdfPage(blob: Blob, pageIndex: number): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(await blob.arrayBuffer());
  if (pdfDoc.getPageCount() <= 1) {
    throw new Error('Cannot delete the only remaining page');
  }
  pdfDoc.removePage(pageIndex);
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function addBlankPdfPage(blob: Blob, afterIndex?: number): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(await blob.arrayBuffer());
  if (typeof afterIndex === 'number' && afterIndex >= 0 && afterIndex < pdfDoc.getPageCount()) {
    pdfDoc.insertPage(afterIndex + 1, [595.28, 841.89]);
  } else {
    pdfDoc.addPage([595.28, 841.89]);
  }
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function reorderPdfPages(blob: Blob, newOrder: number[]): Promise<Blob> {
  const src = await PDFDocument.load(await blob.arrayBuffer());
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, newOrder);
  copied.forEach((p) => out.addPage(p));
  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function extractPdfPages(blob: Blob, pageIndices: number[]): Promise<Blob> {
  const src = await PDFDocument.load(await blob.arrayBuffer());
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pageIndices);
  copied.forEach((p) => out.addPage(p));
  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function mergePdfBlobs(blobs: Blob[]): Promise<Blob> {
  const out = await PDFDocument.create();
  for (const b of blobs) {
    const src = await PDFDocument.load(await b.arrayBuffer());
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function imagesToPdfBlob(imageFiles: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  for (const file of imageFiles) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isJpg = file.type.includes('jpeg') || file.type.includes('jpg');
    const img = isJpg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const saved = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([saved.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function compressPdfBlob(blob: Blob): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(await blob.arrayBuffer());
  const bytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
