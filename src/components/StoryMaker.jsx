import React, { useState, useRef } from 'react';
import { Card, Btn, SectionHead } from './ui.jsx';
import { useStored, toast } from '../lib/store.js';

// Photo Story Maker — Manny's photos become a slideshow with his own voiceover
export default function StoryMaker() {
  const [photos] = useStored('mannyPhotos', []);
  const [story, setStory] = useStored('mannyStory', []);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(0);
  const [recording, setRecording] = useState(null); // photo index being recorded
  const [voiceovers, setVoiceovers] = useStored('mannyVoiceovers', {});
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const addToStory = (photoUrl) => {
    if (story.length >= 10) { toast('📖 Story is full! (10 pages max)'); return; }
    setStory((s) => [...s, photoUrl]);
    toast('📖 Added to your story!');
  };

  const removeFromStory = (idx) => {
    setStory((s) => s.filter((_, i) => i !== idx));
  };

  const movePage = (idx, dir) => {
    const next = [...story];
    const ni = idx + dir;
    if (ni < 0 || ni >= next.length) return;
    [next[idx], next[ni]] = [next[ni], next[idx]];
    setStory(next);
  };

  const startRecording = async (idx) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceovers((v) => ({ ...v, [story[idx]]: url }));
        stream.getTracks().forEach((t) => t.stop());
        toast('🎤 Voiceover saved!');
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(idx);
    } catch {
      toast('🎤 Mic needs permission — ask a grown-up!');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(null);
  };

  const playStory = () => {
    if (!story.length) return;
    setPlaying(true);
    setPlayIdx(0);
    playPage(0);
  };

  const playPage = (idx) => {
    setPlayIdx(idx);
    const vo = voiceovers[story[idx]];
    if (vo) {
      const a = new Audio(vo);
      a.onended = () => nextPage(idx);
      // Auto-advance after 4s if no voiceover or as fallback
      setTimeout(() => { if (playIdx === idx) nextPage(idx); }, 6000);
      a.play().catch(() => nextPage(idx));
    } else {
      setTimeout(() => nextPage(idx), 3000);
    }
  };

  const nextPage = (idx) => {
    if (idx + 1 < story.length) playPage(idx + 1);
    else { setPlaying(false); toast('🎉 The end! Great story!'); }
  };

  const stopStory = () => setPlaying(false);

  if (playing) {
    return (
      <Card style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 14, color: '#8a7f9e', marginBottom: 8 }}>
          📖 Manny's Story — page {playIdx + 1} of {story.length}
        </div>
        <div className="km-photo-frame">
          <img src={story[playIdx]} alt={`Story page ${playIdx + 1}`} style={{ maxHeight: 400, objectFit: 'contain' }} />
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <Btn size="sm" color="cream" onClick={() => playIdx > 0 && playPage(playIdx - 1)}>← Back</Btn>
          <Btn size="sm" color="red" onClick={stopStory}>⏹️ Stop</Btn>
          <Btn size="sm" color="cream" onClick={() => playIdx + 1 < story.length && playPage(playIdx + 1)}>Next →</Btn>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <SectionHead title="📖 My Story Maker" />
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 40 }}>📖🎤</div>
          <b>Turn your photos into a story!</b>
          <div style={{ fontSize: 13, color: '#8a7f9e', marginTop: 4 }}>
            Pick photos, arrange them, record your voice for each page!
          </div>
        </div>
        {story.length > 0 && (
          <Btn block color="purple" onClick={playStory} style={{ marginBottom: 12 }}>
            ▶️ Play My Story! ({story.length} pages)
          </Btn>
        )}
      </Card>

      {story.length > 0 && (
        <Card style={{ marginTop: 10 }}>
          <b>📄 Story pages (tap 🎤 to record your voice)</b>
          <div style={{ marginTop: 10 }}>
            {story.map((url, i) => (
              <div key={i} className="check-item">
                <img src={url} alt={`Page ${i + 1}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <b>Page {i + 1}</b>
                  <div style={{ fontSize: 12, color: '#8a7f9e' }}>
                    {voiceovers[url] ? '🎤 Voiceover recorded!' : 'No voiceover yet'}
                  </div>
                </div>
                <div className="row" style={{ gap: 4 }}>
                  <Btn size="sm" color={recording === i ? 'red' : 'cream'}
                    onClick={() => recording === i ? stopRecording() : startRecording(i)}>
                    {recording === i ? '⏹️' : '🎤'}
                  </Btn>
                  <Btn size="sm" color="cream" onClick={() => movePage(i, -1)}>↑</Btn>
                  <Btn size="sm" color="cream" onClick={() => movePage(i, 1)}>↓</Btn>
                  <button className="btn-gloss btn-red btn-sm" onClick={() => removeFromStory(i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginTop: 10 }}>
        <b>📷 Pick photos for your story</b>
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#8a7f9e' }}>
            <div style={{ fontSize: 40 }}>📷</div>
            <div>No photos yet!<br />Go to the Camera tab and take some pictures first!</div>
          </div>
        ) : (
          <div className="km-gallery" style={{ marginTop: 10 }}>
            {photos.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt={`Photo ${i + 1}`} />
                <button onClick={() => addToStory(url)}
                  style={{
                    position: 'absolute', bottom: 2, left: 2, right: 2,
                    background: story.includes(url) ? 'rgba(46,204,113,.9)' : 'rgba(0,229,255,.9)',
                    color: '#0d0628', border: 'none', borderRadius: 8, padding: '4px',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  }}>
                  {story.includes(url) ? '✅ In story' : '➕ Add'}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
