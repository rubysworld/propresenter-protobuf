import { createPresentation } from './src/lib/create.js';
import { writePresentation } from './src/lib/index.js';

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
        "Love divine all loves excelling\nJoy of heav'n to earth come down",
        "Fix in us Thy humble dwelling\nAll Thy faithful mercies crown",
        "Jesus Thou art all compassion\nPure unbounded love Thou art",
        "Visit us with Thy salvation\nEnter ev'ry trembling heart"
      ]
    },
    { 
      name: "Verse 2", 
      slides: [
        "Breathe o breathe Thy loving Spirit\nInto ev'ry troubled breast",
        "Let us all in Thee inherit\nLet us find the promised rest",
        "Take away our bent to sinning\nAlpha and Omega be",
        "End of faith as its beginning\nLet us find our rest in Thee"
      ]
    },
    { 
      name: "Verse 3", 
      slides: [
        "Come Almighty to deliver\nLet us all Thy grace receive",
        "Suddenly return and never\nNever more Thy temples leave",
        "Thee we would be always blessing\nServe Thee as Thy hosts above",
        "Pray and praise Thee without ceasing\nGlory in Thy perfect love"
      ]
    },
    { 
      name: "Verse 4", 
      slides: [
        "Finish then Thy new creation\nPure and spotless let us be",
        "Let us see Thy great salvation\nPerfectly restored in Thee",
        "Changed from glory into glory\nTill in heav'n we take our place",
        "Till we cast our crowns before Thee\nLost in wonder, love, and praise"
      ]
    },
    {
      name: "Blank",
      slides: [""]
    }
  ]
});

await writePresentation("Love Divine All Loves Excelling.pro", pres);
console.log("Created: Love Divine All Loves Excelling.pro");
