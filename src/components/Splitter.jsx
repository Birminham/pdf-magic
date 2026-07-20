import React, { useState, useRef } from 'react';

export default function Splitter({ file, pageCount, onSplit, busy }) {
  const [ranges, setRanges] = useState('');
  const [mode, setMode] = useState('custom'); // 'all' | 'custom'
  const didSplit = useRef(false);

  const handleSplit = async () => {
    didSplit.current = true;
    let parsed;
    if (mode === 'all') {
      parsed = Array.from({ length: pageCount }, (_, i) => String(i + 1));
    } else {
      parsed = ranges.split(/[,;\s]+/).filter(Boolean);
    }
    await onSplit(parsed);
  };

  const hasInput = mode === 'all' || ranges.trim().length > 0;

  return (
    <div className="tool-panel">
      <h3>Split PDF</h3>
      <p className="tool-desc">Extract specific pages into separate PDFs.</p>

      {file && (
        <div className="split-info">
          <span className="page-count-badge">📄 {file.name} — {pageCount} page{pageCount > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="split-mode">
        <label className={`split-mode-opt${mode === 'all' ? ' active' : ''}`}>
          <input type="radio" name="splitMode" checked={mode === 'all'} onChange={() => setMode('all')} />
          <span>Every page → separate PDF</span>
        </label>
        <label className={`split-mode-opt${mode === 'custom' ? ' active' : ''}`}>
          <input type="radio" name="splitMode" checked={mode === 'custom'} onChange={() => setMode('custom')} />
          <span>Custom ranges</span>
        </label>
      </div>

      {mode === 'custom' && (
        <div className="range-input-wrap">
          <input
            className="text-input"
            placeholder="e.g. 1-3, 5, 7-9"
            value={ranges}
            onChange={e => setRanges(e.target.value)}
            disabled={busy}
          />
          <div className="range-hint">Use commas to separate ranges. Example: "1-5, 8, 10-12"</div>
        </div>
      )}

      <button className="btn-action" disabled={!file || !hasInput || busy} onClick={handleSplit}>
        {busy ? 'Splitting...' : 'Split & Download'}
      </button>
      {didSplit.current && !busy && <div className="success-msg">✅ Split complete! Downloaded as ZIP.</div>}
    </div>
  );
}
