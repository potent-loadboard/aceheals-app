import React, { useState, useRef, useEffect } from 'react';
import { Card, Btn, SectionHead, Paywall, Loading, Empty, Footer, PBar, Modal } from '../components/ui.jsx';
import { useStored, toast } from '../lib/store.js';
import { hasAccess, scansToday, bumpScans, TRIAL_LIMITS } from '../lib/paywall.js';
import { SWAPS, PROTOCOL_PHASES, PROTOCOLS_RESEARCHED, ROADMAP } from '../data/content.js';
import { DISCLAIMER, DOCTOR_FIRST } from '../lib/disclaimer.js';

// ---------- Clean Score logic (per spec) ----------
const DYES = ['red 40', 'yellow 5', 'yellow 6', 'blue 1', 'blue 2', 'green 3', 'e102', 'e110', 'e129', 'e133'];
function cleanScore(ingredientsText = '') {
  const t = ingredientsText.toLowerCase();
  let score = 100;
  const flags = [];
  if (/\b(wheat|gluten|barley|rye)\b/.test(t)) { score -= 25; flags.push('Gluten'); }
  if (/\b(milk|cream|casein|whey|lactose)\b/.test(t)) { score -= 20; flags.push('Dairy'); }
  if (DYES.some((d) => t.includes(d))) { score -= 20; flags.push('Artificial Dyes'); }
  if (t.includes('high fructose corn syrup') || t.includes('hfcs')) { score -= 15; flags.push('HFCS'); }
  const count = t.split(',').length;
  if (count > 15) { score -= 10; flags.push('Ultra-processed'); }
  if (/\b(gmo|genetically modified)\b/.test(t)) { flags.push('GMO Risk'); }
  return { score: Math.max(5, score), flags };
}
function scoreColor(s) { return s >= 80 ? '#2ECC71' : s >= 55 ? '#F1C40F' : '#e74c3c'; }

// ---------- Red Light scanner flags (per spec) ----------
const RED_FLAGS = [
  { re: /paraben/i, label: 'Parabens' },
  { re: /phthalate/i, label: 'Phthalates' },
  { re: /(triclosan|sodium lauryl sulfate|sls\b)/i, label: 'Harsh surfactants' },
  { re: /(fragrance|parfum)(?!.*essential)/i, label: 'Synthetic fragrance' },
  { re: /(bha|bht|propylparaben|sodium benzoate)/i, label: 'Preservatives' },
  { re: /(formaldehyde|dmdm hydantoin)/i, label: 'Formaldehyde releasers' },
  { re: /(oxybenzone|octinoxate)/i, label: 'Chemical UV filters' },
  { re: /(glyphosate|pesticide)/i, label: 'Pesticide residue risk' },
  { re: /(lead|mercury|cadmium)/i, label: 'Heavy metals' },
];

async function lookupBarcode(code) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
  if (!res.ok) throw new Error('Network hiccup');
  const j = await res.json();
  if (j.status !== 1) throw new Error('Not found');
  return j.product;
}

