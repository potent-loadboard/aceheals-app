import React, { useState, useEffect } from 'react';
import { Card, Btn, SectionHead, Paywall, Footer } from '../components/ui.jsx';
import { useStored, toast } from '../lib/store.js';
import { hasAccess } from '../lib/paywall.js';
import { FREQUENCIES, KIDS_CHANNELS, PLAYLISTS, SLEEP_SOUNDS } from '../data/content.js';
import { playFrequency, playAmbience, stopAudio, drum } from '../lib/audio.js';
import { saveBeat, listBeats, deleteBeat } from '../lib/beatStore.js';
import { BUNDLED_BEATS } from '../data/beats.js';
import SongStudio from '../components/SongStudio.jsx';

function Music({ onDisclaimer }) {
  const paid = hasAccess();
  const [playing, setPlaying] = useState(null); // {kind:'freq'|'calm'|'sleep', id}
  const [mix, setMix] = useState([]);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [favs, setFavs] = useStored('musicFavs', []);
  const [instrumentals, setInstrumentals] = useState([]);
  const [currentBeat, setCurrentBeat] = useState(null);
  const [musicSec, setMusicSec] = useState('beats');
  const [songKid, setSongKid] = useState('manny');
  const beatFileRef = React.useRef(null);
  const beatAudioRef = React.useRef(null);

  useEffect(() => {
    listBeats().then(setInstrumentals).catch(() => {});
  }, []);

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

  const handleBeatUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const id = 'beat-' + Date.now();
      await saveBeat(id, file.name.replace(/\.[^.]+$/, ''), file);
      const list = await listBeats();
      setInstrumentals(list);
      toast('🔥 Beat added to the library!');
    } catch {
      toast('😢 Could not save that file');
    }
    e.target.value = '';
  };

  const playBeat = (b) => {
    stopAudio();
    const url = URL.createObjectURL(b.blob);
    if (beatAudioRef.current) { beatAudioRef.current.src = url; beatAudioRef.current.play(); }
    setCurrentBeat(b.id);
    setPlaying(null);
  };

  const playBundled = (b) => {
    stopAudio();
    if (beatAudioRef.current) { beatAudioRef.current.src = b.file; beatAudioRef.current.play(); }
    setCurrentBeat(b.id);
    setPlaying(null);
  };

  const stopBeat = () => { beatAudioRef.current?.pause(); setCurrentBeat(null); };

  const removeBeat = async (id) => {
    await deleteBeat(id);
    setInstrumentals(await listBeats());
    if (currentBeat === id) { beatAudioRef.current?.pause(); setCurrentBeat(null); }
  };

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

      <SectionHead title="🔥 Tony's Beats" />
      <Card style={{ background: 'linear-gradient(180deg,#2a1a4e,#1A1040)', borderColor: '#9B59B6', color: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 40 }}>🎛️</div>
          <b style={{ fontSize: 16 }}>Breez Moira Production</b>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Original instrumentals — pick one and make a song! All ages.</div>
        </div>
        <div className="row" style={{ gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn color="purple" onClick={() => setMusicSec('songs')}>🎤 Song Studio</Btn>
          <Btn color="orange" onClick={() => beatFileRef.current?.click()}>📥 Add a Beat</Btn>
        </div>
        <input ref={beatFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleBeatUpload} />
        <audio ref={beatAudioRef} style={{ display: 'none' }} onEnded={() => setCurrentBeat(null)} />
      </Card>

      {musicSec === 'songs' ? (
        <div style={{ marginTop: 10 }}>
          <div className="row" style={{ marginBottom: 10, gap: 6 }}>
            <Btn size="sm" color={songKid === 'manny' ? 'orange' : 'cream'} onClick={() => setSongKid('manny')}>🎮 Manny</Btn>
            <Btn size="sm" color={songKid === 'maverick' ? 'orange' : 'cream'} onClick={() => setSongKid('maverick')}>⚡ Maverick</Btn>
            <div style={{ flex: 1 }} />
            <Btn size="sm" color="cream" onClick={() => setMusicSec('beats')}>← Beats</Btn>
          </div>
          <SongStudio kidId={songKid} kidName={songKid === 'manny' ? 'Manny' : 'Maverick'} />
        </div>
      ) : (
      <>
      {/* Bundled beats */}
      <div style={{ marginTop: 8 }}>
        {BUNDLED_BEATS.map((b) => (
          <div key={b.id} className="check-item" style={currentBeat === b.id ? { borderColor: '#9B59B6', borderWidth: 2 } : {}}>
            <div style={{ fontSize: 28 }}>{b.mood}</div>
            <div style={{ flex: 1 }} onClick={() => playBundled(b)}>
              <b style={{ color: '#1A1040' }}>{b.name}</b>
              <div style={{ fontSize: 12, color: '#8a7f9e' }}>{b.bpm} BPM • {b.key} {currentBeat === b.id ? '• ▶️ playing' : ''}</div>
            </div>
            {currentBeat === b.id && (
              <Btn size="sm" color="red" onClick={stopBeat}>⏹️</Btn>
            )}
          </div>
        ))}
      </div>
      {/* Uploaded beats */}
      {instrumentals.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <b>📥 Uploaded</b>
          {instrumentals.map((b) => (
            <div key={b.id} className="check-item" style={currentBeat === b.id ? { borderColor: '#9B59B6', borderWidth: 2 } : {}}>
              <div style={{ fontSize: 28 }}>🎧</div>
              <div style={{ flex: 1 }} onClick={() => playBeat(b)}>
                <b style={{ color: '#1A1040' }}>{b.name}</b>
                <div style={{ fontSize: 12, color: '#8a7f9e' }}>{currentBeat === b.id ? '▶️ Now playing' : 'Tap to play'}</div>
              </div>
              {currentBeat === b.id && (
                <Btn size="sm" color="red" onClick={() => { beatAudioRef.current?.pause(); setCurrentBeat(null); }}>⏹️</Btn>
              )}
              <button className="btn-gloss btn-red btn-sm" onClick={() => removeBeat(b.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
      </>
      )}

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
