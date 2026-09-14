(function () {
  var CFG = window.IRIS_VOICE_CONFIG || {};
  var TOKEN_URL = CFG.tokenUrl || "/api/voice-token";
  var WS_URL = "wss://agents.assemblyai.com/v1/ws";

  var SYSTEM_PROMPT =
    "You are Iris, the Morning Light desk voice door for Iris 35. " +
    "You speak for Wyndham Heaven (ElGhaly). Never use the name Mina. " +
    "English only. Warm, calm, direct — like a trusted desk at morning light.\n\n" +
    "Official door URL: https://iris-35.elghaly.dev/ — only this URL is the office.\n" +
    "Private line: support@elghaly.dev (mail only; first pass is free on the glass).\n\n" +
    "Core rules you teach:\n" +
    "1. LOOK is safe — opening a page is not theft.\n" +
    "2. Typing passwords, sending SMS codes, screen sharing, or connecting a wallet IS the theft.\n" +
    "3. Never ask users to paste seed phrases, private keys, or mnemonics.\n" +
    "4. Never tell users to connect a wallet. Public transaction hashes only if they already signed.\n" +
    "5. Help them check their own phone: unknown devices, MDM profiles, linked WhatsApp, mail forwards.\n" +
    "6. They remove every YES themselves — you never take their phone.\n" +
    "7. Teach one person they love to use the same official URL.\n\n" +
    "Keep replies short for voice (1–3 sentences). Ask one clear question at a time. " +
    "If they need human follow-up, tell them to email support@elghaly.dev with PRIVATE or HUMAN.";

  var GREETING =
    "Good morning. I'm Iris at the Morning Light desk — Wyndham Heaven's voice door. " +
    "You're on your own glass, and that's right. What brought you to the door today?";

  var TOOLS = [
    {
      type: "function",
      name: "official_door",
      description: "Return the official Iris 35 door URL when the user asks if a link is real.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      type: "function",
      name: "phone_checklist",
      description: "Brief checklist for iPhone or Android device security review.",
      parameters: {
        type: "object",
        properties: {
          platform: { type: "string", enum: ["iphone", "android", "either"] },
        },
        required: ["platform"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "escalate_mail",
      description: "Give the private mail line for human follow-up after free desk pass.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  ];

  var state = {
    ws: null,
    audioCtx: null,
    stream: null,
    worklet: null,
    ready: false,
    playbackTime: 0,
    active: false,
    pendingTools: [],
  };

  var ui = {
    startBtn: document.getElementById("start-call"),
    endBtn: document.getElementById("end-call"),
    status: document.getElementById("voice-status"),
    log: document.getElementById("voice-log"),
    pulse: document.getElementById("voice-pulse"),
  };

  function setStatus(text, tone) {
    if (ui.status) ui.status.textContent = text;
    if (ui.pulse) ui.pulse.dataset.tone = tone || "idle";
  }

  function appendLog(role, text) {
    if (!ui.log || !text) return;
    var line = document.createElement("div");
    line.className = "log-line log-" + role;
    line.textContent = (role === "you" ? "You: " : role === "iris" ? "Iris: " : "") + text;
    ui.log.appendChild(line);
    ui.log.scrollTop = ui.log.scrollHeight;
  }

  function clearLog() {
    if (ui.log) ui.log.innerHTML = "";
  }

  function flushToolResults() {
    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
    while (state.pendingTools.length) {
      var call = state.pendingTools.shift();
      var payload = runTool(call.name, call.arguments || {});
      state.ws.send(
        JSON.stringify({
          type: "tool.result",
          call_id: call.call_id,
          result: JSON.stringify(payload),
        })
      );
    }
  }

  function runTool(name, args) {
    if (name === "official_door") {
      return {
        url: CFG.officialDoor || "https://iris-35.elghaly.dev/",
        note: "Only this URL is the office. Lookalike domains or chat links asking for passwords are not us.",
      };
    }
    if (name === "phone_checklist") {
      var p = (args && args.platform) || "either";
      if (p === "iphone") {
        return {
          steps: [
            "Settings → your name → Devices: remove anything you do not own.",
            "Settings → General → VPN & Device Management: remove unknown profiles.",
            "WhatsApp → Linked devices: sign out strangers.",
            "Do not install cleaner apps or share your screen.",
          ],
        };
      }
      if (p === "android") {
        return {
          steps: [
            "Google account → Security → Your devices: remove unknown devices.",
            "Settings → Security → Device admin apps: revoke unknown admins.",
            "Settings → Accessibility: turn off unknown services.",
            "Do not install APKs from strangers.",
          ],
        };
      }
      return { note: "Ask whether they use iPhone or Android, then run the matching checklist." };
    }
    if (name === "escalate_mail") {
      return {
        email: CFG.supportEmail || "support@elghaly.dev",
        subject_hint: "PRIVATE or HUMAN",
        note: "First pass is free on the glass. Extra only after work they asked for.",
      };
    }
    return { error: "Unknown tool" };
  }

  function b64FromBuffer(buf) {
    var bytes = new Uint8Array(buf);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function schedulePlayback(msg) {
    var raw = atob(msg.data || msg.audio || "");
    var pcm16 = new Int16Array(raw.length / 2);
    for (var i = 0; i < pcm16.length; i++) {
      pcm16[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8);
    }
    var float32 = new Float32Array(pcm16.length);
    for (var j = 0; j < pcm16.length; j++) float32[j] = pcm16[j] / 32768;
    var buffer = state.audioCtx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    var src = state.audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(state.audioCtx.destination);
    var now = state.audioCtx.currentTime;
    state.playbackTime = Math.max(state.playbackTime, now);
    src.start(state.playbackTime);
    state.playbackTime += buffer.duration;
  }

  function handleMessage(event) {
    var msg;
    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      return;
    }

    if (msg.type === "session.ready") {
      state.ready = true;
      setStatus("Listening — speak naturally", "live");
      appendLog("sys", "Session ready.");
    } else if (msg.type === "transcript.user" && msg.text) {
      appendLog("you", msg.text);
    } else if (msg.type === "transcript.agent" && msg.text) {
      appendLog("iris", msg.text);
    } else if (msg.type === "reply.audio") {
      schedulePlayback(msg);
    } else if (msg.type === "tool.call") {
      state.pendingTools.push(msg);
    } else if (msg.type === "reply.done") {
      if (msg.status === "interrupted") {
        state.playbackTime = state.audioCtx.currentTime;
      }
      flushToolResults();
    } else if (msg.type === "session.error" || msg.type === "error") {
      setStatus(msg.message || "Session error", "error");
      appendLog("sys", msg.message || JSON.stringify(msg));
    } else if (msg.type === "session.ended") {
      cleanup(false);
    }
  }

  function cleanup(userInitiated) {
    state.ready = false;
    state.active = false;
    if (state.ws) {
      try {
        if (state.ws.readyState === WebSocket.OPEN) state.ws.close();
      } catch (e) {}
      state.ws = null;
    }
    if (state.stream) {
      state.stream.getTracks().forEach(function (t) {
        t.stop();
      });
      state.stream = null;
    }
    if (state.audioCtx) {
      state.audioCtx.close().catch(function () {});
      state.audioCtx = null;
    }
    state.worklet = null;
    if (ui.startBtn) ui.startBtn.disabled = false;
    if (ui.endBtn) ui.endBtn.disabled = true;
    setStatus(userInitiated ? "Call ended" : "Disconnected", "idle");
  }

  function endCall() {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type: "session.end" }));
    } else {
      cleanup(true);
    }
  }

  async function startCall() {
    if (state.active) return;
    clearLog();
    setStatus("Connecting…", "busy");
    if (ui.startBtn) ui.startBtn.disabled = true;
    if (ui.endBtn) ui.endBtn.disabled = false;
    state.active = true;

    try {
      var tokenRes = await fetch(TOKEN_URL);
      var tokenBody = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error(tokenBody.error || tokenBody.detail || "Could not fetch voice token");
      }

      state.audioCtx = new AudioContext();
      await state.audioCtx.resume();
      await state.audioCtx.audioWorklet.addModule("pcm-processor.js");
      state.worklet = new AudioWorkletNode(state.audioCtx, "pcm-processor", {
        processorOptions: {
          inputSampleRate: state.audioCtx.sampleRate,
          targetSampleRate: 24000,
        },
      });

      state.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false },
      });
      var source = state.audioCtx.createMediaStreamSource(state.stream);
      source.connect(state.worklet).connect(state.audioCtx.destination);

      state.playbackTime = state.audioCtx.currentTime;
      state.worklet.port.onmessage = function (e) {
        if (state.ready && state.ws && state.ws.readyState === WebSocket.OPEN) {
          state.ws.send(
            JSON.stringify({ type: "input.audio", audio: b64FromBuffer(e.data) })
          );
        }
      };

      var wsUrl = new URL(WS_URL);
      wsUrl.searchParams.set("token", tokenBody.token);
      state.ws = new WebSocket(wsUrl);
      state.ws.addEventListener("open", function () {
        state.ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              system_prompt: SYSTEM_PROMPT,
              greeting: GREETING,
              tools: TOOLS,
              input: { voice_focus: true },
              output: { voice: "ivy" },
            },
          })
        );
      });
      state.ws.addEventListener("message", handleMessage);
      state.ws.addEventListener("close", function () {
        if (state.active) cleanup(false);
      });
      state.ws.addEventListener("error", function () {
        setStatus("WebSocket error — check token server", "error");
      });
    } catch (err) {
      setStatus(err.message || String(err), "error");
      appendLog("sys", err.message || String(err));
      cleanup(false);
    }
  }

  async function checkHealth() {
    var url = CFG.healthUrl;
    if (!url) return;
    try {
      var res = await fetch(url);
      var data = await res.json();
      if (!data.assemblyai_configured) {
        appendLog(
          "sys",
          "Token server is up but ASSEMBLYAI_API_KEY is not set yet. Deploy the server with your key."
        );
      }
    } catch (e) {
      appendLog("sys", "Token server not reachable yet. Deploy server/ to Render first.");
    }
  }

  if (ui.startBtn) ui.startBtn.addEventListener("click", startCall);
  if (ui.endBtn) {
    ui.endBtn.disabled = true;
    ui.endBtn.addEventListener("click", endCall);
  }
  window.addEventListener("pagehide", function () {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type: "session.end" }));
    }
  });

  checkHealth();
})();
