import JSZip from 'jszip';
import {
  DocxBlock,
  DocxComment,
  DocxDocumentModel,
  DocxImageBlock,
  DocxPageSetup,
  DocxParagraph,
  DocxRun,
  DocxTable,
  DocxTableCell,
  DocxTableRow,
} from '../../types';
import { createId } from '../../utils/fileHelpers';

export const defaultPageSetup: DocxPageSetup = {
  paperSize: 'A4',
  orientation: 'portrait',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  columns: 1,
  pageBorder: false,
  pageBorderColor: '#1D4ED8',
  pageBorderWidth: 1,
  pageBackgroundColor: '#FFFFFF',
  watermarkText: '',
  headerText: '',
  footerText: '',
  showPageNumbers: true,
};

export function createEmptyDocxModel(
  title = 'مستند جديد',
  direction: 'rtl' | 'ltr' = 'rtl',
  defaultFont = 'Cairo',
  defaultSize = 12
): DocxDocumentModel {
  return {
    title,
    direction,
    pageSetup: { ...defaultPageSetup },
    blocks: [
      {
        id: createId('p'),
        type: 'paragraph',
        heading: 'h1',
        align: direction === 'rtl' ? 'right' : 'left',
        direction,
        lineSpacing: 1.3,
        spaceAfter: 8,
        runs: [
          {
            id: createId('r'),
            text: title,
            bold: true,
            fontFamily: defaultFont,
            fontSize: 18,
            color: '#0F2942',
          },
        ],
      },
      {
        id: createId('p'),
        type: 'paragraph',
        heading: 'normal',
        align: direction === 'rtl' ? 'right' : 'left',
        direction,
        lineSpacing: 1.5,
        spaceAfter: 6,
        runs: [
          {
            id: createId('r'),
            text:
              direction === 'rtl'
                ? 'ابدأ الكتابة هنا... يدعم AMR DOCS تحرير ملفات DOCX الحقيقية وتنسيقها وتصديرها.'
                : 'Start writing here... AMR DOCS supports real DOCX import, editing, and export.',
            fontFamily: defaultFont,
            fontSize: defaultSize,
            color: '#1E293B',
          },
        ],
      },
    ],
    comments: [],
  };
}

function getElementsByTagLocal(parent: Element | Document, localName: string): Element[] {
  const result: Element[] = [];
  const all = parent.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if (el.localName === localName || el.nodeName.endsWith(`:${localName}`)) {
      result.push(el);
    }
  }
  return result;
}

function getFirstDirectChild(parent: Element, localName: string): Element | null {
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (child.localName === localName || child.nodeName.endsWith(`:${localName}`)) {
      return child;
    }
  }
  return null;
}

function getDirectChildren(parent: Element, localName: string): Element[] {
  const list: Element[] = [];
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (child.localName === localName || child.nodeName.endsWith(`:${localName}`)) {
      list.push(child);
    }
  }
  return list;
}

function getAttr(el: Element | null, name: string): string | null {
  if (!el) return null;
  return (
    el.getAttribute(`w:${name}`) ||
    el.getAttribute(name) ||
    el.getAttribute(`r:${name}`) ||
    null
  );
}

function twipsToMm(twips: number): number {
  return Math.round((twips / 1440) * 25.4);
}

