import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { ref, onValue, set, serverTimestamp } from "firebase/database";

const API_BASE   = "http://localhost:8000";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

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

const SECTIONS = [
  { key: "abstract",     label: "Abstract",    title: "Abstract",     desc: "A concise summary of your research — problem, approach, and key findings.",        placeholder: "Write your abstract here..."    },
  { key: "introduction", label: "Intro",        title: "Introduction", desc: "Introduce the problem, motivate your work, and outline your contributions.",       placeholder: "Write your introduction here..." },
  { key: "methodology",  label: "Method",       title: "Methodology",  desc: "Describe your approach, system design, algorithms, or experimental setup.",        placeholder: "Write your methodology here..."  },
  { key: "results",      label: "Results",      title: "Results",      desc: "Present your findings, measurements, and experimental outcomes.",                  placeholder: "Write your results here..."      },
  { key: "discussion",   label: "Discuss",      title: "Discussion",   desc: "Interpret your results, compare with related work, discuss limitations.",          placeholder: "Write your discussion here..."   },
  { key: "conclusion",   label: "Conclusion",   title: "Conclusion",   desc: "Summarize contributions, implications, and future directions.",                   placeholder: "Write your conclusion here..."   },
  { key: "references",   label: "Refs",         title: "References",   desc: "List your citations. No AI assistance — these must be yours.",                    placeholder: "[1] Author, A. (Year). Title...", noPolish: true },
];

const COLORS = ["#7C6AF7", "#4CAF7D", "#E8934B", "#E05C5C", "#E8B84B", "#9D94F9"];

function generateRoomId() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
function generateUserId()  { return Math.random().toString(36).substring(2, 10); }

const USER_ID    = generateUserId();
const USER_COLOR = COLORS[Math.floor(Math.random() * COLORS.length)];
const USER_NAME  = "User " + USER_ID.substring(0, 4).toUpperCase();