function Scanner({ mode }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useStored('scanHistory', []);
  const videoRef = useRef(null);
  const [camOn, setCamOn] = useState(false);

  const paid = hasAccess();
  const scans = scansToday();
  const limitHit = !paid && scans >= TRIAL_LIMITS.scanner.scansPerDay;

  const doLookup = async (c) => {
    const bc = (c || code).trim();
    if (!bc) { toast('📷 Type or scan a barcode first'); return; }
    if (limitHit) { toast('🔒 Trial scan limit reached (3/day)'); return; }
    setBusy(true); setResult(null);
    try {
      const p = await lookupBarcode(bc);
      const ing = p.ingredients_text || '';
      const { score, flags } = cleanScore(ing);
      const red = RED_FLAGS.filter((f) => f.re.test(ing)).map((f) => f.label);
      const r = {
        code: bc, name: p.product_name || 'Unknown product', brand: p.brands || '',
        ingredients: ing, score, flags, red,
        category: p.categories || '', time: new Date().toISOString(),
      };
      setResult(r);
      setHistory((h) => [r, ...h].slice(0, 30));
      bumpScans();
    } catch (e) {
      toast('🔍 ' + (e.message === 'Not found' ? 'Product not found — try another barcode' : 'Could not reach the food database. Check connection.'));
    } finally { setBusy(false); }
  };

  const startCam = async () => {
    try {
      if (!('BarcodeDetector' in window)) { toast('📷 This browser can\'t scan — type the barcode instead 💛'); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCamOn(true);
      const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
      const tick = async () => {
        if (!videoRef.current || videoRef.current.paused) return;
        try {
          const codes = await det.detect(videoRef.current);
          if (codes.length) { stopCam(); setCode(codes[0].rawValue); doLookup(codes[0].rawValue); return; }
        } catch {}
        requestAnimationFrame(tick);
      };
      tick();
    } catch {
      toast('📷 Camera blocked — allow camera access or type the barcode 💛');
    }
  };
  const stopCam = () => {
    try { videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop()); } catch {}
    setCamOn(false);
  };
  useEffect(() => () => stopCam(), []);

  const verdict = result && (mode === 'red'
    ? { pass: result.red.length === 0 && result.score >= 55, label: result.red.length === 0 && result.score >= 55 ? '🟢 GREEN LIGHT' : '🔴 RED LIGHT' }
    : null);

  return (
    <div>
      {!paid && <div className="pill" style={{ marginBottom: 8 }}>🎁 Trial: {Math.max(0, 3 - scans)} scans left today</div>}
      <Card>
        <div className="row">
          <input className="input-gloss" placeholder="Type barcode…" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" />
          <Btn onClick={() => doLookup()} disabled={busy}>{busy ? '…' : '🔍'}</Btn>
        </div>
        <div style={{ marginTop: 10 }}>
          {!camOn
            ? <Btn color="blue" block onClick={startCam}>📷 Scan with Camera</Btn>
            : <Btn color="red" block onClick={stopCam}>Stop Camera</Btn>}
        </div>
        <video ref={videoRef} style={{ display: camOn ? 'block' : 'none', width: '100%', borderRadius: 12, marginTop: 10 }} playsInline muted />
        <div style={{ fontSize: 12, color: '#8a7f9e', marginTop: 8 }}>
          We use the Open Food Facts database. Scores reflect one family's ingredient preferences — not medical advice.
        </div>
      </Card>

      {busy && <Loading label="Looking up product…" />}
      {result && mode === 'food' && (
        <Card style={{ marginTop: 12 }}>
          <b style={{ fontSize: 17 }}>{result.name}</b>
          <div style={{ fontSize: 13, color: '#8a7f9e' }}>{result.brand}</div>
          <div className="row" style={{ margin: '12px 0', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#8a7f9e' }}>Clean Score</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: scoreColor(result.score) }}>{result.score}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <PBar pct={result.score} color={scoreColor(result.score)} />
              <div style={{ fontSize: 12, marginTop: 4 }}>{result.score >= 80 ? 'Looking good 💚' : result.score >= 55 ? 'Okay-ish 💛' : 'Caution ❤️'}</div>
            </div>
          </div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {result.flags.map((f) => <span key={f} className="pill red">{f}</span>)}
            {result.flags.length === 0 && <span className="pill green">No flags 🎉</span>}
          </div>
          {result.score < 70 && (
            <div style={{ marginTop: 12 }}>
              <b>💡 Cleaner swaps our family likes:</b>
              {(SWAPS[result.category.includes('snack') ? 'snack' : 'default']).map((s) => <div key={s} style={{ fontSize: 14, marginTop: 4 }}>• {s}</div>)}
            </div>
          )}
          <div style={{ marginTop: 10 }}><Btn color="cream" size="sm" onClick={() => { setResult(null); setCode(''); }}>Scan Another 🔄</Btn></div>
        </Card>
      )}
      {result && mode === 'red' && (
        <Card style={{ marginTop: 12, borderColor: verdict.pass ? '#2ECC71' : '#e74c3c' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: verdict.pass ? '#2ECC71' : '#e74c3c', textAlign: 'center', marginBottom: 8 }}>{verdict.label}</div>
          <b>{result.name}</b>
          <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 8 }}>{result.brand}</div>
          {result.red.length > 0 ? (
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{result.red.map((f) => <span key={f} className="pill red">⚠️ {f}</span>)}</div>
          ) : <div className="pill green">No red-flag ingredients found 🎉</div>}
          <div style={{ fontSize: 13, marginTop: 10, background: '#fff8ec', padding: 10, borderRadius: 10 }}>
            💛 <b>Why this matters for our family:</b> we try to keep harsh chemicals out of our home where we can. This is our family's preference — not medical advice.
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <Btn color="cream" size="sm" onClick={() => { setResult(null); setCode(''); }}>Scan Another 🔄</Btn>
            <Btn color="blue" size="sm" onClick={() => {
              const txt = `${verdict.label}: ${result.name} — Flags: ${result.red.join(', ') || 'none'}`;
              navigator.clipboard?.writeText(txt).then(() => toast('📋 Result copied!'));
            }}>Share 📤</Btn>
          </div>
        </Card>
      )}
      {history.length > 0 && (
        <>
          <SectionHead title="🕘 Scan History" />
          {history.slice(0, 8).map((h, i) => (
            <div key={i} className="check-item" onClick={() => setResult(h)}>
              <div style={{ fontSize: 24, fontWeight: 900, color: scoreColor(h.score) }}>{h.score}</div>
              <div style={{ flex: 1 }}><b>{h.name}</b><div style={{ fontSize: 12, color: '#8a7f9e' }}>{h.code}</div></div>
              <div>›</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ---------- Moon phase (simple algorithm) ----------
function moonPhase(date = new Date()) {
  const synodic = 29.53058867;
  const known = Date.UTC(2000, 0, 6, 18, 14) / 864e5;
  const days = date.getTime() / 864e5 - known;
  const age = ((days % synodic) + synodic) % synodic;
  const idx = Math.floor((age / synodic) * 8) % 8;
  return ['🌑 New Moon', '🌒 Waxing Crescent', '🌓 First Quarter', '🌔 Waxing Gibbous', '🌕 Full Moon', '🌖 Waning Gibbous', '🌗 Last Quarter', '🌘 Waning Crescent'][idx];
}

function ProtocolTracker() {
  const [tab, setTab] = useState('tracker');
  const [checks, setChecks] = useStored('protocolChecks', {});
  const [notes, setNotes] = useStored('protocolNotes', '');
  const [symptoms, setSymptoms] = useStored('symptomLog', []); // {date, energy, mood, digestion, behavior}
  const [draft, setDraft] = useState({ energy: 3, mood: 3, digestion: 3, behavior: 3 });

  const toggle = (pid, si) => {
    const k = pid + ':' + si;
    setChecks((c) => ({ ...c, [k]: !c[k] }));
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    const rows = symptoms.map((s) => `<tr><td>${s.date}</td><td>${s.energy}</td><td>${s.mood}</td><td>${s.digestion}</td><td>${s.behavior}</td></tr>`).join('');
    w.document.write(`<html><head><title>AceHeals Notes for Doctor Visit</title></head><body style="font-family:sans-serif;padding:24px">
      <h1>Notes for our doctor visit</h1><p><i>${DISCLAIMER}</i></p>
      <h2>Weekly symptom log</h2><table border="1" cellpadding="6"><tr><th>Date</th><th>Energy</th><th>Mood</th><th>Digestion</th><th>Behavior</th></tr>${rows}</table>
      <h2>Notes</h2><p>${notes.replace(/\n/g, '<br/>')}</p>
      <p><button onclick="window.print()">Print / Save as PDF</button></p></body></html>`);
    w.document.close();
  };

  return (
    <div>
      <Card style={{ background: 'linear-gradient(180deg,#fff8ec,#ffefd6)', borderColor: '#f0d9a8' }}>
        <b>🩺 {DOCTOR_FIRST}</b>
        <div style={{ fontSize: 13, marginTop: 6 }}>
          This section shares <b>what many families try</b> — it is one family's experience, never medical advice.
          {PROTOCOLS_RESEARCHED.length > 0 && (
            <div style={{ marginTop: 6 }}>Protocols families research: {PROTOCOLS_RESEARCHED.map((p) => <span key={p} className="pill" style={{ marginRight: 4 }}>{p}</span>)}</div>
          )}
        </div>
      </Card>

      <div className="row" style={{ margin: '12px 0', gap: 6 }}>
        {[['tracker', '📋 Tracker'], ['moon', '🌙 Moon'], ['symptoms', '📊 Symptoms']].map(([id, label]) => (
          <Btn key={id} size="sm" color={tab === id ? 'orange' : 'cream'} onClick={() => setTab(id)}>{label}</Btn>
        ))}
      </div>

      {tab === 'tracker' && PROTOCOL_PHASES.map((p) => (
        <Card key={p.id} style={{ marginBottom: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <b style={{ color: '#1A1040' }}>{p.name}</b><span className="pill">{p.weeks}</span>
          </div>
          <div className="pill" style={{ margin: '6px 0', fontSize: 11 }}>🩺 ask your doctor first</div>
          {p.steps.map((s, i) => {
            const k = p.id + ':' + i;
            return (
              <div key={i} className={`check-item${checks[k] ? ' done' : ''}`} onClick={() => toggle(p.id, i)}>
                <div className="check-box">{checks[k] ? '✓' : ''}</div>
                <div style={{ fontSize: 14 }}>{s}</div>
              </div>
            );
          })}
        </Card>
      ))}

      {tab === 'tracker' && (
        <Card style={{ marginTop: 4 }}>
          <b>📝 Notes — changes we notice</b>
          <textarea className="input-gloss" style={{ marginTop: 8 }} value={notes}
            onChange={(e) => setNotes(e.target.value)} placeholder="Sleep, mood, appetite, anything…" />
          <div style={{ marginTop: 8 }}><Btn color="blue" size="sm" onClick={exportPDF}>📄 Export for Doctor (PDF)</Btn></div>
        </Card>
      )}

      {tab === 'moon' && (
        <Card>
          <b>🌙 Moon Phase Calendar</b>
          <div style={{ fontSize: 13, color: '#8a7f9e', margin: '6px 0' }}>Many families track rhythms by moon cycle — here's tonight's sky.</div>
          <div style={{ fontSize: 44, textAlign: 'center', margin: '12px 0' }}>{moonPhase().split(' ')[0]}</div>
          <div style={{ textAlign: 'center', fontWeight: 800 }}>{moonPhase()}</div>
          <div className="grid2" style={{ marginTop: 12 }}>
            {[...Array(14)].map((_, i) => {
              const d = new Date(Date.now() + (i - 7) * 864e5);
              const isToday = i === 7;
              return (
                <div key={i} className="stat-gloss" style={isToday ? { borderColor: '#FF6B35', borderWidth: 2 } : {}}>
                  <div style={{ fontSize: 11, color: '#8a7f9e' }}>{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{isToday ? ' • today' : ''}</div>
                  <div style={{ fontSize: 26 }}>{moonPhase(d).split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === 'symptoms' && (
        <Card>
          <b>📊 Weekly Symptom Log</b>
          <div style={{ fontSize: 13, color: '#8a7f9e', margin: '6px 0' }}>Rate 1–5. Just observations — share with your care team.</div>
          {[['energy', '⚡ Energy'], ['mood', '😊 Mood'], ['digestion', '🫄 Digestion'], ['behavior', '🧠 Behavior']].map(([k, label]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', margin: '10px 0' }}>
              <span>{label}</span>
              <div className="row" style={{ gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setDraft((d) => ({ ...d, [k]: n }))}
                    style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', fontWeight: 800,
                      background: draft[k] >= n ? 'linear-gradient(180deg,#8fe6b3,#2ECC71)' : 'linear-gradient(180deg,#e8ddcf,#cfc0a8)',
                      color: '#fff' }}>{n}</button>
                ))}
              </div>
            </div>
          ))}
          <Btn block onClick={() => {
            setSymptoms((s) => [...s, { date: new Date().toISOString().slice(0, 10), ...draft }]);
            toast('📊 Logged for today 💛');
          }}>Log Today</Btn>
          {symptoms.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {symptoms.slice(-7).reverse().map((s, i) => (
                <div key={i} className="row" style={{ justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #f0e2cf' }}>
                  <b>{s.date}</b>
                  <span>⚡{s.energy} 😊{s.mood} 🫄{s.digestion} 🧠{s.behavior}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function Roadmap() {
  const [checks, setChecks] = useStored('roadmapChecks', {});
  return (
    <div>
      {ROADMAP.map((p, pi) => (
        <div key={p.id} className="row" style={{ alignItems: 'stretch', gap: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: p.status === 'locked' ? 'linear-gradient(180deg,#cfc0a8,#a89478)' : `linear-gradient(180deg, ${p.color}, ${p.color}cc)`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 3px 8px rgba(0,0,0,.15)' }}>
              {p.status === 'locked' ? '🔒' : pi + 1}
            </div>
            {pi < ROADMAP.length - 1 && <div style={{ width: 3, flex: 1, background: '#f0e2cf', borderRadius: 2 }} />}
          </div>
          <Card style={{ flex: 1, marginBottom: 12, opacity: p.status === 'locked' ? 0.75 : 1 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <b style={{ color: '#1A1040' }}>Phase {pi + 1}: {p.name}</b>
              <span className="pill">{p.weeks}</span>
            </div>
            <div style={{ margin: '4px 0 8px' }}>
              <span className={`pill ${p.status === 'active' ? 'green' : p.status === 'upcoming' ? 'yellow' : ''}`}>
                {p.status === 'active' ? '● ACTIVE' : p.status === 'upcoming' ? '○ UPCOMING' : '🔒 LOCKED'}
              </span>
            </div>
            {p.steps.map((s, i) => {
              const k = p.id + ':' + i;
              const dis = p.status !== 'active';
              return (
                <div key={i} className={`check-item${checks[k] ? ' done' : ''}`}
                  style={dis ? { opacity: 0.6, cursor: 'default' } : {}}
                  onClick={() => !dis && setChecks((c) => ({ ...c, [k]: !c[k] }))}>
                  <div className="check-box">{checks[k] ? '✓' : ''}</div>
                  <div style={{ fontSize: 14 }}>{s}</div>
                </div>
              );
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}

export default function Heal({ onDisclaimer }) {
  const [sec, setSec] = useState('scan');
  const paid = hasAccess();
  const scanLocked = !paid && false; // scanner has trial limits, not hard paywall

  return (
    <div className="screen">
      <SectionHead title="🌿 Heal" />
      <div className="row" style={{ marginBottom: 12, gap: 6, overflowX: 'auto' }}>
        {[['scan', '🔍 Food Scanner'], ['red', '🔴 Red Light'], ['protocol', '🪱 Protocol'], ['roadmap', '🗺️ Roadmap']].map(([id, label]) => (
          <Btn key={id} size="sm" color={sec === id ? 'orange' : 'cream'} onClick={() => setSec(id)} style={{ whiteSpace: 'nowrap' }}>{label}</Btn>
        ))}
      </div>

      {sec === 'scan' && <Scanner mode="food" />}
      {sec === 'red' && <Scanner mode="red" />}
      {sec === 'protocol' && <ProtocolTracker />}
      {sec === 'roadmap' && <Roadmap />}

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}
