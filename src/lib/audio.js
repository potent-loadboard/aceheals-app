// AceHeals audio engine — everything synthesized with Web Audio API.
// No audio files needed: calming frequencies (pure tones), sleep sounds
// (filtered noise), and beat-maker drums (synthesized kick/snare/hat).
let ctx = null;
let current = null; // { nodes:[], stop() }

// Check global audio settings
function audioAllowed(type = 'effects') {
  try {
    const s = JSON.parse(localStorage.getItem('aceheals:audioSettings') || '{}');
    if (s.master === false) return false;
    if (type === 'effects' && s.effects === false) return false;
    if (s.mode === 'library') return false;
    return true;
  } catch { return true; }
}

function getVolume() {
  try {
    const s = JSON.parse(localStorage.getItem('aceheals:audioSettings') || '{}');
    let v = typeof s.volume === 'number' ? s.volume : 0.8;
    if (s.mode === 'quiet') v *= 0.4; // quiet mode = softer
    return v;
  } catch { return 0.8; }
}

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function stopAudio() {
  try {
    if (current) { current.stop(); current = null; }
  } catch {}
}

function register(nodes, stopFn) {
  stopAudio();
  current = { nodes, stop: stopFn };
}

// --- Calming frequencies: pure sine tones (396/432/528/741 Hz) ---
export function playFrequency(hz) {
  if (!audioAllowed('effects')) return;
  const c = ac();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = hz;
  gain.gain.value = getVolume();
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, c.currentTime + 2);
  osc.connect(gain).connect(c.destination);
  osc.start();
  register([osc, gain], () => {
    try {
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1);
      setTimeout(() => { try { osc.stop(); } catch {} }, 1100);
    } catch {}
  });
}

// --- Sleep / calming sounds: shaped noise ---
function noiseBuffer(c, seconds = 3) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// kind: rain | ocean | whitenoise | fan | thunderstorm | heartbeat | nature
export function playAmbience(kind, { mixWith = null } = {}) {
  if (!audioAllowed('effects')) return;
  const c = ac();
  const nodes = [];
  const master = c.createGain();
  master.gain.value = 0.0;
  master.connect(c.destination);
  master.gain.linearRampToValueAtTime(0.5, c.currentTime + 2);
  nodes.push(master);

  const addNoise = (filterType, freq, q, gainVal) => {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = gainVal;
    src.connect(f).connect(g).connect(master);
    src.start();
    nodes.push(src, f, g);
  };

  switch (kind) {
    case 'rain': addNoise('bandpass', 2500, 0.6, 0.5); addNoise('highpass', 5000, 0.7, 0.18); break;
    case 'ocean': {
      addNoise('lowpass', 500, 0.5, 0.7);
      const lfo = c.createOscillator(); lfo.frequency.value = 0.12;
      const lg = c.createGain(); lg.gain.value = 0.25;
      lfo.connect(lg).connect(master.gain); lfo.start(); nodes.push(lfo, lg);
      break;
    }
    case 'whitenoise': addNoise('highpass', 800, 0.5, 0.28); break;
    case 'fan': addNoise('lowpass', 300, 0.8, 0.55); break;
    case 'thunderstorm':
      addNoise('bandpass', 2500, 0.6, 0.4);
      addNoise('lowpass', 120, 0.6, 0.9);
      break;
    case 'heartbeat': {
      const beat = () => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 55;
        const g = c.createGain();
        g.gain.setValueAtTime(0.9, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.28);
        o.connect(g).connect(master); o.start(); o.stop(c.currentTime + 0.3);
        setTimeout(beat, 950);
      };
      beat._timer = setInterval(beat, 950); beat();
      nodes.push({ _timer: beat._timer });
      break;
    }
    case 'nature':
      addNoise('bandpass', 3500, 2, 0.25);
      addNoise('lowpass', 400, 0.5, 0.3);
      break;
    default: addNoise('lowpass', 600, 0.5, 0.5);
  }

  register(nodes, () => {
    try {
      master.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.8);
      setTimeout(() => nodes.forEach((n) => {
        try { n.stop ? n.stop() : null; } catch {}
        try { n._timer && clearInterval(n._timer); } catch {}
        try { n.disconnect(); } catch {}
      }), 900);
    } catch {}
  });
}

// --- Beat maker drums (synthesized) ---
export function drum(type, when = 0) {
  if (!audioAllowed('effects')) return;
  const c = ac();
  const t = c.currentTime + when;
  if (type === 'kick') {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.3);
  } else if (type === 'snare') {
    const s = c.createBufferSource(); s.buffer = noiseBuffer(c, 0.3);
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800;
    const g = c.createGain();
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  } else if (type === 'hat') {
    const s = c.createBufferSource(); s.buffer = noiseBuffer(c, 0.2);
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = c.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  } else if (type === 'clap') {
    [0, 0.02, 0.04].forEach((d) => {
      const s = c.createBufferSource(); s.buffer = noiseBuffer(c, 0.2);
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.5;
      const g = c.createGain();
      g.gain.setValueAtTime(0.5, t + d);
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.12);
      s.connect(f).connect(g).connect(c.destination); s.start(t + d);
    });
  }
}

// Kit styles shift the drum character slightly
export const KITS = {
  'hip hop': { kick: 'kick', snare: 'snare', hat: 'hat', extra: 'clap' },
  'trap': { kick: 'kick', snare: 'snare', hat: 'hat', extra: 'hat' },
  'boom bap': { kick: 'kick', snare: 'snare', hat: 'hat', extra: 'clap' },
  'chill': { kick: 'kick', snare: 'snare', hat: 'hat', extra: 'snare' },
};

// Export a recorded beat (array of {type, t}) as a downloadable WAV file
export async function exportBeatToWav(events, filename = 'my-beat') {
  if (!events.length) return;
  const duration = Math.max(...events.map((e) => e.t)) / 1000 + 1; // seconds + tail
  const sr = 44100;
  const ctx = new OfflineAudioContext(2, Math.ceil(sr * duration), sr);

  const noiseBuf = (dur) => {
    const b = ctx.createBuffer(1, Math.ceil(sr * dur), sr);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };

  const schedule = (type, t) => {
    if (type === 'kick') {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.3);
    } else if (type === 'snare') {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf(0.3);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      s.connect(f).connect(g).connect(ctx.destination); s.start(t);
    } else if (type === 'hat') {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf(0.2);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      s.connect(f).connect(g).connect(ctx.destination); s.start(t);
    } else if (type === 'clap') {
      [0, 0.02, 0.04].forEach((d) => {
        const s = ctx.createBufferSource(); s.buffer = noiseBuf(0.2);
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, t + d);
        g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.12);
        s.connect(f).connect(g).connect(ctx.destination); s.start(t + d);
      });
    }
  };

  events.forEach(({ type, t }) => schedule(type, t / 1000));
  const buf = await ctx.startRendering();

  // Encode to WAV
  const wav = audioBufferToWav(buf);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.wav`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const len = buffer.length * numCh * 2 + 44;
  const ab = new ArrayBuffer(len);
  const v = new DataView(ab);
  const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF'); v.setUint32(4, len - 8, true); writeStr(8, 'WAVE');
  writeStr(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * numCh * 2, true); v.setUint16(32, numCh * 2, true); v.setUint16(34, 16, true);
  writeStr(36, 'data'); v.setUint32(40, len - 44, true);
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
  }
  return ab;
}
