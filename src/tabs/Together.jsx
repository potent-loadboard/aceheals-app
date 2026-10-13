import React, { useState, useEffect } from 'react';
import { Card, Btn, SectionHead, Loading, Empty, Footer, Modal } from '../components/ui.jsx';
import { useStored, toast } from '../lib/store.js';
import { hasAccess } from '../lib/paywall.js';
import { COMMUNITY_STATS } from '../data/content.js';
import { supabase, sb, supabaseConfigured } from '../lib/supabase.js';

// PLACEHOLDER: per spec, the "upcoming expert call" card is placeholder content.
// Replace with a real scheduled event before public launch.
const EXPERT_CALL_PLACEHOLDER = {
  title: 'Gut Health & First Words',
  speaker: 'Dr. Maria Santos, Integrative Pediatrics', // PLACEHOLDER — not confirmed
  when: 'Thursday 7PM EST', // PLACEHOLDER
};

const SEED_POSTS = [
  { id: 's1', parent: 'Mama of 2 💛', child: 'Leo, 4', text: 'He used his AAC board to ask for water ALL by himself today. I cried happy tears!', likes: 214, ts: Date.now() - 2 * 3600e3, replies: 18 },
  { id: 's2', parent: 'DadLife', child: 'Ava, 6', text: 'Bedtime routine finally clicked after 3 weeks of the visual schedule. Consistency wins!', likes: 156, ts: Date.now() - 5 * 3600e3, replies: 9 },
  { id: 's3', parent: 'Anonymous', child: '', text: 'Just here to say: you are doing better than you think. 💛', likes: 342, ts: Date.now() - 8 * 3600e3, replies: 31 },
];

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