async function callGroq(systemPrompt, userMessage) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
      max_tokens: 2000, temperature: 0.3,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content.trim();
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; font-family: 'Outfit', sans-serif; color: ${C.text}; min-height: 100vh; }

  /* ── Landing ── */
  .landing { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 24px; padding: 24px; }
  .landing-logo { font-family: 'Libre Baskerville', serif; font-size: 36px; color: ${C.text}; }
  .landing-logo span { color: ${C.accent}; font-style: italic; }
  .landing-sub { font-size: 14px; color: ${C.muted}; font-weight: 300; text-align: center; max-width: 400px; line-height: 1.6; }
  .landing-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 32px; width: 100%; max-width: 420px; }
  .landing-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: ${C.muted}; margin-bottom: 10px; display: block; }
  .landing-input { width: 100%; background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px; padding: 12px 16px; color: ${C.text}; font-family: 'JetBrains Mono', monospace; font-size: 14px; outline: none; transition: border-color 0.15s; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 2px; }
  .landing-input:focus { border-color: ${C.accent}; }
  .landing-input::placeholder { text-transform: none; letter-spacing: 0; color: ${C.muted}; opacity: 0.5; }
  .landing-btn { width: 100%; padding: 13px; background: ${C.accent}; border: none; border-radius: 8px; color: white; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; }
  .landing-btn:hover { background: ${C.accentL}; transform: translateY(-1px); }
  .landing-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .landing-btn-outline { width: 100%; padding: 13px; background: none; border: 1px solid ${C.border}; border-radius: 8px; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
  .landing-btn-outline:hover { border-color: ${C.muted}; color: ${C.text}; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
  .divider-line { flex: 1; height: 1px; background: ${C.border}; }
  .divider-text { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.muted}; letter-spacing: 1px; }

  /* ── Top bar ── */
  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; background: ${C.surface}; border-bottom: 1px solid ${C.border}; flex-shrink: 0; }
  .topbar-logo { font-family: 'Libre Baskerville', serif; font-size: 17px; color: ${C.text}; }
  .topbar-logo span { color: ${C.accent}; font-style: italic; }
  .topbar-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.muted}; letter-spacing: 1.5px; margin-left: 10px; }
  .topbar-room { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: ${C.muted}; letter-spacing: 2px; }
  .topbar-room strong { color: ${C.accent}; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .users-row { display: flex; gap: 5px; align-items: center; }
  .user-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: white; }
  .copy-btn { padding: 7px 14px; background: rgba(124,106,247,0.12); border: 1px solid rgba(124,106,247,0.3); border-radius: 6px; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .copy-btn:hover { background: rgba(124,106,247,0.22); }
  .copy-btn.copied { background: rgba(76,175,125,0.12); border-color: rgba(76,175,125,0.3); color: ${C.green}; }
  .export-topbtn { padding: 7px 16px; background: ${C.accent}; border: none; border-radius: 6px; color: white; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: background 0.15s; }
  .export-topbtn:hover { background: ${C.accentL}; }

  /* ── Layout ── */
  .editor-wrap { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .editor-body { display: flex; flex: 1; overflow: hidden; }

  /* ── Progress bar ── */
  .progress-outer { padding: 24px 32px 0; background: ${C.bg}; flex-shrink: 0; }
  .progress-bar { display: flex; align-items: flex-start; gap: 0; position: relative; margin-bottom: 32px; }
  .progress-track { position: absolute; top: 15px; left: 15px; right: 15px; height: 2px; background: ${C.border}; z-index: 0; }
  .progress-fill { height: 100%; background: ${C.accent}; transition: width 0.4s ease; }
  .step-dot-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; position: relative; z-index: 1; cursor: pointer; }
  .step-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid ${C.border}; background: ${C.bg}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: ${C.muted}; transition: all 0.3s; }
  .step-dot.active { border-color: ${C.accent}; background: ${C.accent}; color: white; box-shadow: 0 0 16px rgba(124,106,247,0.4); }
  .step-dot.done { border-color: ${C.green}; background: ${C.green}; color: white; }
  .step-label { font-size: 9px; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px; text-transform: uppercase; text-align: center; white-space: nowrap; }
  .step-label.active { color: ${C.accent}; }
  .step-label.done { color: ${C.green}; }

  /* ── Section card ── */
  .section-wrap { flex: 1; overflow-y: auto; padding: 0 32px 32px; background: ${C.bg}; }
  .pg-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 40px; animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .pg-step-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: ${C.accent}; margin-bottom: 10px; }
  .pg-card-title { font-family: 'Libre Baskerville', serif; font-size: 28px; font-weight: 400; color: ${C.text}; margin-bottom: 6px; line-height: 1.3; }
  .pg-card-desc { font-size: 13px; color: ${C.muted}; margin-bottom: 32px; font-weight: 300; line-height: 1.6; }

  /* ── Textarea ── */
  .pg-textarea { width: 100%; background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 6px; color: ${C.text}; font-family: 'Outfit', sans-serif; font-size: 14px; padding: 14px; outline: none; resize: vertical; min-height: 220px; height: auto; line-height: 1.7; transition: border-color 0.15s; overflow-y: visible; }
  .pg-textarea:focus { border-color: ${C.accent}; }
  .pg-textarea.polishing { border-color: rgba(124,106,247,0.4); background: rgba(124,106,247,0.03); }
  .textarea-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
  .char-count { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.muted}; letter-spacing: 1px; }

  /* Live badge */
  .live-badge { display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.green}; letter-spacing: 1px; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.green}; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }

  /* ── Polish button ── */
  .polish-btn { display: flex; align-items: center; gap: 8px; padding: 8px 18px; background: none; border: 1px solid ${C.border}; border-radius: 6px; color: ${C.sub}; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .polish-btn:hover:not(:disabled) { border-color: ${C.gold}; color: ${C.gold}; background: rgba(232,184,75,0.06); }
  .polish-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .gen-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.gold}; animation: blink 1s ease-in-out infinite; }
  @keyframes blink { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }

  /* ── Diff panel ── */
  .diff-panel { margin-top: 16px; border: 1px solid ${C.border}; border-radius: 8px; overflow: hidden; animation: slideUp 0.25s ease; }
  .diff-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: ${C.surface}; border-bottom: 1px solid ${C.border}; }
  .diff-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.gold}; }
  .diff-actions { display: flex; gap: 8px; }
  .diff-btn { padding: 5px 14px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px; cursor: pointer; border: 1px solid; transition: all 0.15s; }
  .diff-btn.accept { border-color: ${C.green}; color: ${C.green}; background: rgba(76,175,125,0.08); }
  .diff-btn.accept:hover { background: rgba(76,175,125,0.18); }
  .diff-btn.reject { border-color: ${C.border}; color: ${C.muted}; background: none; }
  .diff-btn.reject:hover { border-color: ${C.muted}; color: ${C.text}; }
  .diff-body { padding: 16px; font-size: 13px; color: ${C.sub}; line-height: 1.75; font-weight: 300; white-space: pre-wrap; height: auto; max-height: none; overflow-y: visible; }
  .diff-changes { padding: 10px 16px; background: rgba(76,175,125,0.05); border-top: 1px solid ${C.border}; font-size: 11px; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

  /* ── Nav ── */
  .pg-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid ${C.border}; }
  .btn-back { padding: 11px 24px; background: none; border: 1px solid ${C.border}; border-radius: 6px; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 1px; cursor: pointer; transition: all 0.15s; }
  .btn-back:hover { border-color: ${C.muted}; color: ${C.text}; }
  .btn-next { padding: 11px 28px; background: ${C.accent}; border: none; border-radius: 6px; color: white; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .btn-next:hover:not(:disabled) { background: ${C.accentL}; transform: translateY(-1px); }
  .btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* ── Error ── */
  .pg-error { margin-top: 12px; padding: 10px 14px; background: rgba(224,92,92,0.08); border: 1px solid rgba(224,92,92,0.2); border-radius: 6px; font-size: 12px; color: #e08080; line-height: 1.5; }

  /* ── Users sidebar ── */
  .users-panel { width: 160px; background: ${C.surface}; border-left: 1px solid ${C.border}; padding: 20px 16px; flex-shrink: 0; overflow-y: auto; }
  .users-panel-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: ${C.muted}; margin-bottom: 16px; }
  .user-item { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .user-item-name { font-size: 12px; color: ${C.text}; font-weight: 300; }
  .user-item-you { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: ${C.muted}; margin-top: 2px; }

  /* ── Export overlay ── */
  .export-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .export-panel { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 32px; width: 100%; max-width: 440px; }
  .export-panel-title { font-family: 'Libre Baskerville', serif; font-size: 22px; color: ${C.text}; margin-bottom: 6px; }
  .export-panel-sub { font-size: 13px; color: ${C.muted}; margin-bottom: 24px; font-weight: 300; }
  .export-field { margin-bottom: 18px; }
  .export-field-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.muted}; margin-bottom: 10px; display: block; }
  .export-chips { display: flex; gap: 8px; }
  .export-chip { padding: 7px 16px; border: 1px solid ${C.border}; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; background: none; color: ${C.muted}; transition: all 0.15s; }
  .export-chip:hover { border-color: ${C.muted}; color: ${C.text}; }
  .export-chip.active { border-color: ${C.accent}; color: ${C.accent}; background: rgba(124,106,247,0.08); }
  .export-go-btn { width: 100%; padding: 13px; background: ${C.accent}; border: none; border-radius: 8px; color: white; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
  .export-go-btn:hover:not(:disabled) { background: ${C.accentL}; }
  .export-go-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .export-cancel { width: 100%; padding: 10px; background: none; border: 1px solid ${C.border}; border-radius: 8px; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; margin-top: 8px; transition: all 0.15s; }
  .export-cancel:hover { border-color: ${C.muted}; color: ${C.text}; }
  .export-success { background: rgba(76,175,125,0.08); border: 1px solid rgba(76,175,125,0.25); border-radius: 8px; padding: 16px; margin-top: 16px; }
  .export-success-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: ${C.green}; margin-bottom: 10px; }
  .export-file-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .export-file-path { font-size: 11px; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }
  .export-dl { color: ${C.accent}; font-family: 'JetBrains Mono', monospace; font-size: 10px; text-decoration: none; letter-spacing: 1px; }
  .export-dl:hover { color: ${C.accentL}; }
  .export-error { margin-top: 12px; padding: 10px 14px; background: rgba(224,92,92,0.08); border: 1px solid rgba(224,92,92,0.2); border-radius: 6px; font-size: 12px; color: #e08080; }

  /* ── Field ── */
  .field { margin-bottom: 20px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .field-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.muted}; margin-bottom: 8px; display: block; }
  .pg-input { width: 100%; background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 6px; color: ${C.text}; font-family: 'Outfit', sans-serif; font-size: 14px; padding: 10px 14px; outline: none; transition: border-color 0.15s; }
  .pg-input:focus { border-color: ${C.accent}; }
  .author-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .author-tag { display: flex; align-items: center; gap: 6px; background: rgba(124,106,247,0.12); border: 1px solid rgba(124,106,247,0.25); border-radius: 20px; padding: 4px 12px; font-size: 13px; color: ${C.accentL}; }
  .author-tag button { background: none; border: none; color: ${C.muted}; cursor: pointer; font-size: 14px; line-height: 1; padding: 0; transition: color 0.15s; }
  .author-tag button:hover { color: ${C.red}; }
  .author-add-row { display: flex; gap: 8px; }
  .author-add-row .pg-input { flex: 1; }
  .btn-add { padding: 10px 16px; background: rgba(124,106,247,0.15); border: 1px solid rgba(124,106,247,0.3); border-radius: 6px; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn-add:hover { background: rgba(124,106,247,0.25); }
  .pg-select { width: 100%; background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 6px; color: ${C.text}; font-family: 'Outfit', sans-serif; font-size: 14px; padding: 10px 14px; outline: none; transition: border-color 0.15s; appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236B6B80'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
`;

// ── Section editor with AI polish ─────────────────────────────────────────────
function SectionEditor({ sec, value, onChange }) {
  const [polishing,  setPolishing]  = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error,      setError]      = useState("");

  const polish = async () => {
    if (!value.trim()) return;
    setPolishing(true); setSuggestion(null); setError("");
    const system = `You are an academic writing assistant. Fix spelling mistakes, grammar errors, punctuation, and spacing in research paper text.
Rules:
- Do NOT add new content or ideas
- Do NOT change meaning or structure
- Only fix: spelling, grammar, punctuation, spacing, awkward phrasing
- Keep the author's voice
- Respond ONLY with valid JSON: { "polished": "corrected text", "changes": "brief summary of fixes" }
- No markdown, no extra text`;
    try {
      const raw   = await callGroq(system, `Section: ${sec.title}\n\n${value}`);
      const clean = raw.replace(/```json|```/g, "").trim();
      setSuggestion(JSON.parse(clean));
    } catch (e) {
      setError(e.message || "Polish failed. Try again.");
    } finally {
      setPolishing(false);
    }
  };

  return (
    <div>
      <textarea
        className={`pg-textarea ${polishing ? "polishing" : ""}`}
        placeholder={sec.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={polishing}
        rows={10}
      />
      <div className="textarea-footer">
        <span className="char-count">{value.length} chars · {value.trim().split(/\s+/).filter(Boolean).length} words</span>
        {!sec.noPolish && (
          <button className="polish-btn" onClick={polish} disabled={polishing || !value.trim()}>
            {polishing ? <><div className="gen-dot"/> Polishing…</> : <>✦ Polish with AI</>}
          </button>
        )}
      </div>

      {suggestion && (
        <div className="diff-panel">
          <div className="diff-header">
            <span className="diff-label">✦ Suggested Polish</span>
            <div className="diff-actions">
              <button className="diff-btn reject" onClick={() => setSuggestion(null)}>Discard</button>
              <button className="diff-btn accept" onClick={() => { onChange(suggestion.polished); setSuggestion(null); }}>Accept ✓</button>
            </div>
          </div>
          <div className="diff-body">{suggestion.polished}</div>
          {suggestion.changes && <div className="diff-changes">Fixed: {suggestion.changes}</div>}
        </div>
      )}
      {error && <div className="pg-error">{error}</div>}
    </div>
  );
}

// ── Info step ─────────────────────────────────────────────────────────────────
function InfoStep({ info, setInfo }) {
  const [authorInput, setAuthorInput] = useState("");
  const addAuthor = () => {
    const name = authorInput.trim();
    if (!name) return;
    setInfo((p) => ({ ...p, authors: [...(p.authors || []), name] }));
    setAuthorInput("");
  };
  const removeAuthor = (i) => setInfo((p) => ({ ...p, authors: p.authors.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <div className="pg-step-tag">Step 1 of {SECTIONS.length + 2}</div>
      <h2 className="pg-card-title">Paper Information</h2>
      <p className="pg-card-desc">Tell us about your paper before you start writing.</p>
      <div className="field">
        <label className="field-label">Paper Title</label>
        <input className="pg-input" placeholder="e.g. Deep Learning for Climate Prediction"
          value={info.title || ""} onChange={(e) => setInfo((p) => ({ ...p, title: e.target.value }))} />
      </div>
      <div className="field-row">
        <div>
          <label className="field-label">University / Institution</label>
          <input className="pg-input" placeholder="e.g. MIT"
            value={info.university || ""} onChange={(e) => setInfo((p) => ({ ...p, university: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Supervisor</label>
          <input className="pg-input" placeholder="e.g. Dr. Jane Smith"
            value={info.supervisor || ""} onChange={(e) => setInfo((p) => ({ ...p, supervisor: e.target.value }))} />
        </div>
      </div>
      <div className="field">
        <label className="field-label">Target Venue</label>
        <select className="pg-select" value={info.venue || "ieee"} onChange={(e) => setInfo((p) => ({ ...p, venue: e.target.value }))}>
          <option value="ieee">IEEE</option>
          <option value="springer">Springer</option>
          <option value="acm">ACM</option>
        </select>
      </div>
      <div className="field">
        <label className="field-label">Authors / Team Members</label>
        {info.authors?.length > 0 && (
          <div className="author-tags">
            {info.authors.map((a, i) => (
              <div className="author-tag" key={i}>{a}<button onClick={() => removeAuthor(i)}>×</button></div>
            ))}
          </div>
        )}
        <div className="author-add-row">
          <input className="pg-input" placeholder="Type a name and press Add or Enter..."
            value={authorInput} onChange={(e) => setAuthorInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAuthor()} />
          <button className="btn-add" onClick={addAuthor}>+ Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function CollaborationEditor() {
  const [roomId,       setRoomId]       = useState("");
  const [inputRoom,    setInputRoom]    = useState("");
  const [joined,       setJoined]       = useState(false);
  const [sections,     setSections]     = useState({});
  const [info,         setInfo]         = useState({ authors: [], venue: "ieee" });
  const [step,         setStep]         = useState(0); // 0=info, 1-7=sections, 8=export
  const [users,        setUsers]        = useState({});
  const [copied,       setCopied]       = useState(false);
  const [localValues,  setLocalValues]  = useState({});

  // Export
  const [showExport,   setShowExport]   = useState(false);
  const [exportFormat, setExportFormat] = useState("ieee");
  const [outputType,   setOutputType]   = useState("pdf");
  const [exporting,    setExporting]    = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [exportError,  setExportError]  = useState("");

  const totalSteps  = SECTIONS.length + 2; // info + sections + export
  const progressPct = (step / (totalSteps - 1)) * 100;
  const STEP_LABELS = ["Info", ...SECTIONS.map(s => s.label), "Export"];

  const joinRoom = (id) => {
    const room = id.trim().toUpperCase() || generateRoomId();
    setRoomId(room);
    setJoined(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) joinRoom(room);
  }, []);

  useEffect(() => {
    if (!joined || !roomId) return;
    const presenceRef = ref(db, `rooms/${roomId}/users/${USER_ID}`);
    set(presenceRef, { name: USER_NAME, color: USER_COLOR, lastSeen: serverTimestamp() });
    return () => set(presenceRef, null);
  }, [joined, roomId]);

  useEffect(() => {
    if (!joined || !roomId) return;
    const unsub = onValue(ref(db, `rooms/${roomId}/users`), (snap) => setUsers(snap.val() || {}));
    return () => unsub();
  }, [joined, roomId]);

  useEffect(() => {
    if (!joined || !roomId) return;
    const unsub = onValue(ref(db, `rooms/${roomId}/document`), (snap) => {
      const data = snap.val() || {};
      setSections(data);
      setLocalValues((prev) => ({ ...data, ...prev }));
    });
    return () => unsub();
  }, [joined, roomId]);

  useEffect(() => {
    if (!joined || !roomId) return;
    const unsub = onValue(ref(db, `rooms/${roomId}/info`), (snap) => {
      if (snap.val()) setInfo(snap.val());
    });
    return () => unsub();
  }, [joined, roomId]);

  const writeSection = useCallback(
    (() => {
      let timer = null;
      return (key, value) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          set(ref(db, `rooms/${roomId}/document/${key}`), value);
        }, 600);
      };
    })(),
    [roomId]
  );

  const writeInfo = useCallback(
    (() => {
      let timer = null;
      return (val) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          set(ref(db, `rooms/${roomId}/info`), val);
        }, 600);
      };
    })(),
    [roomId]
  );

  const handleSectionChange = (key, value) => {
    setLocalValues((p) => ({ ...p, [key]: value }));
    writeSection(key, value);
  };

  const handleInfoChange = (val) => {
    setInfo(val);
    writeInfo(val);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?room=${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildTxt = () => {
    const lines = [];
    if (info.title)           lines.push(`Title: ${info.title}`);
    if (info.authors?.length) lines.push(`Authors: ${info.authors.join(", ")}`);
    if (info.university)      lines.push(`University: ${info.university}`);
    if (info.supervisor)      lines.push(`Supervisor: ${info.supervisor}`);
    lines.push("");
    SECTIONS.forEach(({ key, title }) => {
      const val = localValues[key] || sections[key] || "";
      if (val.trim()) { lines.push(`${title.toUpperCase()}:\n${val}`); lines.push(""); }
    });
    return lines.join("\n");
  };

  const handleExport = async () => {
    setExporting(true); setExportError(""); setExportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", new File([buildTxt()], "paper.txt", { type: "text/plain" }));
      fd.append("formats", exportFormat);
      fd.append("output_type", outputType);
      const res  = await fetch(`${API_BASE}/convert/`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      setExportResult(data);
    } catch (e) {
      setExportError(e.message || "Export failed. Make sure backend is running at localhost:8000.");
    } finally {
      setExporting(false);
    }
  };

  // ── Landing ───────────────────────────────────────────────────────────
  if (!joined) {
    return (
      <>
        <style>{css}</style>
        <div className="landing">
          <div className="landing-logo">Paper<span>Pilot</span></div>
          <p className="landing-sub">Collaborate on academic papers in real time. Create a room or join an existing one.</p>
          <div className="landing-card">
            <span className="landing-label">Join existing room</span>
            <input className="landing-input" placeholder="Enter room code e.g. ABC123"
              value={inputRoom} onChange={(e) => setInputRoom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inputRoom.trim() && joinRoom(inputRoom)} />
            <button className="landing-btn" onClick={() => joinRoom(inputRoom)} disabled={!inputRoom.trim()}>
              Join Room →
            </button>
            <div className="divider">
              <div className="divider-line"/><span className="divider-text">OR</span><div className="divider-line"/>
            </div>
            <button className="landing-btn-outline" onClick={() => joinRoom("")}>+ Create New Room</button>
          </div>
        </div>
      </>
    );
  }

  const userCount = Object.keys(users).length;
  const currentSec = SECTIONS[step - 1];
  const currentVal = currentSec ? (localValues[currentSec.key] ?? sections[currentSec.key] ?? "") : "";

  const canNext = step === 0 ? info.title?.trim() && info.authors?.length > 0 : true;

  return (
    <>
      <style>{css}</style>
      <div className="editor-wrap">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <span className="topbar-logo">Paper<span>Pilot</span></span>
            <span className="topbar-tag">COLLABORATE</span>
          </div>
          <div className="topbar-room">Room: <strong>{roomId}</strong></div>
          <div className="topbar-right">
            <div className="users-row">
              {Object.entries(users).slice(0, 5).map(([uid, u]) => (
                <div key={uid} className="user-avatar" style={{ background: u.color }} title={u.name}>
                  {u.name?.substring(5, 7)}
                </div>
              ))}
              {userCount > 5 && <span style={{ fontSize: 11, color: C.muted }}>+{userCount - 5}</span>}
            </div>
            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyLink}>
              {copied ? "✓ Copied!" : "⧉ Share Link"}
            </button>
            <button className="export-topbtn" onClick={() => { setShowExport(true); setExportResult(null); setExportError(""); }}>
              ↓ Export
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-outer">
          <div className="progress-bar">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }}/>
            </div>
            {STEP_LABELS.map((label, i) => (
              <div className="step-dot-wrap" key={i} onClick={() => setStep(i)}>
                <div className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`step-label ${i === step ? "active" : i < step ? "done" : ""}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="editor-body">
          <div className="section-wrap">
            <div className="pg-card" key={step}>

              {/* Info step */}
              {step === 0 && <InfoStep info={info} setInfo={handleInfoChange} />}

              {/* Section steps */}
              {step >= 1 && step <= SECTIONS.length && currentSec && (
                <div>
                  <div className="pg-step-tag">Step {step + 1} of {totalSteps}</div>
                  <h2 className="pg-card-title">{currentSec.title}</h2>
                  <p className="pg-card-desc">{currentSec.desc}</p>
                  <SectionEditor
                    key={currentSec.key}
                    sec={currentSec}
                    value={currentVal}
                    onChange={(v) => handleSectionChange(currentSec.key, v)}
                  />
                </div>
              )}

              {/* Export step */}
              {step === totalSteps - 1 && (
                <div>
                  <div className="pg-step-tag">Step {totalSteps} of {totalSteps}</div>
                  <h2 className="pg-card-title">Ready to Export</h2>
                  <p className="pg-card-desc">Your collaborative paper is ready. Click Export to format it.</p>
                  <button className="btn-next" style={{ width: "100%" }}
                    onClick={() => { setShowExport(true); setExportResult(null); setExportError(""); }}>
                    ↓ Export Paper →
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="pg-nav">
                <button className="btn-back" style={{ visibility: step === 0 ? "hidden" : "visible" }}
                  onClick={() => setStep((s) => s - 1)}>← Back</button>
                {step < totalSteps - 1 && (
                  <button className="btn-next" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                    {step === totalSteps - 2 ? "Review →" : "Next →"}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Users panel */}
          <div className="users-panel">
            <div className="users-panel-label">Online · {userCount}</div>
            <div className="live-badge" style={{ marginBottom: 16 }}><div className="live-dot"/> Live</div>
            {Object.entries(users).map(([uid, u]) => (
              <div className="user-item" key={uid}>
                <div className="user-avatar" style={{ background: u.color, width: 24, height: 24, fontSize: 8 }}>
                  {u.name?.substring(5, 7)}
                </div>
                <div>
                  <div className="user-item-name">{u.name}</div>
                  {uid === USER_ID && <div className="user-item-you">you</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export overlay */}
        {showExport && (
          <div className="export-overlay" onClick={(e) => e.target.className === "export-overlay" && setShowExport(false)}>
            <div className="export-panel">
              <div className="export-panel-title">Export Paper</div>
              <div className="export-panel-sub">Convert your collaborative paper to a formatted academic output.</div>
              <div className="export-field">
                <label className="export-field-label">Target Format</label>
                <div className="export-chips">
                  {["ieee", "springer", "acm"].map((f) => (
                    <button key={f} className={`export-chip ${exportFormat === f ? "active" : ""}`} onClick={() => setExportFormat(f)}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="export-field">
                <label className="export-field-label">Output Type</label>
                <div className="export-chips">
                  {["pdf", "tex"].map((t) => (
                    <button key={t} className={`export-chip ${outputType === t ? "active" : ""}`} onClick={() => setOutputType(t)}>{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <button className="export-go-btn" onClick={handleExport} disabled={exporting}>
                {exporting ? "Exporting…" : "Export Paper →"}
              </button>
              <button className="export-cancel" onClick={() => setShowExport(false)}>Cancel</button>
              {exportResult && (
                <div className="export-success">
                  <div className="export-success-label">✓ Export Successful</div>
                  {exportResult.zip_file && (
                    <div className="export-file-row">
                      <span className="export-file-path">{exportResult.zip_file}</span>
                      <a className="export-dl" href={`${API_BASE}/download/?path=${encodeURIComponent(exportResult.zip_file)}`} download>↓ ZIP</a>
                    </div>
                  )}
                  {exportResult.files && Object.entries(exportResult.files).map(([type, path]) => (
                    <div className="export-file-row" key={type}>
                      <span className="export-file-path">{type.toUpperCase()}: {path}</span>
                      <a className="export-dl" href={`${API_BASE}/download/?path=${encodeURIComponent(path)}`} download>↓ Download</a>
                    </div>
                  ))}
                </div>
              )}
              {exportError && <div className="export-error">{exportError}</div>}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
