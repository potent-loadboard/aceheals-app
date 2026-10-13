import React, { useState } from 'react';
import { Card, Btn, SectionHead, TrialBanner, Footer, PBar } from '../components/ui.jsx';
import { useStored, useStreak, todayKey, toast } from '../lib/store.js';
import { PLANS } from '../lib/paywall.js';

const CHECKLIST = [
  { id: 'playlist', label: 'Try a calming playlist', emoji: '🎵' },
  { id: 'scan', label: 'Scan a food label', emoji: '🔍' },
  { id: 'aac', label: 'Practice AAC board', emoji: '💬' },
  { id: 'potty', label: 'Log potty attempt', emoji: '🚽' },
  { id: 'win', label: 'Share a win with the community', emoji: '❤️' },
];

const QUICK = [
  { id: 'scan', label: 'Scan Food', emoji: '🔍', color: 'green', tab: 'heal' },
  { id: 'aac', label: 'AAC Board', emoji: '💬', color: 'blue', tab: 'maverick' },
  { id: 'potty', label: 'Potty Log', emoji: '🚽', color: 'yellow', tab: 'potty' },
  { id: 'calm', label: 'Calm Mode', emoji: '🌊', color: 'purple', tab: 'music' },
  { id: 'recipe', label: 'Get Recipe', emoji: '🍎', color: 'orange', tab: 'recipes' },
  { id: 'wins', label: 'Community Wins', emoji: '❤️', color: 'pink', tab: 'together' },
];

export default function Home({ go, onDisclaimer, onUpgrade, children: activeChild }) {
  const streak = useStreak();
  const [done, setDone] = useStored('checklist:' + todayKey(), []);
  const [kids] = useStored('kids', [
    { id: 'mav', name: 'Maverick', emoji: '⚡' },
    { id: 'man', name: 'Manny', emoji: '🎮' },
  ]);
  const [activeId, setActiveId] = useStored('activeChild', 'mav');
  const child = kids.find((k) => k.id === activeId) || kids[0] || { name: 'Your child', emoji: '🌟' };

  const toggle = (id) => {
    setDone((d) => {
      const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
      if (!d.includes(id) && next.length === CHECKLIST.length) {
        setTimeout(() => toast('🎉 All 5 done! Incredible day!'), 100);
      }
      return next;
    });
  };

  const score = Math.round((done.length / CHECKLIST.length) * 100);

  return (
    <div className="screen">
      <TrialBanner onUpgrade={onUpgrade} />

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#1A1040' }}>🌿 Good day, parent!</h2>
        <span className="streak-badge">🔥 {streak} day{streak === 1 ? '' : 's'}</span>
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ fontSize: 40 }}>{child.emoji}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1A1040' }}>{child.name}</div>
              <div style={{ fontSize: 12, color: '#8a7f9e' }}>Your Streak Score <span title="Not a medical metric">ⓘ</span></div>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FF6B35' }}>{score}</div>
        </div>
        <div style={{ marginTop: 10 }}><PBar pct={score} color="#FF6B35" /></div>
        {kids.length > 1 && (
          <div className="row" style={{ marginTop: 10, gap: 6, flexWrap: 'wrap' }}>
            {kids.map((k) => (
              <button key={k.id} onClick={() => setActiveId(k.id)} className="pill"
                style={k.id === activeId ? { background: 'linear-gradient(180deg,#ffb08a,#FF6B35)', color: '#fff', borderColor: '#FF6B35' } : {}}>
                {k.emoji} {k.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      <SectionHead title="🎯 Today's Focus" />
      {CHECKLIST.map((c) => (
        <div key={c.id} className={`check-item${done.includes(c.id) ? ' done' : ''}`} onClick={() => toggle(c.id)}>
          <div className="check-box">{done.includes(c.id) ? '✓' : ''}</div>
          <div style={{ fontSize: 22 }}>{c.emoji}</div>
          <div style={{ fontWeight: 700, textDecoration: done.includes(c.id) ? 'line-through' : 'none' }}>{c.label}</div>
        </div>
      ))}

      <SectionHead title="⚡ Quick Actions" />
      <div className="grid3">
        {QUICK.map((q) => (
          <button key={q.id} className="game-btn" onClick={() => go(q.tab)}
            style={{ '--g1': `color-mix(in srgb, ${c2hex(q.color)} 55%, white)`, '--g2': c2hex(q.color), '--g3': `color-mix(in srgb, ${c2hex(q.color)} 75%, black)`, fontSize: 13, padding: '14px 6px' }}>
            <div style={{ fontSize: 26 }}>{q.emoji}</div>{q.label}
          </button>
        ))}
      </div>

      <SectionHead title="🌟 Their Worlds" />
      <div className="grid2">
        <Card onClick={() => go('maverick')} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>⚡</div>
          <b style={{ color: '#1A1040' }}>Maverick's World</b>
          <div style={{ fontSize: 12, color: '#8a7f9e' }}>AAC • Calm tools • Schedule</div>
        </Card>
        <Card onClick={() => go('manny')} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>🎮</div>
          <b style={{ color: '#1A1040' }}>Manny's World</b>
          <div style={{ fontSize: 12, color: '#8a7f9e' }}>22 games • ASL • Rewards</div>
        </Card>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card style={{ background: 'linear-gradient(180deg,#fff,#fef3e2)' }}>
          <b style={{ color: '#1A1040' }}>💛 Why AceHeals Exists</b>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: '8px 0 0' }}>
            Other programs charge $500+ for PDFs. We built a live app with real tools.
            One family's experience, made affordable for every family.
          </p>
        </Card>
      </div>

      <SectionHead title="💳 Simple Pricing" />
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <b style={{ fontSize: 18 }}>{PLANS.lifetime.label}</b><span className="pill">FEATURED</span>
        </div>
        <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 10 }}>{PLANS.lifetime.note} 24-hour free trial, no card needed.</div>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span>or <b>{PLANS.monthly.label}</b> — {PLANS.monthly.note}</span>
        </div>
        <Btn block onClick={onUpgrade}>See Plans 💛</Btn>
        <div style={{ fontSize: 12, color: '#8a7f9e', textAlign: 'center', marginTop: 8 }}>30-day money-back guarantee</div>
      </Card>

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}

function c2hex(c) {
  return { orange: '#FF6B35', green: '#2ECC71', blue: '#3498DB', purple: '#9B59B6', yellow: '#F1C40F', pink: '#E91E8C' }[c] || '#FF6B35';
}
