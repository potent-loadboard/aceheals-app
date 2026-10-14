import React, { useState, useEffect } from 'react';
import { DisclaimerModal, BreakButton, Toasts, Btn, Card, Modal } from './components/ui.jsx';
import { supabase, sb, supabaseConfigured } from './lib/supabase.js';
import { useStored, toast } from './lib/store.js';
import { handlePaymentReturn, trialActive } from './lib/paywall.js';
import { hasPin, setPin, verifyPin, KID_TABS } from './lib/parental.js';
import Home from './tabs/Home.jsx';
import Heal from './tabs/Heal.jsx';
import Maverick from './tabs/Maverick.jsx';
import Manny from './tabs/Manny.jsx';
import Potty from './tabs/Potty.jsx';
import Music from './tabs/Music.jsx';
import Recipes from './tabs/Recipes.jsx';
import Together from './tabs/Together.jsx';
import Settings from './tabs/Settings.jsx';
import AudioControls from './components/AudioControls.jsx';
import Parents from './tabs/Parents.jsx';
import WindDown, { useScreenTime } from './components/WindDown.jsx';
import { useSensory } from './components/SensorySettings.jsx';

const TABS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'heal', label: 'Heal', emoji: '🌿' },
  { id: 'maverick', label: 'Maverick', emoji: '⚡' },
  { id: 'manny', label: 'Manny', emoji: '🎮' },
  { id: 'potty', label: 'Potty', emoji: '🚽' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'recipes', label: 'Recipes', emoji: '🍎' },
  { id: 'together', label: 'Together', emoji: '❤️' },
  { id: 'parents', label: 'Parents', emoji: '💛' },
];

