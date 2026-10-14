// Manny's World — 22 educational games.
// Each game: id, name, emoji, color, gen(diff) -> { q, options[], answer, hint, display }
// diff: 'easy' | 'medium' | 'hard'. Encouraging feedback handled by the game shell.
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

const ANIMALS = [['🐶','dog'],['🐱','cat'],['🦁','lion'],['🐘','elephant'],['🐵','monkey'],['🐸','frog'],['🦋','butterfly'],['🐢','turtle'],['🦒','giraffe'],['🐳','whale'],['🦜','parrot'],['🐝','bee']];
const SIGHT = ['the','and','you','that','was','for','are','with','his','they','this','have','from','one','had','word','but','not','what','all','were','when','your','can','said','there','each','which','their','will'];
const EMOTIONS = [['😊','happy'],['😢','sad'],['😠','angry'],['😨','scared'],['😲','surprised'],['😌','calm'],['🥰','loved'],['😤','frustrated'],['🤩','excited'],['😴','sleepy']];
const SHAPES = [['🔵','circle'],['🟥','square'],['🔺','triangle'],['⭐','star'],['❤️','heart'],['🔷','diamond'],['⬛','rectangle'],['🟣','oval']];
const COLORS = [['🔴','red'],['🔵','blue'],['🟢','green'],['🟡','yellow'],['🟣','purple'],['🟠','orange'],['⚫','black'],['⚪','white'],['🟤','brown'],['💗','pink']];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PLANETS = [
  ['🌑','Mercury'],['🌕','Venus'],['🌍','Earth'],
  ['🔴','Mars'],['🟠','Jupiter'],['🪐','Saturn'],
  ['🩵','Uranus'],['🔵','Neptune']
];
const WEATHER = [['☀️','sunny'],['🌧️','rainy'],['⛈️','stormy'],['❄️','snowy'],['☁️','cloudy'],['🌈','rainbow'],['💨','windy'],['🌫️','foggy']];
const SCIENCE = [
  ['💧','What falls from clouds as rain?','water'],['🌱','What do plants need to grow? (pick one)','sunlight'],
  ['🦴','What holds up your body?','bones'],['❤️','What pumps blood in your body?','heart'],
  ['🌙','What shines in the night sky?','moon'],['🔥','What is hot and glows?','fire'],
];
const MAPS = [['🗺️','Which shows the whole world?','map'],['🧭','What points north?','compass'],['🏔️','What is a tall rocky land?','mountain'],['🌊','What is a big body of salt water?','ocean'],['🏝️','What is land with water all around?','island'],['🏜️','What is a hot sandy place?','desert']];
const OPPOSITES = [['☀️ day','night 🌙'],['🔥 hot','cold 🧊'],['📢 loud','quiet 🔇'],['⚡ fast','slow 🐢'],['😊 happy','sad 😢'],['⬆️ up','down ⬇️'],['💡 light','dark 🌑'],['🐘 big','small 🐭']];
const RHYMES = [
  ['🐱 cat','hat 🎩'],['🐶 dog','frog 🐸'],['🌙 moon','spoon 🥄'],['⭐ star','car 🚗'],
  ['🐝 bee','tree 🌳'],['🦆 duck','truck 🚚'],['🐷 pig','wig 💇'],['🐸 frog','log 🪵'],
  ['🦉 owl','towel 🧻'],['🐰 bun','sun 🌞'],['🦁 lion','crying 😢'],['🐯 tiger','rider 🏍️'],
  ['🐘 elephant','relevant 📌'],['🦒 giraffe','laugh 😂'],['🐵 monkey','donkey 🫏'],
  ['🐔 chicken','pickin ⛏️'],['🐴 horse','of course ✅'],['🐑 sheep','sleep 😴'],
  ['🦋 butterfly','in the sky ☁️'],['🐢 turtle','purple 🟣'],['🐳 whale','sail ⛵'],
  ['🦜 parrot','carrot 🥕'],['🐙 octopus','hocus pocus 🪄'],['🦀 crab','grab ✊'],
  ['🍎 apple','snapple 🧃'],['🍌 banana','bandana 🧣'],['🍇 grapes','shapes 🔷'],
  ['🍓 strawberry','very berry 🫐'],['🥛 milk','silk 🧵'],['🍪 cookie','bookie 📚'],
  ['🧀 cheese','sneeze 🤧'],['🥞 pancake','bake shake 🥤'],['🍩 donut','peanut 🥜'],
  ['🌈 rainbow','go flow 🌊'],['☀️ sun','fun 🎉'],['🌧️ rain','train 🚂'],
  ['❄️ snow','go go 🏃'],['🌊 wave','brave 🦸'],['🔥 fire','higher ⬆️'],
  ['💡 light','bright ✨'],['🌟 twinkle','sprinkle 💦'],['🎈 balloon','moon 🌙'],
  ['🚗 car','star ⭐'],['✈️ plane','rain 🌧️'],['🚂 train','brain 🧠'],
  ['⛵ boat','goat 🐐'],['🏠 house','mouse 🐭'],['🛏️ bed','red 🔴'],
  ['📖 book','look 👀'],['🖍️ crayon','play on ▶️'],['🎨 paint','saint 😇'],
  ['⚽ ball','tall 📏'],['🪁 kite','night 🌃'],['🧸 teddy','ready ✅'],
  ['🎮 game','same 👍'],['🎲 dice','nice 😊'],['🃏 card','hard 💪'],
  ['👑 crown','down ⬇️'],['💎 diamond','island 🏝️'],['🔔 bell','well 🕳️'],
];
const CLOCKS = [['🕐','1 o clock'],['🕑','2 o clock'],['🕒','3 o clock'],['🕓','4 o clock'],['🕔','5 o clock'],['🕕','6 o clock'],['🕖','7 o clock'],['🕗','8 o clock'],['🕘','9 o clock'],['🕙','10 o clock'],['🕚','11 o clock'],['🕛','12 o clock'],['🕜','1 thirty'],['🕝','2 thirty'],['🕞','3 thirty'],['🕟','4 thirty'],['🕠','5 thirty'],['🕡','6 thirty'],['🕢','7 thirty'],['🕣','8 thirty'],['🕤','9 thirty'],['🕥','10 thirty'],['🕦','11 thirty'],['🕧','12 thirty']];

