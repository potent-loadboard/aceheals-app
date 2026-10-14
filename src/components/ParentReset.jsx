import React, { useState, useEffect } from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { toast } from '../lib/store.js';

// Parent Stress Reset — 60 seconds for the grown-up
export default function ParentReset() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [phase, setPhase] = useState('breathe'); // breathe | feeling | done

  useEffect(() => {
    if (!active) return;
    if (seconds <= 0) { setPhase('feeling'); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [active, seconds]);

  const start = () => { setActive(true); setSeconds(60); setPhase('breathe'); };

  if (!active) {
    return (
      <Card style={{ background: 'linear-gradient(180deg,#2a1a4e,#1a0f2e)', borderColor: '#9B59B6', textAlign: 'center' }}>
        <div style={{ fontSize: 44 }}>🧘</div>
        <b style={{ fontSize: 18 }}>Parent 60-Second Reset</b>
        <div style={{ fontSize: 14, color: '#c9b8e8', margin: '8px 0 12px' }}>
          You're pouring from an empty cup. Take one minute — just for you.<br />
          No guilt. No "should." Just breathe.
        </div>
        <Btn color="purple" block onClick={start} style={{ fontSize: 18 }}>Start My Minute 💜</Btn>
      </Card>
    );
  }

  if (phase === 'breathe') {
    const breathPhase = Math.floor((60 - seconds) / 8) % 2; // 4s in, 4s out
    return (
      <Card style={{ textAlign: 'center', background: 'linear-gradient(180deg,#1a2a4e,#0f1a2e)', borderColor: '#3498DB' }}>
        <div style={{ fontSize: 14, color: '#8a7f9e' }}>{seconds}s left</div>
        <div className="breath-bubble" style={{
          width: breathPhase === 0 ? 160 : 110, height: breathPhase === 0 ? 160 : 110,
          transition: 'all 4s ease-in-out', margin: '20px auto', fontSize: 18,
        }}>
          {breathPhase === 0 ? 'breathe in…' : 'breathe out…'}
        </div>
        <div style={{ fontSize: 15, color: '#c9b8e8', fontStyle: 'italic' }}>
          "You don't have to be perfect.<br />You just have to be here."
        </div>
        <div style={{ marginTop: 12 }}>
          <Btn size="sm" color="cream" onClick={() => setActive(false)}>End early</Btn>
        </div>
      </Card>
    );
  }

  if (phase === 'feeling') {
    return (
      <Card style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44 }}>💛</div>
        <b style={{ fontSize: 18 }}>How are YOU feeling?</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '6px 0 12px' }}>Private. No judgment. Just check in.</div>
        <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['😊 Okay', '😮‍💨 Tired', '😰 Stressed', '😢 Sad', '😤 Frustrated', '💪 Ready'].map((f) => (
            <Btn key={f} size="sm" color="cream" onClick={() => {
              toast(`💛 Noted. ${f.includes('Okay') || f.includes('Ready') ? 'Glad to hear it.' : 'That makes sense. Be gentle with yourself today.'}`);
              setActive(false);
            }}>{f}</Btn>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: '#8a7f9e' }}>
          Need a break? It's okay to ask someone you trust for help today.
        </div>
      </Card>
    );
  }
}