export default function Together({ onDisclaimer, user }) {
  const paid = hasAccess();
  const [posts, setPosts] = useState(SEED_POSTS);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [draft, setDraft] = useState('');
  const [anon, setAnon] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [liked, setLiked] = useStored('likedPosts', []);
  const [replies, setReplies] = useStored('postReplies', {});
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Load from Supabase + Realtime subscription (graceful offline fallback to seed posts)
  useEffect(() => {
    let chan = null;
    let cancelled = false;
    (async () => {
      // 8s timeout so a hanging network call can never stick the UI on "Loading…"
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000));
      const rows = await sb(async (s) => {
        const q = s.from('community_posts')
          .select('*').order('created_at', { ascending: false }).limit(50);
        const { data, error } = await Promise.race([q, timeout]);
        if (error) throw error;
        return data;
      }, null).catch(() => null);
      if (cancelled) return;
      if (rows && rows.length) {
        setPosts(rows.map((r) => ({
          id: r.id, parent: r.anonymous ? 'Anonymous' : (r.parent_name || 'Parent 💛'),
          child: r.child_info || '', text: r.text, likes: r.likes || 0,
          ts: new Date(r.created_at).getTime(), replies: r.reply_count || 0,
        })));
      }
      setLoading(false);
      // Realtime: new posts appear live (per spec)
      if (supabaseConfigured) {
        try {
          chan = supabase.channel('community_posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' },
              (payload) => {
                const r = payload.new;
                setPosts((p) => [{
                  id: r.id, parent: r.anonymous ? 'Anonymous' : (r.parent_name || 'Parent 💛'),
                  child: r.child_info || '', text: r.text, likes: 0, ts: Date.now(), replies: 0,
                }, ...p]);
                toast('❤️ New community win!');
              })
            .subscribe();
        } catch {}
      }
    })();
    return () => { cancelled = true; try { chan && supabase.removeChannel(chan); } catch {} };
  }, []);

  const submit = async () => {
    if (!draft.trim()) { toast('✏️ Write your win first!'); return; }
    const post = {
      id: 'l' + Date.now(),
      parent: anon ? 'Anonymous' : (user?.email?.split('@')[0] || 'Parent 💛'),
      child: childName ? `${childName}${childAge ? ', ' + childAge : ''}` : '',
      text: draft.trim(), likes: 0, ts: Date.now(), replies: 0,
    };
    setPosts((p) => [post, ...p]);
    setDraft(''); setChildName(''); setChildAge(''); setShowPost(false);
    toast('🎉 Win shared! You\'re not alone 💛');
    await sb(async (s) => {
      const { data: { user: u } } = await s.auth.getUser();
      await s.from('community_posts').insert({
        user_id: u?.id || null,
        parent_name: post.parent, child_info: post.child,
        text: post.text, anonymous: anon,
      });
    });
  };

  const like = async (id) => {
    const isL = liked.includes(id);
    setLiked((l) => isL ? l.filter((x) => x !== id) : [...l, id]);
    setPosts((ps) => ps.map((p) => p.id === id ? { ...p, likes: p.likes + (isL ? -1 : 1) } : p));
    await sb(async (s) => {
      const p = posts.find((x) => x.id === id);
      if (p && typeof id === 'number') await s.from('community_posts').update({ likes: p.likes + (isL ? -1 : 1) }).eq('id', id);
    });
  };

  const sendReply = (id) => {
    if (!replyText.trim()) return;
    setReplies((r) => ({ ...r, [id]: [...(r[id] || []), { text: replyText.trim(), ts: Date.now() }] }));
    setPosts((ps) => ps.map((p) => p.id === id ? { ...p, replies: p.replies + 1 } : p));
    setReplyText(''); setReplyOpen(null);
    toast('💬 Reply posted!');
  };

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <SectionHead title="❤️ Together" />

      <div className="grid3" style={{ marginBottom: 12 }}>
        <div className="stat-gloss"><div style={{ fontSize: 18, fontWeight: 900, color: '#FF6B35' }}>{COMMUNITY_STATS.families}</div><div style={{ fontSize: 10, color: '#8a7f9e' }}>Families</div></div>
        <div className="stat-gloss"><div style={{ fontSize: 18, fontWeight: 900, color: '#E91E8C' }}>{COMMUNITY_STATS.wins}</div><div style={{ fontSize: 10, color: '#8a7f9e' }}>Wins This Month</div></div>
        <div className="stat-gloss"><div style={{ fontSize: 18, fontWeight: 900, color: '#2ECC71' }}>{COMMUNITY_STATS.online}</div><div style={{ fontSize: 10, color: '#8a7f9e' }}>Online Now</div></div>
      </div>

      <Card style={{ background: 'linear-gradient(180deg,#fff0f4,#ffe4ec)', borderColor: '#f5c6d4', marginBottom: 12 }}>
        <b style={{ color: '#1A1040' }}>💛 You're Not Doing This Alone</b>
        <div style={{ fontSize: 14, marginTop: 4 }}>Thousands of parents walking the same road. Share a win — big or tiny. It all counts.</div>
      </Card>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        {!paid && (
          <div className="pill" style={{ marginBottom: 8 }}>🎁 Trial: read-only — upgrade to post your wins!</div>
        )}
        <Btn block color={paid ? 'pink' : 'cream'} onClick={() => paid ? setShowPost(true) : toast('🔒 Posting unlocks with full access 💛')}>
          ✨ Post Your Win
        </Btn>
      </div>

      {/* PLACEHOLDER expert call card — replace with real event before launch */}
      <Card style={{ marginBottom: 12, background: 'linear-gradient(180deg,#f4ecff,#e9dcf9)' }}>
        <div className="pill purple" style={{ marginBottom: 6 }}>📅 Upcoming Expert Call (coming soon)</div>
        <b>{EXPERT_CALL_PLACEHOLDER.title}</b>
        <div style={{ fontSize: 13, color: '#8a7f9e' }}>{EXPERT_CALL_PLACEHOLDER.speaker} • {EXPERT_CALL_PLACEHOLDER.when}</div>
      </Card>

      {showPost && (
        <Modal onClose={() => setShowPost(false)} title="✨ Share Your Win">
          <textarea className="input-gloss" value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="What went well today? Big or tiny — it counts! 💛" />
          <div className="grid2" style={{ marginTop: 8 }}>
            <input className="input-gloss" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Child's first name (optional)" />
            <input className="input-gloss" value={childAge} onChange={(e) => setChildAge(e.target.value)} placeholder="Age (optional)" inputMode="numeric" />
          </div>
          <label className="row" style={{ gap: 8, marginTop: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> Post anonymously 🕵️
          </label>
          <div style={{ fontSize: 12, color: '#8a7f9e', margin: '6px 0' }}>🛡️ Moderated safe space. Be kind.</div>
          <div style={{ marginTop: 8 }}><Btn block onClick={submit}>Share 💛</Btn></div>
        </Modal>
      )}

      {loading ? <Loading label="Loading community…" /> : (
        <div style={{ position: 'relative' }}>
          {!paid && <div className="pill" style={{ marginBottom: 8 }}>👀 Trial: reading only</div>}
          {posts.map((p) => (
            <Card key={p.id} style={{ marginBottom: 10 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b style={{ color: '#1A1040' }}>{p.parent}</b>
                <span style={{ fontSize: 12, color: '#8a7f9e' }}>{timeAgo(p.ts)}</span>
              </div>
              {p.child && <div style={{ fontSize: 12, color: '#8a7f9e' }}>parent of {p.child}</div>}
              <div style={{ fontSize: 15, margin: '8px 0', lineHeight: 1.55 }}>{p.text}</div>
              <div className="row" style={{ gap: 8 }}>
                <button className="pill" style={{ border: 'none', cursor: 'pointer', fontSize: 14 }}
                  onClick={() => like(p.id)}>{liked.includes(p.id) ? '❤️' : '🤍'} {p.likes}</button>
                <button className="pill" style={{ border: 'none', cursor: 'pointer', fontSize: 14 }}
                  onClick={() => setReplyOpen(replyOpen === p.id ? null : p.id)}>💬 {p.replies + (replies[p.id]?.length || 0)}</button>
              </div>
              {(replies[p.id] || []).map((r, i) => (
                <div key={i} style={{ fontSize: 13, background: '#fff8ec', borderRadius: 8, padding: '6px 10px', marginTop: 6 }}>💬 {r.text}</div>
              ))}
              {replyOpen === p.id && (
                <div className="row" style={{ marginTop: 8 }}>
                  <input className="input-gloss" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a kind reply…" />
                  <Btn size="sm" onClick={() => sendReply(p.id)}>Send</Btn>
                </div>
              )}
            </Card>
          ))}
          {posts.length === 0 && <Empty emoji="❤️" title="No wins yet" sub="Be the first to share some joy today!" />}
        </div>
      )}

      <Footer onDisclaimer={onDisclaimer} />
    </div>
  );
}
