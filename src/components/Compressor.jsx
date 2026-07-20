import React, { useState } from 'react';
import { fmtSize } from '../utils/pdf-ops';

export default function Compressor({ file, onCompress, busy }) {
  const [result, setResult] = useState(null);

  const handle = async () => {
    const r = await onCompress();
    setResult(r);
  };

  const pct = result ? ((1 - result.newSize / result.origSize) * 100).toFixed(1) : 0;
  const saved = result ? result.origSize - result.newSize : 0;

  return (
    <div className="tool-panel">
      <h3>Compress PDF</h3>
      <p className="tool-desc">Reduce file size by optimizing internal structure. All processing in your browser.</p>

      {file && (
        <div className="compress-info">
          <span className="page-count-badge">📄 {file.name}</span>
          <span className="size-badge">{fmtSize(file.size)}</span>
        </div>
      )}

      <button className="btn-action" disabled={!file || busy} onClick={handle}>
        {busy ? 'Compressing...' : 'Compress PDF'}
      </button>

      {result && (
        <div className="compress-result">
          <div className="result-row">
            <span>Original</span>
            <span>{fmtSize(result.origSize)}</span>
          </div>
          <div className="result-row">
            <span>Compressed</span>
            <span className="green">{fmtSize(result.newSize)}</span>
          </div>
          <div className="result-row bold">
            <span>Saved</span>
            <span className="green">{fmtSize(saved)} ({pct}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
