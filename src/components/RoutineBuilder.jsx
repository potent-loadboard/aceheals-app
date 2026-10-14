import React, { useState } from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { useStored, toast, speak } from '../lib/store.js';

// One-Tap Routine Builder — visual routines in seconds, not hours
const ROUTINE_TEMPLATES = {
  morning: {
    name: '☀️ Morning', emoji: '☀️',
    steps: [
      { emoji: '🛏️', label: 'Get out of bed' },
      { emoji: '🚽', label: 'Potty' },
      { emoji: '🪥', label: 'Brush teeth' },
      { emoji: '👕', label: 'Get dressed' },
      { emoji: '🍳', label: 'Eat breakfast' },
      { emoji: '🎒', label: 'Pack bag' },
      { emoji: '👟', label: 'Shoes on' },
    ],
  },
  meals: {
    name: '🍽️ Mealtime', emoji: '🍽️',
    steps: [
      { emoji: '🧼', label: 'Wash hands' },
      { emoji: '🪑', label: 'Sit at table' },
      { emoji: '🍽️', label: 'Eat' },
      { emoji: '🥤', label: 'Drink' },
      { emoji: '🍽️', label: 'Clear plate' },
      { emoji: '🧼', label: 'Wash hands' },
    ],
  },
  school: {
    name: '🎒 School', emoji: '🎒',
    steps: [
      { emoji: '🎒', label: 'Pack backpack' },
      { emoji: '👟', label: 'Shoes & coat' },
      { emoji: '🚗', label: 'Go to school' },
      { emoji: '👋', label: 'Say goodbye' },
      { emoji: '📚', label: 'Learn & play' },
      { emoji: '🏠', label: 'Come home' },
    ],
  },
  bath: {
    name: '🛁 Bath Time', emoji: '🛁',
    steps: [
      { emoji: '👕', label: 'Undress' },
      { emoji: '🛁', label: 'Get in tub' },
      { emoji: '🧼', label: 'Wash body' },
      { emoji: '🧴', label: 'Wash hair' },
      { emoji: '🚿', label: 'Rinse' },
      { emoji: '🏖️', label: 'Dry off' },
      { emoji: '👕', label: 'Pajamas on' },
    ],
  },
  bedtime: {
    name: '🌙 Bedtime', emoji: '🌙',
    steps: [
      { emoji: '🧸', label: 'Pick stuffed animal' },
      { emoji: '🪥', label: 'Brush teeth' },
      { emoji: '🚽', label: 'Potty' },
      { emoji: '👕', label: 'Pajamas' },
      { emoji: '📖', label: 'Read a book' },
      { emoji: '💡', label: 'Lights low' },
      { emoji: '😴', label: 'Sleep' },
    ],
  },
};

export default function RoutineBuilder({ kidId = 'manny' }) {
  const [routines, setRoutines] = useStored(`${kidId}Routines`, {});
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [doneSteps, setDoneSteps] = useState([]);

  const createFromTemplate = (key) => {
    const t = ROUTINE_TEMPLATES[key];
    setRoutines((r) => ({ ...r, [key]: t.steps.map((s, i) => ({ ...s, id: i })) }));
    toast(`✅ ${t.name} routine created!`);
  };

  const startRoutine = (key) => {
    setActiveRoutine(key);
    setDoneSteps([]);
    const r = routines[key];
    if (r?.length > 0) speak(`Let's do the ${ROUTINE_TEMPLATES[key].name} routine! First: ${r[0].label}`);
  };

  const toggleStep = (idx) => {
    const isDone = doneSteps.includes(idx);
    if (isDone) {
      setDoneSteps(doneSteps.filter((i) => i !== idx));
    } else {
      const next = [...doneSteps, idx];
      setDoneSteps(next);
      const routine = routines[activeRoutine];
      // Speak the next step
      const nextIdx = routine.findIndex((_, i) => !next.includes(i));
      if (nextIdx === -1) {
        speak('Amazing! Routine complete! You did it!');
        toast('🎉 Routine complete! Amazing!');
      } else {
        speak(`Good job! Next: ${routine[nextIdx].label}`);
      }
    }
  };

  if (activeRoutine) {
    const routine = routines[activeRoutine];
    const template = ROUTINE_TEMPLATES[activeRoutine];
    const progress = Math.round((doneSteps.length / routine.length) * 100);
    return (
      <div>
        <SectionHead title={`${template.emoji} ${template.name}`} />
        <Card>
          <div style={{ marginBottom: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <b>{doneSteps.length} of {routine.length} done</b>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 12, background: 'rgba(255,255,255,.1)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#2ECC71,#8fe6b3)', transition: 'width .3s' }} />
            </div>
          </div>
          {routine.map((step, i) => {
            const done = doneSteps.includes(i);
            return (
              <button key={step.id} onClick={() => toggleStep(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  background: done ? 'rgba(46,204,113,.2)' : 'rgba(255,255,255,.06)',
                  border: `2px solid ${done ? '#2ECC71' : 'rgba(255,255,255,.15)'}`,
                  borderRadius: 16, padding: 14, marginBottom: 8, cursor: 'pointer',
                  opacity: done ? 0.7 : 1, color: '#fff', textAlign: 'left',
                }}>
                <div style={{ fontSize: 36 }}>{done ? '✅' : step.emoji}</div>
                <div style={{ flex: 1, fontSize: 17, fontWeight: 700, textDecoration: done ? 'line-through' : 'none' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 20 }}>{done ? '✅' : '⭕'}</div>
              </button>
            );
          })}
        </Card>
        <div className="row" style={{ marginTop: 12 }}>
          <Btn color="cream" onClick={() => setActiveRoutine(null)}>← All routines</Btn>
          <div style={{ flex: 1 }} />
          <Btn color="cream" onClick={() => setDoneSteps([])}>🔄 Restart</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title="📋 Routines" />
      <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 12, textAlign: 'center' }}>
        One tap to create. Tap a routine to start it — the app reads each step aloud!
      </div>
      <div className="grid2">
        {Object.entries(ROUTINE_TEMPLATES).map(([key, t]) => {
          const exists = routines[key];
          return (
            <Card key={key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>{t.emoji}</div>
              <b>{t.name}</b>
              <div style={{ fontSize: 12, color: '#8a7f9e', margin: '4px 0 8px' }}>
                {t.steps.length} steps
              </div>
              {exists ? (
                <Btn block color="green" onClick={() => startRoutine(key)}>▶️ Start</Btn>
              ) : (
                <Btn block color="orange" onClick={() => createFromTemplate(key)}>➕ Create</Btn>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
