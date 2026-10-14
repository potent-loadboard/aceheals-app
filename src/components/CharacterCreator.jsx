import React, { useState } from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { useStored, toast, speak } from '../lib/store.js';

// Character Creator — kids design their own buddy from scratch
const BODIES = [
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'eagle', emoji: '🦅', name: 'Eagle' },
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'frog', emoji: '🐸', name: 'Frog' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
  { id: 'robot', emoji: '🤖', name: 'Robot' },
  { id: 'alien', emoji: '👽', name: 'Alien' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
];

const HATS = [
  { id: 'none', emoji: '', name: 'No hat' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'cap', emoji: '🧢', name: 'Cap' },
  { id: 'tophat', emoji: '🎩', name: 'Top hat' },
  { id: 'party', emoji: '🥳', name: 'Party hat' },
  { id: 'cowboy', emoji: '🤠', name: 'Cowboy' },
  { id: 'santa', emoji: '🎅', name: 'Santa' },
  { id: 'grad', emoji: '🎓', name: 'Grad cap' },
];

const GLASSES = [
  { id: 'none', emoji: '', name: 'No glasses' },
  { id: 'cool', emoji: '🕶️', name: 'Cool shades' },
  { id: 'nerd', emoji: '🤓', name: 'Smart glasses' },
  { id: 'star', emoji: '🤩', name: 'Star eyes' },
];

