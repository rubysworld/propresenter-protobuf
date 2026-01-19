import { readPresentation, writePresentation } from './src/lib/index.js';
import { MusicKey, MusicScale } from './src/lib/create.js';

// Read the existing file
const pres = await readPresentation("Love Divine All Loves Excelling - REAL Chords.pro");

// Add music key info - starting key is F major (modulates to G in verse 2)
(pres as any).music = {
  originalMusicKey: "F",
  userMusicKey: "F",
  original: {
    musicKey: MusicKey.F,  // 16
    musicScale: MusicScale.MAJOR  // 0
  },
  user: {
    musicKey: MusicKey.F,
    musicScale: MusicScale.MAJOR
  }
};

// Also set the top-level musicKey field
(pres as any).musicKey = "F";

// Write back
await writePresentation("Love Divine All Loves Excelling - REAL Chords.pro", pres);
console.log("Updated music key to F major (note: modulates to G in verse 2)");
