import React, { useState } from 'react';
import { Card, Btn, SectionHead, Modal } from './ui.jsx';
import { useStored, toast, speak } from '../lib/store.js';

// ================= HARD MOMENT BUTTON =================
// The killer feature: connects parent guidance + child communication in a crisis.
// Step 1: Parent picks what's happening → Step 2: 3 calm actions →
// Step 3: Child gets picture cards → Step 4: Log what helped (after, not during)

const SITUATIONS = [
  {
    id: 'overwhelmed', emoji: '🌊', name: "Overwhelmed / Meltdown",
    steps: [
      "Reduce noise and demands. Dim lights if you can. Safety first.",
      "Use fewer words. Say one short thing, then wait 10 seconds.",
      "Offer two familiar choices or a break — don't ask open questions.",
    ],
    childPrompt: "It's okay. Show me what you need.",
  },
  {
    id: 'transition', emoji: '🔄', name: "Won't Transition",
    steps: [
      "Give a visual warning: '2 more minutes, then we go.' Show a timer.",
      "Offer a transition object — something to carry to the next place.",
      "Use first-then: 'First shoes, then playground.' Keep it visual.",
    ],
    childPrompt: "We're going to do something new soon. What do you need?",
  },
  {
    id: 'wonteat', emoji: '🍽️', name: "Won't Eat",
    steps: [
      "Don't force it. Remove pressure — sit nearby, eat your own food calmly.",
      "Offer one safe food alongside the new one. No 'just one bite' battles.",
      "If it's sensory (texture/smell), note it for later — don't push through.",
    ],
    childPrompt: "Eating is hard right now. Show me how you feel.",
  },
  {
    id: 'cantcommunicate', emoji: '💬', name: "Can't Communicate",
    steps: [
      "Stop asking questions. Switch to showing — hold up two picture cards.",
      "Watch their body: pointing, leading you somewhere, pushing away are communication.",
      "Offer the AAC board or their familiar cards. Accept ANY attempt.",
    ],
    childPrompt: "I want to understand. Show me.",
  },
  {
    id: 'hitting', emoji: '✋', name: "Hitting / Aggression",
    steps: [
      "Stay calm and keep everyone safe. Block gently, don't grab or restrain.",
      "Say very little: 'I won't let you hurt. I'm here.' Then wait.",
      "After calm returns, offer a sensory alternative (squeeze ball, pillow).",
    ],
    childPrompt: "You're safe. Show me what you need.",
  },
  {
    id: 'running', emoji: '🏃', name: "Running Away / Eloping",
    steps: [
      "Stay calm. Follow at a safe distance — don't chase (it becomes a game).",
      "Note where they go — it's usually water, a favorite spot, or away from noise.",
      "When close, offer a preferred item. Save the talk for later.",
    ],
    childPrompt: "I'm here. You're safe.",
  },
  {
    id: 'bedtime', emoji: '🌙', name: "Bedtime Struggle",
    steps: [
      "Dim lights, lower your voice. The routine IS the cue — start it even if they're wired.",
      "Offer two calm choices: 'book or song?' — not 'are you ready for bed?'",
      "If they're not tired, try quiet time in bed instead of forcing sleep.",
    ],
    childPrompt: "It's time to wind down. What helps you feel sleepy?",
  },
  {
    id: 'public', emoji: '🏪', name: "Public Outing Meltdown",
    steps: [
      "Ignore the audience. Your child matters, not strangers' opinions.",
      "Reduce input: move to a quieter spot, offer headphones or a comfort item.",
      "It's okay to leave. Leaving is a success, not a failure.",
    ],
    childPrompt: "We're okay. Show me what you need.",
  },
];

const CHILD_CARDS = [
  { emoji: '🛋️', label: 'Break' },
  { emoji: '🙋', label: 'Help' },
  { emoji: '🔇', label: 'Quiet' },
  { emoji: '✅', label: 'Finished' },
  { emoji: '🤗', label: 'Hug' },
  { emoji: '💧', label: 'Water' },
  { emoji: '🎧', label: 'Headphones' },
  { emoji: '🚶', label: 'Walk' },
];

