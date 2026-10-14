import React, { useState } from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { useStored, toast, speak } from '../lib/store.js';

// Sticker packs — unlock with stars earned from games
const STICKER_PACKS = [
  { id: 'animals', name: '🐾 Animals', cost: 10, stickers: ['🐶', '🐱', '🦁', '🐘', '🦒', '🐵', '🐸', '🦋'] },
  { id: 'space', name: '🚀 Space', cost: 20, stickers: ['🚀', '🪐', '⭐', '🌙', '👽', '🛸', '☄️', '🌍'] },
  { id: 'food', name: '🍕 Yummy', cost: 15, stickers: ['🍕', '🍔', '🍦', '🍩', '🍎', '🧁', '🍪', '🥤'] },
  { id: 'nature', name: '🌈 Nature', cost: 15, stickers: ['🌈', '🌻', '🦄', '🐝', '🍄', '🌊', '⛰️', '🌴'] },
  { id: 'vehicles', name: '🚗 Wheels', cost: 25, stickers: ['🚗', '🚀', '✈️', '🚁', '🚂', '🏎️', '🚲', '🛥️'] },
  { id: 'fantasy', name: '✨ Magic', cost: 30, stickers: ['🧙', '🐉', '🏰', '👑', '💎', '🔮', '🧚', '⚡'] },
];

const WORLD_BACKGROUNDS = [
  { id: 'day', name: '☀️ Sunny Day', css: 'linear-gradient(180deg,#87CEEB 0%,#B0E0E6 60%,#90EE90 100%)' },
  { id: 'night', name: '🌙 Starry Night', css: 'linear-gradient(180deg,#0d0628 0%,#1a0b4a 60%,#2d1b69 100%)' },
  { id: 'beach', name: '🏖️ Beach', css: 'linear-gradient(180deg,#87CEEB 0%,#FFE4B5 60%,#F4A460 100%)' },
  { id: 'space', name: '🌌 Outer Space', css: 'linear-gradient(180deg,#000000 0%,#1a0b4a 60%,#4a1a8a 100%)' },
];

