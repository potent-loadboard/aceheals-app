import React, { useState, useEffect } from 'react';
import { DisclaimerModal, BreakButton, Toasts, Btn, Card } from './components/ui.jsx';
import { supabase, sb, supabaseConfigured } from './lib/supabase.js';
import { useStored, toast } from './lib/store.js';
import { handlePaymentReturn, trialActive } from './lib/paywall.js';
import Home from './tabs/Home.jsx';
import Heal from './tabs/Heal.jsx';
import Maverick from './tabs/Maverick.jsx';
import Manny from './tabs/Manny.jsx';
import Potty from './tabs/Potty.jsx';
import Music from './tabs/Music.jsx';
import Recipes from './tabs/Recipes.jsx';
import Together from './tabs/Together.jsx';
import Settings from './tabs/Settings.jsx';

const TABS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'heal', label: 'Heal', emoji: '🌿' },
  { id: 'maverick', label: 'Maverick', emoji: '⚡' },
  { id: 'manny', label: 'Manny', emoji: '🎮' },
  { id: 'potty', label: 'Potty', emoji: '🚽' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'recipes', label: 'Recipes', emoji: '🍎' },
  { id: 'together', label: 'Together', emoji: '❤️' },
];

function AuthGate({ onAuth }) {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (!email || !pw) { toast('✏️ Enter email + password'); return; }
    setBusy(true);
    try {
      const fn = mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password: pw })
        : supabase.auth.signUp({ email, password: pw });
      const { data, error } = await fn;
      if (error) throw error;
      onAuth(data.user);
    } catch (e) {
      toast('🔐 ' + (e.message || 'Sign-in failed'));
    } finally { setBusy(false); }
  };

  const google = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e) { toast('🔐 ' + (e.message || 'Google sign-in failed')); }
  };

  const skip = () => onAuth({ email: '', guest: true });

  return (
    <div className="screen" style={{ paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 72 }}>🌿</div>
        <h1 style={{ color: '#1A1040', margin: '8px 0 4px', fontSize: 34 }}>AceHeals</h1>
        <div style={{ color: '#8a7f9e', fontStyle: 'italic' }}>"Built by a parent, for parents. Real tools, not $500 PDFs."</div>
        <div style={{ fontSize: 12, marginTop: 6, fontWeight: 700, color: '#1A1040' }}>Sponsored by POTENT ['PRÄDƏKT]®</div>
      </div>
      <Card>
        <div className="row" style={{ marginBottom: 12 }}>
          <Btn size="sm" color={mode === 'signin' ? 'orange' : 'cream'} onClick={() => setMode('signin')} block>Sign In</Btn>
          <Btn size="sm" color={mode === 'signup' ? 'orange' : 'cream'} onClick={() => setMode('signup')} block>Sign Up</Btn>
        </div>
        <input className="input-gloss" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 8 }} />
        <input className="input-gloss" placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={{ marginBottom: 12 }} />
        <Btn block onClick={go} disabled={busy}>{busy ? '…' : mode === 'signin' ? 'Sign In 💛' : 'Create Account 🎉'}</Btn>
        <div style={{ textAlign: 'center', margin: '10px 0', color: '#8a7f9e', fontSize: 13 }}>— or —</div>
        <Btn block color="blue" onClick={google}>🔵 Continue with Google</Btn>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={skip} style={{ background: 'none', border: 'none', color: '#8a7f9e', textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}>
            Explore as guest (24h trial, local only)
          </button>
        </div>
      </Card>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#8a7f9e', marginTop: 16, lineHeight: 1.6 }}>
        🎁 24-hour free trial • No card required<br />$79 once, own forever — or $12.99/mo
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('home');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [breakMode, setBreakMode] = useState(false);
  const [deaf] = useStored('deafMode', false);
  const [hc] = useStored('highContrast', false);
  const [lg] = useStored('largeText', false);

  // ?payment=success handler (per spec)
  useEffect(() => {
    handlePaymentReturn().then((ok) => {
      if (ok) toast('🎉 Payment confirmed — welcome to full access!');
    });
    // Register service worker (offline core tools)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Supabase session
  useEffect(() => {
    (async () => {
      if (!supabaseConfigured) { setAuthChecked(true); return; }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
      } catch {}
      setAuthChecked(true);
    })();
  }, []);

  const logout = async () => {
    try { supabaseConfigured && await supabase.auth.signOut(); } catch {}
    setUser(null);
    setTab('home');
  };

  const goBreak = () => {
    setBreakMode(true);
    toast('🛑 Break time. Breathe with me.');
  };

  if (!authChecked) {
    return <div className="screen"><div className="spinner" /><div className="empty">Warming up… 🌿</div></div>;
  }

  if (!user && supabaseConfigured) {
    return (
      <div className={deaf ? 'deaf' : ''}>
        <AuthGate onAuth={setUser} />
        <Toasts />
      </div>
    );
  }

  const openDisclaimer = () => setShowDisclaimer(true);

  return (
    <div className={`${hc ? 'hc' : ''}${lg ? ' lgtext' : ''}${deaf ? ' deaf' : ''}`}>
      <header className="app-header">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>🌿 AceHeals</h1>
            <div className="sponsor">Sponsored by POTENT ['PRÄDƏKT]®</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button onClick={() => setTab('settings')} aria-label="Settings"
              style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 20, padding: '8px 10px', cursor: 'pointer' }}>⚙️</button>
          </div>
        </div>
      </header>

      {breakMode && (
        <div className="modal-veil" onClick={() => setBreakMode(false)} style={{ alignItems: 'center' }}>
          <div className="modal-card" style={{ borderRadius: 22, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 64 }}>🛑</div>
            <h2 style={{ color: '#1A1040' }}>Let's take a break.</h2>
            <p>Breathe in… and out. You're doing amazing. 💛</p>
            <div className="breath-bubble" style={{ width: 150, height: 150 }}>breathe…</div>
            <div className="row" style={{ marginTop: 12 }}>
              <Btn color="purple" block onClick={() => { setBreakMode(false); setTab('maverick'); }}>Calm Down Corner 🌊</Btn>
            </div>
            <div style={{ marginTop: 8 }}><Btn color="cream" block onClick={() => setBreakMode(false)}>I'm okay now 💛</Btn></div>
          </div>
        </div>
      )}

      {tab === 'home' && <Home go={setTab} onDisclaimer={openDisclaimer} onUpgrade={() => setShowUpgrade(true)} />}
      {tab === 'heal' && <Heal onDisclaimer={openDisclaimer} />}
      {tab === 'maverick' && <Maverick onDisclaimer={openDisclaimer} />}
      {tab === 'manny' && <Manny onDisclaimer={openDisclaimer} />}
      {tab === 'potty' && <Potty onDisclaimer={openDisclaimer} />}
      {tab === 'music' && <Music onDisclaimer={openDisclaimer} />}
      {tab === 'recipes' && <Recipes onDisclaimer={openDisclaimer} />}
      {tab === 'together' && <Together onDisclaimer={openDisclaimer} user={user} />}
      {tab === 'settings' && <Settings onDisclaimer={openDisclaimer} user={user} onLogout={logout} />}

      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}

      {showUpgrade && (
        <div className="modal-veil" onClick={() => setShowUpgrade(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <Settings onDisclaimer={openDisclaimer} user={user} onLogout={logout} />
          </div>
        </div>
      )}

      <BreakButton onBreak={goBreak} />

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => { setTab(t.id); window.scrollTo(0, 0); }}>
            <span className="tico">{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <Toasts />
    </div>
  );
}
