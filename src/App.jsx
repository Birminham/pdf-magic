import React, { useState, useCallback } from 'react';
import ToolSelector from './components/ToolSelector';
import UploadZone from './components/UploadZone';
import FileList from './components/FileList';
import Merger from './components/Merger';
import Splitter from './components/Splitter';
import Compressor from './components/Compressor';
import Converter from './components/Converter';
import {
  mergePDFs, splitPDF, compressPDF, convertToImages, getPageCount,
  downloadBlob, downloadAsZip, downloadImagesAsZip, fmtSize
} from './utils/pdf-ops';

export default function App() {
  const [tool, setTool] = useState('merge');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [pageCountFile, setPageCountFile] = useState(null);

  const handleFiles = useCallback(async (newFiles) => {
    if (tool === 'merge') {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      const f = newFiles[0];
      setFiles([f]);
      setPageCountFile(f);
      try {
        const n = await getPageCount(f);
        setPageCount(n);
      } catch { setPageCount(0); }
    }
  }, [tool]);

  const handleRemove = useCallback((i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const switchTool = useCallback((t) => {
    setTool(t);
    setFiles([]);
    setPageCount(0);
    setPageCountFile(null);
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return;
    setBusy(true);
    try {
      const data = await mergePDFs(files);
      downloadBlob(data, 'merged.pdf');
    } catch (err) {
      console.error('Merge error:', err);
      alert('Merge failed: ' + err.message);
    }
    setBusy(false);
  }, [files]);

  const handleSplit = useCallback(async (ranges) => {
    if (!files[0]) return;
    setBusy(true);
    try {
      const results = await splitPDF(files[0], ranges);
      if (results.length === 1) {
        downloadBlob(results[0], `${files[0].name.replace(/\.pdf$/i, '')}_split.pdf`);
      } else {
        await downloadAsZip(results, files[0].name.replace(/\.pdf$/i, ''));
      }
    } catch (err) {
      console.error('Split error:', err);
      alert('Split failed: ' + err.message);
    }
    setBusy(false);
  }, [files]);

  const handleCompress = useCallback(async () => {
    if (!files[0]) return null;
    setBusy(true);
    try {
      const result = await compressPDF(files[0]);
      downloadBlob(result.data, files[0].name.replace(/\.pdf$/i, '') + '_compressed.pdf');
      setBusy(false);
      return result;
    } catch (err) {
      console.error('Compress error:', err);
      alert('Compress failed: ' + err.message);
      setBusy(false);
      return null;
    }
  }, [files]);

  const handleConvert = useCallback(async (format, scale) => {
    if (!files[0]) return;
    setBusy(true);
    try {
      const images = await convertToImages(files[0], format, scale);
      if (images.length === 1) {
        const a = document.createElement('a');
        a.href = images[0].dataURL;
        a.download = files[0].name.replace(/\.pdf$/i, '') + '.' + format;
        a.click();
      } else {
        await downloadImagesAsZip(images, files[0].name.replace(/\.pdf$/i, ''));
      }
      setBusy(false);
      return images;
    } catch (err) {
      console.error('Convert error:', err);
      alert('Conversion failed: ' + err.message);
      setBusy(false);
      return [];
    }
  }, [files]);

  const uploadAccept = tool === 'convert' ? '.pdf' : '.pdf';
  const uploadMultiple = tool === 'merge';
  const uploadIcon = { merge: '➕', split: '✂️', compress: '🗜️', convert: '🖼️' }[tool];
  const uploadTitle = {
    merge: 'Drop PDFs to merge',
    split: 'Drop a PDF to split',
    compress: 'Drop a PDF to compress',
    convert: 'Drop a PDF to convert',
  }[tool];

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-left">
          <h1>📄 PDF <span className="gradient-text">Magic</span></h1>
          <span className="sub">Merge · Split · Compress · Convert — all in your browser</span>
        </div>
        <div className="topbar-right">
          <span className="privacy-badge" title="Nothing uploads to any server">🔒 100% Private</span>
          <span className="ver">v1.0</span>
        </div>
      </div>

      <div className="body">
        <aside className="sidebar">
          <ToolSelector active={tool} onChange={switchTool} />

          <UploadZone
            onFiles={handleFiles}
            accept={uploadAccept}
            multiple={uploadMultiple}
            disabled={busy}
            icon={uploadIcon}
            title={uploadTitle}
            subtitle="or click to browse"
          />

          <FileList files={files} onRemove={handleRemove} />

          {tool === 'merge' && <Merger files={files} onMerge={handleMerge} busy={busy} />}
          {tool === 'split' && <Splitter file={files[0]} pageCount={pageCount} onSplit={handleSplit} busy={busy} />}
          {tool === 'compress' && <Compressor file={files[0]} onCompress={handleCompress} busy={busy} />}
          {tool === 'convert' && <Converter file={files[0]} onConvert={handleConvert} busy={busy} />}
        </aside>

        <main className="main">
          {files.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{uploadIcon}</div>
              <h2>No file{uploadMultiple ? 's' : ''} selected</h2>
              <p>{uploadTitle}</p>
              <p className="hint">All processing happens in your browser. No file ever leaves your device.</p>
            </div>
          ) : (
            <div className="status-card">
              <div className="status-icon">{uploadIcon}</div>
              <div className="status-info">
                <div className="status-title">{files.length} file{files.length > 1 ? 's' : ''} loaded</div>
                <div className="status-detail">
                  {files.map((f, i) => (
                    <span key={i} className="status-file">{f.name} ({fmtSize(f.size)})</span>
                  ))}
                </div>
                {pageCount > 0 && <div className="status-detail">{pageCount} page{pageCount > 1 ? 's' : ''}</div>}
                {busy && <div className="status-busy">⏳ Processing...</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
