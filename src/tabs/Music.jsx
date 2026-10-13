import React, { useState, useEffect } from 'react';
import { Card, Btn, SectionHead, Paywall, Footer } from '../components/ui.jsx';
import { useStored, toast } from '../lib/store.js';
import { hasAccess } from '../lib/paywall.js';
import { FREQUENCIES, KIDS_CHANNELS, PLAYLISTS, SLEEP_SOUNDS } from '../data/content.js';
import { playFrequency, playAmbience, stopAudio, drum } from '../lib/audio.js';

function Music({ onDisclaimer }) {
  const paid = hasAccess();
  const [playing, setPlaying] = useState(null); // {kind:'freq'|'calm'|'sleep', id}
  const [mix, setMix] = useState([]);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [favs, setFavs] = useStored('musicFavs', []);

  useEffect(() => () => stopAudio(), []);
  useEffect(() => {
    if (!sleepTimer) return;
    const t = setTimeout(() => { stopAudio(); setPlaying(null); setMix([]); toast('🌙 Sleep timer ended. Sweet dreams!'); }, sleepTimer * 60000);
    return () => clearTimeout(t);
  }, [sleepTimer]);

  const startFreq = (f) => {
    playFrequency(f.hz);
    setPlaying({ kind: 'freq', id: f.hz });
    toast(`🎵 ${f.hz}Hz — ${f.name}`);
  };
  const stop = () => { stopAudio(); setPlaying(null); setMix([]); };

  const toggleSleepMix = (id) => {
    const next = mix.includes(id) ? mix.filter((x) => x !== id) : [...mix, id].slice(0, 2);
    setMix(next);
    if (!next.length) { stopAudio(); setPlaying(null); }
    else { playAmbience(next[0]); setPlaying({ kind: 'sleep', id: next[0] }); }
  };

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {!paid && <Paywall feature="Music Tab" />}
      <SectionHead title="🎵 Music" />

      {/* One-tap calm mode */}
      <Card style={{ background: 'linear-gradient(180deg,#3a2a6e,#1A1040)', borderColor: '#3a2a6e', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 44 }}>🌊</div>
        <b style={{ fontSize: 18 }}>One-Tap Calm Mode</b>
        <div style={{ fontSize: 13, opacity: 0.8, margin: '4px 0 12px' }}>Instant calm sounds + gentle pulse</div>
        {playing?.kind === 'calm' ? (
          <div>
            <div className="breath-bubble" style={{ width: 130, height: 130, fontSize: 15 }}>breathing…</div>
            <Btn color="red" onClick={stop}>Stop ⏹️</Btn>
          </div>
        ) : (
          <Btn color="purple" block onClick={() => { playAmbience('ocean'); setPlaying({ kind: 'calm', id: 'ocean' }); }}>Start Calm Mode 🌊</Btn>
        )}
      </Card>

      <SectionHead title="🎼 Calming Frequencies" />
      {FREQUENCIES.map((f) => {
        const isP = playing?.kind === 'freq' && playing?.id === f.hz;
        return (
          <Card key={f.hz} style={{ marginBottom: 8, ...(isP ? { borderColor: '#9B59B6', borderWidth: 2 } : {}) }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="row" style={{ gap: 10 }}>
                <div style={{ fontSize: 30 }}>{f.emoji}</div>
                <div><b>{f.hz}Hz</b><div style={{ fontSize: 13, color: '#8a7f9e' }}>{f.name}</div></div>
              </div>
              <Btn size="sm" color={isP ? 'red' : 'purple'} onClick={() => isP ? stop() : startFreq(f)}>{isP ? '⏸️ Stop' : '▶️ Play'}</Btn>
            </div>
          </Card>
        );
      })}

      <SectionHead title="📺 Kids Channels" />
      <div style={{ fontSize: 12, color: '#8a7f9e', marginBottom: 8 }}>Opens in browser. Not affiliated with AceHeals.</div>
      {KIDS_CHANNELS.map((c) => (
        <a key={c.name} href={c.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <div className="check-item">
            <div style={{ fontSize: 30 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}><b style={{ color: '#1A1040' }}>{c.name}</b><div style={{ fontSize: 12, color: '#8a7f9e' }}>{c.note}</div></div>
            <div>↗️</div>
          </div>
        </a>
      ))}

      <SectionHead title="🎧 Playlists" />
      <div className="grid2">
        {PLAYLISTS.map((p) => (
          <Card key={p.name} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>{p.emoji}</div>
            <b style={{ color: '#1A1040' }}>{p.name}</b>
            <div style={{ fontSize: 12, color: '#8a7f9e' }}>{p.tracks} tracks</div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#8a7f9e' }}>🎵 Curated mixes coming soon — calm mode works now!</div>
            <div style={{ marginTop: 6 }}>
              <Btn size="sm" color={favs.includes(p.name) ? 'pink' : 'cream'}
                onClick={() => setFavs((f) => f.includes(p.name) ? f.filter((x) => x !== p.name) : [...f, p.name])}>
                {favs.includes(p.name) ? '❤️ Saved' : '🤍 Save'}
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      <SectionHead title="🌙 Sleep Sounds" />
      <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 8 }}>Mix up to two 🎧</div>
      <div className="grid3">
        {SLEEP_SOUNDS.map((s) => (
          <button key={s.id} className="aac-word" onClick={() => toggleSleepMix(s.id)}
            style={mix.includes(s.id) ? { borderColor: '#1A1040', borderWidth: 3 } : {}}>
            <div className="emoji">{s.emoji}</div><div className="wlabel">{s.name}</div>
            <div style={{ fontSize: 11 }}>{mix.includes(s.id) ? '⏸️' : '▶️'}</div>
          </button>
        ))}
      </div>
      <Card style={{ marginTop: 10 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <b>⏰ Sleep timer</b>
          <div className="row" style={{ gap: 4 }}>
            {[0, 15, 30, 60].map((m) => (
              <Btn key={m} size="sm" color={sleepTimer === m ? 'orange' : 'cream'} onClick={() => setSleepTimer(m)}>{m === 0 ? 'Off' : m + 'm'}</Btn>
            ))}
          </div>
        </div>
        {mix.length > 0 && <div style={{ marginTop: 8 }}><Btn color="red" block onClick={stop}>Stop Sounds ⏹️</Btn></div>}
      </Card>

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}

export default Music;
