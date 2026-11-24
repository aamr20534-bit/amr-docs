import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  TextWrappingType,
  UnderlineType,
  WidthType,
} from 'docx';
import { PDFDocument, rgb } from 'pdf-lib';
import { DocxDocumentModel, DocxParagraph } from '../../types';

function mmToTwips(mm: number): number {
  return Math.round((mm / 25.4) * 1440);
}

function mapAlign(align?: DocxParagraph['align']) {
  switch (align) {
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
}

function mapHeading(heading?: DocxParagraph['heading']) {
  switch (heading) {
    case 'h1':
      return HeadingLevel.HEADING_1;
    case 'h2':
      return HeadingLevel.HEADING_2;
    case 'h3':
      return HeadingLevel.HEADING_3;
    case 'subtitle':
      return HeadingLevel.HEADING_4;
    default:
      return undefined;
  }
}

function cleanHex(hex?: string): string | undefined {
  if (!hex) return undefined;
  return hex.replace('#', '').toUpperCase();
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function buildDocxParagraph(p: DocxParagraph, defaultDir: 'rtl' | 'ltr'): Paragraph {
  const children: Array<TextRun | ExternalHyperlink> = p.runs.map((r) => {
    const run = new TextRun({
      text: r.text,
      bold: r.bold,
      italics: r.italic,
      underline: r.underline ? { type: UnderlineType.SINGLE } : undefined,
      strike: r.strike,
      superScript: r.superScript,
      subScript: r.subScript,
      font: r.fontFamily || 'Cairo',
      size: (r.fontSize || 12) * 2,
      color: cleanHex(r.color) || '1E293B',
      shading:
        r.highlight || r.backgroundColor
          ? {
              type: ShadingType.CLEAR,
              fill: cleanHex(r.highlight || r.backgroundColor) || 'FEF08A',
            }
          : undefined,
      rightToLeft: (p.direction || defaultDir) === 'rtl',
    });

    if (r.linkUrl) {
      return new ExternalHyperlink({
        link: r.linkUrl,
        children: [run],
      });
    }
    return run;
  });

  return new Paragraph({
    children,
    alignment: mapAlign(p.align),
    heading: mapHeading(p.heading),
    bidirectional: (p.direction || defaultDir) === 'rtl',
    bullet: p.listType === 'bullet' ? { level: p.listLevel || 0 } : undefined,
    numbering: (p.listType === 'number' || p.listType === 'alpha-ar' || p.listType === 'roman') ? { reference: 'amr-numbering', level: p.listLevel || 0 } : undefined,
    spacing: {
      line: Math.round((p.lineSpacing || 1.4) * 240),
      before: (p.spaceBefore || 0) * 20,
      after: (p.spaceAfter ?? 6) * 20,
    },
    indent: {
      left: p.indentLeft ? p.indentLeft * 15 : undefined,
      right: p.indentRight ? p.indentRight * 15 : undefined,
    },
  });
}

export async function exportModelToDocxBlob(model: DocxDocumentModel): Promise<Blob> {
  const sectionChildren: Array<Paragraph | Table> = [];

  for (const block of model.blocks) {
    if (block.type === 'paragraph') {
      sectionChildren.push(buildDocxParagraph(block, model.direction));
    } else if (block.type === 'pageBreak') {
      sectionChildren.push(new Paragraph({ children: [new PageBreak()] }));
    } else if (block.type === 'image') {
      try {
        const bytes = dataUrlToUint8Array(block.dataUrl);
        sectionChildren.push(
          new Paragraph({
            alignment: mapAlign(block.align || 'center'),
            children: [
              new ImageRun({
                data: bytes,
                transformation: {
                  width: block.width || 320,
                  height: block.height || 220,
                  rotation: block.rotation || 0,
                  flip: {
                    horizontal: !!block.flipH,
                    vertical: !!block.flipV,
                  },
                },
                floating:
                  block.wrapMode && block.wrapMode !== 'inline'
                    ? {
                        horizontalPosition: { align: block.align === 'left' ? 'left' : block.align === 'right' ? 'right' : 'center' },
                        verticalPosition: { relative: 'paragraph', offset: 0 },
                        behindDocument: block.wrapMode === 'behind',
                        wrap: {
                          type:
                            block.wrapMode === 'tight'
                              ? TextWrappingType.TIGHT
                              : TextWrappingType.NONE,
                        },
                      }
                    : undefined,
              }),
            ],
          })
        );
      } catch {
        sectionChildren.push(new Paragraph({ children: [new TextRun('[Image]')] }));
      }
    } else if (block.type === 'shape' || block.type === 'textbox') {
      sectionChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: {
                    type: ShadingType.CLEAR,
                    fill: cleanHex(block.fillColor) || 'EFF6FF',
                  },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 8, color: cleanHex(block.borderColor) || '1D4ED8' },
                    bottom: { style: BorderStyle.SINGLE, size: 8, color: cleanHex(block.borderColor) || '1D4ED8' },
                    left: { style: BorderStyle.SINGLE, size: 8, color: cleanHex(block.borderColor) || '1D4ED8' },
                    right: { style: BorderStyle.SINGLE, size: 8, color: cleanHex(block.borderColor) || '1D4ED8' },
                  },
                  children: [
                    new Paragraph({
                      bidirectional: model.direction === 'rtl',
                      alignment: model.direction === 'rtl' ? AlignmentType.RIGHT : AlignmentType.LEFT,
                      children: [new TextRun({ text: block.text, font: 'Cairo', size: 24 })],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    } else if (block.type === 'table') {
      const borderCol = cleanHex(block.borderColor) || 'CBD5E1';
      const rows = block.rows.map(
        (r) =>
          new TableRow({
            children: r.cells.map(
              (c) =>
                new TableCell({
                  columnSpan: c.colSpan,
                  rowSpan: c.rowSpan,
                  shading: c.backgroundColor
                    ? { type: ShadingType.CLEAR, fill: cleanHex(c.backgroundColor) || 'FFFFFF' }
                    : undefined,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: borderCol },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: borderCol },
                    left: { style: BorderStyle.SINGLE, size: 4, color: borderCol },
                    right: { style: BorderStyle.SINGLE, size: 4, color: borderCol },
                  },
                  children: c.paragraphs.map((cp) => buildDocxParagraph(cp, model.direction)),
                })
            ),
          })
      );
      sectionChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        })
      );
    }
  }

  const ps = model.pageSetup;
  const paperDims =
    ps.paperSize === 'Letter'
      ? { width: 12240, height: 15840 }
      : ps.paperSize === 'Legal'
        ? { width: 12240, height: 20160 }
        : { width: 11906, height: 16838 };

  const headerParagraphs: Paragraph[] = [];
  if (ps.headerText || ps.watermarkText) {
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: ps.headerText || ps.watermarkText,
            color: ps.headerText ? '64748B' : 'CBD5E1',
            size: ps.headerText ? 18 : 36,
            font: 'Cairo',
          }),
        ],
      })
    );
  }

  const footerRuns: TextRun[] = [];
  if (ps.footerText) {
    footerRuns.push(new TextRun({ text: `${ps.footerText}   `, color: '64748B', size: 18, font: 'Cairo' }));
  }
  if (ps.showPageNumbers) {
    footerRuns.push(
      new TextRun({
        children:
          ps.pageNumberFormat === 'number'
            ? [PageNumber.CURRENT]
            : [PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES],
        color: '64748B',
        size: 18,
      })
    );
  }

  const borderColorHex = cleanHex(ps.pageBorderColor) || '1D4ED8';
  const borderSize = Math.max(4, (ps.pageBorderWidth || 1) * 6);
  const docxBorderStyle =
    ps.pageBorderStyle === 'dashed'
      ? BorderStyle.DASHED
      : ps.pageBorderStyle === 'double'
        ? BorderStyle.DOUBLE
        : ps.pageBorderStyle === 'dotted'
          ? BorderStyle.DOTTED
          : BorderStyle.SINGLE;

  const bgHex = cleanHex(ps.pageBackgroundColor);
  const doc = new Document({
    background: bgHex && bgHex !== 'FFFFFF' ? { color: bgHex } : undefined,
    numbering: {
      config: [
        {
          reference: 'amr-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          titlePage: !!ps.differentFirstPage,
          page: {
            size: {
              width: paperDims.width,
              height: paperDims.height,
              orientation:
                ps.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: {
              top: mmToTwips(ps.marginTop),
              bottom: mmToTwips(ps.marginBottom),
              left: mmToTwips(ps.marginLeft),
              right: mmToTwips(ps.marginRight),
            },
            borders: ps.pageBorder
              ? {
                  pageBorderTop: { style: docxBorderStyle, size: borderSize, color: borderColorHex, space: 24 },
                  pageBorderBottom: { style: docxBorderStyle, size: borderSize, color: borderColorHex, space: 24 },
                  pageBorderLeft: { style: docxBorderStyle, size: borderSize, color: borderColorHex, space: 24 },
                  pageBorderRight: { style: docxBorderStyle, size: borderSize, color: borderColorHex, space: 24 },
                }
              : undefined,
          },
          column: ps.columns === 2 ? { count: 2, space: 720 } : undefined,
        },
        headers:
          headerParagraphs.length > 0
            ? {
                default: new Header({ children: headerParagraphs }),
              }
            : undefined,
        footers:
          footerRuns.length > 0
            ? {
                default: new Footer({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: footerRuns,
                    }),
                  ],
                }),
              }
            : undefined,
        children: sectionChildren,
      },
    ],
  });

  return Packer.toBlob(doc);
}

