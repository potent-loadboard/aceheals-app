import React from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { useStored, toast } from '../lib/store.js';

// Sensory Settings — one panel for everything sensory.
// Reduce motion, high contrast, bigger targets, mute celebrations, calm palette.
// This is table stakes for autism/sensory-friendly apps.
const DEFAULT_SENSORY = {
  reduceMotion: false,
  highContrast: false,
  largeTargets: false,
  muteCelebrations: false,
  calmPalette: false,
  dimBrightness: false,
};

export function useSensory() {
  const [sensory, setSensory] = useStored('sensorySettings', DEFAULT_SENSORY);
  const update = (patch) => setSensory((s) => ({ ...s, ...patch }));
  const reset = () => setSensory(DEFAULT_SENSORY);
  return { sensory, update, reset };
}

export default function SensorySettings() {
  const { sensory, update, reset } = useSensory();

  const Toggle = ({ id, emoji, title, desc }) => (
    <button onClick={() => { update({ [id]: !sensory[id] }); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        background: sensory[id] ? 'rgba(46,204,113,.15)' : 'rgba(255,255,255,.06)',
        border: `2px solid ${sensory[id] ? '#2ECC71' : 'rgba(255,255,255,.15)'}`,
        borderRadius: 16, padding: 14, marginBottom: 8, cursor: 'pointer',
        color: '#fff', textAlign: 'left',
      }}>
      <div style={{ fontSize: 32 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <b style={{ fontSize: 16 }}>{title}</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{
        width: 52, height: 30, borderRadius: 15,
        background: sensory[id] ? '#2ECC71' : 'rgba(255,255,255,.2)',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: sensory[id] ? 25 : 3,
          transition: 'left .2s', boxShadow: '0 2px 4px rgba(0,0,0,.3)',
        }} />
      </div>
    </button>
  );

  const anyOn = Object.values(sensory).some(Boolean);

  return (
    <div>
      <SectionHead title="🎛️ Sensory Settings" />
      <Card style={{ background: 'linear-gradient(180deg,#1a2a3e,#0f1a2e)', borderColor: '#3498DB', marginBottom: 12 }}>
        <div style={{ fontSize: 14, textAlign: 'center' }}>
          Every kid is different. Tune the app to <b>your</b> child's sensory needs.<br />
          <span style={{ color: '#8a7f9e' }}>Changes apply instantly across the whole app.</span>
        </div>
      </Card>

      <Toggle id="reduceMotion" emoji="🐌"
        title="Reduce motion"
        desc="Stops bouncy animations, floating effects, and auto-playing motion." />
      <Toggle id="highContrast" emoji="◐"
        title="High contrast"
        desc="Stronger borders, bolder text. Easier to see everything." />
      <Toggle id="largeTargets" emoji="👆"
        title="Bigger touch targets"
        desc="All buttons get 30% bigger. Easier for little fingers." />
      <Toggle id="muteCelebrations" emoji="🔇"
        title="Quiet celebrations"
        desc="No loud sounds or confetti bursts. Gentle praise only." />
      <Toggle id="calmPalette" emoji="🌊"
        title="Calm colors"
        desc="Mutes neon brights to soft pastels. Less visual stimulation." />
      <Toggle id="dimBrightness" emoji="🌙"
        title="Dim mode"
        desc="Darkens the whole app for light-sensitive eyes." />

      {anyOn && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Btn color="cream" onClick={() => { reset(); toast('🎛️ Sensory settings reset'); }}>
            Reset all
          </Btn>
        </div>
      )}

      <Card style={{ marginTop: 12, background: 'linear-gradient(180deg,#fff8ec,#ffefd6)' }}>
        <div style={{ fontSize: 13 }}>
          💡 <b>Tip:</b> Set this up once per child. Maverick might want calm colors + reduce motion, while Manny wants everything bright and bouncy. That's the point — it's <i>their</i> app.
        </div>
      </Card>
    </div>
  );
}