function numQ(diff, op) {
  // Grade levels: prek, k2, g34, g56, g78 (junior high)
  const ranges = { prek: [1, 5], k2: [1, 10], g34: [1, 20], g56: [1, 50], g78: [1, 100],
    easy: [1, 10], medium: [1, 20], hard: [1, 50] }; // legacy fallback
  const [lo, hi] = ranges[diff] || [1, 10];
  const a = ri(lo, hi), b = ri(lo, hi);
  if (op === 'add') return { a, b, ans: a + b, sym: '+' };
  if (op === 'sub') { const x = Math.max(a, b), y = Math.min(a, b); return { a: x, b: y, ans: x - y, sym: '−' }; }
}

function mc(answer, pool, n = 4) {
  const seen = new Set([answer]);
  const others = [];
  for (const x of shuffle(pool)) {
    if (!seen.has(x) && others.length < n - 1) { seen.add(x); others.push(x); }
  }
  return shuffle([answer, ...others]);
}

export const GAMES = [
{ id:'pattern', name:'Pattern Match', emoji:'🧩', color:'#9B59B6',
  gen(diff){
    const seqs = [
      ['🔴','🔵'], ['⭐','🌙'], ['🍎','🍌'], ['🐶','🐱'],
      ['🟢','🟡'], ['❤️','💙'], ['🌻','🌷'], ['🐠','🐢'],
    ];
    const seq = rnd(seqs);
    const n = diff === 'prek' ? 3 : diff === 'k2' ? 4 : diff === 'g34' ? 5 : diff === 'g56' ? 6 : 7;
    const pat = []; for (let i = 0; i < n; i++) pat.push(seq[i % 2]);
    // We show the first (n-1) items, so the answer is the nth item: pat[n-1] = seq[(n-1) % 2]
    const answer = seq[(n - 1) % 2];
    const shown = pat.slice(0, -1);
    // Wrong answers: the other pattern item + 2 different animals (not random shapes)
    const decoys = ['🐶','🐱','🐰','🦊','🐸','🐵','🐷','🐥','🦁','🐯','🐨','🐼']
      .filter((e) => e !== answer && e !== seq[0] && e !== seq[1]);
    const wrong1 = seq.find((s) => s !== answer); // the other one in the pattern
    const wrong2 = rnd(decoys);
    const wrong3 = rnd(decoys.filter((e) => e !== wrong2));
    const options = shuffle([answer, wrong1, wrong2, wrong3]);
    return {
      q: 'What comes next? 🤔',
      display: shown.join(' ') + '  ❓',
      options, answer,
      hint: `Look at the pattern — it goes ${seq[0]} then ${seq[1]}, over and over! What's missing? 🧩`,
    };
  } },
{ id:'sight', name:'Sight Words', emoji:'📖', color:'#3498DB',
  gen(){ const w=rnd(SIGHT); return { q:'Tap the word! 👆', display:'🔊 '+w.toUpperCase(), options:mc(w,SIGHT), answer:w, hint:`Sound it out like a robot: "${w}". You're a reading superstar!` }; } },
{ id:'add', name:'Addition', emoji:'➕', color:'#2ECC71',
  gen(diff){ const {a,b,ans,sym}=numQ(diff,'add');
    return { q:'You got this! 💪', display:`${a} ${sym} ${b} = ?`, options:mc(ans,[ans-2,ans-1,ans+1,ans+2,ans+3,ans-3].filter(x=>x>=0)), answer:ans, hint:`Start at ${a}, count up ${b} on your fingers! You've got this, champ!` }; } },
{ id:'sub', name:'Subtraction', emoji:'➖', color:'#E91E8C',
  gen(diff){ const {a,b,ans,sym}=numQ(diff,'sub');
    return { q:'You got this! 💪', display:`${a} ${sym} ${b} = ?`, options:mc(ans,[ans-2,ans-1,ans+1,ans+2,ans+3,ans-3].filter(x=>x>=0)), answer:ans, hint:`Start at ${a}, count back ${b}. You're so smart — try again!` }; } },
{ id:'animals', name:'Animal Kingdom', emoji:'🦁', color:'#FF6B35',
  gen(){ const [e,name]=rnd(ANIMALS); return { q:'Which animal is this? 🦁', display:e, options:mc(name,ANIMALS.map(a=>a[1])), answer:name, hint:`This is a ${name}! Look closely — you're amazing at this!` }; } },
{ id:'space', name:'Space Explorer', emoji:'🚀', color:'#1A1040',
  gen(diff){
    const [e,name]=rnd(PLANETS);
    // For young kids, show a color hint
    const hintExtra = (diff === 'prek' || diff === 'k2') ? ` Look at the color!` : '';
    return { q:'Which planet is this? 🪐', display:e, bigDisplay: true,
      options:mc(name,PLANETS.map(p=>p[1])), answer:name,
      hint:`That's ${name}!${hintExtra} You're a super space explorer! 🚀` };
  } },
{ id:'weather', name:'Weather Watcher', emoji:'🌤️', color:'#3498DB',
  gen(){ const [e,name]=rnd(WEATHER); return { q:'What\'s the weather like? 🌤️', display:e, options:mc(name,WEATHER.map(w=>w[1])), answer:name, hint:`Pretend you're outside — it's ${name}!` }; } },
{ id:'skip', name:'Skip Counting', emoji:'🔢', color:'#9B59B6',
  gen(diff){ const step=diff==='easy'?2:diff==='medium'?5:10; const start=ri(1,5)*step;
    const seq=[start,start+step,start+step*2]; const ans=start+step*3;
    return { q:'Let\'s count! 🔢 by '+step+'s!', display:seq.join(', ')+', ?', options:mc(ans,[ans-step,ans+step,ans-step*2,ans+step*2]), answer:ans, hint:`Keep adding ${step}! You're a counting machine!` }; } },
{ id:'emotions', name:'Emotions', emoji:'😊', color:'#F1C40F',
  gen(){ const [e,name]=rnd(EMOTIONS); return { q:'How are they feeling? 🥰', display:e, options:mc(name,EMOTIONS.map(x=>x[1])), answer:name, hint:`That face looks ${name}. Feelings are superpowers!` }; } },
{ id:'shapes', name:'Shape Sorter', emoji:'🔷', color:'#E91E8C',
  gen(){ const [e,name]=rnd(SHAPES); return { q:'Which shape is this? 🔷', display:e, options:mc(name,SHAPES.map(s=>s[1])), answer:name, hint:`That's a ${name}! Trace it with your finger — how many sides?` }; } },
{ id:'colors', name:'Color Mixer', emoji:'🎨', color:'#FF6B35',
  gen(){ const mixes=[['🔴 + 🟡','orange','🟠'],['🔵 + 🟡','green','🟢'],['🔴 + 🔵','purple','🟣'],['🔴 + ⚪','pink','💗'],['⚫ + ⚪','gray','⬜']];
    const [q,ans,de]=rnd(mixes); return { q:'Mix the colors! 🎨 What do you get?', display:q+' = ?', options:mc(ans,['orange','green','purple','pink','gray','brown']), answer:ans, hint:`You're a color wizard! You get ${ans} ${de}!` }; } },
{ id:'order', name:'Number Order', emoji:'🔢', color:'#2ECC71',
  gen(diff){
    const hi = { prek: 5, k2: 10, g34: 20, g56: 50, g78: 100 }[diff] || 10;
    const n = ri(1, hi - 1);
    const ans = n + 1;
    // Build 3 unique wrong answers, all different from ans and each other
    const wrongSet = new Set();
    const candidates = [n - 1, n + 2, n + 3, n - 2, ans + 2, ans - 2].filter((x) => x > 0 && x !== ans);
    shuffle(candidates).forEach((x) => { if (wrongSet.size < 3) wrongSet.add(x); });
    const options = shuffle([ans, ...wrongSet]);
    return { q: 'What comes next? 🎯', display: `${n}, __`, options, answer: ans, hint: `Just one more number — you're on fire! 🔥` };
  } },
{ id:'letters', name:'Letter Match', emoji:'🔤', color:'#3498DB',
  gen(){ const L=rnd(LETTERS); const lower=L.toLowerCase();
    return { q:'Match the letters! 🔤', display:L+' = ?', options:mc(lower,LETTERS.map(x=>x.toLowerCase())), answer:lower, hint:`Big ${L}, little ${lower} — they're best friends!` }; } },
{ id:'rhyme', name:'Rhyme Time', emoji:'🎵', color:'#9B59B6',
  gen(diff, used = []){
    // No repeats: filter out already-used pairs
    const available = RHYMES.filter((r) => !used.includes(r[0]));
    if (available.length === 0) {
      // All done! Celebrate completion
      return { completed: true, q:'🎉 All done!', display:'🏆',
        options:[], answer:null, hint:'You finished all the rhymes!' };
    }
    const [a,b] = rnd(available); const ans = b.split(' ')[0];
    return { q:`What rhymes with ${a}? 🎤`, display:a,
      options:mc(ans, RHYMES.map(r=>r[1].split(' ')[0])), answer:ans,
      usedKey: a, // track this so we don't repeat
      hint:`${a} and ${b} rhyme — sing it out loud! 🎶` };
  } },
{ id:'opposites', name:'Opposites', emoji:'↔️', color:'#F1C40F',
  gen(){ const [a,b]=rnd(OPPOSITES);
    // Show full "word emoji" for clarity (e.g. "night 🌙" not just "🌙")
    const ans=b;
    return { q:`What's the opposite of ${a}? 🤔`, display:a,
      options:mc(ans,OPPOSITES.map(o=>o[1])), answer:ans,
      hint:`Think about the flip side — it's ${b}! 🔄` }; } },
{ id:'money', name:'Money Counter', emoji:'💰', color:'#2ECC71',
  gen(diff){ const coins=[['🟤',1,'penny'],['⚪',5,'nickel'],['🔘',10,'dime'],['⭕',25,'quarter']];
    const n=diff==='prek'?2:diff==='k2'?2:diff==='g34'?3:diff==='g56'?3:4; let total=0; let coinsShown=[];
    for(let i=0;i<n;i++){ const [emoji,v,name]=rnd(coins); total+=v; coinsShown.push(`${emoji}${v}¢`); }
    return { q:'Count the coins! 🪙', display:coinsShown.join('  +  '), options:mc(total,[total-5,total+5,total-10,total+10,total+1,total-1].filter(x=>x>0)), answer:total, hint:`You're rich! Count those coins again! 🤑` }; } },
{ id:'clock', name:'Clock Reader', emoji:'🕐', color:'#3498DB',
  gen(diff){
    // Young kids: o'clock only. Older: add half-hours, then quarter hours
    let pool;
    if (diff === 'prek') pool = CLOCKS.filter(x => x[1].includes("o clock")).slice(0, 6);
    else if (diff === 'k2') pool = CLOCKS.filter(x => x[1].includes("o clock"));
    else if (diff === 'g34') pool = CLOCKS;
    else pool = CLOCKS;
    const [face,t]=rnd(pool);
    // Teaching hint: explain the hands
    const hour = t.split(' ')[0];
    const isHalf = t.includes('thirty');
    const teachHint = isHalf
      ? `The big hand points DOWN to 6 — that means 30 minutes! The little hand is past ${hour}. So it's ${t}!`
      : `The big hand points UP to 12 — that means o'clock! The little hand points to ${hour}. So it's ${t}!`;
    return { q:'What time is it? ⏰', display:face, visualClock: t, bigDisplay: true,
      options:mc(t,pool.map(x=>x[1])), answer:t,
      hint: teachHint + ` 🕵️` };
  } },
{ id:'map', name:'Map Explorer', emoji:'🗺️', color:'#FF6B35',
  gen(){ const [e,q,ans]=rnd(MAPS); const pool=['map 🗺️','compass 🧭','mountain 🏔️','ocean 🌊','island 🏝️','desert 🏜️'];
    return { q:q+' 🧭', display:e, options:mc(ans+' '+e,MAPS.map(m=>m[2]+' '+m[0])), answer:ans+' '+e, hint:`You're a great explorer! It's the ${ans}! 🗺️` }; } },
{ id:'wordbuild', name:'Word Builder', emoji:'🧱', color:'#E91E8C',
  gen(){ const words=[['🐱','CAT'],['🐶','DOG'],['🌞','SUN'],['🌙','MOON'],['⭐','STAR'],['🐝','BEE'],['🌳','TREE'],['🐟','FISH']];
    const [e,w]=rnd(words); const missing=w[ri(0,w.length-1)];
    const shown=w.split('').map(ch=>ch===missing?'_':ch).join(' ');
    return { q:'Finish the word! ✏️', display:e+'  '+shown, options:mc(missing,LETTERS), answer:missing, hint:`You're a word wizard! The letter is ${missing}!` }; } },
{ id:'story', name:'Story Sequencer', emoji:'📚', color:'#9B59B6',
  gen(){ const seqs=[
      [['🌱','Plant the seed'],['🌧️','Water it'],['🌻','Flower grows']],
      [['🥚','Crack the egg'],['🍳','Cook it'],['🍽️','Eat up']],
      [['🌙','Night falls'],['😴','Fall asleep'],['🌞','Wake up']],
      [['🧱','Stack blocks'],['🏰','Build a tower'],['🎉','Knock it down!']],
    ];
    const s=rnd(seqs); const order=shuffle(s);
    // 4th decoy: a silly wrong step that doesn't belong
    const decoys=['🚀 Blast off!','🎤 Sing a song','🏊 Go swimming','🎮 Play games'];
    const wrongStep=rnd(decoys);
    return { q:'What happens first? 📖', display:order.map(x=>x[0]).join('  '), options:mc(s[0][1],[...s.map(x=>x[1]),wrongStep]), answer:s[0][1], hint:`First: ${s[0][0]} ${s[0][1]}! You're telling the story!` }; } },
{ id:'science', name:'Science Lab', emoji:'🔬', color:'#2ECC71',
  gen(){ const [e,q,ans]=rnd(SCIENCE); const pool=[['💧','water'],['☀️','sunlight'],['🦴','bones'],['❤️','heart'],['🌙','moon'],['🔥','fire'],['🌬️','air'],['🌱','soil']];
    return { q:q+' 🔬', display:e, options:mc(ans+' '+e,pool.map(p=>p[1]+' '+p[0])), answer:ans+' '+e, hint:`Think like a scientist — it's ${ans}! 🧪` }; } },
{ id:'memory', name:'Memory Flip', emoji:'🃏', color:'#1A1040',
  gen(diff){
    const pool=['🐶','🐱','🦁','🐸','🦋','🐢','🐘','🦒','🐳','🦜','🐝','🐵','🐷','🐥','🦄','🐨'];
    const n=diff==='prek'?3:diff==='k2'?3:diff==='g34'?4:diff==='g56'?5:6;
    const shown=shuffle(pool).slice(0,n);
    // Pick one they SAW as the answer, add one they DIDN'T see as decoy
    const answer=rnd(shown);
    const notSeen=pool.filter(e=>!shown.includes(e));
    const decoy=rnd(notSeen);
    const others=shuffle(shown.filter(e=>e!==answer)).slice(0,2);
    const options=shuffle([answer, decoy, ...others]);
    return { q:'Which one did you see? 🧠', display:'❓',
      fullSet: shown, // shown during memorize phase
      options, answer,
      hint:`Think back... which animal was in the group? 🧠` };
  } },
];

