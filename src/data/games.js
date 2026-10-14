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
const PLANETS = [['🌑','Mercury'],['🌕','Venus'],['🌍','Earth'],['🔴','Mars'],['🟠','Jupiter'],['🪐','Saturn'],['💎','Uranus'],['🌊','Neptune']];
const WEATHER = [['☀️','sunny'],['🌧️','rainy'],['⛈️','stormy'],['❄️','snowy'],['☁️','cloudy'],['🌈','rainbow'],['💨','windy'],['🌫️','foggy']];
const SCIENCE = [
  ['💧','What falls from clouds as rain?','water'],['🌱','What do plants need to grow? (pick one)','sunlight'],
  ['🦴','What holds up your body?','bones'],['❤️','What pumps blood in your body?','heart'],
  ['🌙','What shines in the night sky?','moon'],['🔥','What is hot and glows?','fire'],
];
const MAPS = [['🗺️','Which shows the whole world?','map'],['🧭','What points north?','compass'],['🏔️','What is a tall rocky land?','mountain'],['🌊','What is a big body of salt water?','ocean'],['🏝️','What is land with water all around?','island'],['🏜️','What is a hot sandy place?','desert']];
const OPPOSITES = [['☀️ day','night 🌙'],['🔥 hot','cold 🧊'],['📢 loud','quiet 🔇'],['⚡ fast','slow 🐢'],['😊 happy','sad 😢'],['⬆️ up','down ⬇️'],['💡 light','dark 🌑'],['🐘 big','small 🐭']];
const RHYMES = [['🐱 cat','hat 🎩'],['🐶 dog','frog 🐸'],['🌙 moon','spoon 🥄'],['⭐ star','car 🚗'],['🐝 bee','tree 🌳'],['🦆 duck','truck 🚚'],['🐷 pig','wig 💇'],['🦁 lion','? '] ];
const CLOCKS = ['1:00','2:30','3:15','4:45','5:00','6:30','7:15','8:00','9:30','10:15','11:45','12:00'];

function numQ(diff, op) {
  const [lo, hi] = diff === 'easy' ? [1, 10] : diff === 'medium' ? [1, 20] : [1, 50];
  const a = ri(lo, hi), b = ri(lo, hi);
  if (op === 'add') return { a, b, ans: a + b, sym: '+' };
  if (op === 'sub') { const x = Math.max(a, b), y = Math.min(a, b); return { a: x, b: y, ans: x - y, sym: '−' }; }
}

function mc(answer, pool, n = 4) {
  const others = shuffle(pool.filter((x) => x !== answer)).slice(0, n - 1);
  return shuffle([answer, ...others]);
}

