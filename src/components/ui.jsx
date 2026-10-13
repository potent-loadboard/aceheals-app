import React, { useState, useEffect } from 'react';
import { DISCLAIMER } from '../lib/disclaimer.js';
import { PLANS, trialHoursLeft, trialActive, startCheckout } from '../lib/paywall.js';
import { toast } from '../lib/store.js';

export const C = {
  orange: '#FF6B35', navy: '#1A1040', green: '#2ECC71', blue: '#3498DB',
  purple: '#9B59B6', yellow: '#F1C40F', pink: '#E91E8C', red: '#e74c3c',
};

export function Btn({ children, color = 'orange', size, block, onClick, disabled, style }) {
  return (
    <button
      className={`btn-gloss btn-${color}${size === 'sm' ? ' btn-sm' : ''}${block ? ' btn-block' : ''}`}
      onClick={onClick} disabled={disabled} style={style}
    >{children}</button>
  );
}

export function Card({ children, style, onClick }) {
  return <div className="card-gloss" style={style} onClick={onClick}>{children}</div>;
}

export function SectionHead({ title, right }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {right}
    </div>
  );
}

export function Loading({ label }) {
  return <div><div className="spinner" /><div className="empty">{label || 'Loading…'}</div></div>;
}

export function Empty({ emoji, title, sub, action }) {
  return (
    <div className="empty">
      <div className="big">{emoji || '🌿'}</div>
      <div style={{ fontWeight: 800, color: '#1A1040', marginBottom: 4 }}>{title || 'Nothing here yet'}</div>
      <div style={{ fontSize: 14 }}>{sub}</div>
      {action}
    </div>
  );
}

export function Modal({ onClose, children, title }) {
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: '#1A1040' }}>{title}</h3>
          <button onClick={onClose} className="btn-gloss btn-cream btn-sm">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function DisclaimerModal({ onClose }) {
  return (
    <Modal onClose={onClose} title="⚕️ Important to Know">
      <p style={{ lineHeight: 1.7, fontSize: 15 }}>{DISCLAIMER}</p>
      <Btn block onClick={onClose}>Got it 💛</Btn>
    </Modal>
  );
}

export function Footer({ onDisclaimer }) {
  return (
    <div className="footer-disc">
      <button onClick={onDisclaimer}>⚕️ Medical disclaimer</button>
      <div className="tagline">"Built by a parent, for parents. Real tools, not $500 PDFs."</div>
      <div className="sponsor">Sponsored by POTENT ['PRÄDƏKT]®</div>
    </div>
  );
}

// Always-visible "I NEED A BREAK" button (per spec — every screen)
export function BreakButton({ onBreak }) {
  return (
    <button className="break-btn" onClick={onBreak} aria-label="I need a break">
      🛑<br />I NEED<br />A BREAK
    </button>
  );
}

// Paywall overlay for locked tabs after trial (per spec)
export function Paywall({ feature, onUpgrade }) {
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState('lifetime');
  const go = async () => {
    setBusy(true);
    try { await startCheckout(plan, ''); }
    catch (e) { toast('💳 ' + e.message); setBusy(false); }
  };
  return (
    <div className="paywall-veil">
      <div style={{ fontSize: 44 }}>🔒</div>
      <div style={{ fontWeight: 800, color: '#1A1040', fontSize: 18 }}>Your free trial ended</div>
      <div style={{ fontSize: 14, color: '#8a7f9e' }}>{feature} is part of full access.</div>
      <Card style={{ width: '100%', textAlign: 'left' }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
            <input type="radio" checked={plan === 'lifetime'} onChange={() => setPlan('lifetime')} />
            <b>{PLANS.lifetime.label}</b>
          </label>
          <span className="pill">FEATURED</span>
        </div>
        <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 10 }}>{PLANS.lifetime.note}</div>
        <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
          <input type="radio" checked={plan === 'monthly'} onChange={() => setPlan('monthly')} />
          <b>{PLANS.monthly.label}</b>
        </label>
        <div style={{ fontSize: 13, color: '#8a7f9e' }}>{PLANS.monthly.note}</div>
      </Card>
      <Btn block onClick={onUpgrade || go} disabled={busy}>{busy ? 'Opening checkout…' : 'Unlock Full Access 💛'}</Btn>
      <div style={{ fontSize: 12, color: '#8a7f9e' }}>30-day money-back guarantee • Receipt emailed by Stripe</div>
    </div>
  );
}

// Trial countdown banner (per spec)
export function TrialBanner({ onUpgrade }) {
  if (!trialActive()) return null;
  const hrs = trialHoursLeft();
  const label = hrs >= 1 ? `${Math.floor(hrs)} hours left` : `${Math.ceil(hrs * 60)} minutes left`;
  return (
    <Card style={{ background: 'linear-gradient(180deg,#fff8ec,#ffefd6)', borderColor: '#f0d9a8', marginBottom: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div><b>🎁 Free trial:</b> {label}</div>
        <Btn size="sm" onClick={onUpgrade}>Upgrade</Btn>
      </div>
    </Card>
  );
}

// Confetti burst (celebrations)
export function Confetti({ pieces = 60 }) {
  const [bits] = useState(() =>
    Array.from({ length: pieces }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#FF6B35', '#2ECC71', '#3498DB', '#9B59B6', '#F1C40F', '#E91E8C'][i % 6],
      delay: Math.random() * 0.5,
      dur: 2 + Math.random() * 1.5,
      size: 8 + Math.random() * 8,
    }))
  );
  return (
    <>
      {bits.map((b) => (
        <div key={b.id} className="confetti" style={{
          left: b.left + '%', width: b.size, height: b.size * 0.6,
          background: b.color, borderRadius: 2,
          animationDelay: b.delay + 's', animationDuration: b.dur + 's',
        }} />
      ))}
    </>
  );
}

// Global toast listener — mount once in App
export function Toasts() {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => {
    const h = (e) => {
      const id = Date.now() + Math.random();
      setMsgs((m) => [...m, { id, text: e.detail }]);
      setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 3200);
    };
    window.addEventListener('aceheals:toast', h);
    return () => window.removeEventListener('aceheals:toast', h);
  }, []);
  return (
    <>
      {msgs.map((m) => <div key={m.id} className="toast">{m.text}</div>)}
    </>
  );
}

// Progress bar (glossy)
export function PBar({ pct, color }) {
  return <div className="pbar"><div style={{ width: Math.min(100, Math.max(0, pct)) + '%', '--fill': color || '#FF6B35' }} /></div>;
}
