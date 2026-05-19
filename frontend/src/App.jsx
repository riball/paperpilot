import { useState } from 'react'
import PaperGeneration from './components/PaperGeneration'
import CitationDetector from './components/CitationDetector'
import AICritique from './components/AICritique'
import FormatConversion from './components/FormatConversion'

const C = {
  bg:     "#0B0B0F",
  surface:"#13131A",
  border: "#2A2A3A",
  accent: "#7C6AF7",
  muted:  "#6B6B80",
  text:   "#E8E8F0",
  orange: "#E8934B",
}

const navCss = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }
  .navbar {
    position: sticky; top: 0; z-index: 999;
    background: ${C.surface}; border-bottom: 1px solid ${C.border};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 58px;
  }
  .navbar-logo {
    font-family: 'Libre Baskerville', serif;
    font-size: 18px; color: #E8E8F0;
    display: flex; align-items: center; gap: 6px;
  }
  .navbar-logo span { color: ${C.accent}; font-style: italic; }
  .navbar-tabs { display: flex; align-items: center; gap: 4px; }
  .nav-tab {
    padding: 7px 18px; background: none; border: none;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase; color: ${C.muted};
    cursor: pointer; border-radius: 6px; transition: all 0.15s; position: relative;
  }
  .nav-tab:hover { color: #E8E8F0; background: rgba(255,255,255,0.04); }
  .nav-tab.active { color: #E8E8F0; background: rgba(124,106,247,0.12); }
  .nav-tab.active::after {
    content: ''; position: absolute; bottom: -1px;
    left: 18px; right: 18px; height: 2px;
    background: ${C.accent}; border-radius: 2px;
  }
  .nav-tab.coming { opacity: 0.35; cursor: not-allowed; }
  .coming-badge {
    font-size: 8px; letter-spacing: 0.5px;
    background: rgba(232,147,75,0.15); border: 1px solid rgba(232,147,75,0.3);
    color: ${C.orange}; border-radius: 3px; padding: 1px 5px; margin-left: 6px;
    text-transform: uppercase; vertical-align: middle;
  }
  .placeholder-page {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: calc(100vh - 58px); gap: 16px;
  }
  .placeholder-glyph { font-size: 48px; opacity: 0.08; }
  .placeholder-label {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 2px; text-transform: uppercase; color: ${C.muted};
  }
`

const TABS = [
  { id: 'format',   label: 'Format Conversion', coming: false },
  { id: 'generate', label: 'Paper Generation',  coming: false },
  { id: 'citation', label: 'Citation Detector', coming: false },
  { id: 'critique', label: 'AI Critique',        coming: false },
]

function PlaceholderPage({ label }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-glyph">⚙</div>
      <div className="placeholder-label">{label} — Coming Soon</div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('format')

  return (
    <>
      <style>{navCss}</style>
      <nav className="navbar">
        <div className="navbar-logo">Paper<span>Pilot</span></div>
        <div className="navbar-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-tab ${tab === t.id ? 'active' : ''} ${t.coming ? 'coming' : ''}`}
              onClick={() => !t.coming && setTab(t.id)}
            >
              {t.label}
              {t.coming && <span className="coming-badge">soon</span>}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'format'   && <FormatConversion />}
      {tab === 'generate' && <PaperGeneration />}
      {tab === 'citation' && <CitationDetector />}
      {tab === 'critique' && <AICritique />}
    </>
  )
}
