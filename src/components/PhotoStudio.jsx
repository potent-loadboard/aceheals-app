import React, { useState, useRef, useEffect } from 'react';
import { Card, Btn, SectionHead } from '../components/ui.jsx';
import { useStored, toast } from '../lib/store.js';

const FRAMES = [
  { id: 'none', name: 'No frame', icons: [] },
  { id: 'crown', name: '👑 Royal', icons: ['👑', '👑'] },
  { id: 'stars', name: '⭐ Starry', icons: ['⭐', '✨', '🌟'] },
  { id: 'hearts', name: '💛 Hearts', icons: ['💛', '💛', '💛'] },
  { id: 'party', name: '🎉 Party', icons: ['🎉', '🎊', '🥳'] },
];

export default function PhotoStudio() {
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [frame, setFrame] = useState(FRAMES[1]);
  const [gallery, setGallery] = useStored('mannyPhotos', []);
  const [camError, setCamError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCam = async () => {
    setCamError(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
    } catch {
      setCamError(true);
      toast('📷 Camera needs permission — ask a grown-up to allow it');
    }
  };

  const stopCam = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
    return () => stream?.getTracks().forEach((t) => t.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  const snap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // draw frame icons on top
    ctx.font = `${Math.floor(canvas.width / 8)}px serif`;
    ctx.textAlign = 'center';
    frame.icons.forEach((ic, i) => {
      const x = canvas.width * ((i + 1) / (frame.icons.length + 1));
      ctx.fillText(ic, x, canvas.width / 7);
    });
    const url = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(url);
    setGallery((g) => [url, ...g].slice(0, 30));
    toast('📸 Nice shot, photographer!');
    try { navigator.vibrate?.(50); } catch {}
  };

  const deletePhoto = (url) => setGallery((g) => g.filter((x) => x !== url));

  const exportPhoto = (url, i) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `manny-photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('💾 Photo saved to your device!');
  };

  return (
    <div>
      <SectionHead title="📷 Manny's Photo Studio" />
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 10, fontWeight: 800 }}>
          Pick a frame, then say cheese! 🧀
        </div>
        <div className="row" style={{ gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {FRAMES.map((f) => (
            <Btn key={f.id} size="sm" color={frame.id === f.id ? 'yellow' : 'cream'}
              onClick={() => setFrame(f)}>{f.name}</Btn>
          ))}
        </div>

        {!stream && !photo && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {camError
              ? <div>📷😢 Camera blocked — ask a grown-up to allow camera access, then try again.<br /><br /></div>
              : <div style={{ fontSize: 64, marginBottom: 8 }}>📸</div>}
            <Btn color="blue" onClick={startCam} style={{ fontSize: 20, padding: '16px 32px' }}>
              Open Camera 📷
            </Btn>
          </div>
        )}

        {stream && !photo && (
          <div>
            <div className="km-photo-frame">
              <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
              <div className="km-frame-overlay">
                {frame.icons.map((ic, i) => <span key={i}>{ic}</span>)}
              </div>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <Btn block color="pink" onClick={snap} style={{ fontSize: 22, padding: 16 }}>📸 SNAP!</Btn>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button onClick={stopCam} style={{ background: 'none', border: 'none', color: '#9d8fd0', textDecoration: 'underline', cursor: 'pointer' }}>
                Close camera
              </button>
            </div>
          </div>
        )}

        {photo && (
          <div>
            <div className="km-photo-frame">
              <img src={photo} alt="Manny's photo" />
            </div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <Btn block color="green" onClick={() => { setPhoto(null); startCam(); }}>📷 Take another</Btn>
              <Btn block color="cream" onClick={() => { setPhoto(null); stopCam(); }}>Done ✓</Btn>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Card>

      {gallery.length > 0 && (
        <Card>
          <b>🖼️ My Photos ({gallery.length})</b>
          <div className="km-gallery" style={{ marginTop: 10 }}>
            {gallery.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt={`Photo ${i + 1}`} />
                <button onClick={() => exportPhoto(url, i)}
                  style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(0,229,255,.85)', color: '#0d0628', border: 'none', borderRadius: 10, padding: '4px 8px', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>💾 Save</button>
                <button onClick={() => deletePhoto(url)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#9d8fd0', marginTop: 8, textAlign: 'center' }}>
            🔒 Photos stay on this device — never uploaded.
          </div>
        </Card>
      )}
    </div>
  );
}
