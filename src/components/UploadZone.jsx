import React, { useCallback, useRef, useState } from 'react';

export default function UploadZone({ onFiles, accept = '.pdf', multiple = true, disabled = false, icon = '📄', title = 'Drag & drop PDFs here', subtitle = 'or click to browse' }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(f => accept.split(',').some(ext => f.name.toLowerCase().endsWith(ext.trim())));
    if (files.length) onFiles(files);
  }, [onFiles, accept, disabled]);

  const handleChange = useCallback((e) => {
    if (disabled) return;
    const files = Array.from(e.target.files);
    if (files.length) onFiles(files);
    e.target.value = '';
  }, [onFiles, disabled]);

  return (
    <div
      className={`upload-zone${dragOver ? ' drag-over' : ''}${disabled ? ' disabled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className="upload-icon">{icon}</div>
      <div className="upload-text">{title}</div>
      <div className="upload-sub">{subtitle}</div>
      {multiple && <div className="upload-sub hint">Supports multiple files</div>}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} style={{display:'none'}} />
    </div>
  );
}
