import React, { useState } from 'react';
import { Card, Btn, SectionHead, Paywall, Empty, Footer, Modal } from '../components/ui.jsx';
import { useStored, toast } from '../lib/store.js';
import { hasAccess } from '../lib/paywall.js';
import { RECIPES, ALLERGENS, ALLERGEN_LABEL, AGES } from '../data/recipes.js';
import { supabase, sb } from '../lib/supabase.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function RecipeDetail({ r, onClose, onSave, saved }) {
  return (
    <Modal onClose={onClose} title={`${r.emoji} ${r.name}`}>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="pill">{r.age}</span>
        <span className="pill">⏱️ {r.mins} min</span>
        {r.tags.map((t) => <span key={t} className="pill green">{t}</span>)}
        {r.contains.map((a) => <span key={a} className="pill red">contains {ALLERGEN_LABEL[a]}</span>)}
      </div>
      <b>🧂 Ingredients</b>
      {r.ingredients.map((ing, i) => <div key={i} style={{ fontSize: 14, marginTop: 4 }}>• {ing}</div>)}
      <b style={{ display: 'block', marginTop: 12 }}>👩‍🍳 Steps</b>
      {r.steps.map((s, i) => <div key={i} style={{ fontSize: 14, marginTop: 6 }}><b>{i + 1}.</b> {s}</div>)}
      {r.note && <Card style={{ marginTop: 12, background: 'linear-gradient(180deg,#fff8ec,#ffefd6)' }}><b>💛 Note:</b> <span style={{ fontSize: 14 }}>{r.note}</span></Card>}
      <div style={{ marginTop: 12 }}>
        <Btn block color={saved ? 'green' : 'orange'} onClick={onSave}>{saved ? '✓ Saved!' : '❤️ Save Recipe'}</Btn>
      </div>
    </Modal>
  );
}

// AI Recipe Generator — UI-ready stub (per spec). Wires to a Netlify function when configured.
function AIGenerator() {
  const [allergens, setAllergens] = useState([]);
  const [age, setAge] = useState('All Ages');
  const [prefs, setPrefs] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    setBusy(true); setResult(null);
    try {
      const res = await fetch('/.netlify/functions/ai-recipe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclude: allergens, age, prefs }),
      });
      const j = await res.json();
      if (j.recipe) { setResult(j.recipe); return; }
      throw new Error('not configured');
    } catch {
      // Friendly offline stub: compose from local recipes matching filters
      const pool = RECIPES.filter((r) => !allergens.some((a) => r.contains.includes(a)));
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setResult({
        name: 'Family Pick: ' + (pick?.name || 'Veggie Bowl'),
        note: '🤖 AI chef is coming soon! Here\'s a family favorite matching your filters for now.',
        ingredients: pick?.ingredients || ['Mixed veggies', 'Olive oil', 'Salt'],
        steps: pick?.steps || ['Prep ingredients.', 'Cook simply.', 'Serve warm.'],
      });
    } finally { setBusy(false); }
  };

  return (
    <Card>
      <b>🤖 AI Recipe Generator</b>
      <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>Nutrition facts only — no medical claims, ever.</div>
      <div style={{ fontSize: 14, marginBottom: 6 }}><b>Exclude allergens:</b></div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {ALLERGENS.map((a) => (
          <button key={a} className={`pill${allergens.includes(a) ? ' red' : ''}`}
            style={{ border: 'none', cursor: 'pointer', fontSize: 13 }}
            onClick={() => setAllergens((x) => x.includes(a) ? x.filter((y) => y !== a) : [...x, a])}>
            {allergens.includes(a) ? '🚫 ' : ''}{ALLERGEN_LABEL[a]}
          </button>
        ))}
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <select className="input-gloss" value={age} onChange={(e) => setAge(e.target.value)}>
          {AGES.map((a) => <option key={a}>{a}</option>)}
        </select>
        <input className="input-gloss" placeholder="Preferences… (e.g. quick, one-pot)" value={prefs} onChange={(e) => setPrefs(e.target.value)} />
      </div>
      <Btn block onClick={generate} disabled={busy}>{busy ? 'Cooking up ideas… 🤖' : 'Generate Recipe ✨'}</Btn>
      {result && (
        <Card style={{ marginTop: 10, background: 'linear-gradient(180deg,#f4ecff,#e9dcf9)' }}>
          <b>{result.name}</b>
          <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0' }}>{result.note}</div>
          <b>🧂 Ingredients</b>
          {result.ingredients.map((ing, i) => <div key={i} style={{ fontSize: 14 }}>• {ing}</div>)}
          <b style={{ display: 'block', marginTop: 8 }}>👩‍🍳 Steps</b>
          {result.steps.map((s, i) => <div key={i} style={{ fontSize: 14 }}><b>{i + 1}.</b> {s}</div>)}
        </Card>
      )}
    </Card>
  );
}

