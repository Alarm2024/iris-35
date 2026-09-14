# Iris 35 — Morning Light desk + voice door

Standalone from the 35 closed desk. Free open server to look, tap, and ship the next safe step — now with a **real-time voice agent** for the [AssemblyAI Voice Agent Hackathon](https://lablab.ai/ai-hackathons/assemblyai-voice-agent-hackathon) (team [elghaly-35-voice](https://lablab.ai/ai-hackathons/assemblyai-voice-agent-hackathon/elghaly-35-voice)).

**Owner:** Wyndham Heaven / ElGhaly · **Contact:** support@elghaly.dev · **License:** MIT

| Surface | URL |
| --- | --- |
| Main desk (GitHub Pages) | https://iris-35.elghaly.dev/ |
| **Voice demo** | https://iris-35.elghaly.dev/voice/ |
| Token API (deploy separately) | https://iris-35-voice.onrender.com |

Repo 35 custom domain stays 35.elghaly.dev — do not change it.

## Voice agent architecture

```
Browser (/voice/)          Token server (Render)           AssemblyAI
     │                              │                            │
     │  GET /api/voice-token        │  GET /v1/token + API key   │
     │ ───────────────────────────► │ ──────────────────────────►│
     │  { token }                   │  { token }                 │
     │                              │                            │
     │  WebSocket ?token=           │                            │
     │ ─────────────────────────────────────────────────────────►│
     │  session.update (inline prompt + tools)                   │
     │  input.audio ◄──────────────────────────────────────────►│
     │  reply.audio + transcript.* + tool.call                   │
```

- **Frontend:** static HTML + Web Audio API worklet (`voice/`) on GitHub Pages
- **Backend:** minimal Express token mint (`server/`) — API key never in the browser
- **AI:** AssemblyAI [Voice Agent API](https://www.assemblyai.com/docs/voice-agents/voice-agent-api/browser-integration) (STT + LLM + TTS + turn detection in one WebSocket)

## Quick start (local)

### 1. Token server

```bash
cd server
cp .env.example .env   # add ASSEMBLYAI_API_KEY
npm install
npm start              # http://localhost:3000
```

### 2. Voice client

Serve the repo root (HTTPS or localhost required for microphone):

```bash
npx --yes serve . -p 8080
```

Edit `voice/config.js` for local token URL:

```javascript
window.IRIS_VOICE_CONFIG = {
  tokenUrl: "http://localhost:3000/api/voice-token",
  healthUrl: "http://localhost:3000/health",
  // ...
};
```

Open http://localhost:8080/voice/

## Deploy token server (Render)

1. Fork or use this repo in [Alarm2024/iris-35](https://github.com/Alarm2024/iris-35)
2. [Render](https://render.com) → New **Web Service** → connect repo
3. Use `render.yaml` (rootDir `server`) or set:
   - **Build:** `npm install`
   - **Start:** `npm start`
   - **Root directory:** `server`
4. Add environment variable: `ASSEMBLYAI_API_KEY` = your AssemblyAI key
5. Optional: `ALLOWED_ORIGINS=https://iris-35.elghaly.dev,http://localhost:8080`
6. After deploy, confirm https://YOUR-SERVICE.onrender.com/health shows `"assemblyai_configured": true`
7. Update `voice/config.js` `tokenUrl` / `healthUrl` if your Render URL differs

Voice UI deploys automatically via GitHub Pages on push to `main` (includes `voice/`).

## Hackathon submission

See **[SUBMISSION.md](./SUBMISSION.md)** for the LabLab checklist, demo script, and copy-paste project fields.

## Project rules

- English-only voice agent
- Public name **Wyndham Heaven** — never Mina
- No wallet keys, no arb/KEEP/350 coupling
- Official door: https://iris-35.elghaly.dev/

## Repository layout

```
├── index.html          # Main Iris 35 desk (static)
├── app.js boot.js …    # Desk flows
├── voice/              # Voice agent demo (hackathon entry)
│   ├── index.html
│   ├── voice-agent.js
│   ├── pcm-processor.js
│   └── config.js
├── server/             # AssemblyAI token mint (Node)
│   └── server.js
├── render.yaml         # Render deploy blueprint
└── SUBMISSION.md       # LabLab submit checklist
```
