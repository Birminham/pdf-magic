import { PDFDocument } from 'pdf-lib';

/**
 * Merge multiple PDFs into one.
 * Returns Uint8Array of merged PDF.
 */
export async function mergePDFs(files) {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  return merged.save();
}

/**
 * Split PDF: extract page ranges.
 * pageRanges: [3, "1-5", "2"] → returns array of Uint8Arrays.
 */
export async function splitPDF(file, pageRanges) {
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf);
  const total = src.getPageCount();

  const results = [];
  for (const range of pageRanges) {
    const doc = await PDFDocument.create();
    const indices = parseRange(String(range), total);
    if (indices.length > 0) {
      const pages = await doc.copyPages(src, indices);
      pages.forEach(p => doc.addPage(p));
    }
    results.push(await doc.save());
  }
  return results;
}

function parseRange(s, total) {
  s = s.trim();
  const out = [];
  if (s.includes('-')) {
    const [a, b] = s.split('-').map(Number);
    const start = Math.max(0, (a || 1) - 1);
    const end = Math.min(total - 1, (b || total) - 1);
    for (let i = start; i <= end; i++) out.push(i);
  } else if (s.toLowerCase() === 'all') {
    for (let i = 0; i < total; i++) out.push(i);
  } else {
    const n = parseInt(s);
    if (!isNaN(n) && n >= 1 && n <= total) out.push(n - 1);
  }
  return out;
}

/**
 * Compress PDF: re-save with object streams to remove redundancies.
 * Note: pdf-lib does not recompress images. Heavily image-based PDFs
 * may see modest size reduction from structural optimization only.
 * Returns {data, origSize, newSize}.
 */
export async function compressPDF(file) {
  const buf = await file.arrayBuffer();
  const origSize = buf.byteLength;
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const data = await doc.save({ useObjectStreams: true });
  return { data, origSize, newSize: data.byteLength };
}

/**
 * Convert PDF pages to images via Canvas.
 * Returns array of {dataURL, width, height} per page.
 * Requires pdfjs-dist — we use a lighter approach: render via embedded iframe (not viable).
 *
 * SIMPLE approach: use pdf.js via CDN loaded dynamically.
 */
export async function convertToImages(file, format = 'png', scale = 2) {
  if (typeof window === 'undefined') return [];
  const pdfjsLib = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const results = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.92 : undefined;
    results.push({
      dataURL: canvas.toDataURL(mime, quality),
      width: viewport.width,
      height: viewport.height,
      page: i,
    });
  }
  return results;
}

let pdfJsPromise = null;
function loadPdfJs() {
  if (pdfJsPromise) return pdfJsPromise;
  pdfJsPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return pdfJsPromise;
}

/**
 * Get page count without loading full doc.
 */
export async function getPageCount(file) {
  const buf = await file.arrayBuffer();
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  return doc.getPageCount();
}

/**
 * Format bytes to human-readable.
 */
export function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

/**
 * Download a Uint8Array as file.
 */
export function downloadBlob(data, filename, mime = 'application/pdf') {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download multiple PDFs as ZIP (requires JSZip imported at callsite).
 */
export async function downloadAsZip(results, baseName) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  results.forEach((data, i) => {
    zip.file(`${baseName}_${i + 1}.pdf`, data);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download images as ZIP.
 */
export async function downloadImagesAsZip(images, baseName) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const ext = images[0]?.dataURL?.startsWith('data:image/jpeg') ? 'jpg' : 'png';
  images.forEach((img, i) => {
    const b64 = img.dataURL.split(',')[1];
    zip.file(`${baseName}_p${img.page}.${ext}`, b64, { base64: true });
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