// ASL: 15 survival signs (per spec)
export const ASL_SIGNS = [
  { sign:'MORE', emoji:'🤏', tip:'Tap fingertips together. For Maverick: pair with offering more of a favorite snack so the sign = good things.' },
  { sign:'EAT', emoji:'🍽️', tip:'Tap fingertips to mouth. Practice at every meal — repetition is everything.' },
  { sign:'DRINK', emoji:'🥤', tip:'Mime tipping a cup to your mouth. Easy first sign for thirsty moments.' },
  { sign:'HELP', emoji:'🙋', tip:'Fist on open palm, lift up. Teach when calm, not mid-meltdown.' },
  { sign:'STOP', emoji:'✋', tip:'Chop one hand onto the other palm. Clear boundary sign.' },
  { sign:'YES', emoji:'👍', tip:'Nod a fist like a head nodding. Celebrate big when they use it!' },
  { sign:'NO', emoji:'👎', tip:'Tap index + middle finger to thumb, like a mouth closing.' },
  { sign:'PLEASE', emoji:'🙏', tip:'Flat hand circles on chest. Model it every time YOU ask.' },
  { sign:'THANK YOU', emoji:'😊', tip:'Fingertips from chin outward, like blowing a kiss of thanks.' },
  { sign:'TOILET', emoji:'🚽', tip:'Shake a fist (thumb between fingers). Pair with the potty routine.' },
  { sign:'ALL DONE', emoji:'👋', tip:'Twist open hands like wiping a table clean. Great for meals and tasks.' },
  { sign:'I LOVE YOU', emoji:'🤟', tip:'Thumb + index + pinky up. The most important sign of all.' },
  { sign:'HURT', emoji:'🤕', tip:'Tap index fingers together. Give them words for pain.' },
  { sign:'PLAY', emoji:'🎮', tip:'Twist both fists like playing. Use before favorite activities.' },
  { sign:'SLEEP', emoji:'😴', tip:'Open hand closes over face. Part of the bedtime routine.' },
];
export const ASL_VIDEO_URL = 'https://www.youtube.com/results?search_query=asl+signs+for+children+tutorial';

// Encouragement lines (never "wrong" — always teaches)
export const PRAISE = ['Amazing! 🌟','You did it! 🎉','Superstar! ⭐','Brilliant! 💡','Way to go! 🙌','You\'re learning so fast! 🚀','High five! ✋','Incredible! 🌈'];
export const TRY_AGAIN = 'Good try! 💛';
