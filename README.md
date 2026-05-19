# PaperPilot

A unified frontend + backend for academic paper tools.

## Structure

```
merged_project/
├── frontend/          ← Single React app (Vite, port 5173)
│   └── src/
│       ├── App.jsx                          ← Main app with navbar
│       ├── firebase.js                      ← Firebase config (for collaboration)
│       └── components/
│           ├── FormatConversion.jsx         ← Upload & convert papers
│           ├── PaperGeneration.jsx          ← Embeds CollaborationEditor
│           ├── CollaborationEditor.jsx      ← Real-time collaborative editor
│           ├── CitationDetector.jsx         ← Detect & validate citations
│           └── AICritique.jsx               ← AI-powered paper critique
└── Paper_Pilot_v1/    ← Python FastAPI backend (port 8000)
```

## Running

**Backend:**
```bash
cd Paper_Pilot_v1
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Environment

`frontend/.env`:
```
VITE_GROQ_API_KEY=your_groq_key_here
```
