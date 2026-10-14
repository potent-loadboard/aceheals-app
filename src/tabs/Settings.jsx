import React, { useState } from 'react';
import { Card, Btn, SectionHead, Empty, Footer, Modal, Confetti } from '../components/ui.jsx';
import { useStored, toast } from '../lib/store.js';
import { getAccess, setAccess, trialHoursLeft, trialActive, restorePurchase, PLANS, startCheckout } from '../lib/paywall.js';
import { supabase, sb, supabaseConfigured } from '../lib/supabase.js';
import { DISCLAIMER } from '../lib/disclaimer.js';
import { hasPin, setPin } from '../lib/parental.js';

function Settings({ onDisclaimer, user, onLogout }) {
  const [kids, setKids] = useStored('kids', [
    { id: 'mav', name: 'Maverick', emoji: '⚡' },
    { id: 'man', name: 'Manny', emoji: '🎮' },
  ]);
  const [kidDraft, setKidDraft] = useState({ name: '', emoji: '🌟' });
  const [editingKid, setEditingKid] = useState(null);
  const [access, setAcc] = useState(getAccess());
  const [displayName, setDisplayName] = useStored('displayName', '');
  const [notifDaily, setNotifDaily] = useStored('notifDaily', true);
  const [notifWins, setNotifWins] = useStored('notifWins', true);
  const [deaf, setDeaf] = useStored('deafMode', false);
  const [hc, setHc] = useStored('highContrast', false);
  const [newPin, setNewPin] = useState('');
  const [, forcePin] = useState(0);

  const savePin = () => {
    if (setPin(newPin)) {
      toast('🔒 Parent PIN set! Kids Mode is protected 💛');
      setNewPin('');
      forcePin((x) => x + 1);
    } else {
      toast('✏️ Enter a 4-digit PIN');
    }
  };
  const [lg, setLg] = useStored('largeText', false);
  const [lang, setLang] = useStored('lang', 'English');
  const [showSub, setShowSub] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const refreshAccess = () => setAcc({ ...getAccess() });

  const buy = async (planId) => {
    setBusy(true);
    try { await startCheckout(planId, user?.email || ''); }
    catch (e) { toast('💳 ' + e.message); }
    finally { setBusy(false); }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const ok = await restorePurchase(user?.id || 'local');
      if (ok) { refreshAccess(); setCelebrate(true); toast('✅ Purchase restored!'); }
      else toast('🔍 No purchase found for this account.');
    } finally { setBusy(false); }
  };

  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('aceheals:')) data[k] = localStorage.getItem(k);
    }
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>AceHeals Data Export</title></head><body style="font-family:sans-serif;padding:24px;max-width:700px">
      <h1>📄 AceHeals — My Family's Data</h1>
      <p>Exported ${new Date().toLocaleString()}. Share with your doctor, therapist, or IEP team.</p>
      <p><i>${DISCLAIMER}</i></p>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:12px">${JSON.stringify(data, null, 2).replace(/</g, '&lt;')}</pre>
      <p><button onclick="window.print()">Print / Save as PDF</button></p></body></html>`);
    w.document.close();
  };

  const deleteAccount = async () => {
    // Local wipe + Supabase best-effort (RLS assumed server-side)
    Object.keys(localStorage).filter((k) => k.startsWith('aceheals:')).forEach((k) => localStorage.removeItem(k));
    await sb(async (s) => { await s.auth.admin; });
    toast('🗑️ Local data cleared.');
    onLogout();
  };

  const addKid = () => {
    if (!kidDraft.name.trim()) { toast('✏️ Give them a name!'); return; }
    if (editingKid) {
      setKids((ks) => ks.map((k) => k.id === editingKid ? { ...k, name: kidDraft.name.trim(), emoji: kidDraft.emoji } : k));
      setEditingKid(null);
    } else {
      setKids((ks) => [...ks, { id: 'k' + Date.now(), name: kidDraft.name.trim(), emoji: kidDraft.emoji }]);
    }
    setKidDraft({ name: '', emoji: '🌟' });
    toast('💛 Saved!');
  };

  const hrs = trialHoursLeft();

  return (
    <div className={`screen${hc ? ' hc' : ''}${lg ? ' lgtext' : ''}${deaf ? ' deaf' : ''}`}>
      {celebrate && <Confetti />}
      <SectionHead title="⚙️ Settings" />

      <SectionHead title="👶 My Children" />
      <Card>
        {kids.map((k) => (
          <div key={k.id} className="check-item">
            <div style={{ fontSize: 30 }}>{k.emoji}</div>
            <div style={{ flex: 1, fontWeight: 700 }}>{k.name}</div>
            <Btn size="sm" color="cream" onClick={() => { setEditingKid(k.id); setKidDraft({ name: k.name, emoji: k.emoji }); }}>Edit</Btn>
            {kids.length > 1 && <button className="btn-gloss btn-red btn-sm" onClick={() => setKids(kids.filter((x) => x.id !== k.id))}>✕</button>}
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <input className="input-gloss" style={{ maxWidth: 70 }} value={kidDraft.emoji} onChange={(e) => setKidDraft({ ...kidDraft, emoji: e.target.value })} />
          <input className="input-gloss" placeholder="Child's name" value={kidDraft.name} onChange={(e) => setKidDraft({ ...kidDraft, name: e.target.value })} />
          <Btn size="sm" onClick={addKid}>{editingKid ? 'Save' : 'Add'}</Btn>
        </div>
        {editingKid && <div style={{ marginTop: 6 }}><Btn size="sm" color="cream" onClick={() => { setEditingKid(null); setKidDraft({ name: '', emoji: '🌟' }); }}>Cancel</Btn></div>}
      </Card>

      <SectionHead title="👤 Account" />
      <Card>
        <div style={{ fontSize: 14, marginBottom: 8 }}><b>Email:</b> {user?.email || 'Guest (local mode)'}</div>
        <input className="input-gloss" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <div style={{ fontSize: 12, color: '#8a7f9e', marginTop: 8 }}>
          {supabaseConfigured ? 'Signed in via Supabase.' : 'Supabase not configured — running in local mode. Sign-in unlocks sync + community posting.'}
        </div>
      </Card>

      <SectionHead title="💳 Subscription" />
      <Card>
        {access.paid ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44 }}>✅</div>
            <b style={{ fontSize: 18, color: '#2ECC71' }}>Lifetime Access Unlocked ✓</b>
            <div style={{ fontSize: 13, color: '#8a7f9e', marginTop: 4 }}>Thank you for supporting one family's mission 💛</div>
          </div>
        ) : (
          <div>
            <div className="pill yellow" style={{ marginBottom: 8 }}>🎁 Free trial: {trialActive() ? Math.ceil(hrs) + 'h left' : 'ended'}</div>
            <div style={{ marginTop: 8 }}><Btn block onClick={() => setShowSub(true)}>Upgrade 💛</Btn></div>
            <div style={{ marginTop: 8 }}><Btn block color="cream" onClick={restore} disabled={busy}>{busy ? 'Checking…' : 'Restore Purchase 🔄'}</Btn></div>
          </div>
        )}
      </Card>
      {showSub && (
        <Modal onClose={() => setShowSub(false)} title="💛 Unlock AceHeals">
          <Card style={{ marginBottom: 10, borderColor: '#FF6B35', borderWidth: 2 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <b style={{ fontSize: 18 }}>{PLANS.lifetime.label}</b><span className="pill">FEATURED</span>
            </div>
            <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>{PLANS.lifetime.note}</div>
            <Btn block onClick={() => buy('lifetime')} disabled={busy}>Choose Lifetime — $79</Btn>
          </Card>
          <Card>
            <b style={{ fontSize: 18 }}>{PLANS.monthly.label}</b>
            <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>{PLANS.monthly.note}</div>
            <Btn block color="blue" onClick={() => buy('monthly')} disabled={busy}>Choose Monthly — $12.99</Btn>
          </Card>
          <div style={{ fontSize: 12, color: '#8a7f9e', textAlign: 'center', marginTop: 10 }}>
            24-hour free trial • No card required • 30-day money-back guarantee<br />Secure checkout via Stripe
          </div>
        </Modal>
      )}

      <SectionHead title="🔔 Notifications" />
      <Card>
        <Toggle label="Daily reminder" sub="Gentle nudge for today's checklist" val={notifDaily} set={setNotifDaily} />
        <Toggle label="Community win alerts" sub="Celebrate with other families" val={notifWins} set={setNotifWins} />
      </Card>

      <SectionHead title="♿ Accessibility" />
      <Card>
        <Toggle label="🧏 Deaf / Hard of Hearing Mode" sub="Visual alerts only, captions on audio, vibration cues" val={deaf} set={setDeaf} />
        <Toggle label="◐ High contrast display" sub="Stronger borders and text" val={hc} set={setHc} />
        <Toggle label="🔍 Large text" sub="Bigger type everywhere" val={lg} set={setLg} />
        <div style={{ marginTop: 10 }}>
          <b style={{ fontSize: 14 }}>🌍 Language</b>
          <select className="input-gloss" style={{ marginTop: 6 }} value={lang} onChange={(e) => setLang(e.target.value)}>
            {['English', 'Español', 'Français', 'Português', 'Deutsch', 'ASL-friendly (visual first)'].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </Card>

      <SectionHead title="🤝 Care Team" />
      <Card>
        <b>Linked therapist / teacher</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>Share reports with your care team.</div>
        <div className="row">
          <Btn size="sm" color="blue" onClick={exportData}>📄 Export PDF for Doctor / IEP</Btn>
        </div>
      </Card>

      <SectionHead title="🔒 Parent PIN" />
      <Card>
        <b>Kids Mode protection</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>
          {hasPin()
            ? '✅ PIN is set. Kids stay in their safe zone until you enter it.'
            : 'Set a 4-digit PIN. Kids tap their name to play — only you can unlock the grown-up sections.'}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <input className="input-gloss" type="password" inputMode="numeric" maxLength={4}
            placeholder={hasPin() ? 'New 4-digit PIN' : 'Choose 4-digit PIN'}
            value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8, flex: 1 }} />
          <Btn color="orange" onClick={savePin}>{hasPin() ? 'Change' : 'Set PIN'}</Btn>
        </div>
      </Card>

      <SectionHead title="📄 About & Legal" />
      <Card>
        <Btn block color="cream" onClick={onDisclaimer} style={{ marginBottom: 8 }}>⚕️ Medical Disclaimer</Btn>
        <div className="row">
          <Btn size="sm" color="cream" block onClick={() => toast('📄 Privacy: your data stays yours. Stored on Supabase, never sold.')}>Privacy Policy</Btn>
          <Btn size="sm" color="cream" block onClick={() => toast('📄 Terms: be kind, no medical advice in posts.')}>Terms of Service</Btn>
        </div>
        <div style={{ fontSize: 12, color: '#8a7f9e', marginTop: 10, textAlign: 'center' }}>
          AceHeals v1.0 • Sponsored by POTENT ['PRÄDƏKT]®<br />"Built by a parent, for parents. Real tools, not $500 PDFs."
        </div>
      </Card>

      <SectionHead title="🚪 Account Actions" />
      <div className="row">
        <Btn color="blue" block onClick={exportData}>📥 Export My Data</Btn>
      </div>
      <div style={{ marginTop: 8 }} className="row">
        <Btn color="red" block onClick={() => setShowDelete(true)}>🗑️ Delete Account</Btn>
      </div>
      <div style={{ marginTop: 8 }}>
        <Btn color="navy" block onClick={onLogout}>Log Out 👋</Btn>
      </div>

      {showDelete && (
        <Modal onClose={() => setShowDelete(false)} title="🗑️ Delete Account?">
          <p>This clears all your local data and signs you out. This can't be undone.</p>
          <div className="row">
            <Btn color="cream" block onClick={() => setShowDelete(false)}>Keep my data</Btn>
            <Btn color="red" block onClick={deleteAccount}>Delete everything</Btn>
          </div>
        </Modal>
      )}

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}

function Toggle({ label, sub, val, set }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5ead8' }}>
      <div><b style={{ fontSize: 15 }}>{label}</b>{sub && <div style={{ fontSize: 12, color: '#8a7f9e' }}>{sub}</div>}</div>
      <button onClick={() => set(!val)} aria-pressed={val}
        style={{ width: 56, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
          background: val ? 'linear-gradient(180deg,#8fe6b3,#2ECC71)' : 'linear-gradient(180deg,#d9cbb4,#bfab8c)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,.2)' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(180deg,#fff,#f0e6d4)',
          position: 'absolute', top: 3, left: val ? 27 : 3, transition: 'left .15s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,.25)' }} />
      </button>
    </div>
  );
}

export default Settings;
