import { useState } from "react";

const API_BASE = "https://paperpilot-8pwz.onrender.com";

const SECTIONS = [
  { key: "title",        label: "Title" },
  { key: "abstract",     label: "Abstract" },
  { key: "keywords",     label: "Keywords" },
  { key: "introduction", label: "Introduction" },
  { key: "methodology",  label: "Methodology" },
  { key: "results",      label: "Results" },
  { key: "conclusion",   label: "Conclusion" },
  { key: "references",   label: "References" },
];

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
  teal:    "#4CC9C9",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap');

  .ac-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .ac-wrap {
    background: ${C.bg}; min-height: calc(100vh - 58px);
    font-family: 'Outfit', sans-serif; color: ${C.text}; padding: 48px 24px;
  }
  .ac-inner { max-width: 1100px; margin: 0 auto; }

  .ac-header { margin-bottom: 36px; }
  .ac-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2.5px; text-transform: uppercase;
    color: ${C.teal}; margin-bottom: 10px;
  }
  .ac-title {
    font-family: 'Libre Baskerville', serif; font-size: 34px;
    font-weight: 400; color: ${C.text}; margin-bottom: 8px; line-height: 1.2;
  }
  .ac-desc { font-size: 14px; color: ${C.muted}; font-weight: 300; line-height: 1.6; max-width: 580px; }

  /* ── Input mode tabs ─────────────────────────────────────────── */
  .ac-mode-bar {
    display: flex; gap: 0; margin-bottom: 28px;
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 8px; overflow: hidden; width: fit-content;
  }
  .ac-mode-btn {
    padding: 9px 20px; background: none; border: none;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase; color: ${C.muted};
    cursor: pointer; transition: all 0.15s;
  }
  .ac-mode-btn.active { background: rgba(76,201,201,0.1); color: ${C.teal}; }
  .ac-mode-btn:hover:not(.active) { color: ${C.text}; background: rgba(255,255,255,0.03); }

  /* ── Layout ──────────────────────────────────────────────────── */
  .ac-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
  @media (max-width: 820px) { .ac-layout { grid-template-columns: 1fr; } }

  /* ── Sidebar ─────────────────────────────────────────────────── */
  .ac-sidebar {
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 20px; height: fit-content; position: sticky; top: 80px;
  }
  .ac-sidebar-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.muted};
    margin-bottom: 14px; display: flex; align-items: center; gap: 10px;
  }
  .ac-sidebar-label::after { content: ''; flex: 1; height: 1px; background: ${C.border}; }

  .ac-section-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 12px; border-radius: 7px; cursor: pointer;
    transition: all 0.15s; margin-bottom: 3px;
  }
  .ac-section-row:hover { background: rgba(255,255,255,0.04); }
  .ac-section-row.active-section { background: rgba(76,201,201,0.08); }
  .ac-section-name {
    font-size: 13px; color: ${C.sub};
    transition: color 0.15s;
  }
  .ac-section-row.active-section .ac-section-name { color: ${C.teal}; }
  .ac-section-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    background: ${C.border};
  }
  .ac-section-dot.has-content { background: rgba(76,201,201,0.5); }
  .ac-section-dot.has-critique { background: ${C.teal}; }
  .ac-section-dot.loading-dot {
    background: ${C.accent};
    animation: acpulse 0.9s ease-in-out infinite;
  }

  @keyframes acpulse {
    0%,100% { opacity: 0.3; transform: scale(0.7); }
    50%      { opacity: 1;   transform: scale(1.2); }
  }

  .ac-run-all-btn {
    width: 100%; margin-top: 16px; padding: 11px;
    background: ${C.teal}; border: none; border-radius: 7px;
    color: #0B0B0F; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s; font-weight: 500;
  }
  .ac-run-all-btn:hover:not(:disabled) { background: #6ee0e0; transform: translateY(-1px); }
  .ac-run-all-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  /* ── Main panel ──────────────────────────────────────────────── */
  .ac-main {
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 28px; min-height: 480px;
  }
  .ac-main-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.muted};
    margin-bottom: 18px; display: flex; align-items: center; gap: 10px;
  }
  .ac-main-label::after { content: ''; flex: 1; height: 1px; background: ${C.border}; }

  /* ── Upload zone ─────────────────────────────────────────────── */
  .ac-upload {
    border: 1px dashed ${C.border}; border-radius: 8px;
    padding: 32px 20px; text-align: center; cursor: pointer;
    transition: all 0.2s; background: ${C.surface}; margin-bottom: 20px;
  }
  .ac-upload:hover, .ac-upload.drag { border-color: ${C.teal}; background: rgba(76,201,201,0.04); }
  .ac-upload-icon { font-size: 26px; opacity: 0.4; margin-bottom: 8px; }
  .ac-upload-text { font-size: 13px; color: ${C.muted}; }
  .ac-upload-text strong { color: ${C.teal}; font-weight: 500; }
  .ac-upload-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.muted}; margin-top: 5px; opacity: 0.6; }

  /* ── Textarea ────────────────────────────────────────────────── */
  .ac-textarea {
    width: 100%; min-height: 140px; background: ${C.surface};
    border: 1px solid ${C.border}; border-radius: 8px;
    padding: 14px 16px; color: ${C.text}; font-family: 'Outfit', sans-serif;
    font-size: 13px; line-height: 1.6; resize: vertical;
    outline: none; transition: border-color 0.15s; margin-bottom: 14px;
  }
  .ac-textarea:focus { border-color: ${C.teal}; }
  .ac-textarea::placeholder { color: ${C.muted}; opacity: 0.6; }

  .ac-field-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: ${C.muted}; margin-bottom: 8px; display: block;
  }

  /* ── Critique btn ────────────────────────────────────────────── */
  .ac-critique-btn {
    padding: 10px 20px; background: rgba(76,201,201,0.12);
    border: 1px solid rgba(76,201,201,0.3); border-radius: 7px;
    color: ${C.teal}; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
  }
  .ac-critique-btn:hover:not(:disabled) { background: rgba(76,201,201,0.2); border-color: ${C.teal}; }
  .ac-critique-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Loading state ───────────────────────────────────────────── */
  .ac-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 240px; gap: 20px;
  }
  .ac-dots { display: flex; gap: 6px; }
  .ac-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${C.teal}; animation: acpulse 1.1s ease-in-out infinite;
  }
  .ac-dot:nth-child(2) { animation-delay: 0.18s; }
  .ac-dot:nth-child(3) { animation-delay: 0.36s; }
  .ac-loading-text {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.muted};
  }

  /* ── Critique output ─────────────────────────────────────────── */
  .ac-result { animation: acfade 0.3s ease; }
  @keyframes acfade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

  .ac-result-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  }
  .ac-result-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(76,201,201,0.1); border: 1px solid rgba(76,201,201,0.25);
    border-radius: 20px; padding: 4px 12px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase; color: ${C.teal};
  }
  .ac-result-section-name {
    font-family: 'Libre Baskerville', serif; font-size: 20px;
    color: ${C.text}; font-weight: 400;
  }
  .ac-critique-body {
    font-size: 13.5px; line-height: 1.75; color: ${C.sub};
    white-space: pre-wrap;
  }
  .ac-critique-body h2 {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.teal};
    margin: 20px 0 8px; border-bottom: 1px solid rgba(76,201,201,0.15);
    padding-bottom: 5px;
  }

  /* Score badge */
  .ac-score-badge {
    display: inline-flex; align-items: center; gap: 8px;
    margin-top: 16px; padding: 8px 16px;
    background: rgba(76,201,201,0.08); border: 1px solid rgba(76,201,201,0.2);
    border-radius: 8px;
  }
  .ac-score-val {
    font-family: 'Libre Baskerville', serif; font-size: 22px;
    color: ${C.teal}; font-style: italic;
  }
  .ac-score-label {
    font-size: 12px; color: ${C.muted};
  }

  /* ── Error ───────────────────────────────────────────────────── */
  .ac-error {
    padding: 12px 16px; background: rgba(224,92,92,0.08);
    border: 1px solid rgba(224,92,92,0.2); border-radius: 8px;
    font-size: 13px; color: #e08080; line-height: 1.5; margin-top: 14px;
  }

  /* ── Empty state ─────────────────────────────────────────────── */
  .ac-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 320px; gap: 14px; text-align: center;
  }
  .ac-empty-glyph {
    font-family: 'Libre Baskerville', serif; font-size: 52px;
    opacity: 0.06; font-style: italic;
  }
  .ac-empty-text { font-size: 13px; color: ${C.muted}; font-weight: 300; max-width: 220px; line-height: 1.6; }

  /* ── File pill ───────────────────────────────────────────────── */
  .ac-file-pill {
    display: flex; align-items: center; gap: 10px;
    background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;
  }
  .ac-file-name { flex: 1; font-size: 13px; color: ${C.text}; }
  .ac-file-remove {
    background: none; border: none; color: ${C.muted};
    cursor: pointer; font-size: 18px; line-height: 1; padding: 0; transition: color 0.15s;
  }
  .ac-file-remove:hover { color: ${C.red}; }

  /* ── All-sections view ───────────────────────────────────────── */
  .ac-all-card {
    background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 10px; padding: 20px; margin-bottom: 16px;
  }
  .ac-all-card-title {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.teal};
    margin-bottom: 14px;
  }
