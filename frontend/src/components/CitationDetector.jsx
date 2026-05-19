import { useState, useRef } from "react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const CITABLE_SECTIONS = ["abstract", "introduction", "methodology", "results", "conclusion"];

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
  orange:  "#E8934B",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap');

  .cd-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .cd-wrap {
    background: ${C.bg}; min-height: 100vh;
    font-family: 'Outfit', sans-serif; color: ${C.text}; padding: 48px 24px;
  }
  .cd-inner { max-width: 860px; margin: 0 auto; }

  .cd-header { margin-bottom: 40px; }
  .cd-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2.5px; text-transform: uppercase;
    color: ${C.orange}; margin-bottom: 10px;
  }
  .cd-title {
    font-family: 'Libre Baskerville', serif; font-size: 34px;
    font-weight: 400; color: ${C.text}; margin-bottom: 8px; line-height: 1.2;
  }
  .cd-desc { font-size: 14px; color: ${C.muted}; font-weight: 300; line-height: 1.6; max-width: 560px; }

  .cd-mode-switch {
    display: flex; gap: 0; margin-bottom: 24px;
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 8px; overflow: hidden; width: fit-content;
  }
  .cd-mode-btn {
    padding: 9px 20px; background: none; border: none;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; color: ${C.muted}; transition: all 0.15s;
  }
  .cd-mode-btn.active { background: ${C.orange}; color: ${C.bg}; font-weight: 600; }
  .cd-mode-btn:hover:not(.active) { color: ${C.text}; }

  .cd-input-card {
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 32px; margin-bottom: 24px;
  }
  .cd-section-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .cd-tab {
    padding: 6px 14px; border: 1px solid ${C.border}; border-radius: 20px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; background: none; color: ${C.muted}; transition: all 0.15s;
  }
  .cd-tab:hover { border-color: ${C.muted}; color: ${C.text}; }
  .cd-tab.active { border-color: ${C.orange}; color: ${C.orange}; background: rgba(232,147,75,0.08); }

  .cd-textarea {
    width: 100%; background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 8px; color: ${C.text}; font-family: 'Outfit', sans-serif;
    font-size: 14px; padding: 16px; outline: none; resize: vertical;
    min-height: 180px; line-height: 1.7; transition: border-color 0.15s;
  }
  .cd-textarea:focus { border-color: ${C.orange}; }

  .cd-footer-row {
    display: flex; align-items: center;
    justify-content: space-between; margin-top: 14px;
  }
  .cd-word-count {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: ${C.muted}; letter-spacing: 1px;
  }
  .cd-run-btn {
    padding: 10px 24px; background: ${C.orange}; border: none;
    border-radius: 6px; color: ${C.bg}; font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; font-weight: 500; transition: all 0.2s;
  }
  .cd-run-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .cd-run-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .cd-upload-zone {
    border: 2px dashed ${C.border}; border-radius: 12px;
    padding: 48px 24px; text-align: center; cursor: pointer;
    transition: all 0.2s; background: ${C.surface}; position: relative;
  }
  .cd-upload-zone:hover, .cd-upload-zone.drag-over {
    border-color: ${C.orange}; background: rgba(232,147,75,0.04);
  }
  .cd-upload-zone input[type="file"] {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .cd-upload-icon { font-size: 36px; margin-bottom: 16px; opacity: 0.6; }
  .cd-upload-title {
    font-family: 'Libre Baskerville', serif; font-size: 18px;
    color: ${C.text}; margin-bottom: 8px;
  }
  .cd-upload-sub { font-size: 13px; color: ${C.muted}; font-weight: 300; }
  .cd-upload-types { margin-top: 16px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .cd-type-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1px; padding: 4px 10px; border-radius: 4px;
    background: rgba(232,147,75,0.08); border: 1px solid rgba(232,147,75,0.2); color: ${C.orange};
  }

  .cd-file-loaded {
    background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .cd-file-info { display: flex; align-items: center; gap: 12px; }
  .cd-file-icon { font-size: 22px; }
  .cd-file-name { font-size: 14px; color: ${C.text}; font-weight: 500; }
  .cd-file-meta { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.muted}; margin-top: 2px; }
  .cd-file-remove {
    background: none; border: 1px solid ${C.border}; border-radius: 4px;
    color: ${C.muted}; font-size: 11px; padding: 4px 10px; cursor: pointer;
    font-family: 'JetBrains Mono', monospace; transition: all 0.15s;
  }
  .cd-file-remove:hover { border-color: ${C.red}; color: ${C.red}; }

  .cd-sections-preview { margin-bottom: 20px; }
  .cd-sections-preview-title {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.muted}; margin-bottom: 10px;
  }
  .cd-section-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .cd-section-chip {
    padding: 5px 12px; border-radius: 20px; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
  }
  .cd-section-chip.found {
    background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.25); color: ${C.green};
  }
  .cd-section-chip.not-found {
    background: rgba(107,107,128,0.08); border: 1px solid ${C.border}; color: ${C.muted};
  }

  .cd-progress-wrap { margin-bottom: 16px; }
  .cd-progress-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; color: ${C.muted}; margin-bottom: 8px;
    display: flex; justify-content: space-between;
  }
  .cd-progress-bar { height: 3px; background: ${C.border}; border-radius: 2px; overflow: hidden; }
  .cd-progress-fill {
    height: 100%; background: ${C.orange}; border-radius: 2px; transition: width 0.3s ease;
  }

  .cd-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 0; gap: 20px;
  }
  .cd-dots { display: flex; gap: 6px; }
  .cd-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${C.orange}; animation: cdpulse 1.1s ease-in-out infinite;
  }
  .cd-dot:nth-child(2) { animation-delay: 0.18s; }
  .cd-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes cdpulse {
    0%,100% { opacity: 0.2; transform: scale(0.75); }
    50%      { opacity: 1;   transform: scale(1); }
  }
  .cd-loading-text {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.muted};
  }

  .cd-results { animation: cdfade 0.3s ease; }
  @keyframes cdfade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .cd-results-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;
  }
  .cd-results-title {
    font-family: 'Libre Baskerville', serif; font-size: 20px; font-style: italic; color: ${C.text};
  }
  .cd-summary-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 1px; padding: 5px 14px; border-radius: 20px;
  }
  .cd-summary-badge.has-flags {
    background: rgba(232,147,75,0.12); border: 1px solid rgba(232,147,75,0.3); color: ${C.orange};
  }
  .cd-summary-badge.clean {
    background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.25); color: ${C.green};
  }

  .cd-clean { text-align: center; padding: 48px 0; }
  .cd-clean-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.6; }
  .cd-clean-text {
    font-family: 'Libre Baskerville', serif; font-size: 18px;
    font-style: italic; color: ${C.text}; margin-bottom: 8px;
  }
  .cd-clean-sub { font-size: 13px; color: ${C.muted}; font-weight: 300; }

  .cd-section-block { margin-bottom: 28px; }
  .cd-section-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: ${C.orange}; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;
  }
  .cd-section-label::after { content: ''; flex: 1; height: 1px; background: ${C.border}; }
  .cd-count-badge {
    background: rgba(232,147,75,0.12); border: 1px solid rgba(232,147,75,0.2);
    border-radius: 10px; padding: 2px 8px; font-size: 10px; color: ${C.orange};
  }

  .cd-flag {
    background: ${C.card}; border: 1px solid ${C.border};
    border-left: 3px solid ${C.orange}; border-radius: 8px;
    padding: 16px 20px; margin-bottom: 10px; animation: cdfade 0.25s ease both;
  }
  .cd-flag-sentence {
    font-size: 14px; color: ${C.text}; line-height: 1.6;
    margin-bottom: 10px; font-style: italic;
  }
  .cd-flag-sentence::before { content: '"'; color: ${C.orange}; margin-right: 2px; }
  .cd-flag-sentence::after  { content: '"'; color: ${C.orange}; margin-left: 2px; }
  .cd-flag-reason {
    font-size: 12px; color: ${C.muted}; line-height: 1.5;
    display: flex; align-items: flex-start; gap: 8px;
  }
  .cd-flag-icon { font-size: 12px; margin-top: 1px; flex-shrink: 0; }

  .cd-error {
    padding: 14px 18px; background: rgba(224,92,92,0.08);
    border: 1px solid rgba(224,92,92,0.2); border-radius: 8px;
    font-size: 13px; color: #e08080; margin-top: 16px; line-height: 1.5;
  }

  .cd-reset {
    margin-top: 32px; padding: 10px 20px; background: none;
    border: 1px solid ${C.border}; border-radius: 6px;
    color: ${C.muted}; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
  }
  .cd-reset:hover { border-color: ${C.muted}; color: ${C.text}; }

  /* ── Suggested references ── */
  .cd-ref-trigger {
    margin-top: 12px; padding: 7px 14px; background: none;
    border: 1px solid ${C.border}; border-radius: 5px;
    color: ${C.accentL}; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s; display: inline-flex;
    align-items: center; gap: 6px;
  }
  .cd-ref-trigger:hover:not(:disabled) { border-color: ${C.accentL}; background: rgba(124,106,247,0.06); }
  .cd-ref-trigger:disabled { opacity: 0.45; cursor: not-allowed; }
  .cd-ref-trigger .cd-ref-spinner {
    width: 10px; height: 10px; border: 1.5px solid rgba(157,148,249,0.25);
    border-top-color: ${C.accentL}; border-radius: 50%;
    animation: cdspin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes cdspin { to { transform: rotate(360deg); } }

  .cd-refs-panel {
    margin-top: 14px; border-top: 1px solid ${C.border}; padding-top: 14px;
    animation: cdfade 0.2s ease;
  }
  .cd-refs-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 2px; text-transform: uppercase;
    color: ${C.accentL}; margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .cd-refs-label::after { content: ''; flex: 1; height: 1px; background: rgba(124,106,247,0.18); }

  .cd-ref-card {
    background: ${C.surface}; border: 1px solid ${C.border};
    border-left: 2px solid ${C.accentL}; border-radius: 6px;
    padding: 12px 14px; margin-bottom: 8px; position: relative;
  }
  .cd-ref-card:last-child { margin-bottom: 0; }
  .cd-ref-title { font-size: 13px; color: ${C.text}; font-weight: 500; line-height: 1.45; margin-bottom: 4px; }
  .cd-ref-authors { font-size: 11px; color: ${C.muted}; margin-bottom: 3px; font-style: italic; }
  .cd-ref-meta {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: ${C.muted}; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .cd-ref-year {
    background: rgba(124,106,247,0.1); border: 1px solid rgba(124,106,247,0.2);
    border-radius: 4px; padding: 1px 7px; color: ${C.accentL};
  }
  .cd-ref-venue { color: ${C.sub}; }
  .cd-ref-actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .cd-ref-link, .cd-ref-copy {
    font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 1px;
    text-transform: uppercase; padding: 4px 10px; border-radius: 4px;
    cursor: pointer; transition: all 0.15s; text-decoration: none;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .cd-ref-link {
    background: rgba(124,106,247,0.08); border: 1px solid rgba(124,106,247,0.2);
    color: ${C.accentL};
  }
  .cd-ref-link:hover { background: rgba(124,106,247,0.15); }
  .cd-ref-copy {
    background: rgba(107,107,128,0.08); border: 1px solid ${C.border};
    color: ${C.muted};
  }
  .cd-ref-copy:hover { border-color: ${C.muted}; color: ${C.text}; }
  .cd-ref-copy.copied { border-color: ${C.green}; color: ${C.green}; background: rgba(76,175,125,0.08); }

  .cd-refs-error {
    font-size: 12px; color: #e08080; padding: 8px 12px;
    background: rgba(224,92,92,0.06); border: 1px solid rgba(224,92,92,0.15);
    border-radius: 5px;
  }
`;

// ─── Groq call ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an academic writing assistant specializing in research paper integrity.
Your job is to identify sentences that make factual claims, cite statistics, reference prior work,
or make non-obvious statements that require a citation but do not have one.

Rules:
- Only flag sentences that genuinely need a citation
- Do NOT flag common knowledge (e.g., "water boils at 100 degrees")
- Do NOT flag the paper's own findings or contributions
- Do NOT flag sentences that already contain a citation marker like [1], [2], (Author, Year), etc.
- Be concise in your reasons

Respond ONLY with a valid JSON array. No preamble, no markdown backticks. Format:
[
  { "sentence": "the sentence that needs a citation", "reason": "brief reason why" }
]
If no citations are needed, return an empty array: []`;

async function analyzeSection(sectionName, text) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: `Section: ${sectionName.toUpperCase()}\n\n${text}` },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  let raw = data.choices[0].message.content.trim();
  if (raw.startsWith("```")) {
    raw = raw.split("```")[1];
    if (raw.startsWith("json")) raw = raw.slice(4);
  }
  return JSON.parse(raw.trim());
}


// ─── Suggested citations call ─────────────────────────────────
const SUGGEST_PROMPT = `You are an expert academic librarian. Given a sentence from a research paper that needs a citation,
suggest 2-3 real, existing academic references that would be appropriate to cite.

Return ONLY a valid JSON array with no preamble or markdown. Each object must have:
- "title": full paper/book title
- "authors": author names as a string (e.g. "Smith, J., Doe, A.")
- "year": publication year as a string
- "venue": journal name, conference, or publisher
- "doi": DOI string if known, otherwise empty string
- "url": use https://doi.org/<doi> if doi known, else a google scholar search URL for the title
- "bibtex": a minimal BibTeX entry for this reference

Only suggest references that are highly likely to genuinely exist. Prefer well-known papers, surveys, or textbooks.

Return format: [ { "title": "...", "authors": "...", "year": "...", "venue": "...", "doi": "...", "url": "...", "bibtex": "@article{...}" } ]`;

async function fetchSuggestedCitations(sentence, reason) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SUGGEST_PROMPT },
        { role: "user", content: `Sentence needing citation: "${sentence}"\nReason: ${reason}\n\nSuggest 2-3 appropriate academic references.` },
      ],
      max_tokens: 1400,
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  let raw = data.choices[0].message.content.trim();
  const fence = String.fromCharCode(96,96,96);
  if (raw.startsWith(fence)) {
    raw = raw.split(fence)[1];
    if (raw.startsWith("json")) raw = raw.slice(4);
  }
  return JSON.parse(raw.trim());
}