export default function HardMoment() {
  const [situation, setSituation] = useState(null);
  const [step, setStep] = useState(0); // 0=pick, 1=parent steps, 2=child cards, 3=reflect
  const [childPick, setChildPick] = useState(null);
  const [helped, setHelped] = useState('');
  const [log, setLog] = useStored('hardMomentLog', []);

  const start = (s) => { setSituation(s); setStep(1); setChildPick(null); setHelped(''); };

  const saveLog = () => {
    setLog((l) => [{
      id: Date.now(), date: new Date().toISOString(),
      situation: situation.name, childNeeded: childPick?.label || 'not selected',
      helped: helped || 'not noted',
    }, ...l].slice(0, 50));
    toast('💛 Logged. You handled that with love.');
    setSituation(null); setStep(0);
  };

  if (step === 0) {
    return (
      <div>
        <SectionHead title="🆘 Hard Moment" />
        <Card style={{ background: 'linear-gradient(180deg,#2a1a3e,#1a0f2e)', borderColor: '#E91E8C', textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>💛</div>
          <b style={{ fontSize: 18 }}>It's okay. You're doing great.</b>
          <div style={{ fontSize: 14, color: '#c9b8e8', margin: '8px 0' }}>
            Pick what's happening. We'll walk through it together — no judgment, no lectures.
          </div>
        </Card>
        <div className="grid2" style={{ marginTop: 12 }}>
          {SITUATIONS.map((s) => (
            <button key={s.id} className="game-btn" onClick={() => start(s)}
              style={{ '--g1': '#E91E8C55', '--g2': '#E91E8C', '--g3': '#E91E8Caa', minHeight: 90 }}>
              <div style={{ fontSize: 36 }}>{s.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{s.name}</div>
            </button>
          ))}
        </div>
        {log.length > 0 && (
          <Card style={{ marginTop: 12 }}>
            <b>📝 Past hard moments ({log.length})</b>
            <div style={{ fontSize: 13, color: '#8a7f9e', marginTop: 6 }}>
              {log.slice(0, 3).map((l) => (
                <div key={l.id} style={{ marginBottom: 4 }}>
                  {new Date(l.date).toLocaleDateString()} — {l.situation} → needed: {l.childNeeded}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (step === 1) {
    return (
      <div>
        <SectionHead title={`${situation.emoji} ${situation.name}`} />
        <Card style={{ background: 'linear-gradient(180deg,#1a2a1a,#0f1e0f)', borderColor: '#2ECC71' }}>
          <b style={{ fontSize: 16, color: '#2ECC71' }}>🧘 Do these three things:</b>
          <div style={{ marginTop: 10 }}>
            {situation.steps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start',
                background: 'rgba(255,255,255,.06)', padding: 12, borderRadius: 12,
              }}>
                <div style={{
                  minWidth: 32, height: 32, borderRadius: '50%', background: '#2ECC71',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: '#fff',
                }}>{i + 1}</div>
                <div style={{ fontSize: 15, lineHeight: 1.5 }}>{s}</div>
              </div>
            ))}
          </div>
        </Card>
        <div className="row" style={{ marginTop: 12 }}>
          <Btn color="cream" onClick={() => { setStep(0); setSituation(null); }}>← Back</Btn>
          <div style={{ flex: 1 }} />
          <Btn color="purple" onClick={() => setStep(2)} style={{ fontSize: 16 }}>
            Show child cards →
          </Btn>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div>
        <SectionHead title="💬 Let them show you" />
        <Card style={{ textAlign: 'center', background: 'linear-gradient(180deg,#1a1a3e,#0f0f2e)', borderColor: '#3498DB' }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}><b>{situation.childPrompt}</b></div>
          <div style={{ fontSize: 13, color: '#8a7f9e' }}>Hand them the phone. No talking needed.</div>
        </Card>
        <div className="grid2" style={{ marginTop: 12, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {CHILD_CARDS.map((c) => (
            <button key={c.label}
              onClick={() => { setChildPick(c); speak(c.label); }}
              style={{
                background: childPick?.label === c.label ? 'linear-gradient(180deg,#9fd4f5,#3498DB)' : 'rgba(255,255,255,.08)',
                border: `3px solid ${childPick?.label === c.label ? '#3498DB' : 'rgba(255,255,255,.2)'}`,
                borderRadius: 20, padding: 16, cursor: 'pointer', minHeight: 100,
              }}>
              <div style={{ fontSize: 44 }}>{c.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4, color: '#fff' }}>{c.label}</div>
            </button>
          ))}
        </div>
        {childPick && (
          <Card style={{ marginTop: 12, textAlign: 'center', borderColor: '#2ECC71' }}>
            <div style={{ fontSize: 20 }}>💛 They chose: <b>{childPick.emoji} {childPick.label}</b></div>
            <div style={{ fontSize: 13, color: '#8a7f9e', marginTop: 4 }}>Honor it. You can reflect afterward.</div>
          </Card>
        )}
        <div className="row" style={{ marginTop: 12 }}>
          <Btn color="cream" onClick={() => setStep(1)}>← Steps</Btn>
          <div style={{ flex: 1 }} />
          <Btn color="green" onClick={() => setStep(3)}>We're okay ✓</Btn>
        </div>
      </div>
    );
  }

  // Step 3: reflect (after, not during)
  return (
    <div>
      <SectionHead title="💛 You got through it" />
      <Card style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🌈</div>
        <b style={{ fontSize: 18 }}>That was hard. You showed up anyway.</b>
        <div style={{ fontSize: 14, color: '#8a7f9e', margin: '8px 0' }}>
          One optional question — this helps the app learn what works for your family:
        </div>
        <b>What seemed to help?</b>
        <input className="input-gloss" placeholder="e.g. going to the quiet room, the hug card..."
          value={helped} onChange={(e) => setHelped(e.target.value)}
          style={{ marginTop: 8 }} />
        <div className="row" style={{ marginTop: 12 }}>
          <Btn color="cream" onClick={() => { setStep(0); setSituation(null); }}>Skip</Btn>
          <div style={{ flex: 1 }} />
          <Btn color="green" onClick={saveLog}>💾 Save</Btn>
        </div>
      </Card>
      <Card style={{ marginTop: 10, background: 'linear-gradient(180deg,#fff8ec,#ffefd6)' }}>
        <div style={{ fontSize: 13 }}>
          🆘 <b>If anyone is in immediate danger</b>, call emergency services (911) first. This app is supportive guidance, not a substitute for professional help.
        </div>
      </Card>
    </div>
  );
}
