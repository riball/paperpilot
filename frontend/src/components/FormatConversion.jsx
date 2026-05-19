import { useState } from "react";

const API_BASE = "https://paperpilot-8pwz.onrender.com";

const C = {
  bg:      "#0B0B0F",
  surface: "#13131A",
  card:    "#1A1A24",
  border:  "#2A2A3A",
  accent:  "#7C6AF7",
  accentL: "#9D94F9",
  muted:   "#6B6B80",
  text:    "#E8E8F0",
  sub:     "#A0A0B8",
  green:   "#4CAF7D",
  red:     "#E05C5C",
  gold:    "#E8B84B",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap');

  .fc-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .fc-wrap {
    background: ${C.bg}; min-height: calc(100vh - 58px);
    font-family: 'Outfit', sans-serif; color: ${C.text};
    padding: 48px 24px;
  }
  .fc-inner { max-width: 860px; margin: 0 auto; }

  .fc-header { margin-bottom: 40px; }
  .fc-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2.5px; text-transform: uppercase;
    color: ${C.accent}; margin-bottom: 10px;
  }
  .fc-title {
    font-family: 'Libre Baskerville', serif; font-size: 34px;
    font-weight: 400; color: ${C.text}; margin-bottom: 8px; line-height: 1.2;
  }
  .fc-desc {
    font-size: 14px; color: ${C.muted}; font-weight: 300;
    line-height: 1.6; max-width: 520px;
  }

  .fc-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  }
  @media (max-width: 680px) { .fc-grid { grid-template-columns: 1fr; } }

  .fc-card {
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 28px;
  }

  .fc-card-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: ${C.muted}; margin-bottom: 18px;
    display: flex; align-items: center; gap: 10px;
  }
  .fc-card-label::after { content: ''; flex: 1; height: 1px; background: ${C.border}; }

  .fc-upload {
    border: 1px dashed ${C.border}; border-radius: 8px;
    padding: 36px 20px; text-align: center; cursor: pointer;
    transition: all 0.2s; background: ${C.surface}; margin-bottom: 16px;
  }
  .fc-upload:hover, .fc-upload.drag { border-color: ${C.accent}; background: rgba(124,106,247,0.04); }
  .fc-upload-icon { font-size: 28px; opacity: 0.4; margin-bottom: 10px; }
  .fc-upload-text { font-size: 13px; color: ${C.muted}; font-weight: 300; }
  .fc-upload-text strong { color: ${C.accent}; font-weight: 500; }
  .fc-upload-sub {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: ${C.muted}; margin-top: 6px; opacity: 0.6; letter-spacing: 1px;
  }

  .fc-file-pill {
    display: flex; align-items: center; gap: 10px;
    background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;
  }
  .fc-file-name { flex: 1; font-size: 13px; color: ${C.text}; }
  .fc-file-size { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.muted}; }
  .fc-file-remove {
    background: none; border: none; color: ${C.muted};
    cursor: pointer; font-size: 18px; line-height: 1;
    transition: color 0.15s; padding: 0;
  }
  .fc-file-remove:hover { color: ${C.red}; }

  .fc-field { margin-bottom: 20px; }
  .fc-field-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: ${C.muted}; margin-bottom: 10px; display: block;
  }
  .fc-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .fc-chip {
    padding: 7px 16px; border: 1px solid ${C.border}; border-radius: 6px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; background: none; color: ${C.muted}; transition: all 0.15s;
  }
  .fc-chip:hover { border-color: ${C.muted}; color: ${C.text}; }
  .fc-chip.active { border-color: ${C.accent}; color: ${C.accent}; background: rgba(124,106,247,0.08); }

  .fc-btn {
    width: 100%; padding: 13px; background: ${C.accent}; border: none;
    border-radius: 8px; color: white; font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s; margin-top: 8px;
  }
  .fc-btn:hover:not(:disabled) { background: ${C.accentL}; transform: translateY(-1px); }
  .fc-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .fc-result-panel {
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 28px;
    display: flex; flex-direction: column; justify-content: center;
  }

  .fc-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100%; min-height: 300px; gap: 14px; text-align: center;
  }
  .fc-empty-glyph {
    font-family: 'Libre Baskerville', serif; font-size: 52px;
    opacity: 0.07; font-style: italic;
  }
  .fc-empty-text { font-size: 13px; color: ${C.muted}; font-weight: 300; max-width: 180px; line-height: 1.6; }

  .fc-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 300px; gap: 20px;
  }
  .fc-dots { display: flex; gap: 6px; }
  .fc-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${C.accent}; animation: fcpulse 1.1s ease-in-out infinite;
  }
  .fc-dot:nth-child(2) { animation-delay: 0.18s; }
  .fc-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes fcpulse {
    0%,100% { opacity: 0.2; transform: scale(0.75); }
    50%      { opacity: 1;   transform: scale(1); }
  }
  .fc-loading-text {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.muted};
  }

  .fc-success { animation: fcfade 0.3s ease; }
  @keyframes fcfade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .fc-success-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.25);
    border-radius: 20px; padding: 5px 14px; margin-bottom: 20px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase; color: ${C.green};
  }

  .fc-success-title {
    font-family: 'Libre Baskerville', serif; font-size: 22px;
    font-weight: 400; color: ${C.text}; margin-bottom: 6px;
  }
  .fc-success-sub { font-size: 13px; color: ${C.muted}; margin-bottom: 24px; font-weight: 300; }

  .fc-output-row {
    display: flex; align-items: center; justify-content: space-between;
    background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;
    gap: 12px;
  }
  .fc-output-info { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
  .fc-output-type {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1px; text-transform: uppercase; color: ${C.accent};
  }
  .fc-output-path { font-size: 12px; color: ${C.muted}; word-break: break-all; }

  .fc-download-btn {
    padding: 6px 14px;
    background: rgba(124,106,247,0.12);
    border: 1px solid rgba(124,106,247,0.3);
    border-radius: 6px;
    color: #7C6AF7;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    text-decoration: none;
    white-space: nowrap;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .fc-download-btn:hover {
    background: rgba(124,106,247,0.22);
    border-color: rgba(124,106,247,0.6);
  }

  .fc-reset {
    margin-top: 20px; padding: 9px 20px; background: none;
    border: 1px solid ${C.border}; border-radius: 6px;
    color: ${C.muted}; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
  }
  .fc-reset:hover { border-color: ${C.muted}; color: ${C.text}; }

  .fc-error {
    margin-top: 14px; padding: 12px 16px;
    background: rgba(224,92,92,0.08); border: 1px solid rgba(224,92,92,0.2);
    border-radius: 8px; font-size: 13px; color: #e08080; line-height: 1.5;
  }
`;

function formatBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

export default function FormatConversion() {
  const [file,            setFile]            = useState(null);
  const [drag,            setDrag]            = useState(false);
  const [selectedFormats, setSelectedFormats] = useState(["ieee"]);
  const [outputType,      setOutputType]      = useState("tex");
  const [loading,         setLoading]         = useState(false);
  const [result,          setResult]          = useState(null);
  const [error,           setError]           = useState("");

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
  };

  const toggleFormat = (f) =>
    setSelectedFormats((p) =>
      p.includes(f) ? p.filter((x) => x !== f) : [...p, f]
    );

  const convert = async () => {
    if (!file || !selectedFormats.length) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("formats", selectedFormats.join(","));
      fd.append("output_type", outputType);

      const res  = await fetch(`${API_BASE}/convert/`, { method: "POST", body: fd });
      const data = await res.json();

      if (data.status === "error") throw new Error(data.message);
      setResult(data);
    } catch (e) {
      setError(e.message || "Conversion failed. Make sure the backend is running at paperpilot-8pwz.onrender.com.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(""); };

  const getOutputRows = () => {
    if (!result) return [];
    const rows = [];
    if (result.zip_file) rows.push({ type: "ZIP", path: result.zip_file });
    if (result.files) Object.entries(result.files).forEach(([type, path]) => rows.push({ type: type.toUpperCase(), path }));
    return rows;
  };

  return (
    <>
      <style>{css}</style>
      <div className="fc-wrap">
        <div className="fc-inner">

          <div className="fc-header">
            <div className="fc-tag">Feature — Format Conversion</div>
            <h1 className="fc-title">Format Conversion</h1>
            <p className="fc-desc">Upload your paper and convert it to IEEE, Springer, or ACM format instantly.</p>
          </div>

          <div className="fc-grid">
            {/* ── Left: Input ── */}
            <div className="fc-card">
              <div className="fc-card-label">Input</div>

              {!file ? (
                <div
                  className={`fc-upload ${drag ? "drag" : ""}`}
                  onClick={() => document.getElementById('fc-file-input').click()}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                >
                  <div className="fc-upload-icon">⬆</div>
                  <div className="fc-upload-text">Drop file or <strong>click to browse</strong></div>
                  <div className="fc-upload-sub">PDF · DOCX · TXT · TEX</div>
                  <input
                    id="fc-file-input"
                    type="file"
                    accept=".pdf,.docx,.txt,.tex"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="fc-file-pill">
                  <span style={{ fontSize: 18 }}>📄</span>
                  <span className="fc-file-name">{file.name}</span>
                  <span className="fc-file-size">{formatBytes(file.size)}</span>
                  <button className="fc-file-remove" onClick={() => setFile(null)}>×</button>
                </div>
              )}

              <div className="fc-field">
                <label className="fc-field-label">Target Format</label>
                <div className="fc-chips">
                  {["ieee", "springer", "acm"].map((f) => (
                    <button
                      key={f}
                      className={`fc-chip ${selectedFormats.includes(f) ? "active" : ""}`}
                      onClick={() => toggleFormat(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fc-field">
                <label className="fc-field-label">Output Type</label>
                <div className="fc-chips">
                  {["tex"].map((t) => (
                    <button
                      key={t}
                      className={`fc-chip ${outputType === t ? "active" : ""}`}
                      onClick={() => setOutputType(t)}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="fc-btn"
                onClick={convert}
                disabled={loading || !file || !selectedFormats.length}
              >
                {loading ? "Converting…" : "Convert →"}
              </button>

              {error && <div className="fc-error">{error}</div>}
            </div>

            {/* ── Right: Result ── */}
            <div className="fc-result-panel">
              <div className="fc-card-label">Output</div>

              {loading ? (
                <div className="fc-loading">
                  <div className="fc-dots">
                    <div className="fc-dot"/><div className="fc-dot"/><div className="fc-dot"/>
                  </div>
                  <div className="fc-loading-text">Converting…</div>
                </div>
              ) : result ? (
                <div className="fc-success">
                  <div className="fc-success-badge">✓ Conversion complete</div>
                  <div className="fc-success-title">Your paper is ready.</div>
                  <div className="fc-success-sub">
                    Converted to {selectedFormats.map(f => f.toUpperCase()).join(", ")} · {outputType.toUpperCase()}
                  </div>
                  {getOutputRows().map((row, i) => (
                    <div className="fc-output-row" key={i}>
                      <div className="fc-output-info">
                        <span className="fc-output-type">{row.type}</span>
                        <span className="fc-output-path">{row.path}</span>
                      </div>
                      <a
                        className="fc-download-btn"
                        href={`${API_BASE}/download/?path=${encodeURIComponent(row.path)}`}
                        download
                      >
                        ↓ Download
                      </a>
                    </div>
                  ))}
                  <button className="fc-reset" onClick={reset}>← Convert Another</button>
                </div>
              ) : (
                <div className="fc-empty">
                  <div className="fc-empty-glyph">∂</div>
                  <div className="fc-empty-text">Upload a file and choose a format to get started.</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