export default function StickerWorld({ kidId = 'manny' }) {
  const [stars] = useStored(kidId === 'manny' ? 'mannyStars' : 'maverickStars', 0);
  const [unlocked, setUnlocked] = useStored(`${kidId}Stickers`, []);
  const [world, setWorld] = useStored(`${kidId}World`, []);
  const [bg, setBg] = useStored(`${kidId}WorldBg`, 'day');
  const [tab, setTab] = useState('world');
  const [selected, setSelected] = useState(null);

  const unlockPack = (pack) => {
    if (unlocked.includes(pack.id)) return;
    if (stars < pack.cost) {
      toast(`⭐ Need ${pack.cost} stars! Play games to earn more!`);
      speak(`You need ${pack.cost} stars. Play games to earn more!`);
      return;
    }
    setUnlocked((u) => [...u, pack.id]);
    toast(`🎉 ${pack.name} unlocked!`);
    speak(`Wow! You unlocked the ${pack.name} stickers!`);
  };

  const placeSticker = (sticker) => {
    if (world.length >= 30) { toast('🌍 World is full! Remove some stickers first.'); return; }
    // Place at random fun position
    const x = 10 + Math.random() * 70;
    const y = 15 + Math.random() * 60;
    const size = 36 + Math.random() * 28;
    setWorld((w) => [...w, { id: Date.now() + Math.random(), emoji: sticker, x, y, size }]);
  };

  const removeSticker = (id) => setWorld((w) => w.filter((s) => s.id !== id));
  const clearWorld = () => { setWorld([]); toast('🧹 World cleared! Start fresh!'); };

  const allStickers = STICKER_PACKS.filter((p) => unlocked.includes(p.id)).flatMap((p) => p.stickers);
  const currentBg = WORLD_BACKGROUNDS.find((b) => b.id === bg);

  return (
    <div>
      <SectionHead title="🌍 My World" right={<span className="streak-badge">⭐ {stars}</span>} />
      <div className="row" style={{ marginBottom: 12, gap: 6 }}>
        <Btn size="sm" color={tab === 'world' ? 'orange' : 'cream'} onClick={() => setTab('world')}>🌍 My World</Btn>
        <Btn size="sm" color={tab === 'shop' ? 'orange' : 'cream'} onClick={() => setTab('shop')}>🎁 Sticker Shop</Btn>
      </div>

      {tab === 'world' && (
        <div>
          <Card style={{ padding: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div className="row" style={{ justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                {WORLD_BACKGROUNDS.map((b) => (
                  <Btn key={b.id} size="sm" color={bg === b.id ? 'purple' : 'cream'} onClick={() => setBg(b.id)}>
                    {b.name}
                  </Btn>
                ))}
              </div>
            </div>
            {/* The world canvas */}
            <div style={{
              position: 'relative', height: 320, borderRadius: 20, overflow: 'hidden',
              background: currentBg.css, border: '3px solid rgba(255,255,255,.3)',
            }}>
              {bg === 'night' && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontSize: 12, color: '#fff', opacity: 0.7 }}>
                  {'✨ '.repeat(20)}
                </div>
              )}
              {world.length === 0 && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', color: 'rgba(255,255,255,.7)', fontSize: 14, textAlign: 'center', padding: 20,
                }}>
                  <div style={{ fontSize: 48 }}>🌍</div>
                  <div>Your world is empty!<br />Tap a sticker below to add it 👇</div>
                </div>
              )}
              {world.map((s) => (
                <div key={s.id}
                  onClick={() => removeSticker(s.id)}
                  style={{
                    position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
                    fontSize: s.size, cursor: 'pointer', transform: 'translate(-50%,-50%)',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.3))',
                    animation: 'kid-bob 2.4s ease-in-out infinite',
                  }}
                  title="Tap to remove">
                  {s.emoji}
                </div>
              ))}
            </div>
            {world.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Btn size="sm" color="cream" onClick={clearWorld}>🧹 Clear World</Btn>
                <div style={{ fontSize: 11, color: '#8a7f9e', marginTop: 4 }}>Tap a sticker to remove it</div>
              </div>
            )}
          </Card>

          {allStickers.length > 0 ? (
            <Card style={{ marginTop: 10 }}>
              <b>👆 Tap a sticker to add it to your world!</b>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, justifyContent: 'center' }}>
                {allStickers.map((s, i) => (
                  <button key={i} onClick={() => placeSticker(s)}
                    style={{
                      fontSize: 36, background: 'rgba(255,255,255,.15)', border: '2px solid rgba(255,255,255,.3)',
                      borderRadius: 16, padding: 8, cursor: 'pointer',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <Card style={{ marginTop: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>🎁</div>
              <b>No stickers yet!</b>
              <div style={{ fontSize: 14, color: '#8a7f9e', margin: '6px 0 10px' }}>
                Play games to earn ⭐ stars, then unlock sticker packs in the shop!
              </div>
              <Btn color="orange" onClick={() => setTab('shop')}>Visit Sticker Shop 🎁</Btn>
            </Card>
          )}
        </div>
      )}

      {tab === 'shop' && (
        <div className="grid2">
          {STICKER_PACKS.map((pack) => {
            const isUnlocked = unlocked.includes(pack.id);
            const canAfford = stars >= pack.cost;
            return (
              <Card key={pack.id} style={{ textAlign: 'center', opacity: isUnlocked ? 1 : 0.9 }}>
                <div style={{ fontSize: 32 }}>{pack.stickers.slice(0, 4).join(' ')}</div>
                <b>{pack.name}</b>
                <div style={{ fontSize: 12, color: '#8a7f9e', margin: '4px 0' }}>
                  {pack.stickers.length} stickers
                </div>
                {isUnlocked ? (
                  <div style={{ color: '#2ECC71', fontWeight: 800 }}>✅ Unlocked!</div>
                ) : (
                  <Btn size="sm" color={canAfford ? 'orange' : 'cream'}
                    onClick={() => unlockPack(pack)}
                    disabled={!canAfford}>
                    ⭐ {pack.cost} stars
                  </Btn>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
