import { createPresentation, SlideInput } from './src/lib/create.js';
import { writePresentation } from './src/lib/index.js';

// Helper to add chord at start of each line
function addLineChords(text: string, chords: string[]): SlideInput {
  const lines = text.split('\n');
  const chordPositions: { position: number; chord: string }[] = [];
  let pos = 0;
  
  for (let i = 0; i < lines.length && i < chords.length; i++) {
    if (chords[i]) {
      chordPositions.push({ position: pos, chord: chords[i] });
    }
    pos += lines[i].length + 1; // +1 for newline
  }
  
  return { text, chords: chordPositions };
}

const pres = createPresentation({
  title: "Love Divine All Loves Excelling",
  artist: "John Zundel and Sandy Wilkinson",
  ccliNumber: 4365774,
  publisher: "Van Ness Press, Inc.",
  copyrightYear: 2004,
  category: "Hymns",
  sections: [
    { 
      name: "Verse 1", 
      slides: [
        addLineChords("Love divine all loves excelling\nJoy of heav'n to earth come down", ["F", "Bb"]),
        addLineChords("Fix in us Thy humble dwelling\nAll Thy faithful mercies crown", ["F", "C"]),
        addLineChords("Jesus Thou art all compassion\nPure unbounded love Thou art", ["F", "Bb"]),
        addLineChords("Visit us with Thy salvation\nEnter ev'ry trembling heart", ["F/A", "C7", "F"])
      ]
    },
    { 
      name: "Verse 2", 
      slides: [
        addLineChords("Breathe o breathe Thy loving Spirit\nInto ev'ry troubled breast", ["F", "Bb"]),
        addLineChords("Let us all in Thee inherit\nLet us find the promised rest", ["F", "C"]),
        addLineChords("Take away our bent to sinning\nAlpha and Omega be", ["Dm", "Bb"]),
        addLineChords("End of faith as its beginning\nLet us find our rest in Thee", ["F/A", "C7", "F"])
      ]
    },
    { 
      name: "Verse 3", 
      slides: [
        addLineChords("Come Almighty to deliver\nLet us all Thy grace receive", ["F", "Bb"]),
        addLineChords("Suddenly return and never\nNever more Thy temples leave", ["F", "C"]),
        addLineChords("Thee we would be always blessing\nServe Thee as Thy hosts above", ["Dm", "Bb"]),
        addLineChords("Pray and praise Thee without ceasing\nGlory in Thy perfect love", ["F/A", "C7", "F"])
      ]
    },
    { 
      name: "Verse 4", 
      slides: [
        addLineChords("Finish then Thy new creation\nPure and spotless let us be", ["F", "Bb"]),
        addLineChords("Let us see Thy great salvation\nPerfectly restored in Thee", ["F", "C"]),
        addLineChords("Changed from glory into glory\nTill in heav'n we take our place", ["Dm", "Bb"]),
        addLineChords("Till we cast our crowns before Thee\nLost in wonder, love, and praise", ["F/A", "C7", "F"])
      ]
    },
    {
      name: "Blank",
      slides: [""]
    }
  ]
});

await writePresentation("Love Divine All Loves Excelling - With Chords.pro", pres);
console.log("Created: Love Divine All Loves Excelling - With Chords.pro");