export async function parseDocxBlob(blob: Blob, fallbackTitle = 'Document'): Promise<DocxDocumentModel> {
  const arrayBuffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const documentXmlFile = zip.file('word/document.xml');
  if (!documentXmlFile) {
    throw new Error('Invalid DOCX archive: word/document.xml not found');
  }

  const parser = new DOMParser();
  const docXmlText = await documentXmlFile.async('text');
  const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');

  // Parse relationships for images & hyperlinks
  const relsMap = new Map<string, { type: string; target: string }>();
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (relsFile) {
    const relsXml = parser.parseFromString(await relsFile.async('text'), 'application/xml');
    const relEls = getElementsByTagLocal(relsXml, 'Relationship');
    for (const rel of relEls) {
      const id = rel.getAttribute('Id') || '';
      const type = rel.getAttribute('Type') || '';
      const target = rel.getAttribute('Target') || '';
      if (id) relsMap.set(id, { type, target });
    }
  }

  // Extract media files as base64 data URLs
  const mediaDataUrls = new Map<string, string>();
  for (const [, rel] of relsMap.entries()) {
    if (rel.type.includes('/image') && rel.target) {
      const normalizedPath = rel.target.startsWith('word/') ? rel.target : `word/${rel.target.replace(/^\/+/, '')}`;
      const mediaFile = zip.file(normalizedPath);
      if (mediaFile) {
        const b64 = await mediaFile.async('base64');
        const ext = normalizedPath.split('.').pop()?.toLowerCase() || 'png';
        const mime =
          ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'gif'
              ? 'image/gif'
              : ext === 'svg'
                ? 'image/svg+xml'
                : 'image/png';
        mediaDataUrls.set(rel.target, `data:${mime};base64,${b64}`);
      }
    }
  }

  // Parse optional header & footer
  let headerText = '';
  let footerText = '';
  const headerFile = zip.file('word/header1.xml');
  if (headerFile) {
    const hXml = parser.parseFromString(await headerFile.async('text'), 'application/xml');
    headerText = getElementsByTagLocal(hXml, 't')
      .map((t) => t.textContent || '')
      .join(' ')
      .trim();
  }
  const footerFile = zip.file('word/footer1.xml');
  if (footerFile) {
    const fXml = parser.parseFromString(await footerFile.async('text'), 'application/xml');
    footerText = getElementsByTagLocal(fXml, 't')
      .map((t) => t.textContent || '')
      .join(' ')
      .trim();
  }

  // Parse comments
  const comments: DocxComment[] = [];
  const commentsFile = zip.file('word/comments.xml');
  if (commentsFile) {
    const cXml = parser.parseFromString(await commentsFile.async('text'), 'application/xml');
    const cEls = getElementsByTagLocal(cXml, 'comment');
    for (const cEl of cEls) {
      const author = getAttr(cEl, 'author') || 'User';
      const text = getElementsByTagLocal(cEl, 't')
        .map((t) => t.textContent || '')
        .join('')
        .trim();
      if (text) {
        comments.push({
          id: createId('cmt'),
          author,
          text,
          createdAt: Date.now(),
        });
      }
    }
  }

  const pageSetup: DocxPageSetup = {
    ...defaultPageSetup,
    headerText,
    footerText,
  };

  const bodyEl = getElementsByTagLocal(xmlDoc, 'body')[0];
  const blocks: DocxBlock[] = [];
  let detectedRtl = false;

  if (bodyEl) {
    // Parse sectPr for page setup
    const sectPr = getFirstDirectChild(bodyEl, 'sectPr');
    if (sectPr) {
      const pgSz = getFirstDirectChild(sectPr, 'pgSz');
      if (pgSz) {
        const orient = getAttr(pgSz, 'orient');
        if (orient === 'landscape') pageSetup.orientation = 'landscape';
        const w = Number(getAttr(pgSz, 'w') || 11906);
        if (Math.abs(w - 12240) < 200) pageSetup.paperSize = 'Letter';
      }
      const pgMar = getFirstDirectChild(sectPr, 'pgMar');
      if (pgMar) {
        const top = Number(getAttr(pgMar, 'top'));
        const bottom = Number(getAttr(pgMar, 'bottom'));
        const left = Number(getAttr(pgMar, 'left'));
        const right = Number(getAttr(pgMar, 'right'));
        if (top) pageSetup.marginTop = twipsToMm(top);
        if (bottom) pageSetup.marginBottom = twipsToMm(bottom);
        if (left) pageSetup.marginLeft = twipsToMm(left);
        if (right) pageSetup.marginRight = twipsToMm(right);
      }
      const cols = getFirstDirectChild(sectPr, 'cols');
      if (cols && Number(getAttr(cols, 'num')) === 2) {
        pageSetup.columns = 2;
      }
      const pgBorders = getFirstDirectChild(sectPr, 'pgBorders');
      if (pgBorders) {
        pageSetup.pageBorder = true;
        const topBorder = getFirstDirectChild(pgBorders, 'top');
        const col = getAttr(topBorder, 'color');
        if (col && col !== 'auto') pageSetup.pageBorderColor = `#${col}`;
      }
    }

    const parseRunElement = (rEl: Element, linkUrl?: string): { run?: DocxRun; image?: DocxImageBlock; hasPageBreak?: boolean } => {
      const brEls = getDirectChildren(rEl, 'br');
      if (brEls.some((b) => getAttr(b, 'type') === 'page')) {
        return { hasPageBreak: true };
      }

      // Check for embedded image
      const blips = getElementsByTagLocal(rEl, 'blip');
      if (blips.length > 0) {
        const embedId = blips[0].getAttribute('r:embed') || blips[0].getAttribute('embed');
        if (embedId && relsMap.has(embedId)) {
          const target = relsMap.get(embedId)!.target;
          const dataUrl = mediaDataUrls.get(target);
          if (dataUrl) {
            return {
              image: {
                id: createId('img'),
                type: 'image',
                dataUrl,
                width: 320,
                height: 220,
                align: 'center',
              },
            };
          }
        }
      }

      const rPr = getFirstDirectChild(rEl, 'rPr');
      const tEls = getDirectChildren(rEl, 't');
      const text = tEls.map((t) => t.textContent || '').join('');
      if (!text && !rPr) return {};

      const bold = !!getFirstDirectChild(rPr || rEl, 'b') && getAttr(getFirstDirectChild(rPr || rEl, 'b'), 'val') !== '0';
      const italic = !!getFirstDirectChild(rPr || rEl, 'i') && getAttr(getFirstDirectChild(rPr || rEl, 'i'), 'val') !== '0';
      const uEl = rPr ? getFirstDirectChild(rPr, 'u') : null;
      const underline = !!uEl && getAttr(uEl, 'val') !== 'none';
      const strike = rPr ? !!getFirstDirectChild(rPr, 'strike') : false;

      let fontFamily: string | undefined;
      let fontSize: number | undefined;
      let color: string | undefined;
      let highlight: string | undefined;

      if (rPr) {
        const rFonts = getFirstDirectChild(rPr, 'rFonts');
        fontFamily = getAttr(rFonts, 'cs') || getAttr(rFonts, 'ascii') || undefined;
        const sz = getFirstDirectChild(rPr, 'sz');
        const szVal = Number(getAttr(sz, 'val'));
        if (szVal) fontSize = Math.round(szVal / 2);

        const colEl = getFirstDirectChild(rPr, 'color');
        const colVal = getAttr(colEl, 'val');
        if (colVal && colVal !== 'auto') color = `#${colVal}`;

        const hlEl = getFirstDirectChild(rPr, 'highlight');
        const hlVal = getAttr(hlEl, 'val');
        if (hlVal) {
          highlight = hlVal === 'yellow' ? '#FEF08A' : hlVal === 'cyan' ? '#A5F3FC' : '#FDE68A';
        }
      }

      return {
        run: {
          id: createId('r'),
          text,
          bold,
          italic,
          underline,
          strike,
          fontFamily,
          fontSize,
          color,
          highlight,
          linkUrl,
        },
      };
    };

    const parseParagraphElement = (pEl: Element): DocxBlock[] => {
      const out: DocxBlock[] = [];
      const pPr = getFirstDirectChild(pEl, 'pPr');
      let heading: DocxParagraph['heading'] = 'normal';
      let align: DocxParagraph['align'] = 'right';
      let direction: 'rtl' | 'ltr' = 'ltr';
      let listType: DocxParagraph['listType'] = 'none';
      let lineSpacing = 1.4;

      if (pPr) {
        const pStyle = getFirstDirectChild(pPr, 'pStyle');
        const styleVal = (getAttr(pStyle, 'val') || '').toLowerCase();
        if (styleVal.includes('heading1') || styleVal === '1' || styleVal === 'title') heading = 'h1';
        else if (styleVal.includes('heading2') || styleVal === '2') heading = 'h2';
        else if (styleVal.includes('heading3') || styleVal === '3') heading = 'h3';

        const bidi = getFirstDirectChild(pPr, 'bidi');
        if (bidi && getAttr(bidi, 'val') !== '0') {
          direction = 'rtl';
          detectedRtl = true;
        }

        const jc = getFirstDirectChild(pPr, 'jc');
        const jcVal = getAttr(jc, 'val');
        if (jcVal === 'center') align = 'center';
        else if (jcVal === 'both' || jcVal === 'justify') align = 'justify';
        else if (jcVal === 'right' || jcVal === 'end') align = 'right';
        else if (jcVal === 'left' || jcVal === 'start') align = direction === 'rtl' ? 'right' : 'left';
        else align = direction === 'rtl' ? 'right' : 'left';

        const numPr = getFirstDirectChild(pPr, 'numPr');
        if (numPr) {
          const numId = getFirstDirectChild(numPr, 'numId');
          const idVal = Number(getAttr(numId, 'val') || 1);
          listType = idVal % 2 === 0 ? 'number' : 'bullet';
        }

        const spacing = getFirstDirectChild(pPr, 'spacing');
        const line = Number(getAttr(spacing, 'line'));
        if (line && line > 100) {
          lineSpacing = Number((line / 240).toFixed(2));
        }
      }

      const runs: DocxRun[] = [];
      for (let i = 0; i < pEl.children.length; i++) {
        const child = pEl.children[i];
        if (child.localName === 'r') {
          const parsed = parseRunElement(child);
          if (parsed.hasPageBreak) {
            out.push({ id: createId('pb'), type: 'pageBreak' });
          }
          if (parsed.image) {
            out.push(parsed.image);
          }
          if (parsed.run) {
            if (/[\u0600-\u06FF]/.test(parsed.run.text)) {
              direction = 'rtl';
              detectedRtl = true;
            }
            runs.push(parsed.run);
          }
        } else if (child.localName === 'hyperlink') {
          const rId = child.getAttribute('r:id') || child.getAttribute('id') || '';
          const linkUrl = relsMap.get(rId)?.target;
          const innerRuns = getDirectChildren(child, 'r');
          for (const ir of innerRuns) {
            const parsed = parseRunElement(ir, linkUrl);
            if (parsed.run) runs.push(parsed.run);
          }
        }
      }

      if (runs.length === 0) {
        runs.push({ id: createId('r'), text: '' });
      }

      out.unshift({
        id: createId('p'),
        type: 'paragraph',
        heading,
        align,
        direction,
        lineSpacing,
        spaceAfter: 6,
        listType,
        runs,
      });

      return out;
    };

    for (let i = 0; i < bodyEl.children.length; i++) {
      const child = bodyEl.children[i];
      if (child.localName === 'p') {
        blocks.push(...parseParagraphElement(child));
      } else if (child.localName === 'tbl') {
        const rows: DocxTableRow[] = [];
        const trEls = getDirectChildren(child, 'tr');
        for (const tr of trEls) {
          const cells: DocxTableCell[] = [];
          const tcEls = getDirectChildren(tr, 'tc');
          for (const tc of tcEls) {
            const cellParagraphs: DocxParagraph[] = [];
            const pEls = getDirectChildren(tc, 'p');
            for (const p of pEls) {
              const parsedBlocks = parseParagraphElement(p);
              for (const b of parsedBlocks) {
                if (b.type === 'paragraph') cellParagraphs.push(b);
              }
            }
            if (cellParagraphs.length === 0) {
              cellParagraphs.push({
                id: createId('p'),
                type: 'paragraph',
                runs: [{ id: createId('r'), text: '' }],
              });
            }
            const tcPr = getFirstDirectChild(tc, 'tcPr');
            const gridSpan = tcPr ? Number(getAttr(getFirstDirectChild(tcPr, 'gridSpan'), 'val')) : undefined;
            const shd = tcPr ? getFirstDirectChild(tcPr, 'shd') : null;
            const fill = getAttr(shd, 'fill');

            cells.push({
              id: createId('tc'),
              paragraphs: cellParagraphs,
              colSpan: gridSpan && gridSpan > 1 ? gridSpan : undefined,
              backgroundColor: fill && fill !== 'auto' ? `#${fill}` : undefined,
            });
          }
          rows.push({ id: createId('tr'), cells });
        }
        const table: DocxTable = {
          id: createId('tbl'),
          type: 'table',
          rows,
          borderColor: '#CBD5E1',
        };
        blocks.push(table);
      }
    }
  }

  if (blocks.length === 0) {
    return createEmptyDocxModel(fallbackTitle, 'rtl');
  }

  return {
    title: fallbackTitle,
    direction: detectedRtl ? 'rtl' : 'ltr',
    pageSetup,
    blocks,
    comments,
  };
}