/**
 * Exports a DocxDocumentModel to PDF by rendering each page cleanly onto a high-DPI HTML5 Canvas
 * (preserving full Arabic RTL shaping, fonts, tables, borders, watermarks, headers/footers)
 * and embedding the rendered pages into a genuine PDF via pdf-lib.
 */
export async function exportDocxModelToPdfBlob(model: DocxDocumentModel): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const isLandscape = model.pageSetup.orientation === 'landscape';
  const baseW = model.pageSetup.paperSize === 'Letter' ? 612 : 595.28;
  const baseH =
    model.pageSetup.paperSize === 'Letter'
      ? 792
      : model.pageSetup.paperSize === 'Legal'
        ? 1008
        : 841.89;

  const pageW = isLandscape ? baseH : baseW;
  const pageH = isLandscape ? baseW : baseH;

  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(pageW * scale);
  canvas.height = Math.round(pageH * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const emptyPage = pdfDoc.addPage([pageW, pageH]);
    emptyPage.drawText(model.title, { x: 40, y: pageH - 60, size: 16, color: rgb(0.06, 0.16, 0.26) });
    const bytes = await pdfDoc.save();
    return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  }

  const marginPx = model.pageSetup.marginLeft * 2.83 * scale;
  const topPx = model.pageSetup.marginTop * 2.83 * scale;
  const bottomPx = model.pageSetup.marginBottom * 2.83 * scale;
  const contentW = canvas.width - marginPx * 2;
  let y = topPx;
  let pageNumber = 1;

  const initPageCanvas = () => {
    ctx.fillStyle = model.pageSetup.pageBackgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (model.pageSetup.pageBorder) {
      ctx.strokeStyle = model.pageSetup.pageBorderColor || '#1D4ED8';
      ctx.lineWidth = (model.pageSetup.pageBorderWidth || 1) * scale;
      ctx.strokeRect(24 * scale, 24 * scale, canvas.width - 48 * scale, canvas.height - 48 * scale);
    }

    if (model.pageSetup.watermarkText) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.font = `bold ${44 * scale}px Cairo, Arial, sans-serif`;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.textAlign = 'center';
      ctx.fillText(model.pageSetup.watermarkText, 0, 0);
      ctx.restore();
    }

    if (model.pageSetup.headerText) {
      ctx.font = `${10 * scale}px Cairo, Arial, sans-serif`;
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.fillText(model.pageSetup.headerText, canvas.width / 2, 20 * scale);
    }
    y = topPx;
  };

  const commitPage = async () => {
    if (model.pageSetup.footerText || model.pageSetup.showPageNumbers) {
      ctx.font = `${10 * scale}px Cairo, Arial, sans-serif`;
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      const footer = [
        model.pageSetup.footerText,
        model.pageSetup.showPageNumbers ? `${pageNumber}` : '',
      ]
        .filter(Boolean)
        .join('  •  ');
      ctx.fillText(footer, canvas.width / 2, canvas.height - 16 * scale);
    }
    const pngDataUrl = canvas.toDataURL('image/png');
    const pngBytes = dataUrlToUint8Array(pngDataUrl);
    const embedded = await pdfDoc.embedPng(pngBytes);
    const page = pdfDoc.addPage([pageW, pageH]);
    page.drawImage(embedded, { x: 0, y: 0, width: pageW, height: pageH });
    pageNumber += 1;
  };

  initPageCanvas();

  for (const block of model.blocks) {
    if (block.type === 'pageBreak') {
      await commitPage();
      initPageCanvas();
      continue;
    }

    if (block.type === 'paragraph') {
      const fullText = block.runs.map((r) => r.text).join('');
      const firstRun = block.runs[0];
      const baseSize =
        block.heading === 'h1' ? 20 : block.heading === 'h2' ? 16 : block.heading === 'h3' ? 14 : firstRun?.fontSize || 12;
      const fontSize = baseSize * scale;
      const isBold = block.heading !== 'normal' || firstRun?.bold;
      ctx.font = `${isBold ? 'bold ' : ''}${firstRun?.italic ? 'italic ' : ''}${fontSize}px ${
        firstRun?.fontFamily || 'Cairo'
      }, Arial, sans-serif`;
      ctx.fillStyle = firstRun?.color || '#1E293B';

      const isRtl = (block.direction || model.direction) === 'rtl';
      ctx.direction = isRtl ? 'rtl' : 'ltr';
      const align = block.align || (isRtl ? 'right' : 'left');
      ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
      const drawX =
        align === 'center'
          ? canvas.width / 2
          : align === 'right'
            ? canvas.width - marginPx
            : marginPx;

      const prefix = block.listType === 'bullet' ? '• ' : block.listType === 'number' ? '1. ' : '';
      const words = `${prefix}${fullText}`.split(/\s+/);
      let line = '';
      const lineHeight = fontSize * (block.lineSpacing || 1.45);

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > contentW && line) {
          if (y + lineHeight > canvas.height - bottomPx) {
            await commitPage();
            initPageCanvas();
          }
          ctx.fillText(line, drawX, y);
          y += lineHeight;
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        if (y + lineHeight > canvas.height - bottomPx) {
          await commitPage();
          initPageCanvas();
        }
        ctx.fillText(line, drawX, y);
        y += lineHeight + 6 * scale;
      } else {
        y += lineHeight * 0.6;
      }
    } else if (block.type === 'table') {
      const rowH = 26 * scale;
      for (const row of block.rows) {
        if (y + rowH > canvas.height - bottomPx) {
          await commitPage();
          initPageCanvas();
        }
        const colW = contentW / Math.max(1, row.cells.length);
        row.cells.forEach((cell, idx) => {
          const cx = marginPx + idx * colW;
          ctx.strokeStyle = block.borderColor || '#CBD5E1';
          ctx.lineWidth = 1 * scale;
          if (cell.backgroundColor) {
            ctx.fillStyle = cell.backgroundColor;
            ctx.fillRect(cx, y - 16 * scale, colW, rowH);
          }
          ctx.strokeRect(cx, y - 16 * scale, colW, rowH);
          const cellText = cell.paragraphs.map((p) => p.runs.map((r) => r.text).join('')).join(' ');
          ctx.font = `${11 * scale}px Cairo, Arial, sans-serif`;
          ctx.fillStyle = '#1E293B';
          ctx.textAlign = 'center';
          ctx.fillText(cellText.slice(0, 35), cx + colW / 2, y);
        });
        y += rowH;
      }
      y += 10 * scale;
    }
  }

  await commitPage();
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