// AI Chef chat — UI-ready stub
function AIChef() {
  const [msgs, setMsgs] = useState([{ from: 'chef', text: '👨‍🍳 Hi! Ask me any food question or for recipe ideas!' }]);
  const [inp, setInp] = useState('');
  const send = async () => {
    const q = inp.trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: 'you', text: q }]);
    setInp('');
    // Stub: friendly local answer until the AI function is wired
    setTimeout(() => {
      const hits = RECIPES.filter((r) => q.toLowerCase().split(' ').some((w) => w.length > 3 && r.name.toLowerCase().includes(w))).slice(0, 3);
      const text = hits.length
        ? `Great question! Based on our recipe box, try: ${hits.map((h) => h.emoji + ' ' + h.name).join(', ')}. (Full AI answers coming soon! 🤖)`
        : `Good question! Our recipe box has ${RECIPES.length} clean recipes — try the search above. Full AI answers coming soon! 🤖`;
      setMsgs((m) => [...m, { from: 'chef', text }]);
    }, 600);
  };
  return (
    <Card>
      <b>👨‍🍳 AI Chef</b>
      <div style={{ maxHeight: 220, overflowY: 'auto', margin: '8px 0' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ textAlign: m.from === 'you' ? 'right' : 'left', margin: '6px 0' }}>
            <span style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 14, fontSize: 14, maxWidth: '85%',
              background: m.from === 'you' ? 'linear-gradient(180deg,#ffb08a,#FF6B35)' : 'linear-gradient(180deg,#fff,#f5ead8)',
              color: m.from === 'you' ? '#fff' : '#2b2140' }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="row">
        <input className="input-gloss" value={inp} onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about food…" />
        <Btn size="sm" onClick={send}>Send</Btn>
      </div>
    </Card>
  );
}

