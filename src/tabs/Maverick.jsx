import React, { useState, useEffect, useRef } from 'react';
import { Card, Btn, SectionHead, Paywall, Loading, Empty, Footer, PBar, Modal } from '../components/ui.jsx';
import { useStored, toast, speak, stopSpeak, buzz } from '../lib/store.js';
import { hasAccess, TRIAL_LIMITS } from '../lib/paywall.js';
import { AAC_CATEGORIES, READING_CARDS } from '../data/aac.js';
import { SOCIAL_STORIES } from '../data/content.js';
import { HIP_HOP_SESSIONS } from '../data/content.js';
import { CALM_SOUNDS, SLEEP_SOUNDS } from '../data/content.js';
import { playAmbience, stopAudio, drum, KITS, exportBeatToWav } from '../lib/audio.js';
import { DISCLAIMER } from '../lib/disclaimer.js';
import ASL from '../components/ASL.jsx';
import StickerWorld from '../components/StickerWorld.jsx';
import CharacterCreator from '../components/CharacterCreator.jsx';
import RoutineBuilder from '../components/RoutineBuilder.jsx';
import { Mascot } from '../components/Mascot.jsx';

// ================= AAC BOARD =================
function AACBoard({ largeMode, highContrast }) {
  const [cat, setCat] = useState(AAC_CATEGORIES[0].id);
  const [strip, setStrip] = useState([]);
  const [favs, setFavs] = useStored('aacFavs', []);
  const [recent, setRecent] = useStored('aacRecent', []);
  const [custom, setCustom] = useStored('aacCustom', []);
  const [savedPhrases, setSavedPhrases] = useStored('aacPhrases', []);
  const [showPhrases, setShowPhrases] = useState(false);
  const [newWord, setNewWord] = useState({ emoji: '⭐', label: '' });
  const paid = hasAccess();
  const visibleCats = paid ? AAC_CATEGORIES : AAC_CATEGORIES.slice(0, TRIAL_LIMITS.aac.categories);

  const tap = (label) => {
    speak(label);
    buzz([40]);
    setStrip((s) => [...s, label].slice(-5));
    setRecent((r) => [label, ...r.filter((x) => x !== label)].slice(0, 12));
  };

  const category = AAC_CATEGORIES.find((c) => c.id === cat);
  const words = [...(category.id === 'custom' ? custom : category.words)];

  return (
    <div style={{ position: 'relative' }}>
      {!paid && <Paywall feature="Full AAC Board" />}
      <div className="row" style={{ overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
        {visibleCats.map((c) => (
          <Btn key={c.id} size="sm" color={cat === c.id ? 'orange' : 'cream'}
            onClick={() => setCat(c.id)} style={{ whiteSpace: 'nowrap' }}>{c.name}</Btn>
        ))}
        <Btn size="sm" color={cat === 'custom' ? 'orange' : 'cream'} onClick={() => setCat('custom')} style={{ whiteSpace: 'nowrap' }}>⭐ Mine</Btn>
        <Btn size="sm" color={cat === 'read' ? 'orange' : 'cream'} onClick={() => setCat('read')} style={{ whiteSpace: 'nowrap' }}>📖 Reading</Btn>
      </div>

      {/* Sentence strip */}
      <Card style={{ marginBottom: 10, background: 'linear-gradient(180deg,#f4ecff,#e9dcf9)' }}>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6, minHeight: 40 }}>
          {strip.length === 0 && <span style={{ color: '#8a7f9e', fontSize: 14 }}>Tap words to build a sentence…</span>}
          {strip.map((w, i) => <span key={i} className="pill purple">{w}</span>)}
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <Btn size="sm" color="green" onClick={() => strip.length && speak(strip.join('. '))}>🔊 Speak All</Btn>
          <Btn size="sm" color="cream" onClick={() => setStrip([])}>Clear</Btn>
          <Btn size="sm" color="blue" onClick={() => setShowPhrases(true)}>💾 Phrases</Btn>
        </div>
      </Card>

      {cat === 'read' ? (
        <div className="grid2">
          {READING_CARDS.map((p) => (
            <button key={p} className="aac-word" onClick={() => tap(p)} style={{ padding: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1040' }}>{p}</div>
              <div style={{ fontSize: 12, color: '#8a7f9e' }}>tap to hear 🔊</div>
            </button>
          ))}
        </div>
      ) : cat === 'custom' ? (
        <div>
          <Card style={{ marginBottom: 10 }}>
            <b>Add your own word</b>
            <div className="row" style={{ marginTop: 8 }}>
              <input className="input-gloss" style={{ maxWidth: 90 }} value={newWord.emoji}
                onChange={(e) => setNewWord({ ...newWord, emoji: e.target.value })} placeholder="😊" />
              <input className="input-gloss" value={newWord.label}
                onChange={(e) => setNewWord({ ...newWord, label: e.target.value })} placeholder="Word label" />
              <Btn size="sm" onClick={() => {
                if (!newWord.label.trim()) return;
                setCustom((c) => [...c, [newWord.emoji || '⭐', newWord.label.trim()]]);
                setNewWord({ emoji: '⭐', label: '' });
                toast('⭐ Word added!');
              }}>Add</Btn>
            </div>
          </Card>
          <div className="grid3">
            {custom.map(([e, w], i) => (
              <button key={i} className="aac-word" onClick={() => tap(w)}>
                <div className="emoji" style={largeMode ? { fontSize: 52 } : {}}>{e}</div>
                <div className="wlabel">{w}</div>
              </button>
            ))}
          </div>
          {custom.length === 0 && <Empty emoji="⭐" title="No custom words yet" sub="Add words your family uses every day." />}
        </div>
      ) : (
        <div className="grid3" style={largeMode ? { gridTemplateColumns: '1fr 1fr' } : {}}>
          {favs.filter((f) => words.some((w) => w[1] === f)).map((f) => {
            const w = words.find((x) => x[1] === f);
            return (
              <button key={'f' + f} className="aac-word" onClick={() => tap(f)}
                style={{ borderColor: '#F1C40F', borderWidth: 2, ...(largeMode ? { padding: 20 } : {}) }}>
                <div className="emoji" style={largeMode ? { fontSize: 52 } : {}}>{w[0]}</div>
                <div className="wlabel">⭐ {f}</div>
              </button>
            );
          })}
          {words.map(([e, w]) => (
            <button key={w} className="aac-word" onClick={() => tap(w)}
              onContextMenu={(ev) => { ev.preventDefault(); setFavs((f) => f.includes(w) ? f.filter((x) => x !== w) : [...f, w]); toast(favs.includes(w) ? 'Unstarred' : '⭐ Favorited!'); }}
              style={largeMode ? { padding: 20 } : {}}>
              <div className="emoji" style={largeMode ? { fontSize: 52 } : {}}>{e}</div>
              <div className="wlabel">{w}</div>
            </button>
          ))}
        </div>
      )}

      {recent.length > 0 && cat !== 'read' && cat !== 'custom' && (
        <>
          <SectionHead title="🕘 Recently Used" />
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {recent.slice(0, 8).map((w) => <button key={w} className="pill" onClick={() => tap(w)}>{w}</button>)}
          </div>
        </>
      )}

      {showPhrases && (
        <Modal onClose={() => setShowPhrases(false)} title="💾 Saved Phrases">
          {strip.length > 0 && (
            <div className="row" style={{ marginBottom: 10 }}>
              <Btn size="sm" color="green" onClick={() => {
                setSavedPhrases((p) => [...p, strip.join(' ')]);
                setStrip([]); setShowPhrases(false); toast('💾 Phrase saved!');
              }}>Save current: "{strip.join(' ')}"</Btn>
            </div>
          )}
          {savedPhrases.map((p, i) => (
            <div key={i} className="check-item" onClick={() => speak(p)}>
              <div style={{ flex: 1 }}>🔊 {p}</div>
              <button className="btn-gloss btn-red btn-sm" onClick={(e) => { e.stopPropagation(); setSavedPhrases((x) => x.filter((_, j) => j !== i)); }}>✕</button>
            </div>
          ))}
          {savedPhrases.length === 0 && !strip.length && <Empty emoji="💾" title="No saved phrases" sub="Build a sentence, then save it here for one-tap speaking." />}
        </Modal>
      )}
      <div style={{ fontSize: 11, color: '#8a7f9e', marginTop: 8 }}>💡 Long-press a word to favorite it. Works offline.</div>
    </div>
  );
}

// ================= VISUAL SCHEDULE =================
const SCHEDULE_TEMPLATES = {
  'School Day': [['🌅', 'Wake up'], ['🦷', 'Brush teeth'], ['🍳', 'Breakfast'], ['🎒', 'School'], ['🍎', 'Lunch'], ['🧩', 'Play'], ['🍽️', 'Dinner'], ['🛁', 'Bath'], ['📚', 'Story'], ['🌙', 'Bed']],
  'Weekend': [['🌅', 'Wake up'], ['🥞', 'Pancakes'], ['🏞️', 'Park'], ['🍽️', 'Lunch'], ['🎨', 'Art time'], ['🎵', 'Music'], ['🍽️', 'Dinner'], ['🌙', 'Bed']],
  'Doctor Day': [['🌅', 'Wake up'], ['🍳', 'Breakfast'], ['🚗', 'Drive'], ['🩺', 'Doctor visit'], ['⭐', 'Brave reward!'], ['🏠', 'Home'], ['🧩', 'Play'], ['🌙', 'Bed']],
  'Holiday': [['🌅', 'Wake up slow'], ['🎉', 'Celebrate!'], ['🍽️', 'Special meal'], ['👪', 'Family time'], ['🎁', 'Gifts'], ['🌙', 'Bed']],
};
function Schedule() {
  const [tasks, setTasks] = useStored('schedule', SCHEDULE_TEMPLATES['School Day'].map(([e, t]) => ({ e, t, done: false })));
  const [focus, setFocus] = useState(false);
  const [newT, setNewT] = useState('');
  const next = tasks.find((t) => !t.done);

  const loadTpl = (name) => {
    setTasks(SCHEDULE_TEMPLATES[name].map(([e, t]) => ({ e, t, done: false })));
    toast('📋 ' + name + ' loaded!');
  };

  if (focus && next) {
    return (
      <Card style={{ textAlign: 'center', padding: 30 }}>
        <div style={{ fontSize: 13, color: '#8a7f9e' }}>WHAT'S NEXT?</div>
        <div style={{ fontSize: 90, margin: '16px 0' }}>{next.e}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#1A1040' }}>{next.t}</div>
        <div style={{ marginTop: 20 }}>
          <Btn color="green" block onClick={() => {
            setTasks((ts) => ts.map((t) => t === next ? { ...t, done: true } : t));
            toast('⭐ Done! Amazing!');
          }}>Done! ⭐</Btn>
          <div style={{ marginTop: 8 }}><Btn color="cream" block onClick={() => setFocus(false)}>Back to full schedule</Btn></div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 10, gap: 6, overflowX: 'auto' }}>
        {Object.keys(SCHEDULE_TEMPLATES).map((n) => <Btn key={n} size="sm" color="cream" onClick={() => loadTpl(n)} style={{ whiteSpace: 'nowrap' }}>{n}</Btn>)}
        {next && <Btn size="sm" color="purple" onClick={() => setFocus(true)}>🔍 What's Next?</Btn>}
      </div>
      {['Morning 🌅', 'Afternoon ☀️', 'Evening 🌇', 'Night 🌙'].map((part) => {
        const slice = { 'Morning 🌅': [0, 3], 'Afternoon ☀️': [3, 6], 'Evening 🌇': [6, 8], 'Night 🌙': [8, 99] }[part];
        const items = tasks.slice(slice[0], slice[1]);
        if (!items.length) return null;
        return (
          <div key={part}>
            <SectionHead title={part} />
            {items.map((t, i) => {
              const gi = slice[0] + i;
              return (
                <div key={gi} className={`check-item${t.done ? ' done' : ''}`}
                  onClick={() => setTasks((ts) => ts.map((x, j) => j === gi ? { ...x, done: !x.done } : x))}>
                  <div style={{ fontSize: 30 }}>{t.e}</div>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: 17, textDecoration: t.done ? 'line-through' : 'none' }}>{t.t}</div>
                  <div className="check-box">{t.done ? '✓' : ''}</div>
                  <button className="btn-gloss btn-red btn-sm" onClick={(e) => { e.stopPropagation(); setTasks((ts) => ts.filter((_, j) => j !== gi)); }}>✕</button>
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="row" style={{ marginTop: 8 }}>
        <input className="input-gloss" placeholder="Add a task… (e.g. 🧸 Quiet time)" value={newT} onChange={(e) => setNewT(e.target.value)} />
        <Btn size="sm" onClick={() => {
          if (!newT.trim()) return;
          const parts = newT.trim().split(' ');
          const e = /\p{Emoji}/u.test(parts[0]) ? parts.shift() : '⭐';
          setTasks((ts) => [...ts, { e, t: parts.join(' ') || 'New task', done: false }]);
          setNewT('');
        }}>Add</Btn>
      </div>
      <div style={{ marginTop: 8 }}><Btn color="cream" size="sm" block onClick={() => setTasks((ts) => ts.map((t) => ({ ...t, done: false })))}>Reset day 🔄</Btn></div>
    </div>
  );
}

// ================= CALM DOWN CORNER =================
function Breathing() {
  const [phase, setPhase] = useState('ready'); // ready | inhale | hold | exhale
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const seq = [['inhale', 4000], ['hold', 4000], ['exhale', 4000]];
    let i = 0;
    const step = () => {
      if (cancelled) return;
      setPhase(seq[i][0]);
      setTimeout(() => { i = (i + 1) % 3; step(); }, seq[i][1]);
    };
    step();
    return () => { cancelled = true; };
  }, [running]);
  const size = phase === 'inhale' ? 220 : phase === 'hold' ? 220 : phase === 'exhale' ? 120 : 160;
  const label = { ready: 'Tap start 🌱', inhale: 'Breathe in…', hold: 'Hold…', exhale: 'Breathe out…' }[phase];
  return (
    <Card style={{ textAlign: 'center' }}>
      <b>🫧 Breathing Bubble</b>
      <div className="breath-bubble" style={{ width: size, height: size, fontSize: 18 }}>{label}</div>
      <Btn color="purple" onClick={() => { setRunning((r) => !r); if (running) setPhase('ready'); }}>
        {running ? 'Stop' : 'Start Breathing 🌬️'}
      </Btn>
    </Card>
  );
}
function Grounding() {
  const steps = [['5 👀', 'Name 5 things you see'], ['4 ✋', 'Touch 4 things'], ['3 👂', 'Hear 3 sounds'], ['2 👃', 'Smell 2 things'], ['1 👅', 'Taste 1 thing']];
  const [i, setI] = useState(0);
  return (
    <Card style={{ textAlign: 'center' }}>
      <b>🧘 5-4-3-2-1 Grounding</b>
      <div style={{ fontSize: 52, margin: '14px 0 6px' }}>{steps[i][0]}</div>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>{steps[i][1]}</div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Btn size="sm" color="cream" onClick={() => setI(Math.max(0, i - 1))}>← Back</Btn>
        <Btn size="sm" onClick={() => i < 4 ? setI(i + 1) : (setI(0), toast('🌟 So calm. Great job!'))}>{i < 4 ? 'Next →' : 'Finish 🌟'}</Btn>
      </div>
    </Card>
  );
}
function CalmCorner() {
  const [sec, setSec] = useState('breathe');
  const [mix, setMix] = useState([]);
  const [kit, setKit] = useStored('calmKit', ['🧸 Blanket', '🎧 Headphones', '🫧 Bubbles']);
  const [newK, setNewK] = useState('');

  const toggleMix = (id) => {
    const has = mix.includes(id);
    const next = has ? mix.filter((x) => x !== id) : [...mix, id].slice(0, 2);
    setMix(next);
    if (next.length === 0) stopAudio();
    else if (next.length === 1) playAmbience(next[0]);
    else { playAmbience(next[0]); toast('🎧 Mixing two sounds! (plays first — device plays one stream)'); }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: 12, gap: 6, overflowX: 'auto' }}>
        {[['breathe', '🫧 Breathe'], ['ground', '🧘 Grounding'], ['sensory', '🤲 Sensory'], ['sounds', '🔊 Sounds'], ['kit', '🎒 My Kit']].map(([id, l]) => (
          <Btn key={id} size="sm" color={sec === id ? 'purple' : 'cream'} onClick={() => { setSec(id); stopAudio(); setMix([]); }} style={{ whiteSpace: 'nowrap' }}>{l}</Btn>
        ))}
      </div>
      {sec === 'breathe' && <Breathing />}
      {sec === 'ground' && <Grounding />}
      {sec === 'sensory' && (
        <div className="grid2">
          {[['🏋️', 'Heavy work', 'Push, pull, carry'], ['🤗', 'Deep pressure', 'Bear hugs, squeezes'], ['🌀', 'Spinning', 'Spin safe & slow'], ['🌳', 'Swinging', 'Gentle swinging'], ['🍎', 'Chewing', 'Chewy snacks'], ['🧱', 'Building', 'Stack & crash']].map(([e, t, d]) => (
            <Card key={t} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>{e}</div><b>{t}</b><div style={{ fontSize: 12, color: '#8a7f9e' }}>{d}</div>
            </Card>
          ))}
        </div>
      )}
      {sec === 'sounds' && (
        <div>
          <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 8 }}>Tap up to two to mix 🎧</div>
          <div className="grid3">
            {CALM_SOUNDS.map((s) => (
              <button key={s.id} className="aac-word" onClick={() => toggleMix(s.id)}
                style={mix.includes(s.id) ? { borderColor: '#9B59B6', borderWidth: 3 } : {}}>
                <div className="emoji">{s.emoji}</div><div className="wlabel">{s.name}</div>
                <div style={{ fontSize: 11 }}>{mix.includes(s.id) ? '⏸️' : '▶️'}</div>
              </button>
            ))}
          </div>
          {mix.length > 0 && <div style={{ marginTop: 10 }}><Btn color="red" block onClick={() => { stopAudio(); setMix([]); }}>Stop Sounds ⏹️</Btn></div>}
        </div>
      )}
      {sec === 'kit' && (
        <Card>
          <b>🎒 Our Calm Down Kit</b>
          <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>What works for YOUR child — build it together.</div>
          {kit.map((k, i) => (
            <div key={i} className="check-item"><div style={{ flex: 1 }}>{k}</div>
              <button className="btn-gloss btn-red btn-sm" onClick={() => setKit(kit.filter((_, j) => j !== i))}>✕</button></div>
          ))}
          <div className="row" style={{ marginTop: 8 }}>
            <input className="input-gloss" value={newK} onChange={(e) => setNewK(e.target.value)} placeholder="Add item… (e.g. 🌙 Night light)" />
            <Btn size="sm" onClick={() => { if (newK.trim()) { setKit([...kit, newK.trim()]); setNewK(''); } }}>Add</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ================= VISUAL TIMER =================
function VisualTimer() {
  const presets = [1, 2, 5, 10, 15, 20, 30];
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const done = total > 0 && left === 0;
  const pct = total ? (left / total) * 100 : 0;
  return (
    <div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {presets.map((m) => (
          <Btn key={m} size="sm" color={total === m * 60 ? 'blue' : 'cream'}
            onClick={() => { setTotal(m * 60); setLeft(m * 60); }}>{m} min</Btn>
        ))}
      </div>
      <Card style={{ padding: 0, overflow: 'hidden', height: 320, position: 'relative', background: '#f7efe2' }}>
        <div className="timer-fill" style={{ height: pct + '%', '--fill': '#3498DB', position: 'absolute', top: 0, left: 0, right: 0 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          {total === 0 && <div style={{ fontWeight: 800, color: '#8a7f9e' }}>Pick a time above ⏱️</div>}
          {total > 0 && !done && <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1040', background: 'rgba(255,255,255,.8)', padding: '6px 16px', borderRadius: 999 }}>Watch the color drain… no numbers needed 💙</div>}
          {done && <div style={{ fontSize: 60, animation: 'breakpulse 1s infinite' }}>🌟</div>}
          {done && <div style={{ fontWeight: 900, fontSize: 22, color: '#1A1040' }}>All done!</div>}
        </div>
      </Card>
      {total > 0 && <div style={{ marginTop: 10 }}><Btn color="cream" block onClick={() => { setTotal(0); setLeft(0); }}>Reset ⏱️</Btn></div>}
    </div>
  );
}

// ================= TOKEN BOARD =================
function TokenBoard() {
  const [boards, setBoards] = useStored('tokenBoards', [
    { id: 'm', name: 'Morning Routine', emoji: '🌅', goal: 5, reward: 'iPad time', tokens: 0 },
    { id: 's', name: 'School', emoji: '🎒', goal: 5, reward: 'Park trip', tokens: 0 },
    { id: 'b', name: 'Bedtime', emoji: '🌙', goal: 5, reward: 'Extra story', tokens: 0 },
  ]);
  const [hist, setHist] = useStored('tokenHist', []);
  const [showCeleb, setShowCeleb] = useState(null);

  const give = (id) => {
    setBoards((bs) => bs.map((b) => {
      if (b.id !== id) return b;
      const tokens = b.tokens + 1;
      if (tokens >= b.goal) {
        setTimeout(() => setShowCeleb(b), 50);
        setHist((h) => [{ date: new Date().toISOString().slice(0, 10), board: b.name, reward: b.reward }, ...h].slice(0, 30));
        return { ...b, tokens: 0 };
      }
      return { ...b, tokens };
    }));
    buzz([50]);
  };

  return (
    <div>
      {showCeleb && (
        <Modal onClose={() => setShowCeleb(null)} title="🎉 GOAL REACHED!">
          <Confetti />
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 70 }}>🏆</div>
            <h2 style={{ color: '#1A1040' }}>{showCeleb.reward}!</h2>
            <p>You earned it, superstar! ⭐</p>
            <Btn block onClick={() => setShowCeleb(null)}>Yay! 🎉</Btn>
          </div>
        </Modal>
      )}
      {boards.map((b) => (
        <Card key={b.id} style={{ marginBottom: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <b>{b.emoji} {b.name}</b>
            <span className="pill">{b.tokens}/{b.goal} → {b.reward}</span>
          </div>
          <div style={{ margin: '10px 0' }}><PBar pct={(b.tokens / b.goal) * 100} color="#F1C40F" /></div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {[...Array(b.goal)].map((_, i) => (
              <div key={i} style={{ fontSize: 30, filter: i < b.tokens ? 'none' : 'grayscale(1)', opacity: i < b.tokens ? 1 : 0.3 }}>⭐</div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}><Btn color="yellow" block onClick={() => give(b.id)}>Give a Token ⭐</Btn></div>
        </Card>
      ))}
      {hist.length > 0 && (
        <>
          <SectionHead title="📜 Token History" />
          {hist.slice(0, 7).map((h, i) => (
            <div key={i} className="check-item"><div style={{ flex: 1 }}>🏆 <b>{h.board}</b> → {h.reward}</div><span className="pill">{h.date}</span></div>
          ))}
        </>
      )}
    </div>
  );
}

// ================= MELTDOWN TRACKER =================
function Meltdown() {
  const [logs, setLogs] = useStored('meltdowns', []);
  const [f, setF] = useState({ location: '', trigger: 'sensory', intensity: 3, helped: '', notes: '' });
  const triggers = ['sensory', 'hunger', 'tired', 'transition', 'unexpected change', 'communication'];

  const exportPDF = () => {
    const w = window.open('', '_blank');
    const rows = logs.map((l) => `<tr><td>${l.date}</td><td>${l.time}</td><td>${l.location}</td><td>${l.trigger}</td><td>${l.intensity}/5</td><td>${l.helped}</td><td>${l.notes}</td></tr>`).join('');
    w.document.write(`<html><body style="font-family:sans-serif;padding:24px"><h1>Behavior Log for therapist/doctor</h1>
      <p><i>${DISCLAIMER}</i></p>
      <table border="1" cellpadding="6"><tr><th>Date</th><th>Time</th><th>Location</th><th>Trigger</th><th>Intensity</th><th>What helped</th><th>Notes</th></tr>${rows}</table>
      <p><button onclick="window.print()">Print / Save as PDF</button></p></body></html>`);
    w.document.close();
  };

  // weekly pattern
  const counts = {};
  logs.forEach((l) => { counts[l.trigger] = (counts[l.trigger] || 0) + 1; });
  const topTrigger = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <Card>
        <b>📝 Quick Log</b>
        <div className="grid2" style={{ marginTop: 8 }}>
          <input className="input-gloss" placeholder="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
          <select className="input-gloss" value={f.trigger} onChange={(e) => setF({ ...f, trigger: e.target.value })}>
            {triggers.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Intensity: <b>{f.intensity}/5</b></div>
          <div className="row" style={{ gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setF({ ...f, intensity: n })}
                style={{ width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 900, color: '#fff',
                  background: f.intensity >= n ? 'linear-gradient(180deg,#ff9a8a,#e74c3c)' : 'linear-gradient(180deg,#e8ddcf,#cfc0a8)' }}>{n}</button>
            ))}
          </div>
        </div>
        <input className="input-gloss" style={{ marginTop: 8 }} placeholder="What helped? 💛" value={f.helped} onChange={(e) => setF({ ...f, helped: e.target.value })} />
        <textarea className="input-gloss" style={{ marginTop: 8 }} placeholder="Notes…" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <div style={{ marginTop: 8 }}><Btn block onClick={() => {
          const now = new Date();
          setLogs((l) => [{ date: now.toISOString().slice(0, 10), time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...f }, ...l]);
          setF({ location: '', trigger: 'sensory', intensity: 3, helped: '', notes: '' });
          toast('📝 Logged. You\'re doing great tracking this 💛');
        }}>Log It 📝</Btn></div>
      </Card>

      {topTrigger && (
        <Card style={{ marginTop: 10, background: 'linear-gradient(180deg,#fff8ec,#ffefd6)' }}>
          <b>🔍 Pattern spotted:</b> most common trigger is <b>{topTrigger[0]}</b> ({topTrigger[1]}×). Spotting it is the first step 💛
        </Card>
      )}

      {logs.length > 0 && (
        <>
          <SectionHead title="📜 Log" right={<Btn size="sm" color="blue" onClick={exportPDF}>📄 PDF</Btn>} />
          {logs.slice(0, 20).map((l, i) => (
            <div key={i} className="check-item">
              <div style={{ flex: 1 }}>
                <b>{l.date} {l.time}</b> • {l.location || '—'} • <span className="pill">{l.trigger}</span> • intensity {l.intensity}/5
                {l.helped && <div style={{ fontSize: 13 }}>💛 Helped: {l.helped}</div>}
                {l.notes && <div style={{ fontSize: 13, color: '#8a7f9e' }}>{l.notes}</div>}
              </div>
              <button className="btn-gloss btn-red btn-sm" onClick={() => setLogs(logs.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ================= SOCIAL STORIES =================
function Stories() {
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [practice, setPractice] = useState(false);
  const [favs, setFavs] = useStored('storyFavs', []);
  const [custom, setCustom] = useStored('customStories', []);
  const [draft, setDraft] = useState({ title: '', panels: '' });

  const all = [...SOCIAL_STORIES, ...custom];
  const story = all.find((s) => s.id === open);

  return (
    <div>
      {!story ? (
        <>
          <div className="grid2">
            {all.map((s) => (
              <Card key={s.id} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { setOpen(s.id); setPage(0); setPractice(false); }}>
                <div style={{ fontSize: 44 }}>{s.emoji}</div>
                <b style={{ color: '#1A1040' }}>{s.title}</b>
                <div style={{ fontSize: 12, color: '#8a7f9e' }}>{s.panels.length} pictures</div>
                <button className="pill" style={{ marginTop: 6, border: 'none', cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); setFavs((f) => f.includes(s.id) ? f.filter((x) => x !== s.id) : [...f, s.id]); }}>
                  {favs.includes(s.id) ? '⭐ Favorite' : '☆ Favorite'}
                </button>
              </Card>
            ))}
          </div>
          <Card style={{ marginTop: 12 }}>
            <b>✏️ Create your own story</b>
            <input className="input-gloss" style={{ marginTop: 8 }} placeholder="Story title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <textarea className="input-gloss" style={{ marginTop: 8 }} placeholder="One panel per line: emoji + text (e.g. 🏠 We go to the park.)" value={draft.panels} onChange={(e) => setDraft({ ...draft, panels: e.target.value })} />
            <div style={{ marginTop: 8 }}><Btn size="sm" onClick={() => {
              if (!draft.title.trim() || !draft.panels.trim()) return;
              const panels = draft.panels.split('\n').filter((l) => l.trim()).map((l) => {
                const m = l.trim().match(/^(\p{Emoji}\uFE0F?|\p{Extended_Pictographic}+)\s*(.*)$/u);
                return m ? [m[1], m[2] || ''] : ['⭐', l.trim()];
              });
              setCustom((c) => [...c, { id: 'c' + Date.now(), title: draft.title.trim(), emoji: panels[0][0], panels }]);
              setDraft({ title: '', panels: '' }); toast('📖 Story created!');
            }}>Create Story</Btn></div>
          </Card>
        </>
      ) : (
        <div>
          <Btn size="sm" color="cream" onClick={() => setOpen(null)}>← All stories</Btn>
          <div className="row" style={{ margin: '10px 0' }}>
            <Btn size="sm" color={practice ? 'purple' : 'cream'} onClick={() => setPractice(!practice)}>{practice ? '📖 Reading' : '🎭 Practice Mode'}</Btn>
            <Btn size="sm" color="blue" onClick={() => speak(story.panels.map((p) => p[1]).join('. '))}>🔊 Read Aloud</Btn>
          </div>
          <Card style={{ textAlign: 'center', padding: 26 }}>
            <div style={{ fontSize: 90 }}>{story.panels[page][0]}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12, lineHeight: 1.5 }}>{story.panels[page][1]}</div>
            <div style={{ marginTop: 8, color: '#8a7f9e' }}>{page + 1} / {story.panels.length}</div>
          </Card>
          <div className="row" style={{ marginTop: 10 }}>
            <Btn color="cream" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>← Back</Btn>
            <div style={{ flex: 1 }} />
            {page < story.panels.length - 1
              ? <Btn onClick={() => setPage(page + 1)}>Next →</Btn>
              : <Btn color="green" onClick={() => { toast('🌟 Story complete! Great practice!'); setOpen(null); }}>Finish 🌟</Btn>}
          </div>
          {practice && <div className="pill" style={{ marginTop: 10 }}>🎭 Practice Mode: swipe through before the real event!</div>}
        </div>
      )}
    </div>
  );
}

// ================= BEAT MAKER =================
function BeatMaker() {
  const [kit, setKit] = useState('hip hop');
  const [rec, setRec] = useState(false);
  const [events, setEvents] = useState([]);
  // Session-only: nothing auto-saves to device storage. Export the final WAV.
  const [takes, setTakes] = useState([]);
  const [imported, setImported] = useState([]);
  const [exporting, setExporting] = useState(false);
  const startRef = useRef(0);
  const fileRef = useRef(null);
  const audioRef = useRef(null);
  const pads = [
    ['🥁', 'kick', '#FF6B35'], ['🪘', 'snare', '#9B59B6'], ['🎩', 'hat', '#3498DB'], ['👏', 'clap', '#2ECC71'],
    ['🥁', 'kick', '#E91E8C'], ['🪘', 'snare', '#F1C40F'], ['🎩', 'hat', '#1A1040'], ['👏', 'clap', '#FF6B35'],
  ];
  const hit = (type, i) => {
    drum(type);
    buzz([30]);
    const el = document.getElementById('pad' + i);
    if (el) { el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 150); }
    if (rec) setEvents((e) => [...e, { type, t: Date.now() - startRef.current }]);
  };
  const playBack = (evts) => {
    if (!evts.length) return;
    evts.forEach(({ type, t }) => drum(type, t / 1000));
    toast('🎵 Playing your beat!');
  };

  const doExport = async (evts, name) => {
    setExporting(true);
    try {
      await exportBeatToWav(evts, name || 'maverick-beat');
      toast('💾 Beat exported as WAV!');
    } catch {
      toast('😢 Export failed — try again');
    }
    setExporting(false);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImported((list) => [{ id: Date.now(), name: file.name.replace(/\.[^.]+$/, ''), url }, ...list].slice(0, 10));
    toast('🎵 Beat loaded for this session!');
    e.target.value = '';
  };

  const keepTake = () => {
    if (!events.length) return;
    setTakes((t) => [...t, { id: Date.now(), events: [...events], name: `Take ${t.length + 1}` }]);
    setEvents([]);
    toast('🎵 Take kept — export your favorite when done!');
  };
  return (
    <div>
      <div className="row" style={{ marginBottom: 10, gap: 6 }}>
        {Object.keys(KITS).map((k) => <Btn key={k} size="sm" color={kit === k ? 'orange' : 'cream'} onClick={() => setKit(k)}>{k}</Btn>)}
      </div>
      <div className="grid2" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {pads.map(([e, type, col], i) => (
          <button key={i} id={'pad' + i} className="pad-btn" onClick={() => hit(type, i)}
            style={{ '--g2': col, fontSize: 30 }}>{e}</button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 12, gap: 6, flexWrap: 'wrap' }}>
        <Btn size="sm" color={rec ? 'red' : 'cream'} onClick={() => {
          if (!rec) { startRef.current = Date.now(); setEvents([]); }
          else if (events.length > 0) keepTake();
          setRec(!rec);
        }}>{rec ? '⏹️ Stop & Keep Take' : '⏺️ Record'}</Btn>
        {events.length > 0 && !rec && (
          <>
            <Btn size="sm" color="blue" onClick={() => playBack(events)}>▶️ Play</Btn>
            <Btn size="sm" color="green" onClick={keepTake}>➕ Keep Take</Btn>
          </>
        )}
        <Btn size="sm" color="orange" onClick={() => fileRef.current?.click()}>📥 Import Beat</Btn>
        <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleImport} />
      </div>
      <div style={{ fontSize: 12, color: '#8a7f9e', marginTop: 6, textAlign: 'center' }}>
        🎙️ Takes stay in this session only — nothing saves to your phone until you export.
      </div>
      <audio ref={audioRef} style={{ display: 'none' }} />
      {takes.length > 0 && (
        <>
          <SectionHead title="🎙️ Session Takes — pick your final" />
          {takes.map((t) => (
            <div key={t.id} className="check-item">
              <div style={{ flex: 1 }} onClick={() => playBack(t.events)}>🎵 {t.name} ({t.events.length} hits) — tap to hear</div>
              <Btn size="sm" color="green" disabled={exporting} onClick={() => doExport(t.events, t.name.toLowerCase().replace(/\s+/g, '-'))}>
                {exporting ? '⏳' : '✅ Export Final'}
              </Btn>
              <button className="btn-gloss btn-red btn-sm" onClick={() => setTakes(takes.filter((x) => x.id !== t.id))}>✕</button>
            </div>
          ))}
        </>
      )}
      {imported.length > 0 && (
        <>
          <SectionHead title="📥 Imported Beats (this session)" />
          {imported.map((b) => (
            <div key={b.id} className="check-item">
              <div style={{ flex: 1 }} onClick={() => { if (audioRef.current) { audioRef.current.src = b.url; audioRef.current.play(); } }}>
                🎧 {b.name} — tap to play
              </div>
              <button className="btn-gloss btn-red btn-sm" onClick={() => { URL.revokeObjectURL(b.url); setImported(imported.filter((x) => x.id !== b.id)); }}>✕</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ================= HIP HOP THERAPY =================
function HipHop() {
  const [sec, setSec] = useState('sessions');
  const [sess, setSess] = useState(null);
  const [len, setLen] = useState(5);
  const [left, setLeft] = useState(0);
  const [favs, setFavs] = useStored('hiphopFavs', []);
  const [notes, setNotes] = useStored('hiphopNotes', {});
  const [note, setNote] = useState('');

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  if (sess) {
    const s = HIP_HOP_SESSIONS.find((x) => x.id === sess);
    const mm = Math.floor(left / 60), ss = left % 60;
    return (
      <div>
        <Btn size="sm" color="cream" onClick={() => { setSess(null); setLeft(0); }}>← Sessions</Btn>
        <Card style={{ marginTop: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 50 }}>{s.emoji}</div>
          <h3 style={{ color: '#1A1040' }}>{s.name}</h3>
          <div className="row" style={{ justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            {[3, 5, 10].map((m) => <Btn key={m} size="sm" color={len === m ? 'orange' : 'cream'} onClick={() => setLen(m)}>{m} min</Btn>)}
          </div>
          {left > 0 ? (
            <>
              <div style={{ fontSize: 44, fontWeight: 900 }}>{mm}:{String(ss).padStart(2, '0')}</div>
              <div style={{ margin: '12px 0' }}><PBar pct={(left / (len * 60)) * 100} color="#9B59B6" /></div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.cues[Math.floor((len * 60 - left) / 20) % s.cues.length]}</div>
              <Btn color="red" onClick={() => setLeft(0)}>End Session</Btn>
            </>
          ) : (
            <>
              {s.cues.map((c, i) => <div key={i} className="check-item"><div style={{ flex: 1 }}>{c}</div></div>)}
              <div className="row" style={{ marginTop: 10 }}>
                <Btn color="green" block onClick={() => setLeft(len * 60)}>Start {len}-min Session ▶️</Btn>
                <Btn size="sm" color="cream" onClick={() => setFavs((f) => f.includes(s.id) ? f.filter((x) => x !== s.id) : [...f, s.id])}>
                  {favs.includes(s.id) ? '⭐' : '☆'}
                </Btn>
              </div>
              <div style={{ marginTop: 10 }}>
                <b>📝 Parent notes — how did they respond?</b>
                <textarea className="input-gloss" style={{ marginTop: 6 }} value={note || notes[s.id] || ''}
                  onChange={(e) => setNote(e.target.value)} placeholder="Loved the stomping! Calmed after 3 min…" />
                <div style={{ marginTop: 6 }}><Btn size="sm" color="blue" onClick={() => { setNotes({ ...notes, [s.id]: note }); setNote(''); toast('📝 Note saved!'); }}>Save Note</Btn></div>
                {notes[s.id] && <div style={{ fontSize: 13, marginTop: 6, background: '#fff8ec', padding: 8, borderRadius: 8 }}>Last: {notes[s.id]}</div>}
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <Btn size="sm" color={sec === 'sessions' ? 'orange' : 'cream'} onClick={() => setSec('sessions')}>🎵 Sessions</Btn>
        <Btn size="sm" color={sec === 'beat' ? 'orange' : 'cream'} onClick={() => setSec('beat')}>🥁 Beat Maker</Btn>
      </div>
      {sec === 'beat' ? <BeatMaker /> : (
        <div className="grid2">
          {HIP_HOP_SESSIONS.map((s) => (
            <Card key={s.id} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setSess(s.id)}>
              <div style={{ fontSize: 44 }}>{s.emoji}</div>
              <b style={{ color: '#1A1040' }}>{s.name}</b>
              <div>{favs.includes(s.id) ? '⭐' : ''}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ================= SENSORY DIET =================
function SensoryDiet() {
  const [check, setChecks] = useStored('sensoryCheck', null);
  const [log, setLog] = useStored('sensoryLog', []);
  const [sel, setSel] = useState([]);
  const needs = [['👀', 'Visual'], ['👂', 'Auditory'], ['✋', 'Tactile'], ['🏃', 'Movement'], ['👄', 'Oral']];
  const suggestions = {
    Visual: ['Dim the lights 💡', 'Offer sunglasses 🕶️', 'Calm visual timers ⏱️'],
    Auditory: ['Headphones on 🎧', 'Quiet room 🤫', 'Soft music 🎵'],
    Tactile: ['Deep pressure hugs 🤗', 'Playdough squish 🟤', 'Warm blanket 🧸'],
    Movement: ['Swing time 🌳', 'Jumping jacks 🦘', 'Dance break 💃'],
    Oral: ['Chewy snack 🍎', 'Drink through straw 🥤', 'Crunchy veggies 🥕'],
  };
  return (
    <div>
      <Card>
        <b>🌅 Morning Check-in — sensory needs today</b>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {needs.map(([e, n]) => (
            <button key={n} className="pill" style={sel.includes(n) ? { background: 'linear-gradient(180deg,#ffb08a,#FF6B35)', color: '#fff' } : { border: 'none', cursor: 'pointer', fontSize: 14 }}
              onClick={() => setSel((s) => s.includes(n) ? s.filter((x) => x !== n) : [...s, n])}>{e} {n}</button>
          ))}
        </div>
        <div style={{ marginTop: 10 }}><Btn block disabled={!sel.length} onClick={() => {
          setChecks({ date: new Date().toISOString().slice(0, 10), needs: sel });
          toast('🌅 Check-in saved!');
        }}>Save Check-in</Btn></div>
      </Card>
      {check && (
        <Card style={{ marginTop: 10 }}>
          <b>💡 Suggestions for today ({check.date})</b>
          {check.needs.map((n) => (
            <div key={n} style={{ marginTop: 8 }}>
              <b>{n}</b>
              {suggestions[n].map((s) => <div key={s} style={{ fontSize: 14 }}>• {s}</div>)}
            </div>
          ))}
          <div className="row" style={{ marginTop: 10 }}>
            <Btn size="sm" color="green" onClick={() => { setLog((l) => [...l, { ...check, result: 'helped' }]); toast('💚 Noted what helped!'); }}>👍 This helped</Btn>
            <Btn size="sm" color="red" onClick={() => { setLog((l) => [...l, { ...check, result: 'overwhelmed' }]); toast('📝 Noted — we\'ll adjust tomorrow'); }}>👎 Overwhelmed</Btn>
          </div>
        </Card>
      )}
      {log.length > 0 && (
        <>
          <SectionHead title="📊 Weekly Report" />
          {log.slice(-7).reverse().map((l, i) => (
            <div key={i} className="check-item">
              <div style={{ flex: 1 }}><b>{l.date}</b> — {l.needs.join(', ')}</div>
              <span className={`pill ${l.result === 'helped' ? 'green' : 'red'}`}>{l.result === 'helped' ? '💚 helped' : '🔴 overwhelmed'}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ================= SPEECH MILESTONES =================
const MILESTONES = ['First sound recorded', 'First word attempt', 'First clear word spoken', 'Two-word combination', 'Requesting with words', 'Conversational phrase'];
function Speech() {
  const [done, setDone] = useStored('milestones', {});
  return (
    <div>
      <Card style={{ background: 'linear-gradient(180deg,#f4ecff,#e9dcf9)', marginBottom: 10 }}>
        💛 Every child's timeline is their own. Celebrate every single step!
      </Card>
      {MILESTONES.map((m, i) => (
        <div key={m} className={`check-item${done[i] ? ' done' : ''}`}
          onClick={() => setDone((d) => d[i] ? { ...d, [i]: null } : { ...d, [i]: new Date().toISOString().slice(0, 10) })}>
          <div className="check-box" style={done[i] ? { background: 'linear-gradient(180deg,#8fe6b3,#2ECC71)' } : {}}>{done[i] ? '✓' : (i + 1)}</div>
          <div style={{ flex: 1, fontWeight: 700 }}>{m}</div>
          {done[i] && <span className="pill green">{done[i]}</span>}
        </div>
      ))}
    </div>
  );
}

// ================= MAIN TAB =================
const SECTIONS = [
  ['aac', '💬 AAC Board'], ['schedule', '📋 Schedule'], ['calm', '🌊 Calm Down'],
  ['timer', '⏱️ Timer'], ['tokens', '⭐ Tokens'], ['meltdown', '📝 Behavior'],
  ['stories', '📖 Stories'], ['hiphop', '🎵 Hip Hop'], ['sensory', '🤲 Sensory'], ['speech', '🗣️ Speech'],
  ['asl', '🖐️ ASL'], ['world', '🌍 My World'], ['buddy', '🎨 My Buddy'], ['routines', '📋 Routines'],
];

export default function Maverick({ onDisclaimer }) {
  const [sec, setSec] = useState('aac');
  const [largeMode, setLarge] = useStored('aacLarge', false);
  const [highContrast, setHC] = useStored('aacHC', false);

  return (
    <div className={`screen${highContrast ? ' hc' : ''}`}>
      <SectionHead title="⚡ Maverick's World"
        right={sec === 'aac' && (
          <div className="row" style={{ gap: 4 }}>
            <Btn size="sm" color={largeMode ? 'orange' : 'cream'} onClick={() => setLarge(!largeMode)}>🔍 Large</Btn>
            <Btn size="sm" color={highContrast ? 'orange' : 'cream'} onClick={() => setHC(!highContrast)}>◐ Contrast</Btn>
          </div>
        )} />
      <div className="row" style={{ marginBottom: 12, gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {SECTIONS.map(([id, label]) => (
          <Btn key={id} size="sm" color={sec === id ? 'orange' : 'cream'} onClick={() => { setSec(id); stopSpeak(); stopAudio(); }} style={{ whiteSpace: 'nowrap' }}>{label}</Btn>
        ))}
      </div>
      {sec === 'aac' && <Mascot kidId="maverick" mood="greeting" />}

      {sec === 'aac' && <AACBoard largeMode={largeMode} highContrast={highContrast} />}
      {sec === 'schedule' && <Schedule />}
      {sec === 'calm' && <CalmCorner />}
      {sec === 'timer' && <VisualTimer />}
      {sec === 'tokens' && <TokenBoard />}
      {sec === 'meltdown' && <Meltdown />}
      {sec === 'stories' && <Stories />}
      {sec === 'hiphop' && <HipHop />}
      {sec === 'sensory' && <SensoryDiet />}
      {sec === 'speech' && <Speech />}
      {sec === 'asl' && <ASL />}
      {sec === 'world' && <StickerWorld kidId="maverick" />}
      {sec === 'buddy' && <CharacterCreator kidId="maverick" onDone={() => setSec('aac')} />}
      {sec === 'routines' && <RoutineBuilder kidId="maverick" />}

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}