function readAsText(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = () => rej(new Error("Failed to read file"));
    r.readAsText(file);
  });
}

function readAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = () => rej(new Error("Failed to read file"));
    r.readAsArrayBuffer(file);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function extractText(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "txt") {
    return readAsText(file);
  }

  if (ext === "pdf") {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const ab = await readAsArrayBuffer(file);
    const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return text;
  }

  if (ext === "docx") {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
    const ab = await readAsArrayBuffer(file);
    const result = await window.mammoth.extractRawText({ arrayBuffer: ab });
    return result.value;
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload PDF, DOCX, or TXT.`);
}

// ─── Section splitter ─────────────────────────────────────────────────────────

const SECTION_KEYWORDS = {
  abstract:     ["abstract"],
  introduction: ["introduction", "1. introduction", "1 introduction", "i. introduction"],
  methodology:  ["methodology", "methods", "method", "materials and methods",
                 "2. methodology", "3. methodology", "2. methods", "3. methods",
                 "ii. methods", "iii. methods"],
  results:      ["results", "findings", "experimental results",
                 "3. results", "4. results", "results and discussion",
                 "iii. results", "iv. results"],
  conclusion:   ["conclusion", "conclusions", "concluding remarks", "summary",
                 "5. conclusion", "6. conclusion", "v. conclusion", "vi. conclusion"],
};

function splitIntoSections(text) {
  const lines = text.split(/\r?\n/);
  const boundaries = [];

  lines.forEach((line, idx) => {
    const t = line.trim().toLowerCase().replace(/\s+/g, " ");
    if (!t || t.length > 80) return; // section headers are short
    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
      if (keywords.some((kw) => t === kw || t.startsWith(kw + " ") || t.startsWith(kw + ":"))) {
        boundaries.push({ section, lineIndex: idx });
        break;
      }
    }
  });

  if (boundaries.length === 0) {
    return { "full paper": text.trim() };
  }

  const sections = {};
  boundaries.forEach(({ section, lineIndex }, i) => {
    const start = lineIndex + 1;
    const end = i + 1 < boundaries.length ? boundaries[i + 1].lineIndex : lines.length;
    const content = lines.slice(start, end).join("\n").trim();
    if (content.length > 20) {
      sections[section] = sections[section] ? sections[section] + "\n" + content : content;
    }
  });

  return sections;
}

function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") return "📄";
  if (ext === "docx") return "📝";
  return "📃";
}

// ─── FlagCard with lazy reference suggestions ─────────────────────────────────

function FlagCard({ flag, delay }) {
  const [refState, setRefState] = useState("idle"); // idle | loading | done | error
  const [refs,     setRefs]     = useState([]);
  const [refError, setRefError] = useState("");
  const [copied,   setCopied]   = useState({}); // { index: bool }

  const loadRefs = async () => {
    setRefState("loading");
    try {
      const suggestions = await fetchSuggestedCitations(flag.sentence, flag.reason);
      setRefs(suggestions);
      setRefState("done");
    } catch (e) {
      setRefError(e.message || "Could not fetch suggestions.");
      setRefState("error");
    }
  };

  const copyBibtex = (bibtex, idx) => {
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopied((p) => ({ ...p, [idx]: true }));
      setTimeout(() => setCopied((p) => ({ ...p, [idx]: false })), 2000);
    });
  };

  return (
    <div className="cd-flag" style={{ animationDelay: `${delay}s` }}>
      {/* Gap sentence */}
      <div className="cd-flag-sentence">{flag.sentence}</div>

      {/* Reason */}
      <div className="cd-flag-reason">
        <span className="cd-flag-icon">⚠</span>
        {flag.reason}
      </div>

      {/* Find References trigger */}
      {refState === "idle" && (
        <button className="cd-ref-trigger" onClick={loadRefs}>
          <span>📚</span> Find References
        </button>
      )}
      {refState === "loading" && (
        <button className="cd-ref-trigger" disabled>
          <span className="cd-ref-spinner" />
          Fetching suggestions…
        </button>
      )}

      {/* References panel */}
      {refState === "done" && refs.length > 0 && (
        <div className="cd-refs-panel">
          <div className="cd-refs-label">Suggested References</div>
          {refs.map((ref, i) => (
            <div className="cd-ref-card" key={i}>
              <div className="cd-ref-title">{ref.title}</div>
              <div className="cd-ref-authors">{ref.authors}</div>
              <div className="cd-ref-meta">
                <span className="cd-ref-year">{ref.year}</span>
                {ref.venue && <span className="cd-ref-venue">{ref.venue}</span>}
                {ref.doi && <span style={{ color: "#6B6B80" }}>DOI: {ref.doi}</span>}
              </div>
              <div className="cd-ref-actions">
                {ref.url && (
                  <a className="cd-ref-link" href={ref.url} target="_blank" rel="noopener noreferrer">
                    🔗 Open
                  </a>
                )}
                {ref.bibtex && (
                  <button
                    className={`cd-ref-copy ${copied[i] ? "copied" : ""}`}
                    onClick={() => copyBibtex(ref.bibtex, i)}
                  >
                    {copied[i] ? "✓ Copied" : "Copy BibTeX"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {refState === "done" && refs.length === 0 && (
        <div className="cd-refs-panel">
          <div className="cd-refs-error">No specific references found. Try searching Google Scholar manually.</div>
        </div>
      )}

      {refState === "error" && (
        <div className="cd-refs-panel">
          <div className="cd-refs-error">⚠ {refError}</div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CitationDetector() {
  const [mode,             setMode]             = useState("sections");
  const [activeSection,    setActiveSection]    = useState("abstract");
  const [texts,            setTexts]            = useState({});
  const [loading,          setLoading]          = useState(false);
  const [results,          setResults]          = useState(null);
  const [error,            setError]            = useState("");
  const [uploadedFile,     setUploadedFile]     = useState(null);
  const [extractedSections,setExtractedSections]= useState(null);
  const [extracting,       setExtracting]       = useState(false);
  const [isDragOver,       setIsDragOver]       = useState(false);
  const [scanProgress,     setScanProgress]     = useState({ current: 0, total: 0, label: "" });
  const fileInputRef = useRef(null);

  const currentText = texts[activeSection] || "";
  const wordCount   = currentText.trim().split(/\s+/).filter(Boolean).length;
  const hasAnyText  = CITABLE_SECTIONS.some((s) => texts[s]?.trim().length > 20);
  const hasUploadReady = extractedSections && Object.keys(extractedSections).length > 0;

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setUploadedFile(file);
    setExtractedSections(null);
    setExtracting(true);
    try {
      const text = await extractText(file);
      const sections = splitIntoSections(text);
      setExtractedSections(sections);
    } catch (e) {
      setError(e.message);
      setUploadedFile(null);
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setUploadedFile(null); setExtractedSections(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const run = async () => {
    setLoading(true); setError(""); setResults(null);

    const sectionsToAnalyze = mode === "upload"
      ? extractedSections
      : Object.fromEntries(
          CITABLE_SECTIONS.filter((s) => texts[s]?.trim().length > 20).map((s) => [s, texts[s]])
        );

    const keys = Object.keys(sectionsToAnalyze);
    setScanProgress({ current: 0, total: keys.length, label: "" });

    const allResults = {};
    try {
      for (let i = 0; i < keys.length; i++) {
        const section = keys[i];
        setScanProgress({ current: i + 1, total: keys.length, label: section });
        const flagged = await analyzeSection(section, sectionsToAnalyze[section]);
        if (flagged.length > 0) allResults[section] = flagged;
      }
      setResults(allResults);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setScanProgress({ current: 0, total: 0, label: "" });
    }
  };

  const totalFlags = results
    ? Object.values(results).reduce((acc, arr) => acc + arr.length, 0) : 0;

  const reset = () => {
    setResults(null); setError("");
    if (mode === "upload") removeFile();
  };

  const switchMode = (m) => { setMode(m); setResults(null); setError(""); };

  return (
    <>
      <style>{css}</style>
      <div className="cd-wrap">
        <div className="cd-inner">

          <div className="cd-header">
            <div className="cd-tag">Feature — Citation Detector</div>
            <h1 className="cd-title">Citation Gap Detector</h1>
            <p className="cd-desc">
              Identify sentences that make claims without a citation — before peer review does.
            </p>
          </div>

          {!results && (
            <div className="cd-mode-switch">
              <button className={`cd-mode-btn ${mode === "sections" ? "active" : ""}`}
                onClick={() => switchMode("sections")}>✏ Section by Section</button>
              <button className={`cd-mode-btn ${mode === "upload" ? "active" : ""}`}
                onClick={() => switchMode("upload")}>⬆ Upload Paper</button>
            </div>
          )}

          {/* ── SECTION MODE ── */}
          {mode === "sections" && !results && (
            <div className="cd-input-card">
              <div className="cd-section-tabs">
                {CITABLE_SECTIONS.map((s) => (
                  <button key={s}
                    className={`cd-tab ${activeSection === s ? "active" : ""}`}
                    onClick={() => setActiveSection(s)}>
                    {texts[s]?.trim() ? "✓ " : ""}{s}
                  </button>
                ))}
              </div>
              <textarea key={activeSection} className="cd-textarea"
                placeholder={`Paste your ${activeSection} here…`}
                value={currentText}
                onChange={(e) => setTexts((p) => ({ ...p, [activeSection]: e.target.value }))} />
              <div className="cd-footer-row">
                <span className="cd-word-count">
                  {wordCount} words · {CITABLE_SECTIONS.filter((s) => texts[s]?.trim().length > 20).length} / {CITABLE_SECTIONS.length} sections filled
                </span>
                <button className="cd-run-btn" onClick={run} disabled={loading || !hasAnyText}>
                  {loading ? "Scanning…" : "Scan for Citations →"}
                </button>
              </div>
              {error && <div className="cd-error">{error}</div>}
            </div>
          )}

          {/* ── UPLOAD MODE ── */}
          {mode === "upload" && !results && (
            <div className="cd-input-card">
              {uploadedFile ? (
                <div className="cd-file-loaded">
                  <div className="cd-file-info">
                    <span className="cd-file-icon">{fileIcon(uploadedFile.name)}</span>
                    <div>
                      <div className="cd-file-name">{uploadedFile.name}</div>
                      <div className="cd-file-meta">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                        {extractedSections && ` · ${Object.keys(extractedSections).length} section(s) detected`}
                      </div>
                    </div>
                  </div>
                  <button className="cd-file-remove" onClick={removeFile}>✕ Remove</button>
                </div>
              ) : (
                <div
                  className={`cd-upload-zone ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt"
                    onChange={(e) => handleFile(e.target.files[0])} />
                  <div className="cd-upload-icon">📎</div>
                  <div className="cd-upload-title">Drop your paper here</div>
                  <div className="cd-upload-sub">or click to browse files</div>
                  <div className="cd-upload-types">
                    <span className="cd-type-badge">PDF</span>
                    <span className="cd-type-badge">DOCX</span>
                    <span className="cd-type-badge">TXT</span>
                  </div>
                </div>
              )}

              {extracting && (
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <div className="cd-dots" style={{ justifyContent: "center" }}>
                    <div className="cd-dot"/><div className="cd-dot"/><div className="cd-dot"/>
                  </div>
                  <div className="cd-loading-text" style={{ marginTop: 10 }}>Extracting text…</div>
                </div>
              )}

              {extractedSections && !extracting && (
                <div className="cd-sections-preview">
                  <div className="cd-sections-preview-title">Detected sections</div>
                  <div className="cd-section-chips">
                    {CITABLE_SECTIONS.map((s) => (
                      <span key={s} className={`cd-section-chip ${extractedSections[s] ? "found" : "not-found"}`}>
                        {extractedSections[s] ? "✓ " : ""}{s}
                      </span>
                    ))}
                    {Object.keys(extractedSections)
                      .filter((s) => !CITABLE_SECTIONS.includes(s))
                      .map((s) => (
                        <span key={s} className="cd-section-chip found">✓ {s}</span>
                      ))}
                  </div>
                </div>
              )}

              <div className="cd-footer-row">
                <span className="cd-word-count">
                  {extractedSections
                    ? `${Object.values(extractedSections).join(" ").trim().split(/\s+/).filter(Boolean).length} words total`
                    : "No file selected"}
                </span>
                <button className="cd-run-btn" onClick={run}
                  disabled={loading || !hasUploadReady || extracting}>
                  {loading ? "Scanning…" : "Scan for Citations →"}
                </button>
              </div>

              {error && <div className="cd-error">{error}</div>}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="cd-loading">
              <div className="cd-dots">
                <div className="cd-dot"/><div className="cd-dot"/><div className="cd-dot"/>
              </div>
              {scanProgress.total > 0 && (
                <div style={{ width: "100%", maxWidth: 360 }}>
                  <div className="cd-progress-wrap">
                    <div className="cd-progress-label">
                      <span>Scanning "{scanProgress.label}"</span>
                      <span>{scanProgress.current} / {scanProgress.total}</span>
                    </div>
                    <div className="cd-progress-bar">
                      <div className="cd-progress-fill"
                        style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )}
              <div className="cd-loading-text">Scanning sections…</div>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div className="cd-results">
              <div className="cd-results-header">
                <div className="cd-results-title">Scan Complete</div>
                <div className={`cd-summary-badge ${totalFlags > 0 ? "has-flags" : "clean"}`}>
                  {totalFlags > 0 ? `${totalFlags} citation gap${totalFlags > 1 ? "s" : ""} found` : "No gaps found"}
                </div>
              </div>

              {totalFlags === 0 ? (
                <div className="cd-clean">
                  <div className="cd-clean-icon">✓</div>
                  <div className="cd-clean-text">All sections look well-cited.</div>
                  <div className="cd-clean-sub">No sentences flagged as needing a citation.</div>
                </div>
              ) : (
                Object.entries(results).map(([section, flags]) => (
                  <div className="cd-section-block" key={section}>
                    <div className="cd-section-label">
                      {section}
                      <span className="cd-count-badge">{flags.length}</span>
                    </div>
                    {flags.map((flag, i) => (
                      <FlagCard key={i} flag={flag} delay={i * 0.05} />
                    ))}
                  </div>
                ))
              )}

              <button className="cd-reset" onClick={reset}>← Scan Another Paper</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
