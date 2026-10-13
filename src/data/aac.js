// AAC Communication Board — 12 categories, 120 words (emoji + label).
// Works fully offline (bundled data + localStorage). TTS via speechSynthesis.
export const AAC_CATEGORIES = [
  { id: 'needs', name: 'I Need', color: '#FF6B35', words: [
    ['🍽️','I am hungry'],['🥤','I want water'],['🚽','I need potty'],['😴','I am tired'],
    ['🤗','I need a hug'],['🆘','I need help'],['🛑','Stop'],['⏸️','I need a break'],
    ['🩹','I hurt'],['🧸','I want my toy']]},
  { id: 'feelings', name: 'Feelings', color: '#F1C40F', words: [
    ['😊','I am happy'],['😢','I am sad'],['😠','I am mad'],['😨','I am scared'],
    ['🤩','I am excited'],['😌','I am calm'],['🥰','I love you'],['😤','I am frustrated'],
    ['😴','I am sleepy'],['🤔','I am confused']]},
  { id: 'food', name: 'Food', color: '#2ECC71', words: [
    ['🍎','Apple'],['🍌','Banana'],['🍗','Chicken'],['🍚','Rice'],
    ['🥛','Milk'],['🍪','Cookie'],['🧃','Juice'],['🥑','Avocado'],
    ['🍉','Watermelon'],['🥞','Pancakes']]},
  { id: 'drink', name: 'Drinks', color: '#3498DB', words: [
    ['💧','Water'],['🧃','Juice'],['🥛','Milk'],['🥤','Smoothie'],
    ['🍵','Tea'],['🧋','Boba'],['🥥','Coconut water'],['🍋','Lemonade'],
    ['🫖','Warm drink'],['🧊','Ice water']]},
  { id: 'play', name: 'Play', color: '#9B59B6', words: [
    ['⚽','Ball'],['🎵','Music'],['💃','Dance'],['🧩','Puzzle'],
    ['🎨','Colors'],['📚','Book'],['🫧','Bubbles'],['🚗','Cars'],
    ['🏖️','Outside'],['🎮','Game']]},
  { id: 'people', name: 'People', color: '#E91E8C', words: [
    ['👩','Mama'],['👨','Dada'],['👵','Grandma'],['👴','Grandpa'],
    ['👧','Sister'],['👦','Brother'],['👩‍🏫','Teacher'],['🧑‍⚕️','Doctor'],
    ['👫','Friend'],['👪','Family']]},
  { id: 'places', name: 'Places', color: '#3498DB', words: [
    ['🏠','Home'],['🏫','School'],['🏞️','Park'],['🏪','Store'],
    ['🏥','Doctor'],['🍽️','Restaurant'],['🏊','Pool'],['🦁','Zoo'],
    ['✈️','Airplane'],['🚗','Car ride']]},
  { id: 'actions', name: 'Actions', color: '#FF6B35', words: [
    ['▶️','Go'],['⏹️','Stop'],['🔁','Again'],['👀','Look'],
    ['👂','Listen'],['✋','Wait'],['🤝','Help me'],['🎉','Play with me'],
    ['📖','Read'],['🎤','Sing']]},
  { id: 'describing', name: 'Describing', color: '#9B59B6', words: [
    ['👍','Good'],['👎','Bad'],['🔥','Hot'],['🧊','Cold'],
    ['📢','Loud'],['🔇','Quiet'],['⚡','Fast'],['🐢','Slow'],
    ['😋','Yummy'],['🤢','Yucky']]},
  { id: 'questions', name: 'Questions', color: '#F1C40F', words: [
    ['❓','What?'],['📍','Where?'],['🕐','When?'],['👤','Who?'],
    ['💡','Why?'],['🤷','How?'],['🔢','How many?'],['↔️','Which one?'],
    ['✅','Yes'],['❌','No']]},
  { id: 'comfort', name: 'Comfort', color: '#2ECC71', words: [
    ['🤗','Hug please'],['🛋️','Sit with me'],['🌙','Dark please'],['💡','Light please'],
    ['🎧','Headphones'],['🧸','Blanket'],['🤫','Quiet please'],['🌬️','Fresh air'],
    ['💆','Deep pressure'],['🎵','Calm music']]},
  { id: 'more', name: 'More', color: '#E91E8C', words: [
    ['➕','More'],['🔚','All done'],['🔁','Again please'],['🆕','Something else'],
    ['⏰','Later'],['🔜','Soon'],['🙏','Please'],['😊','Thank you'],
    ['👋','Hi'],['👋','Bye']]},
];

// Reading cards — full phrase cards for kids who can read (per spec)
export const READING_CARDS = [
  'I am hungry', 'I need help', 'I love you', 'Play music',
  'I am happy', 'Go outside', 'I am tired', 'I want water',
];
