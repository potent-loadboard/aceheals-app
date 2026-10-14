import React, { useState, useEffect } from 'react';
import { Card, Btn } from './ui.jsx';
import { useStored, toast, speak } from '../lib/store.js';

// Screen-Time Wind-Down — gentle exit ramp, no abrupt cutoff, no meltdown.
// When the parent-set time limit hits, the mascot says goodbye,
// a breathing animation plays, and the app softly locks.
export default function WindDown({ kidId = 'manny', onComplete }) {
  const [stage, setStage] = useState(0); // 0=warning, 1=goodbye, 2=breathing, 3=locked
  const [buddy] = useStored(`${kidId}Buddy`, 'griffin');
  const [character] = useStored(`${kidId}Character`, null);

  const MASCOT_EMOJI = { griffin: '🦅', manny: '🦊', maverick: '🦉' };
  const MASCOT_NAME = { griffin: 'Giffy', manny: 'Ziggy', maverick: 'Luna' };

  useEffect(() => {
    if (stage === 0) {
      speak(`Time is almost up! Let's say goodbye nicely.`);
      const t = setTimeout(() => setStage(1), 8000);
      return () => clearTimeout(t);
    }
    if (stage === 1) {
      const name = character?.name || MASCOT_NAME[buddy];
      speak(`Goodbye! ${name} had so much fun with you today! You're amazing!`);
      const t = setTimeout(() => setStage(2), 6000);
      return () => clearTimeout(t);
    }
    if (stage === 2) {
      const t = setTimeout(() => setStage(3), 20000); // 20s breathing
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage === 0) {
    return (
      <div className="modal-veil" style={{ zIndex: 9999 }}>
        <Card style={{ textAlign: 'center', maxWidth: 400, margin: '20vh auto' }}>
          <div style={{ fontSize: 56 }}>⏰</div>
          <b style={{ fontSize: 20 }}>5 more minutes!</b>
          <div style={{ fontSize: 15, color: '#8a7f9e', marginTop: 8 }}>
            Finish up what you're doing.<br />We'll say goodbye nicely soon. 💛
          </div>
        </Card>
      </div>
    );
  }

  if (stage === 1) {
    const emoji = MASCOT_EMOJI[buddy] || '🦅';
    const name = MASCOT_NAME[buddy] || 'Giffy';
    return (
      <div className="modal-veil" style={{ zIndex: 9999 }}>
        <Card style={{ textAlign: 'center', maxWidth: 400, margin: '15vh auto' }}>
          <div style={{ fontSize: 80, animation: 'kid-bob 2s ease-in-out infinite' }}>{emoji}</div>
          <b style={{ fontSize: 22 }}>{name} says goodbye! 👋</b>
          <div style={{ fontSize: 16, marginTop: 8 }}>
            "You were AMAZING today!<br />I'm so proud of you!<br />See you next time! 💛"
          </div>
          {character && (
            <div style={{ marginTop: 8, fontSize: 14, color: '#8a7f9e' }}>
              {character.name} will miss you too!
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (stage === 2) {
    return (
      <div className="modal-veil" style={{ zIndex: 9999, background: 'rgba(13,6,40,.97)' }}>
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
          <div style={{ fontSize: 18, color: '#c9b8e8', marginBottom: 20 }}>
            Let's take 3 calm breaths together 🌙
          </div>
          <BreathingBall />
          <div style={{ marginTop: 20 }}>
            <Btn size="sm" color="cream" onClick={() => setStage(3)}>I'm ready ✓</Btn>
          </div>
        </div>
      </div>
    );
  }

  // Locked
  return (
    <div className="modal-veil" style={{ zIndex: 9999, background: 'rgba(13,6,40,.98)' }}>
      <Card style={{ textAlign: 'center', maxWidth: 400, margin: '25vh auto' }}>
        <div style={{ fontSize: 56 }}>🌙</div>
        <b style={{ fontSize: 20 }}>All done for today!</b>
        <div style={{ fontSize: 15, color: '#8a7f9e', marginTop: 8 }}>
          Great playing! Time for real-world adventures. 💛
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: '#8a7f9e' }}>
          🔒 A grown-up can unlock with the parent PIN.
        </div>
        {onComplete && (
          <div style={{ marginTop: 12 }}>
            <Btn size="sm" color="cream" onClick={onComplete}>Grown-up unlock 🔓</Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

function BreathingBall() {
  const [big, setBig] = useState(true);
  const [count, setCount] = useState(1);
  useEffect(() => {
    const t = setInterval(() => {
      setBig((b) => !b);
      setCount((c) => (c >= 6 ? 1 : c + 1));
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      <div style={{
        width: big ? 180 : 100, height: big ? 180 : 100,
        borderRadius: '50%', margin: '0 auto',
        background: 'radial-gradient(circle, #9B59B655, #3498DB33)',
        border: '3px solid #9B59B6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 4s ease-in-out',
        boxShadow: '0 0 40px rgba(155,89,182,.4)',
      }}>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>
          {big ? 'breathe in…' : 'breathe out…'}
        </div>
      </div>
      <div style={{ marginTop: 12, color: '#8a7f9e' }}>Breath {Math.ceil(count / 2)} of 3</div>
    </div>
  );
}

// Hook to manage screen-time: tracks session, triggers wind-down at limit
export function useScreenTime(kidId = 'manny') {
  const [parent] = useStored('parentProfile', { dailyLimit: 60 });
  const [sessionStart] = useState(Date.now());
  const [windingDown, setWindingDown] = useState(false);
  const [todayMinutes] = useStored(`screenTime-${kidId}-${new Date().toDateString()}`, 0);

  useEffect(() => {
    if (!parent.dailyLimit) return;
    const check = setInterval(() => {
      const elapsed = (Date.now() - sessionStart) / 60000;
      const total = todayMinutes + elapsed;
      // 5-min warning
      if (total >= parent.dailyLimit - 5 && total < parent.dailyLimit && !windingDown) {
        setWindingDown('warning');
      }
      // Time's up
      if (total >= parent.dailyLimit && windingDown !== 'done') {
        setWindingDown('done');
      }
    }, 30000);
    return () => clearInterval(check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent.dailyLimit]);

  return { windingDown, setWindingDown };
}
