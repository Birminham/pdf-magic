import React, { useState } from 'react';

export default function Converter({ file, onConvert, busy }) {
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(2);
  const [previews, setPreviews] = useState(null);

  const handle = async () => {
    const imgs = await onConvert(format, scale);
    setPreviews(imgs);
  };

  return (
    <div className="tool-panel">
      <h3>Convert PDF to Images</h3>
      <p className="tool-desc">Render each PDF page as a high-resolution image. Uses pdf.js in your browser.</p>

      {file && (
        <div className="convert-info">
          <span className="page-count-badge">📄 {file.name}</span>
        </div>
      )}

      <div className="convert-options">
        <div className="ctrl-group">
          <label>Output Format</label>
          <div className="format-row">
            <button className={`fmt-btn${format === 'png' ? ' active' : ''}`} onClick={() => setFormat('png')}>PNG</button>
            <button className={`fmt-btn${format === 'jpg' ? ' active' : ''}`} onClick={() => setFormat('jpg')}>JPEG</button>
          </div>
        </div>
        <div className="ctrl-group">
          <label>Resolution Scale: {scale}x</label>
          <input type="range" min="1" max="4" step="0.5" value={scale} onChange={e => setScale(Number(e.target.value))} />
          <div className="range-labels"><span>1x (72dpi)</span><span>4x (288dpi)</span></div>
        </div>
      </div>

      <button className="btn-action" disabled={!file || busy} onClick={handle}>
        {busy ? 'Converting...' : `Convert to ${format.toUpperCase()}`}
      </button>

      {previews && (
        <div className="preview-strip">
          {previews.slice(0, 5).map((img, i) => (
            <div key={i} className="preview-thumb">
              <img src={img.dataURL} alt={`Page ${img.page}`} />
              <span>Page {img.page}</span>
            </div>
          ))}
          {previews.length > 5 && <div className="preview-more">+{previews.length - 5} more pages</div>}
        </div>
      )}
    </div>
  );
}
