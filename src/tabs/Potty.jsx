import React, { useState } from 'react';
import { Card, Btn, SectionHead, Paywall, Empty, Footer, PBar, Modal, Confetti } from '../components/ui.jsx';
import { useStored, toast, buzz } from '../lib/store.js';
import { hasAccess } from '../lib/paywall.js';
import { supabase, sb } from '../lib/supabase.js';

const STEPS = [['🪑', 'Sit Down'], ['💪', 'Try'], ['🧻', 'Wipe'], ['🚽', 'Flush'], ['🧼', 'Wash Hands']];
const REWARDS = [['⭐', 'Sticker'], ['🎵', 'Favorite Song'], ['🙌', 'High Five'], ['📺', '2 Min Show']];

export default function Potty({ onDisclaimer }) {
  const paid = hasAccess();
  const [goal, setGoal] = useStored('pottyGoal', 5);
  const [logs, setLogs] = useStored('pottyLogs', []); // {ts}
  const [steps, setSteps] = useState([]);
  const [reward, setReward] = useStored('pottyReward', '⭐ Sticker');
  const [editing, setEditing] = useState(false);
  const [draftGoal, setDraftGoal] = useState(goal);
  const [celebrate, setCelebrate] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter((l) => l.ts.slice(0, 10) === today);
  const count = todayLogs.length;
  const reached = count >= goal;

  const logSuccess = async () => {
    const entry = { ts: new Date().toISOString() };
    setLogs((l) => [...l, entry]);
    buzz([60, 60, 60]);
    // Sync to Supabase when available
    await sb(async (s) => {
      const { data: { user } } = await s.auth.getUser();
      if (user) await s.from('potty_logs').insert({ user_id: user.id, created_at: entry.ts });
    });
    if (count + 1 >= goal) setCelebrate(true);
    else toast('🎉 Great job! ' + (count + 1) + '/' + goal);
  };

  // Weekly chart data
  const week = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString(undefined, { weekday: 'short' })[0], count: logs.filter((l) => l.ts.slice(0, 10) === k).length, today: k === today };
  });
  const maxC = Math.max(1, ...week.map((w) => w.count));

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {!paid && <Paywall feature="Potty Training Tracker" />}

      {celebrate && (
        <Modal onClose={() => setCelebrate(false)} title="🏆 GOAL REACHED!">
          <Confetti pieces={90} />
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 80 }}>🎉</div>
            <h2 style={{ color: '#1A1040' }}>Amazing job! 🎉</h2>
            <p>Reward: <b style={{ fontSize: 20 }}>{reward}</b></p>
            <Btn block onClick={() => setCelebrate(false)}>Yay! 🌟</Btn>
          </div>
        </Modal>
      )}

      <SectionHead title="🚽 Potty Training" />
      <Card style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Today's Progress</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#2ECC71', margin: '8px 0' }}>{count}<span style={{ fontSize: 24, color: '#8a7f9e' }}>/{goal}</span></div>
        <PBar pct={(count / goal) * 100} color="#2ECC71" />
        <div className="row" style={{ marginTop: 10, justifyContent: 'center' }}>
          {!editing ? <Btn size="sm" color="cream" onClick={() => { setDraftGoal(goal); setEditing(true); }}>Edit Goal ✏️</Btn> : (
            <><input className="input-gloss" type="number" min={1} max={20} value={draftGoal} onChange={(e) => setDraftGoal(Number(e.target.value))} style={{ maxWidth: 90 }} />
            <Btn size="sm" onClick={() => { setGoal(draftGoal || 5); setEditing(false); }}>Save</Btn></>
          )}
        </div>
        {reached && <div style={{ fontSize: 40, marginTop: 6 }}>🏆 Goal Reached!</div>}
      </Card>

      <div style={{ marginTop: 12 }}>
        <Btn color="green" block onClick={logSuccess} style={{ fontSize: 20, padding: '18px' }}>✅ Log a Success!</Btn>
      </div>

      <SectionHead title="📋 Step Sequence" />
      <div className="row" style={{ gap: 6 }}>
        {STEPS.map(([e, label], i) => (
          <button key={label} className="aac-word" onClick={() => setSteps((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i])}
            style={{ flex: 1, ...(steps.includes(i) ? { background: 'linear-gradient(180deg,#d8f7e4,#bff0d2)', borderColor: '#2ECC71' } : {}) }}>
            <div className="emoji" style={{ fontSize: 28 }}>{e}</div>
            <div className="wlabel" style={{ fontSize: 11 }}>{label}</div>
            <div>{steps.includes(i) ? '✅' : '⭕'}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 8 }}><Btn color="cream" size="sm" block onClick={() => setSteps([])}>Reset Steps 🔄</Btn></div>

      <SectionHead title="🎁 Choose The Reward" />
      <div className="grid2">
        {REWARDS.map(([e, label]) => {
          const full = e + ' ' + label;
          return (
            <button key={label} className="aac-word" onClick={() => { setReward(full); toast('🎁 Reward: ' + full); }}
              style={reward === full ? { borderColor: '#FF6B35', borderWidth: 3 } : {}}>
              <div className="emoji" style={{ fontSize: 36 }}>{e}</div>
              <div className="wlabel">{label}</div>
            </button>
          );
        })}
      </div>

      <SectionHead title="📊 This Week" />
      <Card>
        <div className="row" style={{ alignItems: 'flex-end', justifyContent: 'space-around', height: 130 }}>
          {week.map((w, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>{w.count}</div>
              <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{
                  width: 30, borderRadius: '8px 8px 4px 4px',
                  height: Math.max(6, (w.count / maxC) * 80),
                  background: w.today ? 'linear-gradient(180deg,#ffb08a,#FF6B35)' : 'linear-gradient(180deg,#9fd4f5,#3498DB)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5)',
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4, fontWeight: w.today ? 800 : 400, color: w.today ? '#FF6B35' : '#8a7f9e' }}>{w.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <b>🎬 Video Modeling</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>Watching other kids helps! (Opens YouTube — not affiliated with AceHeals.)</div>
        <a href="https://www.youtube.com/results?search_query=potty+training+video+for+kids" target="_blank" rel="noreferrer"
          className="btn-gloss btn-red btn-block" style={{ textDecoration: 'none', textAlign: 'center' }}>▶️ Watch Potty Videos</a>
      </Card>

      {todayLogs.length > 0 && (
        <>
          <SectionHead title="🕘 Today's Log" />
          {todayLogs.map((l, i) => (
            <div key={i} className="check-item">
              <div style={{ fontSize: 22 }}>✅</div>
              <div style={{ flex: 1 }}><b>{new Date(l.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b> — Success! 🎉</div>
              <button className="btn-gloss btn-red btn-sm" onClick={() => setLogs(logs.filter((x) => x !== l))}>✕</button>
            </div>
          ))}
        </>
      )}

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}
