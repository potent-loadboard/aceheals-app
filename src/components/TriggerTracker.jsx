import React, { useState } from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { useStored, toast } from '../lib/store.js';

// Trigger Tracker — "what happened before the meltdown?"
// Quick-log the basics, the app finds patterns over time.
const FACTORS = [
  { id: 'sleep', emoji: '😴', name: 'Bad sleep', options: ['Slept well', 'Woke up a lot', 'Went to bed late', 'Woke up early'] },
  { id: 'hunger', emoji: '🍽️', name: 'Hunger', options: ['Ate well', 'Skipped meal', 'Ate less than usual', 'Ate a lot'] },
  { id: 'noise', emoji: '🔊', name: 'Noise/Sensory', options: ['Quiet day', 'Loud noises', 'Bright lights', 'Crowded place', 'New texture/touch'] },
  { id: 'routine', emoji: '🔄', name: 'Routine change', options: ['Normal day', 'Schedule changed', 'New place', 'Someone new', 'Missed activity'] },
  { id: 'communication', emoji: '💬', name: 'Communication', options: ['Communicating well', 'Frustrated trying to tell me something', 'Went nonverbal', 'New words/gestures!'] },
  { id: 'mood', emoji: '😊', name: 'Mood before', options: ['Happy', 'Calm', 'Cranky', 'Anxious', 'Hyper', 'Withdrawn'] },
];

const INCIDENT_TYPES = [
  { id: 'meltdown', emoji: '🌊', name: 'Meltdown' },
  { id: 'refusal', emoji: '🚫', name: 'Refusal' },
  { id: 'hitting', emoji: '✋', name: 'Hitting' },
  { id: 'running', emoji: '🏃', name: 'Running away' },
  { id: 'crying', emoji: '😢', name: 'Long crying' },
  { id: 'shutdown', emoji: '🔇', name: 'Shutdown/withdrawn' },
  { id: 'great', emoji: '🌈', name: 'Great moment!' },
];