const EXTRAS = [
  { id: 'none', emoji: '', name: 'Nothing' },
  { id: 'cape', emoji: '🦸', name: 'Super cape' },
  { id: 'bow', emoji: '🎀', name: 'Bow' },
  { id: 'flower', emoji: '🌸', name: 'Flower' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning' },
  { id: 'heart', emoji: '💛', name: 'Heart' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
];

const COLORS = [
  { id: 'orange', hex: '#FF6B35', name: 'Orange' },
  { id: 'purple', hex: '#9B59B6', name: 'Purple' },
  { id: 'blue', hex: '#3498DB', name: 'Blue' },
  { id: 'pink', hex: '#E91E8C', name: 'Pink' },
  { id: 'green', hex: '#2ECC71', name: 'Green' },
  { id: 'yellow', hex: '#F1C40F', name: 'Yellow' },
  { id: 'red', hex: '#e74c3c', name: 'Red' },
  { id: 'teal', hex: '#1abc9c', name: 'Teal' },
];

const PERSONALITIES = [
  { id: 'silly', name: '🤪 Silly', desc: 'loves jokes and being goofy' },
  { id: 'brave', name: '🦸 Brave', desc: 'never afraid of adventure' },
  { id: 'calm', name: '🧘 Calm', desc: 'peaceful and gentle' },
  { id: 'curious', name: '🔍 Curious', desc: 'always asking questions' },
  { id: 'kind', name: '💛 Kind', desc: 'helps everyone' },
  { id: 'wild', name: '🎉 Wild', desc: 'full of energy!' },
];

export default function CharacterCreator({ kidId = 'manny', onDone }) {
  const [character, setCharacter] = useStored(`${kidId}Character`, null);
  const [draft, setDraft] = useState(character || {
    body: 'fox', hat: 'none', glasses: 'none', extra: 'none',
    color: 'orange', personality: 'silly', name: '',
  });
  const [step, setStep] = useState(0);

  const update = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  const body = BODIES.find((b) => b.id === draft.body);
  const hat = HATS.find((h) => h.id === draft.hat);
  const glasses = GLASSES.find((g) => g.id === draft.glasses);
  const extra = EXTRAS.find((e) => e.id === draft.extra);
  const color = COLORS.find((c) => c.id === draft.color);
  const personality = PERSONALITIES.find((p) => p.id === draft.personality);

  const save = () => {
    if (!draft.name.trim()) { toast('✏️ Give your buddy a name first!'); return; }
    setCharacter(draft);
    toast(`🎉 ${draft.name} is ready to play!`);
    speak(`Wow! ${draft.name} is awesome! Let's play!`);
    onDone?.();
  };

  const steps = ['Body', 'Hat', 'Glasses', 'Extra', 'Color', 'Personality', 'Name'];

  const renderPreview = (size = 100) => (
    <div style={{
      position: 'relative', width: size * 1.4, height: size * 1.4, margin: '0 auto',
      background: `radial-gradient(circle, ${color.hex}33, ${color.hex}11)`,
      borderRadius: '50%', border: `3px solid ${color.hex}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ fontSize: size, animation: 'kid-bob 2s ease-in-out infinite' }}>{body.emoji}</div>
      {hat.emoji && (
        <div style={{ position: 'absolute', top: size * 0.05, fontSize: size * 0.4 }}>{hat.emoji}</div>
      )}
      {glasses.emoji && (
        <div style={{ position: 'absolute', top: size * 0.42, fontSize: size * 0.35 }}>{glasses.emoji}</div>
      )}
      {extra.emoji && (
        <div style={{ position: 'absolute', bottom: size * 0.08, right: size * 0.1, fontSize: size * 0.35 }}>{extra.emoji}</div>
      )}
    </div>
  );

  const OptionGrid = ({ options, selected, onPick, emojiKey = 'emoji', nameKey = 'name' }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
      {options.map((o) => (
        <button key={o.id} onClick={() => onPick(o.id)}
          style={{
            background: selected === o.id ? `${color.hex}44` : 'rgba(255,255,255,.08)',
            border: `2px solid ${selected === o.id ? color.hex : 'rgba(255,255,255,.2)'}`,
            borderRadius: 16, padding: '8px 12px', cursor: 'pointer', minWidth: 70,
            color: '#fff', fontSize: 13,
          }}>
          {o[emojiKey] && <div style={{ fontSize: 32 }}>{o[emojiKey]}</div>}
          {o.hex && <div style={{ width: 32, height: 32, borderRadius: '50%', background: o.hex, margin: '0 auto' }} />}
          <div style={{ fontWeight: 700, marginTop: 4 }}>{o[nameKey]}</div>
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <SectionHead title="🎨 Design Your Buddy!" />
      {/* Progress */}
      <div className="row" style={{ justifyContent: 'center', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={s} style={{
            padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 800,
            background: i === step ? color.hex : i < step ? '#2ECC71' : 'rgba(255,255,255,.1)',
            color: i <= step ? '#fff' : '#8a7f9e',
          }}>
            {i < step ? '✓ ' : ''}{s}
          </div>
        ))}
      </div>

      <Card style={{ textAlign: 'center' }}>
        {renderPreview(90)}
        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>
          {draft.name || '???'} {personality && <span style={{ fontSize: 14, fontWeight: 400 }}>• {personality.name}</span>}
        </div>
      </Card>

      <Card style={{ marginTop: 10 }}>
        {step === 0 && (<><b>🦊 Pick your animal!</b><OptionGrid options={BODIES} selected={draft.body} onPick={(v) => update('body', v)} /></>)}
        {step === 1 && (<><b>👑 Pick a hat!</b><OptionGrid options={HATS} selected={draft.hat} onPick={(v) => update('hat', v)} /></>)}
        {step === 2 && (<><b>🕶️ Pick glasses!</b><OptionGrid options={GLASSES} selected={draft.glasses} onPick={(v) => update('glasses', v)} /></>)}
        {step === 3 && (<><b>✨ Pick something extra!</b><OptionGrid options={EXTRAS} selected={draft.extra} onPick={(v) => update('extra', v)} /></>)}
        {step === 4 && (<><b>🎨 Pick a favorite color!</b><OptionGrid options={COLORS} selected={draft.color} onPick={(v) => update('color', v)} /></>)}
        {step === 5 && (
          <>
            <b>💫 What's your buddy like?</b>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              {PERSONALITIES.map((p) => (
                <button key={p.id} onClick={() => update('personality', p.id)}
                  style={{
                    background: draft.personality === p.id ? `${color.hex}44` : 'rgba(255,255,255,.08)',
                    border: `2px solid ${draft.personality === p.id ? color.hex : 'rgba(255,255,255,.2)'}`,
                    borderRadius: 16, padding: '10px 14px', cursor: 'pointer', color: '#fff',
                  }}>
                  <div style={{ fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 6 && (
          <>
            <b>✏️ Name your buddy!</b>
            <input className="input-gloss" placeholder="Type a name..." value={draft.name}
              onChange={(e) => update('name', e.target.value.slice(0, 20))}
              style={{ textAlign: 'center', fontSize: 24, marginTop: 12 }} maxLength={20} />
            <div style={{ fontSize: 13, color: '#8a7f9e', marginTop: 8 }}>
              {body.name} • {personality.name} • loves {color.name.toLowerCase()}
            </div>
          </>
        )}

        <div className="row" style={{ marginTop: 16, gap: 8 }}>
          {step > 0 && <Btn color="cream" onClick={() => setStep(step - 1)}>← Back</Btn>}
          <div style={{ flex: 1 }} />
          {step < 6
            ? <Btn color="orange" onClick={() => setStep(step + 1)}>Next →</Btn>
            : <Btn color="green" onClick={save} style={{ fontSize: 18 }}>🎉 Done! Let's Play!</Btn>}
        </div>
      </Card>
    </div>
  );
}

// Compact display of the kid's custom character (for headers, etc.)
export function CharacterBadge({ kidId = 'manny', size = 40 }) {
  const [character] = useStored(`${kidId}Character`, null);
  if (!character) return null;
  const body = BODIES.find((b) => b.id === character.body);
  const color = COLORS.find((c) => c.id === character.color);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title={`${character.name} — ${character.personality}`}>
      <div style={{
        fontSize: size, background: `${color.hex}33`, borderRadius: '50%',
        border: `2px solid ${color.hex}`, width: size + 16, height: size + 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {body.emoji}
      </div>
      <b style={{ fontSize: 14 }}>{character.name}</b>
    </div>
  );
}
