import React from 'react';

const TOOLS = [
  { id: 'merge', icon: '➕', label: 'Merge', desc: 'Combine multiple PDFs into one' },
  { id: 'split', icon: '✂️', label: 'Split', desc: 'Extract pages from a PDF' },
  { id: 'compress', icon: '🗜️', label: 'Compress', desc: 'Reduce PDF file size' },
  { id: 'convert', icon: '🖼️', label: 'Convert', desc: 'PDF to images (PNG/JPG)' },
];

export default function ToolSelector({ active, onChange }) {
  return (
    <div className="tool-selector">
      {TOOLS.map(t => (
        <button
          key={t.id}
          className={`tool-btn${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="tool-icon">{t.icon}</span>
          <span className="tool-label">{t.label}</span>
          <span className="tool-desc">{t.desc}</span>
        </button>
      ))}
    </div>
  );
}
