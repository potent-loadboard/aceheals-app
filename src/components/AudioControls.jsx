import React, { useState } from 'react';
import { getAudioSettings, saveAudioSettings, AUDIO_MODES } from '../lib/audioSettings.js';
import { stopSpeak } from '../lib/store.js';
import { stopAudio } from '../lib/audio.js';

// Floating audio control button — sound on/off, volume, voice, effects, modes
export default function AudioControls() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getAudioSettings);

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveAudioSettings(next);
    // If master turned off, stop everything immediately
    if (patch.master === false) {
      stopSpeak();
      stopAudio();
    }
  };

  const modeInfo = AUDIO_MODES.find((m) => m.id === settings.mode);
  const icon = !settings.master || settings.mode === 'library' ? '🔇'
    : settings.mode === 'quiet' ? '🔉'
    : settings.mode === 'headphones' ? '🎧' : '🔊';

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 999 }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: 48, height: 48, borderRadius: '50%', fontSize: 22,
          background: 'rgba(26,16,64,.85)', border: '2px solid rgba(255,255,255,.3)',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0,0,0,.4)',
        }}>
        {icon}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 56, right: 0, width: 260,
          background: 'linear-gradient(180deg,#2a1a4e,#1a0f2e)',
          border: '2px solid rgba(155,89,182,.4)', borderRadius: 16,
          padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,.5)',
        }}>
          <div style={{ fontWeight: 900, color: '#fff', marginBottom: 12, fontSize: 16 }}>
            🔊 Sound Controls
          </div>

          {/* Master on/off */}
          <button onClick={() => update({ master: !settings.master })}
            style={{
              width: '100%', padding: '10px', borderRadius: 12, border: 'none',
              background: settings.master ? '#2ECC71' : '#e74c3c',
              color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 10,
            }}>
            {settings.master ? '🔊 Sound ON' : '🔇 Sound OFF'}
          </button>

          {/* Volume slider */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#b9a8e8', marginBottom: 6, fontWeight: 700 }}>
              Volume: {Math.round(settings.volume * 100)}%
            </div>
            <input type="range" min={0} max={100} value={Math.round(settings.volume * 100)}
              onChange={(e) => update({ volume: e.target.value / 100 })}
              style={{ width: '100%', accentColor: '#9B59B6' }} />
          </div>

          {/* Voice narration toggle */}
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>🗣️ Voice Narration</span>
            <button onClick={() => update({ voice: !settings.voice })}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: settings.voice ? '#2ECC71' : '#555', color: '#fff', fontWeight: 700,
              }}>
              {settings.voice ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Sound effects toggle */}
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>✨ Sound Effects</span>
            <button onClick={() => update({ effects: !settings.effects })}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: settings.effects ? '#2ECC71' : '#555', color: '#fff', fontWeight: 700,
              }}>
              {settings.effects ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Modes */}
          <div style={{ fontSize: 13, color: '#b9a8e8', marginBottom: 6, fontWeight: 700 }}>
            Mode: {modeInfo.name}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {AUDIO_MODES.map((m) => (
              <button key={m.id} onClick={() => update({ mode: m.id })}
                title={m.desc}
                style={{
                  padding: '8px 4px', borderRadius: 10, cursor: 'pointer', fontSize: 12,
                  background: settings.mode === m.id ? '#9B59B6' : 'rgba(255,255,255,.08)',
                  border: settings.mode === m.id ? '2px solid #9B59B6' : '2px solid rgba(255,255,255,.15)',
                  color: '#fff', fontWeight: 700,
                }}>
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
