import React, { useState } from 'react';
import { Card, Btn } from './ui.jsx';
import { useStored, toast } from '../lib/store.js';
import { ASL_SIGNS, ASL_VIDEO_URL } from '../data/games.js';

export default function ASL() {
  const [idx, setIdx] = useState(0);
  const [learned, setLearned] = useStored('aslLearned', []);
  const [flash, setFlash] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const s = ASL_SIGNS[idx];

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <Btn size="sm" color={!flash ? 'orange' : 'cream'} onClick={() => setFlash(false)}>🖐️ Learn</Btn>
        <Btn size="sm" color={flash ? 'orange' : 'cream'} onClick={() => setFlash(true)}>🃏 Flashcards</Btn>
        <div style={{ flex: 1 }} />
        <a href={ASL_VIDEO_URL} target="_blank" rel="noreferrer" className="btn-gloss btn-blue btn-sm" style={{ textDecoration: 'none' }}>▶️ Video Tutorial</a>
      </div>

      <div className="row" style={{ justifyContent: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
        {ASL_SIGNS.map((x, i) => (
          <button key={x.sign} onClick={() => { setIdx(i); setShowTip(false); }}
            style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: learned.includes(x.sign) ? 'linear-gradient(180deg,#8fe6b3,#2ECC71)' : i === idx ? 'linear-gradient(180deg,#ffb08a,#FF6B35)' : '#e8ddcf' }}
            title={x.sign} />
        ))}
      </div>

      <Card style={{ textAlign: 'center', padding: 28 }}>
        {flash && !showTip ? (
          <>
            <div style={{ fontSize: 80 }}>{s.emoji}</div>
            <div style={{ fontSize: 15, color: '#8a7f9e', marginTop: 8 }}>What sign is this? 🤔</div>
            <div style={{ marginTop: 12 }}><Btn onClick={() => setShowTip(true)}>Reveal 👀</Btn></div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 80 }}>{s.emoji}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#1A1040', marginTop: 8 }}>{s.sign}</div>
            <Card style={{ marginTop: 12, background: 'linear-gradient(180deg,#f4ecff,#e9dcf9)', textAlign: 'left' }}>
              <b>💡 Tip:</b>
              <div style={{ fontSize: 14, marginTop: 4 }}>{s.tip}</div>
            </Card>
            <div style={{ fontSize: 12, color: '#8a7f9e', marginTop: 8 }}>📹 GIF/video demos coming — watch the full tutorial above for now!</div>
          </>
        )}
      </Card>

      <div className="row" style={{ marginTop: 12 }}>
        <Btn color="cream" onClick={() => { setIdx((idx + ASL_SIGNS.length - 1) % ASL_SIGNS.length); setShowTip(false); }}>← Prev</Btn>
        <div style={{ flex: 1 }} />
        <Btn color={learned.includes(s.sign) ? 'green' : 'orange'} onClick={() => {
          setLearned((l) => l.includes(s.sign) ? l : [...l, s.sign]);
          toast('⭐ ' + s.sign + ' learned!');
        }}>{learned.includes(s.sign) ? '✓ Learned!' : 'Got it! ⭐'}</Btn>
        <div style={{ flex: 1 }} />
        <Btn color="cream" onClick={() => { setIdx((idx + 1) % ASL_SIGNS.length); setShowTip(false); }}>Next →</Btn>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}><span className="pill">{learned.length}/15 signs learned 🎉</span></div>

      <Card style={{ marginTop: 12 }}>
        <b>📘 Parent Guide</b>
        <div style={{ fontSize: 14, lineHeight: 1.7, marginTop: 6 }}>
          • Teach <b>one sign at a time</b> — master it before adding another.<br />
          • Pair every sign with the <b>real thing</b> (MORE + snack in hand).<br />
          • <b>Model constantly</b> — use the signs yourself all day.<br />
          • Celebrate <b>every attempt</b>, even approximations!<br />
          • For nonverbal kids: accept <b>any consistent gesture</b> as the sign.<br />
          • Practice during <b>calm, happy moments</b> — never mid-meltdown.
        </div>
      </Card>
    </div>
  );
}