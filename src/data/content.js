// Social Stories — 8 pre-built stories, 6-10 picture panels + simple text each.
export const SOCIAL_STORIES = [
{ id:'doctor', title:'Doctor Visit', emoji:'🩺', panels:[
  ['🏠','We get ready to visit the doctor.'],
  ['🚗','We ride in the car. I can bring my toy.'],
  ['🏥','We arrive. The waiting room has chairs.'],
  ['👋','The nurse calls our name. We say hi.'],
  ['🩺','The doctor listens to my heart. It is quick.'],
  ['💪','The doctor checks my arms and legs.'],
  ['⭐','I was so brave! We did it!'],
  ['🏠','We go home. I am proud of me.']]},
{ id:'haircut', title:'Haircut', emoji:'💇', panels:[
  ['🚗','We go to the barber shop.'],
  ['💺','I sit in the big chair.'],
  ['🧥','The cape goes around me like a superhero!'],
  ['✂️','Snip snip. The clippers buzz.'],
  ['🪞','I look in the mirror.'],
  ['🎉','Fresh haircut! I look great!']]},
{ id:'grocery', title:'Grocery Store', emoji:'🛒', panels:[
  ['📝','We make a list together.'],
  ['🚗','We drive to the store.'],
  ['🛒','I help push the cart.'],
  ['🍎','We find the foods on our list.'],
  ['💳','We pay at the register.'],
  ['🚗','We load the car and go home.'],
  ['⭐','I was a great helper!']]},
{ id:'school', title:'School First Day', emoji:'🎒', panels:[
  ['🌞','It is the first day of school!'],
  ['🎒','I pack my backpack.'],
  ['🚌','We ride to school.'],
  ['👋','I say goodbye. Hugs help.'],
  ['👩‍🏫','I meet my teacher.'],
  ['🧩','We play and learn together.'],
  ['🏠','Mama/Dada picks me up. I did it!']]},
{ id:'babysitter', title:'New Babysitter', emoji:'👩', panels:[
  ['👋','A new babysitter is coming.'],
  ['😊','They are kind and fun.'],
  ['🧸','We play with my toys.'],
  ['🍽️','We eat together.'],
  ['📚','We read a story.'],
  ['🏠','Mama/Dada comes home!']]},
{ id:'birthday', title:'Birthday Party', emoji:'🎂', panels:[
  ['🎈','There are balloons and decorations.'],
  ['👫','Friends are here!'],
  ['🎮','We play games together.'],
  ['🎂','We sing happy birthday!'],
  ['🎁','Presents are opened.'],
  ['🎉','What a fun party!']]},
{ id:'plane', title:'Flying on a Plane', emoji:'✈️', panels:[
  ['🧳','We pack our bags.'],
  ['🛫','The plane takes off. Up we go!'],
  ['👂','My ears might feel funny. I can chew gum.'],
  ['🎧','I watch a show with headphones.'],
  ['🍪','We have a snack.'],
  ['🛬','We land! Great job, traveler!']]},
{ id:'restaurant', title:'Restaurant', emoji:'🍽️', panels:[
  ['🚗','We go to a restaurant.'],
  ['💺','We sit at our table.'],
  ['📖','We look at the menu.'],
  ['🙋','We order our food.'],
  ['🍽️','Yummy food arrives!'],
  ['😊','We had a nice meal together.']]},
];

// Music tab content
export const FREQUENCIES = [
  { hz: 396, name: 'Release Tension', emoji: '🌊' },
  { hz: 432, name: 'Natural Calm', emoji: '🍃' },
  { hz: 528, name: 'Focus Time', emoji: '🎯' },
  { hz: 741, name: 'Settling Down', emoji: '🌙' },
];
export const KIDS_CHANNELS = [
  { name: "Gracie's Corner", note: 'hip hop phonics', emoji: '🎤', url: 'https://www.youtube.com/results?search_query=gracies+corner' },
  { name: 'Sumo World', note: 'movement + learning', emoji: '🦍', url: 'https://www.youtube.com/results?search_query=sumo+world+kids' },
  { name: 'Danny Go', note: 'high energy movement', emoji: '⚡', url: 'https://www.youtube.com/results?search_query=danny+go+kids' },
  { name: 'Jools TV', note: 'calm, sensory-friendly', emoji: '🌈', url: 'https://www.youtube.com/results?search_query=jools+tv' },
  { name: 'Hip Hop Harry', note: 'educational hip hop', emoji: '🎧', url: 'https://www.youtube.com/results?search_query=hip+hop+harry' },
];
export const PLAYLISTS = [
  { name: 'Morning Wake Up', tracks: 12, emoji: '🌅', color: '#F1C40F' },
  { name: 'Learning Mode', tracks: 18, emoji: '📚', color: '#3498DB' },
  { name: 'Lyric Learning', tracks: 8, emoji: '🎤', color: '#9B59B6' },
  { name: 'Bedtime Wind Down', tracks: 10, emoji: '🌙', color: '#1A1040' },
];
export const SLEEP_SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'whitenoise', name: 'White Noise', emoji: '📻' },
  { id: 'fan', name: 'Fan', emoji: '🌀' },
  { id: 'thunderstorm', name: 'Thunderstorm', emoji: '⛈️' },
];
export const CALM_SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'whitenoise', name: 'White Noise', emoji: '📻' },
  { id: 'heartbeat', name: 'Heartbeat', emoji: '💓' },
  { id: 'nature', name: 'Nature', emoji: '🌲' },
  { id: 'fan', name: 'Fan', emoji: '🌀' },
  { id: 'thunderstorm', name: 'Thunderstorm', emoji: '⛈️' },
];