function MealPlanner() {
  const [plan, setPlan] = useStored('mealPlan', {});
  const [pickFor, setPickFor] = useState(null);
  const [q, setQ] = useState('');

  const set = (day, meal, recipe) => {
    setPlan((p) => ({ ...p, [day + ':' + meal]: recipe }));
    setPickFor(null); setQ('');
  };

  const pool = RECIPES.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase())).slice(0, 12);

  // Auto shopping list from the week
  const chosen = Object.values(plan).filter(Boolean);
  const shopping = {};
  chosen.forEach((r) => r.ingredients.forEach((ing) => { shopping[ing] = (shopping[ing] || 0) + 1; }));
  const [checked, setChecked] = useStored('shoppingChecked', []);

  return (
    <div>
      <Card>
        <b>📅 Weekly Meal Planner</b>
        <div style={{ fontSize: 13, color: '#8a7f9e', margin: '4px 0 8px' }}>Tap a slot, pick a recipe.</div>
        {DAYS.map((d) => (
          <div key={d} style={{ marginBottom: 8 }}>
            <b style={{ fontSize: 14 }}>{d}</b>
            <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 4 }}>
              {MEALS.map((m) => {
                const r = plan[d + ':' + m];
                return (
                  <button key={m} className="aac-word" style={{ padding: 8 }} onClick={() => setPickFor({ day: d, meal: m })}>
                    <div style={{ fontSize: 10, color: '#8a7f9e' }}>{m}</div>
                    <div className="wlabel" style={{ fontSize: 12 }}>{r ? r.emoji + ' ' + r.name.slice(0, 18) : '+ Add'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      {pickFor && (
        <Modal onClose={() => setPickFor(null)} title={`Pick for ${pickFor.day} ${pickFor.meal}`}>
          <input className="input-gloss" placeholder="Search recipes…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 8 }} />
          {pool.map((r) => (
            <div key={r.name} className="check-item" onClick={() => set(r && { ...r })} style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: 24 }}>{r.emoji}</div>
              <div style={{ flex: 1 }}><b>{r.name}</b><div style={{ fontSize: 12, color: '#8a7f9e' }}>{r.age} • {r.mins} min</div></div>
            </div>
          ))}
          <div style={{ marginTop: 8 }}><Btn color="red" size="sm" block onClick={() => setPickFor && setPlan((p) => { const n = { ...p }; delete n[pickFor.day + ':' + pickFor.meal]; return n; }) || setPickFor(null)}>Clear slot</Btn></div>
        </Modal>
      )}

      {chosen.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <b>🛒 Auto Shopping List</b>
          <div style={{ fontSize: 13, color: '#8a7f9e', marginBottom: 6 }}>From your {chosen.length} planned meals</div>
          {Object.keys(shopping).sort().map((ing) => (
            <div key={ing} className={`check-item${checked.includes(ing) ? ' done' : ''}`} onClick={() =>
              setChecked((c) => c.includes(ing) ? c.filter((x) => x !== ing) : [...c, ing])}>
              <div className="check-box">{checked.includes(ing) ? '✓' : ''}</div>
              <div style={{ flex: 1, fontSize: 14 }}>{ing}{shopping[ing] > 1 && <span className="pill" style={{ marginLeft: 6 }}>×{shopping[ing]}</span>}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export default function Recipes({ onDisclaimer }) {
  const paid = hasAccess();
  const [sec, setSec] = useState('browse');
  const [q, setQ] = useState('');
  const [excluded, setExcluded] = useState([]);
  const [age, setAge] = useState('All Ages');
  const [open, setOpen] = useState(null);
  const [favs, setFavs] = useStored('savedRecipes', []);
  const [showFavs, setShowFavs] = useState(false);

  let list = RECIPES.filter((r) =>
    (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.ingredients.some((i) => i.toLowerCase().includes(q.toLowerCase()))) &&
    (age === 'All Ages' || r.age === age || r.age === 'All Ages') &&
    !excluded.some((a) => r.contains.includes(a))
  );
  if (!paid) list = list.slice(0, 5);
  if (showFavs) list = RECIPES.filter((r) => favs.includes(r.name));

  const toggleFav = async (r) => {
    const isF = favs.includes(r.name);
    setFavs((f) => isF ? f.filter((x) => x !== r.name) : [...f, r.name]);
    await sb(async (s) => {
      const { data: { user } } = await s.auth.getUser();
      if (!user) return;
      if (isF) await s.from('saved_recipes').delete().eq('user_id', user.id).eq('recipe_name', r.name);
      else await s.from('saved_recipes').insert({ user_id: user.id, recipe_name: r.name, recipe_data: r });
    });
  };

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {(!paid && sec === 'browse') ? null : null}
      <SectionHead title="🍎 Recipes" right={
        <Btn size="sm" color={showFavs ? 'pink' : 'cream'} onClick={() => setShowFavs(!showFavs)}>❤️ ({favs.length})</Btn>
      } />

      <div className="row" style={{ marginBottom: 10, gap: 6 }}>
        {[['browse', '🔍 Browse'], ['ai', '🤖 AI Generator'], ['chef', '👨‍🍳 AI Chef'], ['plan', '📅 Meal Plan']].map(([id, l]) => (
          <Btn key={id} size="sm" color={sec === id ? 'orange' : 'cream'} onClick={() => setSec(id)}>{l}</Btn>
        ))}
      </div>

      {sec === 'ai' && (!paid ? <div style={{ position: 'relative' }}><Paywall feature="AI Recipe Generator" /></div> : <AIGenerator />)}
      {sec === 'chef' && <AIChef />}
      {sec === 'plan' && <MealPlanner />}

      {sec === 'browse' && (
        <div style={{ position: 'relative' }}>
          {!paid && <Paywall feature="Full Recipe Box" />}
          <input className="input-gloss" placeholder="🔍 Search 100+ recipes…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 13, marginBottom: 6 }}><b>🚫 Exclude allergens:</b></div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {ALLERGENS.map((a) => (
              <button key={a} className={`pill${excluded.includes(a) ? ' red' : ''}`}
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => setExcluded((x) => x.includes(a) ? x.filter((y) => y !== a) : [...x, a])}>
                {excluded.includes(a) ? '🚫 ' : ''}{ALLERGEN_LABEL[a]}
              </button>
            ))}
          </div>
          <div className="row" style={{ marginBottom: 10 }}>
            <select className="input-gloss" value={age} onChange={(e) => setAge(e.target.value)}>
              {AGES.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          {!paid && <div className="pill" style={{ marginBottom: 8 }}>🎁 Trial: showing 5 of {RECIPES.length} recipes</div>}
          {list.map((r) => (
            <div key={r.name} className="check-item" onClick={() => setOpen(r)}>
              <div style={{ fontSize: 32 }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <b style={{ color: '#1A1040' }}>{r.name}</b>
                <div style={{ fontSize: 12, color: '#8a7f9e' }}>
                  <span className="pill" style={{ fontSize: 10 }}>{r.age}</span> ⏱️ {r.mins} min
                  {r.tags.slice(0, 2).map((t) => <span key={t} className="pill green" style={{ fontSize: 10, marginLeft: 4 }}>{t}</span>)}
                </div>
              </div>
              <button className="pill" style={{ border: 'none', cursor: 'pointer', fontSize: 16 }}
                onClick={(e) => { e.stopPropagation(); toggleFav(r); }}>{favs.includes(r.name) ? '❤️' : '🤍'}</button>
            </div>
          ))}
          {list.length === 0 && <Empty emoji="🍎" title="No recipes match" sub="Try fewer filters — dinner's gotta happen! 😄" />}
          {open && <RecipeDetail r={open} onClose={() => setOpen(null)} saved={favs.includes(open.name)} onSave={() => toggleFav(open)} />}
        </div>
      )}

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}
