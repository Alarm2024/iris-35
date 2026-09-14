# LabLab AssemblyAI Voice Agent Hackathon — submission checklist

**Team:** [elghaly-35-voice](https://lablab.ai/ai-hackathons/assemblyai-voice-agent-hackathon/elghaly-35-voice)  
**Hackathon:** [AssemblyAI Voice Agent Hackathon](https://lablab.ai/ai-hackathons/assemblyai-voice-agent-hackathon) (Sep 1–30, 2026)  
**Owner:** Wyndham Heaven / ElGhaly  
**Repo:** https://github.com/Alarm2024/iris-35 (MIT)

## Public URLs

| Asset | URL |
| --- | --- |
| Main desk | https://iris-35.elghaly.dev/ |
| **Voice demo (submit this)** | https://iris-35.elghaly.dev/voice/ |
| Token API (Render) | https://iris-35-voice.onrender.com/health |
| Support | support@elghaly.dev |

## Before you submit on LabLab

- [ ] **Register / join team** at the [team page](https://lablab.ai/ai-hackathons/assemblyai-voice-agent-hackathon/elghaly-35-voice)
- [ ] **Deploy token server** on Render (or your host) with `ASSEMBLYAI_API_KEY` set — see README
- [ ] **Smoke test voice:** open `/voice/`, Start call, confirm Iris greets and responds
- [ ] **Record demo video** (MP4, ≤3 minutes recommended, ≤5 min max per LabLab rules)
- [ ] **Prepare slide deck** (PDF, 16:9 cover image PNG/JPG)
- [ ] **Confirm GitHub repo is public** — Alarm2024/iris-35

## LabLab project fields (copy-paste starters)

**Title:** Iris 35 Morning Light Voice Door

**Short description:** A browser voice desk for Iris 35 — Wyndham Heaven's Morning Light door. Users stay on their own phone; Iris listens via AssemblyAI Voice Agent API (STT + LLM + TTS + turn detection) and guides safe next steps for device security and scam avoidance.

**Long description:** Iris 35 is a free open desk at https://iris-35.elghaly.dev/. This hackathon entry adds a real-time voice agent at `/voice/` powered by AssemblyAI's Voice Agent API over a single WebSocket. A small token server mints ephemeral credentials so the API key never reaches the browser. Iris speaks English only, uses inline agent configuration with desk-specific tools (official door lookup, phone checklist, mail escalation), and follows strict safety rules: no wallet connect, no seed phrases, no taking the user's phone. Built for the elghaly-35-voice team by Wyndham Heaven.

**Technology tags:** AssemblyAI, Voice Agent API, JavaScript, WebSocket, Web Audio API, Node.js, GitHub Pages, Render

**Category:** Voice AI / Security / Consumer

## Demo video script (~2:30)

1. **0:00–0:20** — Show https://iris-35.elghaly.dev/ and the Morning Light brand; click through to Voice Door
2. **0:20–0:45** — Start call; Iris greeting; ask "Is this the real Iris site?"
3. **0:45–1:30** — Ask about unknown device on iPhone; Iris walks through checklist (tool call)
4. **1:30–2:00** — Ask about wallet connect scam; Iris refuses connect, redirects to safe path
5. **2:00–2:30** — Show transcript panel, GitHub repo, token server health, end call cleanly

## AssemblyAI compliance

- Uses **Voice Agent API** (`wss://agents.assemblyai.com/v1/ws`) — managed STT + LLM + TTS path
- Token minted server-side via `GET https://agents.assemblyai.com/v1/token`
- Sessions ended with `session.end` (no 30s billing grace leak)

## Out of scope (per project rules)

- No wallet private keys or connect flows
- No arb / KEEP / 350 product coupling
- No "python 35 as teacher" persona
- Public name **Wyndham Heaven** — never Mina

## Post-submit

- [ ] Paste demo URL + video + slides into LabLab submission form
- [ ] Optional: Devpost if the event lists a Devpost mirror
- [ ] Monitor Render free-tier cold starts (first token fetch may take ~30s)