// Heal tab — cleaner swap suggestions by category (static, per spec)
export const SWAPS = {
  snack: ['Fresh fruit with sunflower seed butter', 'Veggie sticks with hummus', 'Air-popped popcorn with sea salt'],
  drink: ['Water with fruit slices', 'Coconut water', 'Homemade lemonade with honey'],
  cereal: ['Oatmeal with fresh berries', 'Quinoa porridge with cinnamon'],
  treat: ['Frozen banana bites', 'Baked apple slices with cinnamon'],
  default: ['Whole fruit instead of fruit snacks', 'Water instead of colored drinks', 'Homemade versions of packaged favorites'],
};

// Parasite protocol tracker — "what many families try" framing ONLY. Never medical advice.
export const PROTOCOL_PHASES = [
  { id: 'prep', name: 'Prep', weeks: 'Week 1–2', color: '#2ECC71', steps: [
    'Focus on whole foods (ask your doctor first)',
    'Add fiber-rich foods',
    'Increase water intake',
    'Start a symptom notes journal',
  ]},
  { id: 'cleanse', name: 'Active Cleanse', weeks: 'Week 3–6', color: '#F1C40F', steps: [
    'Follow your doctor-approved plan only',
    'Keep logging symptoms daily',
    'Rest when tired — this is a marathon',
    'Stay hydrated',
  ]},
  { id: 'rest', name: 'Rest & Rebuild', weeks: 'Week 7–8', color: '#3498DB', steps: [
    'Gentle nourishing foods',
    'Continue symptom journal',
    'Check in with your doctor',
    'Prioritize sleep',
  ]},
  { id: 'gut', name: 'Gut Support', weeks: 'Week 9–10', color: '#9B59B6', steps: [
    'Probiotic foods (ask your doctor first)',
    'Bone broth if tolerated',
    'Keep tracking what you notice',
    'Celebrate how far you came 🎉',
  ]},
];
export const PROTOCOLS_RESEARCHED = ['Mimosa Pudica', 'Black Walnut', 'Clove', 'Wormwood'];

// Wellness roadmap (per spec)
export const ROADMAP = [
  { id: 'p1', name: 'Foundation', weeks: 'Weeks 1–2', status: 'active', color: '#2ECC71', steps: [
    'Remove gluten & dairy', 'Eliminate artificial dyes', 'Filter drinking water', 'Add probiotic (ask doctor first)']},
  { id: 'p2', name: 'Gut Support', weeks: 'Weeks 3–6', status: 'upcoming', color: '#F1C40F', steps: [
    'Gut-supportive supplements (consult doctor)', 'Bone broth', 'Anti-inflammatory meal plan', 'Track bowel/behavior']},
  { id: 'p3', name: 'With Your Doctor', weeks: 'Weeks 7–10', status: 'locked', color: '#95a5a6', steps: [
    'Always consult your pediatrician before starting any herbal protocols']},
  { id: 'p4', name: 'Thrive', weeks: 'Week 11+', status: 'locked', color: '#95a5a6', steps: [
    'Keep the rhythms that work for your family', 'Share your wins with the community 💛']},
];

// Hip hop therapy sessions
export const HIP_HOP_SESSIONS = [
  { id: 'wake', name: 'Wake Up', emoji: '🌅', cues: ['Clap to the beat 👏','March in place 🦶','Big stretch up! 🙆'] },
  { id: 'focus', name: 'Focus', emoji: '🎯', cues: ['Stomp left, stomp right 🦶','Clap on the 2 and 4 👏','Freeze! 🧊'] },
  { id: 'calm', name: 'Calm Down', emoji: '🌊', cues: ['Slow sway side to side 🌊','Deep breath in… out 🌬️','Gentle shoulder rolls 💆'] },
  { id: 'dance', name: 'Dance Break', emoji: '💃', cues: ['Freestyle! Go wild 🎉','Spin! 🌀','Strike a pose 📸'] },
  { id: 'bedtime', name: 'Bedtime Wind Down', emoji: '🌙', cues: ['Slow rocking 🚼','Soft humming 🎵','Tiny movements only 🤫'] },
];

// Community stats (per spec)
export const COMMUNITY_STATS = { families: '12,847', wins: '3,291', online: '847' };