export default function TriggerTracker({ kidId = 'manny', kidName = 'Manny' }) {
  const [entries, setEntries] = useStored(`${kidId}Triggers`, []);
  const [logging, setLogging] = useState(false);
  const [incident, setIncident] = useState(null);
  const [factors, setFactors] = useState({});
  const [note, setNote] = useState('');
  const [showPatterns, setShowPatterns] = useState(false);

  const startLog = () => { setLogging(true); setIncident(null); setFactors({}); setNote(''); };

  const saveEntry = () => {
    if (!incident) { toast('Pick what happened first!'); return; }
    setEntries((e) => [{
      id: Date.now(), date: new Date().toISOString(),
      incident: incident.id, incidentName: incident.name,
      factors: { ...factors }, note,
    }, ...e].slice(0, 100));
    toast('📝 Logged! The app will look for patterns.');
    setLogging(false);
  };

  const getPatterns = () => {
    if (entries.length < 3) return null;
    const patterns = [];
    // For each factor, check if a non-default value correlates with incidents
    FACTORS.forEach((f) => {
      const counts = {};
      entries.forEach((e) => {
        const v = e.factors[f.id];
        if (v && v !== f.options[0]) counts[v] = (counts[v] || 0) + 1;
      });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] >= 3 && top[1] / entries.length >= 0.4) {
        patterns.push({ factor: f.name, emoji: f.emoji, value: top[0], count: top[1], pct: Math.round((top[1] / entries.length) * 100) });
      }
    });
    return patterns;
  };

  const patterns = getPatterns();

  if (logging) {
    return (
      <div>
        <SectionHead title={`📝 Log for ${kidName}`} />
        {!incident ? (
          <div>
            <b>What happened?</b>
            <div className="grid2" style={{ marginTop: 8 }}>
              {INCIDENT_TYPES.map((t) => (
                <button key={t.id} onClick={() => setIncident(t)}
                  className="game-btn" style={{ '--g1': '#3498DB55', '--g2': '#3498DB', minHeight: 80 }}>
                  <div style={{ fontSize: 32 }}>{t.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{t.name}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12 }}><Btn color="cream" onClick={() => setLogging(false)}>Cancel</Btn></div>
          </div>
        ) : (
          <div>
            <Card style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{incident.emoji}</div>
              <b>{incident.name}</b>
              <div style={{ fontSize: 13, color: '#8a7f9e' }}>Now quick-tap what was going on:</div>
            </Card>
            {FACTORS.map((f) => (
              <Card key={f.id} style={{ marginBottom: 8 }}>
                <b>{f.emoji} {f.name}</b>
                <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {f.options.map((o) => (
                    <Btn key={o} size="sm"
                      color={factors[f.id] === o ? 'orange' : 'cream'}
                      onClick={() => setFactors((p) => ({ ...p, [f.id]: o }))}>
                      {o}
                    </Btn>
                  ))}
                </div>
              </Card>
            ))}
            <Card style={{ marginBottom: 8 }}>
              <b>📝 Note (optional)</b>
              <input className="input-gloss" placeholder="Anything else? What helped?"
                value={note} onChange={(e) => setNote(e.target.value)} style={{ marginTop: 6 }} />
            </Card>
            <div className="row" style={{ marginTop: 12 }}>
              <Btn color="cream" onClick={() => setIncident(null)}>← Back</Btn>
              <div style={{ flex: 1 }} />
              <Btn color="green" onClick={saveEntry}>💾 Save Log</Btn>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <SectionHead title={`📝 Trigger Tracker — ${kidName}`} />
      </div>
      <Btn block color="orange" onClick={startLog} style={{ marginBottom: 12 }}>
        ➕ Log a moment
      </Btn>

      {patterns && patterns.length > 0 && (
        <Card style={{ marginBottom: 12, borderColor: '#F1C40F', background: 'linear-gradient(180deg,#2a2410,#1a1608)' }}>
          <b style={{ fontSize: 16 }}>🔍 Patterns I'm noticing:</b>
          {patterns.map((p, i) => (
            <div key={i} style={{ marginTop: 8, fontSize: 14, background: 'rgba(255,255,255,.06)', padding: 10, borderRadius: 10 }}>
              <div>{p.emoji} <b>{p.factor}:</b> "{p.value}"</div>
              <div style={{ fontSize: 13, color: '#c9b8e8' }}>
                Showed up in {p.count} of {entries.length} logs ({p.pct}%). Worth watching!
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#8a7f9e', marginTop: 8 }}>
            These are patterns, not diagnoses. Share with your care team if helpful!
          </div>
        </Card>
      )}

      {entries.length > 0 ? (
        <div>
          {entries.slice(0, 10).map((e) => (
            <Card key={e.id} style={{ marginBottom: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>{INCIDENT_TYPES.find((t) => t.id === e.incident)?.emoji} {e.incidentName}</b>
                <span style={{ fontSize: 12, color: '#8a7f9e' }}>
                  {new Date(e.date).toLocaleDateString()} {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#8a7f9e', marginTop: 4 }}>
                {Object.entries(e.factors).map(([k, v]) => {
                  const f = FACTORS.find((x) => x.id === k);
                  return f ? `${f.emoji} ${v}` : '';
                }).filter(Boolean).join(' • ')}
              </div>
              {e.note && <div style={{ fontSize: 13, marginTop: 4 }}>📝 {e.note}</div>}
              <button onClick={() => setEntries(entries.filter((x) => x.id !== e.id))}
                style={{ background: 'none', border: 'none', color: '#8a7f9e', fontSize: 12, cursor: 'pointer', marginTop: 4, padding: 0 }}>
                Delete
              </button>
            </Card>
          ))}
          {entries.length < 3 && (
            <div style={{ fontSize: 13, color: '#8a7f9e', textAlign: 'center', marginTop: 8 }}>
              Log {3 - entries.length} more and I'll start finding patterns! 🔍
            </div>
          )}
        </div>
      ) : (
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>📝</div>
          <b>No logs yet</b>
          <div style={{ fontSize: 14, color: '#8a7f9e', marginTop: 6 }}>
            When something happens (good or hard), tap "Log a moment."<br />
            After a few logs, I'll spot patterns — like "meltdowns happen when bedtime was late."
          </div>
        </Card>
      )}
    </div>
  );
}
