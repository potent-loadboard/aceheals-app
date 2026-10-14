import React, { useState, useEffect } from 'react';
import { Card, Btn, SectionHead, Loading, Empty, Footer, PBar, Modal, Confetti } from '../components/ui.jsx';
import { useStored, toast, speak } from '../lib/store.js';
import VisualClock from '../components/VisualClock.jsx';
import { GAMES, PRAISE, TRY_AGAIN } from '../data/games.js';
import PhotoStudio from '../components/PhotoStudio.jsx';
import StickerWorld from '../components/StickerWorld.jsx';
import StoryMaker from '../components/StoryMaker.jsx';
import CharacterCreator from '../components/CharacterCreator.jsx';
import { Mascot } from '../components/Mascot.jsx';
import { useKidProfile } from '../lib/kidProfile.js';
import { useSensory } from '../components/SensorySettings.jsx';

// ================= GAME SHELL =================
function GameShell({ game, onExit }) {
  const [diff, setDiff] = useState('k2');
  const [q, setQ] = useState(() => game.gen('k2'));
  const [picked, setPicked] = useState(null);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastEarned, setLastEarned] = useState(2);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const { recordGamePlay, getSuggestedDifficulty } = useKidProfile('manny');
  const [timerOn, setTimerOn] = useState(false);
  const [secs, setSecs] = useState(0);
  const [stats, setStats] = useStored('gameStats:' + game.id, { attempts: 0, correct: 0, byDiff: {} });
  const [totalStars, setTotalStars] = useStored('mannyStars', 0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!timerOn) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerOn]);

  const next = (d = diff) => {
    const usedKeys = usedRef.current;
    const newQ = game.id === 'rhyme' ? game.gen(d, usedKeys) : game.gen(d);
    if (newQ.usedKey) usedKeys.push(newQ.usedKey);
    setQ(newQ); setPicked(null); setShowHint(false);
    // Narrate the question (unless it's the memory memorize phase)
    if (!newQ.completed && game.id !== 'memory') {
      setTimeout(() => speak(newQ.q), 300);
    }
    // Memory game: show memorize phase first
    if (game.id === 'memory') {
      setMemorizing(true);
      setTimeout(() => setMemorizing(false), 3000);
    }
  };
  const usedRef = React.useRef([]);
  const [memorizing, setMemorizing] = useState(game.id === 'memory');

  // Start memorize timer on first load for memory game
  useEffect(() => {
    if (game.id === 'memory') {
      setMemorizing(true);
      const t = setTimeout(() => setMemorizing(false), 3000);
      return () => clearTimeout(t);
    }
  }, [game.id]);

  // Auto-suggest difficulty based on learned profile
  useEffect(() => {
    const suggested = getSuggestedDifficulty(game.id);
    if (suggested !== diff) {
      setDiff(suggested);
      setQ(game.gen(suggested));
      setPicked(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    const ok = opt === q.answer;
    setAttemptCount((a) => a + 1);
    if (ok) setCorrectCount((c) => c + 1);
    // Learn from this play
    recordGamePlay(game.id, diff, ok ? 1 : 0, 1);
    setStats((s) => ({ attempts: s.attempts + 1, correct: s.correct + (ok ? 1 : 0),
      byDiff: { ...s.byDiff, [diff]: (s.byDiff[diff] || 0) + (ok ? 1 : 0) } }));
    if (ok) {
      const earned = { prek: 1, k2: 2, g34: 3, g56: 4, g78: 5 }[diff] || 2;
      setLastEarned(earned);
      setStars((s) => s + earned);
      setTotalStars((s) => s + earned);
      setStreak((s) => s + 1);
      speak(pick2(PRAISE));
      setTimeout(() => next(), 1400);
    } else {
      setStreak(0);
      setShowHint(true);
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <Btn color="blue" onClick={onExit} style={{ fontSize: 18, padding: '12px 20px' }}>← Back</Btn>
        <div style={{ flex: 1 }} />
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['prek', '🍼 Pre-K', '#2ECC71'],
            ['k2', '🧒 K-2', '#3498DB'],
            ['g34', '📚 3-4', '#9B59B6'],
            ['g56', '📖 5-6', '#F1C40F'],
            ['g78', '🎓 7-8', '#E91E8C'],
          ].map(([d, l, col]) => (
            <button key={d} onClick={() => { setDiff(d); next(d); }}
              style={{
                background: diff === d ? col : 'rgba(255,255,255,.08)',
                border: `2px solid ${diff === d ? col : 'rgba(255,255,255,.2)'}`,
                borderRadius: 14, padding: '8px 12px', cursor: 'pointer',
                color: diff === d ? '#0d0628' : '#fff', fontWeight: 900, fontSize: 13,
                boxShadow: diff === d ? `0 0 14px ${col}` : 'none',
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <Card style={{ textAlign: 'center', padding: 24 }}>
        {q.completed ? (
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 80 }}>🏆</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ffe600', marginTop: 12 }}>
              You did ALL the rhymes!
            </div>
            <div style={{ fontSize: 16, color: '#b9a8e8', marginTop: 8 }}>
              Amazing work, superstar! 🌟
            </div>
            <div style={{ marginTop: 16 }}>
              <Btn color="purple" onClick={() => { usedRef.current = []; next(); }} style={{ fontSize: 18, padding: '14px 28px', marginRight: 8 }}>
                🔄 Play Again
              </Btn>
              <Btn color="blue" onClick={onExit} style={{ fontSize: 18, padding: '14px 28px' }}>
                ← Back to Games
              </Btn>
            </div>
          </div>
        ) : (
        <>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="streak-badge">⭐ {stars} this game</span>
          <span className="pill">🔥 streak {streak}</span>
          <Btn size="sm" color={timerOn ? 'blue' : 'cream'} onClick={() => { setTimerOn(!timerOn); setSecs(0); }}>⏱️ {timerOn ? secs + 's' : 'Timer'}</Btn>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#8a7f9e', marginBottom: 8 }}>
          {game.id === 'memory' && memorizing ? '👀 Memorize these friends!' : q.q}
        </div>
        {game.id === 'memory' && memorizing ? (
          <div style={{
            fontSize: 48, padding: 24, textAlign: 'center',
            background: 'linear-gradient(135deg,#1a0f2e,#2a1a4e)',
            border: '3px solid #9B59B6', borderRadius: 20,
            letterSpacing: 8, lineHeight: 1.6,
          }}>
            {q.fullSet?.join('  ')}
            <div style={{ fontSize: 14, color: '#b9a8e8', marginTop: 12, letterSpacing: 2 }}>
              Remember them all! 🧠
            </div>
          </div>
        ) : q.visualClock ? (
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <VisualClock timeStr={q.visualClock} size={220} />
          </div>
        ) : q.bigDisplay ? (
          <div style={{ fontSize: 120, textAlign: 'center', margin: '16px 0', lineHeight: 1 }}>{q.display}</div>
        ) : (
          <div className={`game-q-display${game.id === 'pattern' ? ' pattern' : ''}`}>{q.display}</div>
        )}
        {!(game.id === 'memory' && memorizing) && (
        <>
        <div className="grid2" style={{ marginTop: 14 }}>
          {q.options.map((opt, oi) => {
            const isAns = opt === q.answer;
            const isPicked = picked === opt;
            let bg = {};
            if (picked && isAns) bg = { background: 'linear-gradient(180deg,#8fe6b3,#2ECC71)', color: '#fff' };
            else if (isPicked && !isAns) bg = { background: 'linear-gradient(180deg,#ffb3a6,#e74c3c)', color: '#fff' };
            return (
              <button key={`${oi}-${String(opt)}`} className="game-btn" onClick={() => pick(opt)} disabled={!!picked}
                style={{ '--g1': '#9fd4f5', '--g2': '#3498DB', '--g3': '#2378b3', ...bg, fontSize: String(opt).length > 10 ? 15 : 20, padding: '16px 8px' }}>
                {String(opt)}
              </button>
            );
          })}
        </div>
        {picked && picked === q.answer && (
          <div style={{
            marginTop: 16, padding: 20, borderRadius: 20, textAlign: 'center',
            background: 'linear-gradient(135deg,#1a0f2e,#2a1a4e)',
            border: '3px solid #ffe600',
            boxShadow: '0 0 40px rgba(255,230,0,.6), 0 0 80px rgba(255,230,0,.3)',
            animation: 'celebrate-pop .5s ease-out',
          }}>
            <div style={{ fontSize: 72, animation: 'kid-bob .8s ease-in-out infinite' }}>🦅</div>
            <div style={{ fontSize: 14, color: '#F1C40F', fontWeight: 700, marginTop: 4 }}>
              Giffy says:
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ffe600', textShadow: '0 0 20px rgba(255,230,0,.8)', marginTop: 4 }}>
              {pick2(PRAISE)}
            </div>
            <div style={{ fontSize: 16, color: '#F1C40F', fontStyle: 'italic', marginTop: 6 }}>
              "{pick2(GIFFY_PRAISE)}"
            </div>
            <div style={{ fontSize: 40, marginTop: 8 }}>⭐🌟⭐</div>
            <div style={{ fontSize: 14, color: '#b9a8e8', marginTop: 4 }}>+{lastEarned} stars!</div>
          </div>
        )}
        {picked && picked !== q.answer && (
          <div style={{
            marginTop: 16, padding: 16, borderRadius: 16, textAlign: 'center',
            background: 'linear-gradient(135deg,#2a1a3e,#1a0f2e)',
            border: '2px solid #9B59B6',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{TRY_AGAIN}</div>
            <div style={{ fontSize: 14, marginTop: 6, color: '#b9a8e8' }}>💡 {q.hint}</div>
            <div style={{ marginTop: 10 }}><Btn color="purple" onClick={() => next()} style={{ fontSize: 16, padding: '12px 24px' }}>Try Again 💪</Btn></div>
          </div>
        )}
        {!picked && (
          <div style={{ marginTop: 10 }}><Btn size="sm" color="cream" onClick={() => setShowHint(!showHint)}>💡 Hint</Btn></div>
        )}
        {showHint && !picked && <div style={{ fontSize: 14, marginTop: 8, color: '#8a7f9e' }}>💡 {q.hint}</div>}
        </>
        )}
        </>
        )}
      </Card>
      {/* Big back button at bottom — easy thumb reach on tablet */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Btn color="blue" onClick={onExit} style={{ fontSize: 20, padding: '16px 40px' }}>
          ← Back to Games
        </Btn>
      </div>
    </div>
  );
}
const GIFFY_PRAISE = [
  "RAWR! You're amazing!",
  "*happy wing flaps* You did it!",
  "I'm so proud I could fly!",
  "Best human ever! Can I be your sidekick?",
  "WOW! Even my eagle eyes are impressed!",
  "You did that! High-five with my tiny wing!",
];
function pick2(a) { return a[Math.floor(Math.random() * a.length)]; }

// ================= ASL =================
// ================= REWARDS =================
function Rewards() {
  const [stars] = useStored('mannyStars', 0);
  const [goal, setGoal] = useStored('mannyGoal', { stars: 50, reward: 'Movie night 🍿' });
  const [celebrate, setCelebrate] = useState(false);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(goal);
  const { sensory } = useSensory();

  useEffect(() => {
    if (stars >= goal.stars && goal.stars > 0) setCelebrate(true);
  }, [stars, goal.stars]);

  return (
    <div>
      {celebrate && (
        <Modal onClose={() => setCelebrate(false)} title={sensory.muteCelebrations ? "🌟 Nice work!" : "🎉 REWARD EARNED!"}>
          {!sensory.muteCelebrations && <Confetti pieces={80} />}
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 70 }}>🏆</div>
            <h2>{goal.reward}</h2>
            <p>{stars} stars! {sensory.muteCelebrations ? 'Well done.' : 'You earned it, superstar!'}</p>
            <Btn block onClick={() => {
              setGoal({ ...goal, stars: goal.stars + 50 });
              setCelebrate(false);
            }}>Claim & Set Next Goal 🚀</Btn>
          </div>
        </Modal>
      )}
      <Card style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60 }}>⭐</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: '#FF6B35' }}>{stars}</div>
        <div style={{ color: '#8a7f9e' }}>stars earned from games</div>
        <div style={{ margin: '12px 0' }}><PBar pct={(stars / goal.stars) * 100} color="#F1C40F" /></div>
        <b>🎯 Goal: {goal.stars} stars → {goal.reward}</b>
        <div style={{ marginTop: 10 }}>
          {!edit ? <Btn size="sm" color="cream" onClick={() => { setDraft(goal); setEdit(true); }}>Edit Goal ✏️</Btn> : (
            <div>
              <div className="row">
                <input className="input-gloss" type="number" value={draft.stars} onChange={(e) => setDraft({ ...draft, stars: Number(e.target.value) })} placeholder="Stars" />
                <input className="input-gloss" value={draft.reward} onChange={(e) => setDraft({ ...draft, reward: e.target.value })} placeholder="Reward" />
              </div>
              <div style={{ marginTop: 8 }}><Btn size="sm" onClick={() => { setGoal(draft); setEdit(false); }}>Save 💾</Btn></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ================= REPORT CARD =================
function Report() {
  const rows = GAMES.map((g) => {
    let s = { attempts: 0, correct: 0 };
    try { s = JSON.parse(localStorage.getItem('aceheals:gameStats:' + g.id)) || s; } catch {}
    return { g, ...s, acc: s.attempts ? Math.round((s.correct / s.attempts) * 100) : null };
  });
  const played = rows.filter((r) => r.attempts > 0);
  const totalA = played.reduce((a, r) => a + r.attempts, 0);
  const totalC = played.reduce((a, r) => a + r.correct, 0);
  const sorted = [...played].sort((a, b) => (b.acc || 0) - (a.acc || 0));

  const share = () => {
    const txt = `🌟 Manny's Learning Report\n${played.length} games played • ${totalA} questions • ${totalC} correct (${totalA ? Math.round(totalC / totalA * 100) : 0}% accuracy)\n` +
      sorted.slice(0, 5).map((r) => `${r.g.emoji} ${r.g.name}: ${r.acc}%`).join('\n');
    if (navigator.share) navigator.share({ title: "Manny's Report", text: txt }).catch(() => {});
    else navigator.clipboard?.writeText(txt).then(() => toast('📋 Report copied — share with teachers!'));
  };

  if (!played.length) return <Empty emoji="📊" title="No games played yet" sub="Play some games and watch this report fill up!" />;
  return (
    <div>
      <Card style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 44 }}>📊</div>
        <h3 style={{ color: '#1A1040', margin: '4px 0' }}>Learning Report Card</h3>
        <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <div className="stat-gloss"><div style={{ fontSize: 22, fontWeight: 900 }}>{played.length}</div><div style={{ fontSize: 11 }}>games</div></div>
          <div className="stat-gloss"><div style={{ fontSize: 22, fontWeight: 900 }}>{totalA}</div><div style={{ fontSize: 11 }}>questions</div></div>
          <div className="stat-gloss"><div style={{ fontSize: 22, fontWeight: 900, color: '#2ECC71' }}>{totalA ? Math.round(totalC / totalA * 100) : 0}%</div><div style={{ fontSize: 11 }}>accuracy</div></div>
        </div>
      </Card>
      {sorted[0] && (
        <Card style={{ marginBottom: 10, background: 'linear-gradient(180deg,#e8f9ef,#d8f5e3)' }}>
          <b>🌟 Most improved:</b> {sorted[0].g.emoji} {sorted[0].g.name} ({sorted[0].acc}%)
        </Card>
      )}
      {[...sorted].reverse()[0] && sorted.length > 1 && (
        <Card style={{ marginBottom: 10, background: 'linear-gradient(180deg,#fff8ec,#ffefd6)' }}>
          <b>💪 Needs practice:</b> {[...sorted].reverse()[0].g.emoji} {[...sorted].reverse()[0].g.name} ({[...sorted].reverse()[0].acc}%)
        </Card>
      )}
      {rows.map(({ g, attempts, correct, acc }) => attempts > 0 && (
        <div key={g.id} className="check-item">
          <div style={{ fontSize: 26 }}>{g.emoji}</div>
          <div style={{ flex: 1 }}><b>{g.name}</b><div style={{ fontSize: 12, color: '#8a7f9e' }}>{correct}/{attempts} correct</div></div>
          <span className={`pill ${acc >= 80 ? 'green' : acc >= 50 ? 'yellow' : 'red'}`}>{acc}%</span>
        </div>
      ))}
      <div style={{ marginTop: 12 }}><Btn color="blue" block onClick={share}>📤 Share with Teachers / Tutors</Btn></div>
    </div>
  );
}

// ================= MAIN =================
export default function Manny({ onDisclaimer }) {
  const [sec, setSec] = useState('games');
  const [game, setGame] = useState(null);
  const [stars] = useStored('mannyStars', 0);
  const active = GAMES.find((g) => g.id === game);

  return (
    <div className="screen">
      <SectionHead title="🎮 Manny's World" right={<span className="streak-badge">⭐ {stars}</span>} />
      {!game && (
        <div className="row" style={{ marginBottom: 12, gap: 6, flexWrap: 'wrap' }}>
          {[['games', '🎮 Games'], ['camera', '📷 Camera'], ['story', '📖 Story'], ['world', '🌍 My World'], ['buddy', '🎨 My Buddy'], ['rewards', '🏆 Rewards'], ['report', '📊 Report']].map(([id, l]) => (
            <Btn key={id} size="sm" color={sec === id ? 'orange' : 'cream'} onClick={() => setSec(id)}>{l}</Btn>
          ))}
        </div>
      )}
      {sec === 'games' && !game && <Mascot kidId="manny" mood="greeting" />}

      {sec === 'games' && !active && (
        <div className="grid2">
          {GAMES.map((g) => (
            <button key={g.id} className="game-btn" onClick={() => setGame(g.id)}
              style={{ '--g1': g.color + '99', '--g2': g.color, '--g3': g.color + 'bb', minHeight: 96 }}>
              <div style={{ fontSize: 34 }}>{g.emoji}</div>
              <div style={{ fontSize: 14 }}>{g.name}</div>
            </button>
          ))}
        </div>
      )}
      {sec === 'games' && active && <GameShell game={active} onExit={() => setGame(null)} />}
      {sec === 'camera' && <PhotoStudio />}
      {sec === 'story' && <StoryMaker />}
      {sec === 'world' && <StickerWorld kidId="manny" />}
      {sec === 'buddy' && <CharacterCreator kidId="manny" onDone={() => setSec('games')} />}
      {sec === 'rewards' && <Rewards />}
      {sec === 'report' && <Report />}

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}
