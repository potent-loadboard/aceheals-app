import { useStored } from './store.js';

// Kid Learning Profile — the app learns each kid over time.
// Tracks favorites, difficulty comfort, play patterns, and personalizes the experience.
const DEFAULT_PROFILE = {
  favoriteGames: {},      // gameId -> play count
  bestDifficulty: {},     // gameId -> 'easy'|'medium'|'hard' (where they succeed most)
  totalPlays: 0,
  totalStars: 0,
  streakDays: 0,
  lastPlayed: null,
  favoriteColor: null,
  sessionCount: 0,
  avgSessionMinutes: 0,
  // Adaptive flags
  needsEncouragement: false,  // true if recent accuracy < 50%
  readyForHarder: false,       // true if recent accuracy > 90% on current difficulty
};

export function useKidProfile(kidId = 'manny') {
  const [profile, setProfile] = useStored(`${kidId}Profile`, DEFAULT_PROFILE);

  const recordGamePlay = (gameId, difficulty, correct, total) => {
    setProfile((p) => {
      const fav = { ...p.favoriteGames, [gameId]: (p.favoriteGames[gameId] || 0) + 1 };
      const accuracy = total > 0 ? correct / total : 0;
      return {
        ...p,
        favoriteGames: fav,
        totalPlays: p.totalPlays + 1,
        lastPlayed: Date.now(),
        needsEncouragement: accuracy < 0.5 && total >= 3,
        readyForHarder: accuracy > 0.9 && total >= 5 && difficulty !== 'g78',
        bestDifficulty: {
          ...p.bestDifficulty,
          [gameId]: accuracy > 0.7 ? difficulty : (p.bestDifficulty[gameId] || difficulty),
        },
      };
    });
  };

  const recordSession = (minutesPlayed) => {
    setProfile((p) => {
      const sessions = p.sessionCount + 1;
      const avg = ((p.avgSessionMinutes * p.sessionCount) + minutesPlayed) / sessions;
      const today = new Date().toDateString();
      const lastDay = p.lastPlayed ? new Date(p.lastPlayed).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let streak = p.streakDays;
      if (lastDay !== today) {
        streak = lastDay === yesterday ? streak + 1 : 1;
      }
      return { ...p, sessionCount: sessions, avgSessionMinutes: Math.round(avg), streakDays: streak };
    });
  };

  const getFavoriteGames = (limit = 3) => {
    return Object.entries(profile.favoriteGames)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  };

  const getSuggestedDifficulty = (gameId) => {
    return profile.bestDifficulty[gameId] || 'k2';
  };

  const getPersonalizedGreeting = (kidName) => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    if (profile.sessionCount === 0) return `Hi ${kidName}! I'm so excited to meet you! Let's play!`;
    if (profile.streakDays >= 3) return `Good ${timeOfDay}, ${kidName}! ${profile.streakDays} days in a row — you're on fire!`;
    if (profile.needsEncouragement) return `Hi ${kidName}! Let's have fun today — no pressure, just play!`;
    const favs = getFavoriteGames(1);
    if (favs.length > 0) return `Good ${timeOfDay}, ${kidName}! Want to play your favorite?`;
    return `Good ${timeOfDay}, ${kidName}! What should we play today?`;
  };

  const resetProfile = () => setProfile(DEFAULT_PROFILE);

  return {
    profile, recordGamePlay, recordSession,
    getFavoriteGames, getSuggestedDifficulty, getPersonalizedGreeting, resetProfile,
  };
}

// Parent profile — personalization for grown-ups
const DEFAULT_PARENT = {
  name: '',
  bedtime: '20:00',
  dailyLimit: 60, // minutes
  calmMode: false,
  weeklyReport: true,
};

export function useParentProfile() {
  const [parent, setParent] = useStored('parentProfile', DEFAULT_PARENT);
  const update = (patch) => setParent((p) => ({ ...p, ...patch }));
  return { parent, update };
}
