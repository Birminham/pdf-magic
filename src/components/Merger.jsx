import React, { useState } from 'react';

export default function Merger({ files, onMerge, busy }) {
  const hasFiles = files.length >= 2;
  const [justMerged, setJustMerged] = useState(false);

  const handle = async () => {
    setJustMerged(true);
    await onMerge();
  };

  return (
    <div className="tool-panel">
      <h3>Merge PDFs</h3>
      <p className="tool-desc">Combine multiple PDFs into a single file. Drag to reorder in the file list above.</p>
      {files.length > 0 && (
        <div className="merge-summary">
          <span className="merge-count">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
          <span className="merge-hint">{files.length < 2 ? ' — Add at least 2 PDFs to merge' : ' — Ready to merge!'}</span>
        </div>
      )}
      <button className="btn-action" disabled={!hasFiles || busy} onClick={handle}>
        {busy ? 'Merging...' : hasFiles ? `Merge ${files.length} PDFs` : 'Add 2+ PDFs to merge'}
      </button>
      {justMerged && !busy && <div className="success-msg">✅ Merged! Downloaded automatically.</div>}
    </div>
  );
}
