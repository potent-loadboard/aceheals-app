import React, { useState, useRef } from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { useStored, toast, speak } from '../lib/store.js';
import { BUNDLED_BEATS } from '../data/beats.js';

// Song Studio — pick a beat, write lyrics with parent help, record your song!
// Lyrics are kid-friendly: big text, line-by-line, parent can type for little ones.
const LYRIC_PROMPTS = [
  "What makes you happy? 😊",
  "What's your favorite thing to do? 🎮",
  "If you had a superpower, what would it be? 🦸",
  "What's the coolest animal? 🦁",
  "Where would you travel? ✈️",
  "What do you want to be when you grow up? 🌟",
];

export default function SongStudio({ kidId = 'manny', kidName = 'Manny' }) {
  const [songs, setSongs] = useStored(`${kidId}Songs`, []);
  const [activeSong, setActiveSong] = useState(null);
  const [beat, setBeat] = useState(BUNDLED_BEATS[0]);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const beatRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const createSong = () => {
    const song = {
      id: Date.now(), title: 'My Song', beatId: beat.id,
      lines: ['', '', '', ''], created: new Date().toISOString(),
    };
    setSongs((s) => [song, ...s]);
    setActiveSong(song.id);
  };

  const updateSong = (id, patch) => {
    setSongs((songs) => songs.map((s) => s.id === id ? { ...s, ...patch } : s));
    if (activeSong === id) setActiveSong(id); // refresh
  };

  const getSong = (id) => songs.find((s) => s.id === id);

  const updateLine = (songId, idx, text) => {
    const song = getSong(songId);
    const lines = [...song.lines];
    lines[idx] = text;
    updateSong(songId, { lines });
  };

  const addLine = (songId) => {
    const song = getSong(songId);
    if (song.lines.length >= 16) { toast('📝 16 lines max — keep it punchy!'); return; }
    updateSong(songId, { lines: [...song.lines, ''] });
  };

  const deleteSong = (id) => {
    setSongs(songs.filter((s) => s.id !== id));
    if (activeSong === id) setActiveSong(null);
    toast('🗑️ Song deleted');
  };

  // Play beat + record vocals simultaneously
  const startRecording = async (song) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Start the beat
      const beatInfo = BUNDLED_BEATS.find((b) => b.id === song.beatId) || BUNDLED_BEATS[0];
      if (beatRef.current) {
        beatRef.current.src = beatInfo.file;
        beatRef.current.loop = true;
        await beatRef.current.play();
      }
      // Start vocal recording
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        updateSong(song.id, { vocalUrl: url });
        stream.getTracks().forEach((t) => t.stop());
        if (beatRef.current) { beatRef.current.pause(); beatRef.current.currentTime = 0; }
        toast('🎤 Song recorded! You\'re a star!');
        speak('Amazing! You made a song!');
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(song.id);
      toast('🔴 Recording... sing your heart out!');
    } catch {
      toast('🎤 Mic needs permission — ask a grown-up!');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(null);
  };

  const playSong = (song) => {
    const beatInfo = BUNDLED_BEATS.find((b) => b.id === song.beatId) || BUNDLED_BEATS[0];
    if (beatRef.current) {
      beatRef.current.src = beatInfo.file;
      beatRef.current.loop = false;
      beatRef.current.play();
    }
    if (song.vocalUrl) {
      // Play vocals on top (simple — may not be perfectly synced, but fun!)
      const v = new Audio(song.vocalUrl);
      v.play().catch(() => {});
    }
    setPlaying(song.id);
    beatRef.current.onended = () => setPlaying(null);
  };

  const stopPlayback = () => {
    beatRef.current?.pause();
    setPlaying(null);
  };

  const song = activeSong ? getSong(activeSong) : null;

  return (
    <div>
      <SectionHead title="🎤 Song Studio" />
      <audio ref={beatRef} style={{ display: 'none' }} />

      {!song ? (
        <div>
          <Card style={{ textAlign: 'center', background: 'linear-gradient(180deg,#2a1a4e,#1a0f2e)', borderColor: '#9B59B6' }}>
            <div style={{ fontSize: 48 }}>🎤🎵</div>
            <b style={{ fontSize: 18 }}>Make your own songs!</b>
            <div style={{ fontSize: 14, color: '#c9b8e8', margin: '8px 0 12px' }}>
              1. Pick a beat 🎧<br />
              2. Write lyrics with a grown-up ✏️<br />
              3. Hit record and SING! 🎤
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>🎧 Pick a beat:</b>
              <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {BUNDLED_BEATS.map((b) => (
                  <Btn key={b.id} size="sm" color={beat.id === b.id ? 'purple' : 'cream'}
                    onClick={() => setBeat(b)}>
                    {b.mood} {b.name}
                  </Btn>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#8a7f9e', marginTop: 6 }}>
                {beat.name} • {beat.bpm} BPM • {beat.key}
              </div>
            </div>
            <Btn block color="orange" onClick={createSong} style={{ fontSize: 18 }}>
              ✏️ Start a New Song!
            </Btn>
          </Card>

          {songs.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <b>🎵 My Songs ({songs.length})</b>
              {songs.map((s) => {
                const b = BUNDLED_BEATS.find((x) => x.id === s.beatId);
                return (
                  <Card key={s.id} style={{ marginTop: 8 }}>
                    <div className="row" style={{ alignItems: 'center' }}>
                      <div style={{ fontSize: 32 }}>🎤</div>
                      <div style={{ flex: 1 }}>
                        <b>{s.title}</b>
                        <div style={{ fontSize: 12, color: '#8a7f9e' }}>
                          {b?.mood} {b?.name} • {s.lines.filter((l) => l.trim()).length} lines
                          {s.vocalUrl ? ' • 🎤 recorded!' : ''}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 4 }}>
                        {playing === s.id
                          ? <Btn size="sm" color="red" onClick={stopPlayback}>⏹️</Btn>
                          : <Btn size="sm" color="blue" onClick={() => playSong(s)}>▶️</Btn>}
                        <Btn size="sm" color="cream" onClick={() => setActiveSong(s.id)}>✏️</Btn>
                        <button className="btn-gloss btn-red btn-sm" onClick={() => deleteSong(s.id)}>✕</button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="row" style={{ marginBottom: 10 }}>
            <Btn size="sm" color="cream" onClick={() => setActiveSong(null)}>← My Songs</Btn>
          </div>
          <Card>
            <b>🎵 Song title</b>
            <input className="input-gloss" value={song.title}
              onChange={(e) => updateSong(song.id, { title: e.target.value.slice(0, 40) })}
              style={{ marginTop: 6, fontSize: 20, textAlign: 'center' }} maxLength={40} />
          </Card>

          <Card style={{ marginTop: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <b>🎧 Beat: {BUNDLED_BEATS.find((b) => b.id === song.beatId)?.name}</b>
              <Btn size="sm" color="cream" onClick={() => {
                const idx = BUNDLED_BEATS.findIndex((b) => b.id === song.beatId);
                const next = BUNDLED_BEATS[(idx + 1) % BUNDLED_BEATS.length];
                updateSong(song.id, { beatId: next.id });
              }}>🔄 Change beat</Btn>
            </div>
            {playing === song.id
              ? <Btn block color="red" onClick={stopPlayback} style={{ marginTop: 8 }}>⏹️ Stop</Btn>
              : <Btn block color="blue" onClick={() => playSong(song)} style={{ marginTop: 8 }}>▶️ Play beat</Btn>}
          </Card>

          <Card style={{ marginTop: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <b>✏️ Lyrics</b>
              <span style={{ fontSize: 12, color: '#8a7f9e' }}>Ask a grown-up to help type!</span>
            </div>
            <div style={{ background: 'rgba(155,89,182,.1)', padding: 10, borderRadius: 10, marginBottom: 10, fontSize: 13 }}>
              💡 <b>Stuck?</b> {LYRIC_PROMPTS[Math.floor(Math.random() * LYRIC_PROMPTS.length)]}
            </div>
            {song.lines.map((line, i) => (
              <div key={i} className="row" style={{ gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <span style={{ color: '#8a7f9e', fontSize: 13, minWidth: 20 }}>{i + 1}.</span>
                <input className="input-gloss" placeholder="Write a line..."
                  value={line} onChange={(e) => updateLine(song.id, i, e.target.value)}
                  style={{ fontSize: 16 }} />
              </div>
            ))}
            <Btn size="sm" color="cream" onClick={() => addLine(song.id)} style={{ marginTop: 6 }}>
              ➕ Add a line
            </Btn>
          </Card>

          <Card style={{ marginTop: 10, textAlign: 'center', borderColor: '#E91E8C' }}>
            <b style={{ fontSize: 16 }}>🎤 Record your song!</b>
            <div style={{ fontSize: 13, color: '#8a7f9e', margin: '6px 0 12px' }}>
              The beat plays while you sing. Give it everything!
            </div>
            {recording === song.id ? (
              <div>
                <div style={{ fontSize: 40, animation: 'kid-bob 1s ease-in-out infinite' }}>🔴</div>
                <div style={{ fontWeight: 800, color: '#e74c3c', marginBottom: 10 }}>RECORDING...</div>
                {/* Show lyrics while recording */}
                <div style={{ textAlign: 'left', background: 'rgba(0,0,0,.3)', padding: 12, borderRadius: 12, marginBottom: 10 }}>
                  {song.lines.filter((l) => l.trim()).map((l, i) => (
                    <div key={i} style={{ fontSize: 18, marginBottom: 4, color: '#fff' }}>{l}</div>
                  ))}
                </div>
                <Btn block color="red" onClick={stopRecording} style={{ fontSize: 18 }}>⏹️ Stop Recording</Btn>
              </div>
            ) : (
              <Btn block color="pink" onClick={() => startRecording(song)} style={{ fontSize: 18 }}>
                {song.vocalUrl ? '🎤 Re-record' : '🎤 Record!'}
              </Btn>
            )}
            {song.vocalUrl && recording !== song.id && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#2ECC71' }}>
                ✅ Vocals recorded! Hit ▶️ above to hear your song!
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
