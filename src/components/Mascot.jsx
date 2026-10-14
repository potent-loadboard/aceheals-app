import React, { useState, useEffect } from 'react';
import { Card, Btn } from './ui.jsx';
import { speak, stopSpeak } from '../lib/store.js';

// Living mascots — characters with personalities who react to the kids
const MASCOTS = {
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
  const mascot = MASCOTS[kidId] || MASCOTS.manny;
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const lines = mascot[mood] || mascot.greetings;
    const line = lines[Math.floor(Math.random() * lines.length)];
    setMessage(line);
    // Speak the message (emoji-stripped by speak())
    const t = setTimeout(() => speak(line, kidId === 'maverick' ? 0.75 : 0.9), 500);
    return () => { clearTimeout(t); stopSpeak(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  if (!visible) return null;

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
          <b style={{ color: mascot.color, fontSize: 16 }}>{mascot.name} says:</b>
          <div style={{ fontSize: 15, marginTop: 4, lineHeight: 1.5 }}>{message}</div>
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