function AuthGate({ onAuth }) {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [showParent, setShowParent] = useState(false);

  // Welcome speech on landing page — Giffy greets the kids!
  useEffect(() => {
    const t = setTimeout(() => {
      speak("Hi friends! I'm Giffy! Tap your name to start playing with me!");
    }, 800);
    return () => clearTimeout(t);
  }, []);

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
  const kidLogin = (kidTab) => onAuth({ email: '', guest: true, kidMode: true, kidTab });

  return (
    <div className="kids-mode" style={{ minHeight: '100vh', padding: '20px 16px 40px', position: 'relative' }}>
      <div className="screen" style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto' }}>
        {/* HERO — kids first! */}
        <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: 20 }}>
          <div style={{ fontSize: 80, animation: 'kid-bob 2.4s ease-in-out infinite' }}>🦅</div>
          <h1 style={{
            fontSize: 38, fontWeight: 900, margin: '8px 0 4px', color: '#fff',
            textShadow: '0 0 20px #00e5ff, 0 0 40px #b537f2',
          }}>
            Manny & Maverick
          </h1>
          <div style={{ fontSize: 16, color: '#ffe600', fontWeight: 700, textShadow: '0 0 12px rgba(255,230,0,.5)' }}>
            ✨ Play. Create. Shine. ✨
          </div>
          <div style={{ fontSize: 13, color: '#b9a8e8', marginTop: 8 }}>
            Games • Music • Photos • Stories — made for YOU!
          </div>
        </div>

        {/* KIDS — giant tap targets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <button onClick={() => kidLogin('manny')}
            style={{
              background: 'linear-gradient(180deg,#ffe600,#ff9d00)', border: '3px solid rgba(255,255,255,.4)',
              borderRadius: 28, padding: '28px 12px', cursor: 'pointer',
              boxShadow: '0 0 30px rgba(255,230,0,.5), 0 6px 0 rgba(0,0,0,.4)',
              animation: 'kid-bob 2.4s ease-in-out infinite',
            }}>
            <div style={{ fontSize: 56 }}>🎮</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0d0628' }}>Manny</div>
            <div style={{ fontSize: 12, color: '#0d0628', opacity: 0.7 }}>Tap to play!</div>
          </button>
          <button onClick={() => kidLogin('maverick')}
            style={{
              background: 'linear-gradient(180deg,#b537f2,#7b2ff7)', border: '3px solid rgba(255,255,255,.4)',
              borderRadius: 28, padding: '28px 12px', cursor: 'pointer',
              boxShadow: '0 0 30px rgba(181,55,242,.5), 0 6px 0 rgba(0,0,0,.4)',
              animation: 'kid-bob 2.4s ease-in-out infinite', animationDelay: '.3s',
            }}>
            <div style={{ fontSize: 56 }}>⚡</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Maverick</div>
            <div style={{ fontSize: 12, color: '#fff', opacity: 0.7 }}>Tap to play!</div>
          </button>
        </div>

        {/* Feature highlights */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            ['🎮', '22 Games'], ['📷', 'Photo Studio'], ['🎤', 'Song Maker'],
            ['🌍', 'My World'], ['🦅', 'Giffy'],
          ].map(([e, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>{e}</div>
              <div style={{ fontSize: 11, color: '#b9a8e8', fontWeight: 700 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Parent zone — collapsed by default */}
        <div style={{ textAlign: 'center' }}>
          {!showParent ? (
            <button onClick={() => setShowParent(true)}
              style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 16, padding: '10px 20px', color: '#b9a8e8', cursor: 'pointer', fontSize: 13 }}>
              🔒 Grown-ups — tap here
            </button>
          ) : (
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
                  Explore as guest (24h trial)
                </button>
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#8a7f9e', marginTop: 12, lineHeight: 1.6 }}>
                🎁 24-hour free trial • No card required<br />$79 once, own forever — or $12.99/mo<br />
                <span style={{ fontStyle: 'italic' }}>"Built by a parent, for parents."</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button onClick={() => setShowParent(false)} style={{ background: 'none', border: 'none', color: '#8a7f9e', cursor: 'pointer', fontSize: 12 }}>
                  Hide ▲
                </button>
              </div>
            </Card>
          )}
        </div>
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
  const [kidMode, setKidMode] = useState(false);
  const [showPinGate, setShowPinGate] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
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
    setKidMode(false);
    setTab('home');
  };

  // Enter kids mode when a kid taps their name on the login screen
  useEffect(() => {
    if (user?.kidMode) {
      setKidMode(true);
      setTab(user.kidTab || 'manny');
    }
  }, [user]);

  // Screen-time wind-down in kids mode
  const { windingDown, setWindingDown } = useScreenTime(user?.kidTab || 'manny');

  // Sensory settings — applied as CSS classes across the whole app
  const { sensory } = useSensory();
  const sensoryClasses = [
    sensory.reduceMotion ? 'sensory-calm' : '',
    sensory.highContrast ? 'sensory-hc' : '',
    sensory.largeTargets ? 'sensory-big' : '',
    sensory.calmPalette ? 'sensory-pastel' : '',
    sensory.dimBrightness ? 'sensory-dim' : '',
  ].filter(Boolean).join(' ');

  // Grown-ups gate: PIN required to leave kids mode
  const exitKidMode = () => {
    if (!hasPin()) {
      // No PIN yet — let parent set one up right here
      setPinInput('');
      setShowPinSetup(true);
      return;
    }
    setPinInput('');
    setShowPinGate(true);
  };

  const submitPinSetup = () => {
    if (setPin(pinInput)) {
      setShowPinSetup(false);
      toast('🔒 Parent PIN set! You\'re all set.');
      setPinInput('');
      setShowPinGate(true); // now prompt to unlock
    } else {
      toast('🔒 Enter 4 digits for your PIN');
    }
  };

  const submitPin = () => {
    if (verifyPin(pinInput)) {
      setShowPinGate(false);
      setKidMode(false);
      setTab('home');
      toast('👋 Welcome back, grown-up!');
    } else {
      toast('❌ Wrong PIN — try again');
      setPinInput('');
    }
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
    <div className={`${hc ? 'hc' : ''}${lg ? ' lgtext' : ''}${deaf ? ' deaf' : ''}${kidMode ? ' kids-mode' : ''} ${sensoryClasses}`}>
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
      {tab === 'parents' && <Parents />}
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

      {kidMode && windingDown && (
        <WindDown kidId={user?.kidTab || 'manny'} onComplete={() => exitKidMode()} />
      )}

      {showPinGate && (
        <Modal onClose={() => setShowPinGate(false)} title="✋ Grown-ups only!">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 48 }}>🔒</div>
            <div style={{ fontSize: 14, color: '#8a7f9e', marginTop: 8 }}>
              Hey kiddo — this needs a grown-up!<br />
              Ask a parent to type the secret code 👇
            </div>
          </div>
          <input className="input-gloss" type="password" inputMode="numeric" maxLength={4}
            placeholder="••••" value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={(e) => e.key === 'Enter' && submitPin()}
            style={{ textAlign: 'center', fontSize: 28, letterSpacing: 12, marginBottom: 12 }} />
          <Btn block onClick={submitPin}>Unlock 🔓</Btn>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Btn size="sm" color="cream" onClick={() => setShowPinGate(false)}>← Back to playing! 🎮</Btn>
          </div>
        </Modal>
      )}

      {showPinSetup && (
        <Modal onClose={() => setShowPinSetup(false)} title="✋ Whoa there!">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 56 }}>👨‍👩‍👧</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1040', marginTop: 8 }}>
              This part is for grown-ups!
            </div>
            <div style={{ fontSize: 14, color: '#8a7f9e', marginTop: 8 }}>
              Go grab a parent to set this up 👆<br />
              Then you can get back to playing! 🎮
            </div>
          </div>
          <div style={{ background: 'rgba(155,89,182,.08)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1040', marginBottom: 8, textAlign: 'center' }}>
              🔒 Parent: create a 4-digit PIN
            </div>
            <input className="input-gloss" type="password" inputMode="numeric" maxLength={4}
              placeholder="••••" value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && submitPinSetup()}
              style={{ textAlign: 'center', fontSize: 28, letterSpacing: 12, marginBottom: 8 }} />
            <Btn block onClick={submitPinSetup}>Set PIN ✅</Btn>
          </div>
          <Btn block color="cream" onClick={() => setShowPinSetup(false)}>← Back to playing! 🎮</Btn>
        </Modal>
      )}

      <nav className="tabbar">
        {(kidMode ? TABS.filter((t) => KID_TABS.includes(t.id)) : TABS).map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => { setTab(t.id); window.scrollTo(0, 0); }}>
            <span className="tico">{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
        {kidMode && (
          <button onClick={exitKidMode} style={{ opacity: 0.75 }}>
            <span className="tico">🔒</span>
            <span>Grown-ups</span>
          </button>
        )}
      </nav>

      <Toasts />
      <AudioControls />
    </div>
  );
}
