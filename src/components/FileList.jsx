import React from 'react';

export default function FileList({ files, onRemove, onReorder, labels }) {
  if (!files.length) return null;
  return (
    <div className="file-chips">
      {files.map((f, i) => (
        <div key={i} className="file-chip">
          <span className="chip-num">{i + 1}</span>
          <span className="chip-name" title={f.name}>{f.name}</span>
          {labels?.[i] && <span className="chip-label">{labels[i]}</span>}
          <button className="chip-rm" onClick={() => onRemove(i)} title="Remove">×</button>
        </div>
      ))}
    </div>
  );
}
