import React, { useState } from 'react';
import { SectionHead, Card, Btn } from '../components/ui.jsx';
import HardMoment from '../components/HardMoment.jsx';
import ParentReset from '../components/ParentReset.jsx';
import RoutineBuilder from '../components/RoutineBuilder.jsx';
import TriggerTracker from '../components/TriggerTracker.jsx';
import SensorySettings from '../components/SensorySettings.jsx';
import { useKidProfile, useParentProfile } from '../lib/kidProfile.js';

export default function Parents() {
  const [sec, setSec] = useState('help');
  const [trigKid, setTrigKid] = useState('manny');
  const manny = useKidProfile('manny');
  const maverick = useKidProfile('maverick');
  const { parent, update } = useParentProfile();

  return (
    <div className="screen">
      <SectionHead title="💛 Parent Zone" />
      <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 12, textAlign: 'center' }}>
        For grown-ups only. Take care of them — and yourself.
      </div>
      <div className="row" style={{ marginBottom: 12, gap: 6, flexWrap: 'wrap' }}>
        {[
          ['help', '🆘 Hard Moment'],
          ['reset', '🧘 My Reset'],
          ['routines', '📋 Routines'],
          ['triggers', '📝 Triggers'],
          ['sensory', '🎛️ Sensory'],
          ['insights', '📊 Insights'],
          ['settings', '⚙️ My Settings'],
        ].map(([id, l]) => (
          <Btn key={id} size="sm" color={sec === id ? 'orange' : 'cream'} onClick={() => setSec(id)}>{l}</Btn>
        ))}
      </div>

      {sec === 'help' && <HardMoment />}
      {sec === 'reset' && <ParentReset />}
      {sec === 'sensory' && <SensorySettings />}
      {sec === 'triggers' && (
        <div>
          <div className="row" style={{ marginBottom: 10, gap: 6 }}>
            <Btn size="sm" color={trigKid === 'manny' ? 'orange' : 'cream'} onClick={() => setTrigKid('manny')}>🎮 Manny</Btn>
            <Btn size="sm" color={trigKid === 'maverick' ? 'orange' : 'cream'} onClick={() => setTrigKid('maverick')}>⚡ Maverick</Btn>
          </div>
          <TriggerTracker kidId={trigKid} kidName={trigKid === 'manny' ? 'Manny' : 'Maverick'} />
        </div>
      )}
      {sec === 'routines' && (
        <div>
          <div className="row" style={{ marginBottom: 10, gap: 6 }}>
            <Btn size="sm" color="orange">🎮 Manny's</Btn>
            <Btn size="sm" color="cream" onClick={() => {}}>⚡ Maverick's (coming)</Btn>
          </div>
          <RoutineBuilder kidId="manny" />
        </div>
      )}
      {sec === 'insights' && <Insights manny={manny} maverick={maverick} />}
      {sec === 'settings' && <ParentSettings parent={parent} update={update} />}
    </div>
  );
}

function Insights({ manny, maverick }) {
  const kids = [
    { name: 'Manny', emoji: '🎮', p: manny },
    { name: 'Maverick', emoji: '⚡', p: maverick },
  ];
  return (
    <div>
      <SectionHead title="📊 How they're doing" />
      <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 12 }}>
        The app learns each child. Here's what it's noticed. No pressure, no rankings — just patterns.
      </div>
      {kids.map(({ name, emoji, p }) => {
        const prof = p.profile;
        const favs = p.getFavoriteGames(3);
        return (
          <Card key={name} style={{ marginBottom: 10 }}>
            <div className="row" style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 32 }}>{emoji}</div>
              <b style={{ fontSize: 18 }}>{name}</b>
              <div style={{ flex: 1 }} />
              {prof.streakDays > 0 && <span className="pill">🔥 {prof.streakDays} day streak</span>}
            </div>
            <div className="grid2" style={{ gap: 8 }}>
              <div className="stat-gloss"><div style={{ fontSize: 22, fontWeight: 900 }}>{prof.totalPlays}</div><div style={{ fontSize: 12 }}>games played</div></div>
              <div className="stat-gloss"><div style={{ fontSize: 22, fontWeight: 900 }}>{prof.sessionCount}</div><div style={{ fontSize: 12 }}>sessions</div></div>
            </div>
            {favs.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                <b>❤️ Loves:</b> {favs.join(', ')}
              </div>
            )}
            {prof.needsEncouragement && (
              <div style={{ marginTop: 8, fontSize: 14, background: 'rgba(241,196,15,.15)', padding: 8, borderRadius: 8 }}>
                💛 Been having a tough time lately — extra encouragement mode is on.
              </div>
            )}
            {prof.readyForHarder && (
              <div style={{ marginTop: 8, fontSize: 14, background: 'rgba(46,204,113,.15)', padding: 8, borderRadius: 8 }}>
                🚀 Crushing it! Ready for harder challenges.
              </div>
            )}
            {prof.totalPlays === 0 && (
              <div style={{ marginTop: 8, fontSize: 14, color: '#8a7f9e' }}>
                No plays yet — the app will start learning once {name} plays some games!
              </div>
            )}
          </Card>
        );
      })}
      <Card style={{ background: 'linear-gradient(180deg,#fff8ec,#ffefd6)' }}>
        <div style={{ fontSize: 13 }}>
          💡 <b>Tip:</b> These insights stay on your device. They're here to help you understand patterns — not to compare your kids to anyone else's.
        </div>
      </Card>
    </div>
  );
}

function ParentSettings({ parent, update }) {
  return (
    <div>
      <SectionHead title="⚙️ My Settings" />
      <Card>
        <b>Your name</b>
        <input className="input-gloss" placeholder="What should we call you?"
          value={parent.name} onChange={(e) => update({ name: e.target.value })}
          style={{ marginTop: 6 }} />
      </Card>
      <Card style={{ marginTop: 10 }}>
        <b>🌙 Bedtime</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0' }}>The app winds down before this time.</div>
        <input className="input-gloss" type="time" value={parent.bedtime}
          onChange={(e) => update({ bedtime: e.target.value })} style={{ marginTop: 6 }} />
      </Card>
      <Card style={{ marginTop: 10 }}>
        <b>⏱️ Daily screen limit (minutes)</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0' }}>Gentle wind-down when time's up. No abrupt cutoff.</div>
        <div className="row" style={{ gap: 6, marginTop: 8 }}>
          {[30, 45, 60, 90, 120].map((m) => (
            <Btn key={m} size="sm" color={parent.dailyLimit === m ? 'orange' : 'cream'}
              onClick={() => update({ dailyLimit: m })}>{m}m</Btn>
          ))}
        </div>
      </Card>
    </div>
  );
}