export const GAMES = [
{ id:'pattern', name:'Pattern Match', emoji:'🧩', color:'#9B59B6',
  gen(diff){ const seq=[['🔴','🔵'],['⭐','🌙'],['🍎','🍌'],['🐶','🐱']].map(rnd)[0];
    const n = diff==='easy'?4:diff==='medium'?6:8;
    const pat=[]; for(let i=0;i<n;i++) pat.push(seq[i%2]);
    const answer=seq[n%2]; const shown=pat.slice(0,-1);
    return { q:'What comes next? 🤔', display:shown.join(' ')+' ❓', options:mc(answer,[seq[0],seq[1],'⭐','🔴']), answer, hint:`Look for the pattern — it repeats! ${seq[0]} then ${seq[1]}. Count along!` }; } },
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
  gen(){ const [e,name]=rnd(PLANETS); return { q:'Which planet is this? 🪐', display:e, options:mc(name,PLANETS.map(p=>p[1])), answer:name, hint:`That's ${name}! You're a super space explorer! 🚀` }; } },
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
  gen(diff){ const hi=diff==='easy'?10:diff==='medium'?20:50; const n=ri(1,hi-2);
    const ans=n+1; return { q:'What comes next? 🎯', display:`${n}, __`, options:mc(ans,[n-1,n+2,n+3,ans+1]), answer:ans, hint:`Just one more number — you're on fire!` }; } },
{ id:'letters', name:'Letter Match', emoji:'🔤', color:'#3498DB',
  gen(){ const L=rnd(LETTERS); const lower=L.toLowerCase();
    return { q:'Match the letters! 🔤', display:L+' = ?', options:mc(lower,LETTERS.map(x=>x.toLowerCase())), answer:lower, hint:`Big ${L}, little ${lower} — they're best friends!` }; } },
{ id:'rhyme', name:'Rhyme Time', emoji:'🎵', color:'#9B59B6',
  gen(){ const [a,b]=rnd(RHYMES.filter(r=>!r[1].includes('?'))); const ans=b.split(' ')[1]||b;
    return { q:`What rhymes with ${a}?`, display:a+' 🎤', options:mc(ans,['hat','frog','spoon','car','tree','truck','wig']), answer:ans, hint:`${a} and ${b} rhyme — listen to the ending sound!` }; } },
{ id:'opposites', name:'Opposites', emoji:'↔️', color:'#F1C40F',
  gen(){ const [a,b]=rnd(OPPOSITES); const ans=b.split(' ')[1]||b;
    return { q:`What's the opposite of ${a}?`, display:a+' ↔️ ?', options:mc(ans,['night','cold','quiet','slow','sad','down','dark','small']), answer:ans, hint:`Think about the flip side — it's ${b}!` }; } },
{ id:'money', name:'Money Counter', emoji:'💰', color:'#2ECC71',
  gen(diff){ const coins=[['🪙 penny',1],['🪙 nickel',5],['🪙 dime',10],['🪙 quarter',25]];
    const n=diff==='easy'?2:diff==='medium'?3:4; let total=0; let desc=[];
    for(let i=0;i<n;i++){ const [nm,v]=rnd(coins); total+=v; desc.push(nm.split(' ')[1]); }
    return { q:'Count the coins! 🪙', display:desc.join(' + '), options:mc(total,[total-5,total+5,total-10,total+10,total+1,total-1].filter(x=>x>0)), answer:total, hint:`You're rich! Count those coins again!` }; } },
{ id:'clock', name:'Clock Reader', emoji:'🕐', color:'#3498DB',
  gen(){ const t=rnd(CLOCKS); return { q:'What time is it? ⏰', display:'🕐 '+t, options:mc(t,CLOCKS), answer:t, hint:`You're a time detective — it's ${t}!` }; } },
{ id:'map', name:'Map Explorer', emoji:'🗺️', color:'#FF6B35',
  gen(){ const [e,q,ans]=rnd(MAPS); return { q, display:e, options:mc(ans,MAPS.map(m=>m[2])), answer:ans, hint:`The answer is "${ans}" — great exploring!` }; } },
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
    return { q:'What happens first? 📖', display:order.map(x=>x[0]).join('  '), options:mc(s[0][1],s.map(x=>x[1])), answer:s[0][1], hint:`First: ${s[0][0]} ${s[0][1]}! You're telling the story!` }; } },
{ id:'science', name:'Science Lab', emoji:'🔬', color:'#2ECC71',
  gen(){ const [e,q,ans]=rnd(SCIENCE); const pool=['water','sunlight','bones','heart','moon','fire','air','soil'];
    return { q, display:e, options:mc(ans,pool), answer:ans, hint:`Think like a scientist — it's ${ans}!` }; } },
{ id:'memory', name:'Memory Flip', emoji:'🃏', color:'#1A1040',
  gen(){ const pair=rnd([['🐶','dog'],['🐱','cat'],['🦁','lion'],['🐸','frog'],['🦋','butterfly'],['🐢','turtle']]);
    return { q:'Remember! 🧠', display:pair[0]+' = ?', options:mc(pair[1],['dog','cat','lion','frog','butterfly','turtle']), answer:pair[1], hint:`${pair[0]} is the ${pair[1]} — make a silly picture in your brain!` }; } },
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