`;

/* ── Markdown-lite renderer ───────────────────────────────────────────────── */
function renderCritique(text) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++}>{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <strong key={key++} style={{ color: "#E8E8F0" }}>
          {line.slice(2, -2)}
        </strong>
      );
    } else if (line.trim() === "") {
      elements.push(<br key={key++} />);
    } else {
      elements.push(<span key={key++}>{line}{"\n"}</span>);
    }
  }

  // Extract score from text
  const scoreMatch = text.match(/(\d+)\s*\/\s*10/);
  const score = scoreMatch ? scoreMatch[1] : null;

  return { elements, score };
}

export default function AICritique() {
  const [mode, setMode]             = useState("manual"); // "manual" | "upload"
  const [activeSection, setActive]  = useState("abstract");
  const [sectionTexts, setTexts]    = useState({});
  const [critiques, setCritiques]   = useState({});
  const [loading, setLoading]       = useState({}); // per section
  const [globalLoading, setGlobal]  = useState(false);
  const [error, setError]           = useState("");
  const [uploadedFile, setUploaded] = useState(null);
  const [drag, setDrag]             = useState(false);

  const setText = (key, val) =>
    setTexts((p) => ({ ...p, [key]: val }));

  // ── Critique one section ──────────────────────────────────────────────────
  const critiqueSection = async (sectionKey) => {
    const content = sectionTexts[sectionKey];
    if (!content?.trim()) return;
    setLoading((p) => ({ ...p, [sectionKey]: true }));
    setError("");
    try {
      const res = await fetch(`${API_BASE}/critique/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: { [sectionKey]: content },
          target_section: sectionKey,
        }),
      });
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      setCritiques((p) => ({ ...p, ...data.critiques }));
    } catch (e) {
      setError(e.message || "Critique failed. Make sure the backend is running.");
    } finally {
      setLoading((p) => ({ ...p, [sectionKey]: false }));
    }
  };

  // ── Critique all sections ─────────────────────────────────────────────────
  const critiqueAll = async () => {
    const toProcess = Object.fromEntries(
      SECTIONS.filter((s) => sectionTexts[s.key]?.trim()).map((s) => [s.key, sectionTexts[s.key]])
    );
    if (!Object.keys(toProcess).length) return;

    setGlobal(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/critique/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: toProcess }),
      });
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      setCritiques((p) => ({ ...p, ...data.critiques }));
    } catch (e) {
      setError(e.message || "Critique failed. Make sure the backend is running.");
    } finally {
      setGlobal(false);
    }
  };

  // ── Handle file upload for auto-parsing ──────────────────────────────────
  const handleFile = async (f) => {
    if (!f) return;
    setUploaded(f);
    setError("");

    // For .tex files: send to backend parse endpoint (reuse /convert/ tex only)
    // For pdf/docx/txt: send to backend as well, but we need sections back.
    // We'll use a dedicated /parse/ endpoint — but since it doesn't exist yet,
    // we tell user to paste manually if not .tex.
    // Actually, let's just call /convert/ with tex output to get sections parsed.
    // We'll add a /parse-sections/ endpoint to backend for this.
    // For now: send to a parse endpoint and populate text fields.
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${API_BASE}/parse-sections/`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      setTexts(data.sections || {});
    } catch (e) {
      setError("Could not auto-parse file. You can still paste section text manually.");
    }
  };

  const filledSections = SECTIONS.filter((s) => sectionTexts[s.key]?.trim());
  const canCritiqueAll = filledSections.length > 0 && !globalLoading;

  const curr = SECTIONS.find((s) => s.key === activeSection);
  const currText = sectionTexts[activeSection] || "";
  const currCritique = critiques[activeSection] || null;
  const currLoading = loading[activeSection] || false;

  return (
    <>
      <style>{css}</style>
      <div className="ac-wrap">
        <div className="ac-inner">

          {/* ── Header ── */}
          <div className="ac-header">
            <div className="ac-tag">Feature — AI Critique</div>
            <h1 className="ac-title">AI Critique</h1>
            <p className="ac-desc">
              Get expert-level peer review feedback on each section of your research paper,
              powered by AI. Paste your sections or upload a file to begin.
            </p>
          </div>

          {/* ── Mode bar ── */}
          <div className="ac-mode-bar">
            <button
              className={`ac-mode-btn ${mode === "manual" ? "active" : ""}`}
              onClick={() => setMode("manual")}
            >
              Manual Entry
            </button>
            <button
              className={`ac-mode-btn ${mode === "upload" ? "active" : ""}`}
              onClick={() => setMode("upload")}
            >
              Upload File
            </button>
          </div>

          {/* ── Upload mode ── */}
          {mode === "upload" && (
            <div style={{ marginBottom: 24 }}>
              {!uploadedFile ? (
                <div
                  className={`ac-upload ${drag ? "drag" : ""}`}
                  style={{ maxWidth: 480 }}
                  onClick={() => document.getElementById("ac-file-in").click()}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                >
                  <div className="ac-upload-icon">⬆</div>
                  <div className="ac-upload-text">Drop file or <strong>click to browse</strong></div>
                  <div className="ac-upload-sub">PDF · DOCX · TXT · TEX</div>
                  <input
                    id="ac-file-in" type="file"
                    accept=".pdf,.docx,.txt,.tex"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="ac-file-pill" style={{ maxWidth: 480 }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                  <span className="ac-file-name">{uploadedFile.name}</span>
                  <button className="ac-file-remove" onClick={() => { setUploaded(null); setTexts({}); }}>×</button>
                </div>
              )}
              {error && <div className="ac-error">{error}</div>}
            </div>
          )}

          {/* ── Main layout ── */}
          <div className="ac-layout">

            {/* ── Sidebar ── */}
            <div className="ac-sidebar">
              <div className="ac-sidebar-label">Sections</div>
              {SECTIONS.map((s) => {
                const hasText = !!(sectionTexts[s.key]?.trim());
                const hasCrit = !!(critiques[s.key]);
                const isLoading = !!(loading[s.key]);
                return (
                  <div
                    key={s.key}
                    className={`ac-section-row ${activeSection === s.key ? "active-section" : ""}`}
                    onClick={() => setActive(s.key)}
                  >
                    <span className="ac-section-name">{s.label}</span>
                    <span
                      className={`ac-section-dot ${
                        isLoading ? "loading-dot" : hasCrit ? "has-critique" : hasText ? "has-content" : ""
                      }`}
                    />
                  </div>
                );
              })}

              <button
                className="ac-run-all-btn"
                onClick={critiqueAll}
                disabled={!canCritiqueAll}
              >
                {globalLoading ? "Analysing…" : `Critique All (${filledSections.length})`}
              </button>

              {/* Legend */}
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { color: "rgba(76,201,201,1)", label: "Critique ready" },
                  { color: "rgba(76,201,201,0.5)", label: "Content added" },
                  { color: "#2A2A3A", label: "Empty" },
                ].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "#6B6B80", letterSpacing: 1 }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Main ── */}
            <div className="ac-main">
              <div className="ac-main-label">{curr?.label}</div>

              {/* Input area */}
              <label className="ac-field-label">Section Content</label>
              <textarea
                className="ac-textarea"
                placeholder={`Paste your ${curr?.label.toLowerCase()} here…`}
                value={currText}
                onChange={(e) => setText(activeSection, e.target.value)}
                rows={6}
              />

              <button
                className="ac-critique-btn"
                onClick={() => critiqueSection(activeSection)}
                disabled={!currText.trim() || currLoading || globalLoading}
              >
                {currLoading ? "Analysing…" : `Critique ${curr?.label} →`}
              </button>

              {mode === "manual" && error && <div className="ac-error">{error}</div>}

              {/* Critique result */}
              <div style={{ marginTop: 28 }}>
                {currLoading || (globalLoading && !critiques[activeSection]) ? (
                  <div className="ac-loading">
                    <div className="ac-dots">
                      <div className="ac-dot" /><div className="ac-dot" /><div className="ac-dot" />
                    </div>
                    <div className="ac-loading-text">Reviewing with AI…</div>
                  </div>
                ) : currCritique ? (
                  <CritiqueDisplay text={currCritique} sectionLabel={curr?.label} />
                ) : (
                  <div className="ac-empty">
                    <div className="ac-empty-glyph">ρ</div>
                    <div className="ac-empty-text">
                      Paste content above and click Critique to get expert feedback.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function CritiqueDisplay({ text, sectionLabel }) {
  const { elements, score } = renderCritique(text);

  return (
    <div className="ac-result">
      <div className="ac-result-header">
        <span className="ac-result-badge">✓ Review complete</span>
        <span className="ac-result-section-name">{sectionLabel}</span>
      </div>

      <div className="ac-critique-body">{elements}</div>

      {score && (
        <div className="ac-score-badge">
          <span className="ac-score-val">{score}/10</span>
          <span className="ac-score-label">Overall Score</span>
        </div>
      )}
    </div>
  );
}
