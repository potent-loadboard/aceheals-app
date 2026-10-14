import React, { useState, useEffect } from 'react';
import { Card, Btn } from './ui.jsx';
import { speak, stopSpeak, useStored } from '../lib/store.js';

// Living mascots — characters with personalities who react to the kids
const MASCOTS = {
  griffin: {
    name: 'Giffy',
    emoji: '🦅',
    subtitle: 'baby griffin',
    color: '#F1C40F',
    personality: 'brave, cuddly, and a little clumsy',
    greetings: [
      "RAWR! I mean... hi! I'm Giffy! I'm a baby griffin! Wanna play?",
      "Hi hi hi! I'm Giffy! I'm still learning to fly — wanna learn with me?",
      "*flaps tiny wings* I'm Giffy! Let's have the BEST day ever!",
    ],
    praise: [
      "RAWR! That was AMAZING! I'm doing a happy wing-flap!",
      "You did it! I'm so proud I could fly! ...well, almost fly!",
      "WOW WOW WOW! You're the best! Can I be your sidekick?",
    ],
    encourage: [
      "It's okay! Baby griffins fall down too! Let's try again!",
      "Hmm... even my eagle eyes need practice! You got this!",
    ],
    goodbye: [
      "Bye bye! I'll be practicing my flying! *flap flap*",
      "See you soon! Dream of flying!",
    ],
  },
  manny: {
    name: 'Ziggy',
    emoji: '🦊',
    color: '#FF6B35',
    personality: 'adventurous and silly',
    greetings: [
      "Hey Manny! It's me, Ziggy! Ready for an adventure?",
      "Manny! You're here! I was just thinking about you!",
      "Let's do something AMAZING today!",
    ],
    praise: [
      "WOW! You're incredible!",
      "That's AMAZING! High five!",
      "You're so smart! I'm doing a happy dance!",
      "YES! You did it! You're my hero!",
    ],
    encourage: [
      "It's okay! Even superheroes need practice!",
      "Try again — I believe in you!",
      "Hmm, let's think together... you've got this!",
    ],
    goodbye: [
      "Bye Manny! You're the best!",
      "See you soon, superstar!",
    ],
  },
  maverick: {
    name: 'Luna',
    emoji: '🦉',
    color: '#9B59B6',
    personality: 'calm and gentle',
    greetings: [
      "Hi Maverick. It's Luna. I'm glad you're here.",
      "Hello, friend. Let's have a calm, happy time.",
    ],
    praise: [
      "That was wonderful. I'm proud of you.",
      "You did so well. Take a deep breath — you earned it.",
      "Beautiful work, Maverick.",
    ],
    encourage: [
      "It's okay. There's no rush. Try when you're ready.",
      "Take your time. I'm right here with you.",
    ],
    goodbye: [
      "Goodbye for now. You did great today.",
      "Rest well, friend. I'll be here when you come back.",
    ],
  },
};

export function Mascot({ kidId = 'manny', mood = 'greeting', onDone }) {
  const [buddy, setBuddy] = useStored(`${kidId}Buddy`, kidId === 'maverick' ? 'maverick' : 'griffin');
  const mascot = MASCOTS[buddy] || MASCOTS.griffin;
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(true);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    const lines = mascot[mood] || mascot.greetings;
    const line = lines[Math.floor(Math.random() * lines.length)];
    setMessage(line);
    // Speak the message (emoji-stripped by speak())
    const t = setTimeout(() => speak(line, buddy === 'maverick' ? 0.75 : 0.95), 500);
    return () => { clearTimeout(t); stopSpeak(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, buddy]);

  if (!visible) return null;

  if (picking) {
    return (
      <Card style={{ marginBottom: 12, textAlign: 'center' }}>
        <b style={{ fontSize: 18 }}>🦸 Choose your buddy!</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 12px' }}>Who do you want hanging out with you?</div>
        <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
          {Object.entries(MASCOTS).map(([id, m]) => (
            <button key={id} onClick={() => { setBuddy(id); setPicking(false); }}
              style={{
                background: buddy === id ? `${m.color}33` : 'rgba(255,255,255,.1)',
                border: `3px solid ${buddy === id ? m.color : 'rgba(255,255,255,.2)'}`,
                borderRadius: 20, padding: 12, cursor: 'pointer', minWidth: 100,
              }}>
              <div style={{ fontSize: 44 }}>{m.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: '#8a7f9e' }}>{m.subtitle || m.personality.split(',')[0]}</div>
            </button>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card style={{
      background: `linear-gradient(135deg, ${mascot.color}22, ${mascot.color}44)`,
      borderColor: mascot.color, borderWidth: 2, marginBottom: 12,
    }}>
      <div className="row" style={{ gap: 12, alignItems: 'center' }}>
        <div style={{
          fontSize: 56, animation: 'kid-bob 2s ease-in-out infinite',
          filter: `drop-shadow(0 0 12px ${mascot.color})`,
        }}>
          {mascot.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <b style={{ color: mascot.color, fontSize: 16 }}>{mascot.name} {mascot.subtitle ? `(${mascot.subtitle})` : ''} says:</b>
          <div style={{ fontSize: 15, marginTop: 4, lineHeight: 1.5 }}>{message}</div>
          <button onClick={() => setPicking(true)}
            style={{ background: 'none', border: 'none', color: mascot.color, textDecoration: 'underline', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: 0 }}>
            🔄 Change buddy
          </button>
        </div>
        <button onClick={() => { setVisible(false); stopSpeak(); onDone?.(); }}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', opacity: 0.5 }}>✕</button>
      </div>
    </Card>
  );
}

// Hook to trigger mascot reactions from game events
export function useMascot(kidId = 'manny') {
  const [mood, setMood] = useState('greeting');
  const [key, setKey] = useState(0);

  const react = (newMood) => {
    setMood(newMood);
    setKey((k) => k + 1);
  };

  const MascotView = () => <Mascot key={key} kidId={kidId} mood={mood} />;

  return { react, MascotView };
}

export default Mascot;
