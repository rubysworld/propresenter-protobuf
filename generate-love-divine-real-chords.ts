import { createPresentation, SlideInput } from './src/lib/create.js';
import { writePresentation } from './src/lib/index.js';

// Helper to create slide with chords
function slide(text: string, chordMap: Array<[number, string]>): SlideInput {
  return {
    text,
    chords: chordMap.map(([position, chord]) => ({ position, chord }))
  };
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
        // Measures 31-34: F² C²/E B♭² F²/D F²/C B♭² F²/A Gm⁷ C/E F
        slide(
          "Love divine all loves excelling\nJoy of heav'n to earth come down",
          [
            [0, "F"],           // "Love"
            [5, "C/E"],         // "divine"
            [12, "Bb"],         // "all"
            [16, "F/D"],        // "loves"
            [22, "F/C"],        // "excelling"
            [32, "Bb"],         // (newline) 
            [32, "F/A"],        // "Joy"
            [36, "Gm7"],        // "of"
            [48, "C/E"],        // "to"
            [57, "F"]           // "down"
          ]
        ),
        // Measures 35-38: B♭²/D F²/C B♭² F²/A C Fsus F
        slide(
          "Fix in us Thy humble dwelling\nAll Thy faithful mercies crown",
          [
            [0, "Bb/D"],        // "Fix"
            [7, "F/C"],         // "us"
            [14, "Bb"],         // "humble"
            [21, "F/A"],        // "dwelling"
            [31, "C"],          // (newline)
            [31, "Fsus"],       // "All"
            [59, "F"]           // "crown"
          ]
        ),
        // Measures 39-42: Dm A7/D A7 Dm A7/C# F/C FMaj7/C Gm/Bb F/A
        slide(
          "Jesus Thou art all compassion\nPure unbounded love Thou art",
          [
            [0, "Dm"],          // "Jesus"
            [6, "A7/D"],        // "Thou"
            [16, "Dm"],         // "compassion"
            [27, "A7/C#"],      // (newline)
            [31, "F/C"],        // "Pure"
            [36, "Gm/Bb"],      // "unbounded"
            [55, "F/A"]         // "art"
          ]
        ),
        // Measures 43-46: Gsus G Csus C F² C²/E B♭² F/C
        slide(
          "Visit us with Thy salvation\nEnter ev'ry trembling heart",
          [
            [0, "Gsus"],        // "Visit"
            [9, "G"],           // "with"
            [14, "Csus"],       // "Thy"
            [18, "C"],          // "salvation"
            [29, "F"],          // (newline)
            [29, "C/E"],        // "Enter"
            [35, "Bb"],         // "ev'ry"
            [51, "F/C"]         // "heart"
          ]
        )
      ]
    },
    { 
      name: "Verse 2", 
      slides: [
        // Key change to G major at measure 60
        // Measures 60-63: G² D²/F# C²/E G²/D C² G²/B Am⁷ D/F# G
        slide(
          "Breathe o breathe Thy loving Spirit\nInto ev'ry troubled breast",
          [
            [0, "G"],           // "Breathe"
            [8, "D/F#"],        // "o"
            [18, "C/E"],        // "Thy"
            [22, "G/D"],        // "loving"
            [29, "C"],          // "Spirit"
            [36, "G/B"],        // (newline)
            [36, "Am7"],        // "Into"
            [48, "D/F#"],       // "troubled"
            [57, "G"]           // "breast"
          ]
        ),
        // Measures 64-67: D²/F# C²/E G²/D C² G²/B D Gsus G
        slide(
          "Let us all in Thee inherit\nLet us find the promised rest",
          [
            [0, "D/F#"],        // "Let"
            [7, "C/E"],         // "all"
            [14, "G/D"],        // "Thee"
            [19, "C"],          // "inherit"
            [28, "G/B"],        // (newline)
            [28, "D"],          // "Let"
            [35, "Gsus"],       // "promised"
            [48, "G"]           // "rest"
          ]
        ),
        // Measures 68-71: Em Baug/E B⁷/E G/D GMaj⁷/D Am/C G/B
        slide(
          "Take away our bent to sinning\nAlpha and Omega be",
          [
            [0, "Em"],          // "Take"
            [5, "B7/E"],        // "away"
            [18, "Em"],         // "sinning"
            [26, "B7/D#"],      // (newline)
            [30, "G/D"],        // "Alpha"
            [40, "Am/C"],       // "Omega"
            [47, "G/B"]         // "be"
          ]
        ),
        // Measures 72-75: Asus A Dsus D G² D²/F# C²/E G/D
        slide(
          "End of faith as its beginning\nLet us find our rest in Thee",
          [
            [0, "Asus"],        // "End"
            [7, "A"],           // "faith"
            [13, "Dsus"],       // "as"
            [19, "D"],          // "beginning"
            [30, "G"],          // (newline)
            [30, "D/F#"],       // "Let"
            [37, "C/E"],        // "find"
            [53, "G/D"]         // "Thee"
          ]
        )
      ]
    },
    { 
      name: "Verse 3", 
      slides: [
        // Still in G major
        slide(
          "Come Almighty to deliver\nLet us all Thy grace receive",
          [
            [0, "G"],
            [5, "D/F#"],
            [15, "C/E"],
            [25, "G/D"],
            [30, "C"],
            [37, "G/B"],
            [46, "D"]
          ]
        ),
        slide(
          "Suddenly return and never\nNever more Thy temples leave",
          [
            [0, "D/F#"],
            [9, "C/E"],
            [20, "G/D"],
            [26, "C"],
            [32, "G/B"],
            [44, "D"],
            [54, "G"]
          ]
        ),
        slide(
          "Thee we would be always blessing\nServe Thee as Thy hosts above",
          [
            [0, "Em"],
            [5, "B7/E"],
            [21, "Em"],
            [29, "B7/D#"],
            [34, "G/D"],
            [44, "Am/C"],
            [61, "G/B"]
          ]
        ),
        slide(
          "Pray and praise Thee without ceasing\nGlory in Thy perfect love",
          [
            [0, "Asus"],
            [9, "A"],
            [15, "Dsus"],
            [33, "D"],
            [41, "G"],
            [47, "D/F#"],
            [57, "C/E"]
          ]
        )
      ]
    },
    { 
      name: "Verse 4", 
      slides: [
        slide(
          "Finish then Thy new creation\nPure and spotless let us be",
          [
            [0, "G"],
            [7, "D/F#"],
            [16, "C/E"],
            [24, "G/D"],
            [30, "C"],
            [35, "G/B"],
            [52, "D"]
          ]
        ),
        slide(
          "Let us see Thy great salvation\nPerfectly restored in Thee",
          [
            [0, "D/F#"],
            [7, "C/E"],
            [18, "G/D"],
            [29, "C"],
            [36, "G/B"],
            [47, "D"],
            [58, "G"]
          ]
        ),
        slide(
          "Changed from glory into glory\nTill in heav'n we take our place",
          [
            [0, "Em"],
            [8, "B7/E"],
            [22, "Em"],
            [28, "B7/D#"],
            [34, "G/D"],
            [47, "Am/C"],
            [57, "G/B"]
          ]
        ),
        slide(
          "Till we cast our crowns before Thee\nLost in wonder, love, and praise",
          [
            [0, "Asus"],
            [5, "A"],
            [13, "Dsus"],
            [29, "D"],
            [37, "G"],
            [46, "D/F#"],
            [54, "C/E"]
          ]
        )
      ]
    },
    {
      name: "Blank",
      slides: [{ text: "", chords: [] }]
    }
  ]
});

await writePresentation("Love Divine All Loves Excelling - REAL Chords.pro", pres);
console.log("Created: Love Divine All Loves Excelling - REAL Chords.pro");
console.log("Chords extracted from rhythm chart PDF - F major → G major key change");
