import { load, save } from './store.js';

// Global audio settings — controls all sound in the app
const KEY = 'audioSettings';

const DEFAULTS = {
  master: true,      // master on/off
  voice: true,       // TTS narration on/off
  effects: true,     // sound effects on/off
  volume: 0.8,       // 0-1
  mode: 'normal',    // normal | headphones | quiet | library
};

export function getAudioSettings() {
  return { ...DEFAULTS, ...load(KEY, {}) };
}

export function saveAudioSettings(s) {
  save(KEY, { ...getAudioSettings(), ...s });
}

// Check if a sound type should play
export function shouldPlay(type = 'effects') {
  const s = getAudioSettings();
  if (!s.master) return false;
  if (s.mode === 'library' || s.mode === 'quiet') return false;
  if (type === 'voice' && !s.voice) return false;
  if (type === 'effects' && !s.effects) return false;
  return true;
}

export function getVolume() {
  return getAudioSettings().volume;
}

export const AUDIO_MODES = [
  { id: 'normal', name: '🔊 Normal', desc: 'All sounds on' },
  { id: 'headphones', name: '🎧 Headphones', desc: 'Optimized for headphones' },
  { id: 'quiet', name: '🔉 Quiet', desc: 'Soft sounds only' },
  { id: 'library', name: '📚 Library', desc: 'Silent — visuals only' },
];
