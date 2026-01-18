# ProPresenter Protobuf Tools

Reverse-engineered tools for reading and writing ProPresenter 7+ files.

## ⚠️ WARNING

These are **unofficial, reverse-engineered** tools. They are NOT created, endorsed, or supported by Renewed Vision (the makers of ProPresenter).

- **DO NOT contact Renewed Vision for support!**
- Always backup your files before making any modifications
- Test changes on copies first, never on production files
- Mistakes can crash/break ProPresenter

## Overview

ProPresenter 7 moved from XML to Google Protocol Buffers for its file formats. This project provides:

1. **Proto definitions** - `.proto` files describing the data structures (from [greyshirtguy/ProPresenter7-Proto](https://github.com/greyshirtguy/ProPresenter7-Proto))
2. **TypeScript library** - Read, modify, and write ProPresenter files
3. **CLI tool** - Command-line interface for common operations

## File Types

| Extension | Description | Proto Message |
|-----------|-------------|---------------|
| `.pro` | Presentation document | `rv.data.Presentation` |
| `.proplaylist` | Playlist | `rv.data.PlaylistDocument` |
| `.proworkspace` | Workspace configuration | `rv.data.Workspace` |

## Installation

```bash
npm install
```

## Usage

### CLI

```bash
# Show presentation info
npx tsx src/cli.ts info song.pro
npx tsx src/cli.ts info -v song.pro  # verbose with all slides

# List slides with text
npx tsx src/cli.ts list song.pro
npx tsx src/cli.ts list -g Chorus song.pro  # filter by group

# Extract text/lyrics
npx tsx src/cli.ts text song.pro
npx tsx src/cli.ts text -o lyrics.txt song.pro

# Extract chord chart
npx tsx src/cli.ts chords song.pro
npx tsx src/cli.ts chords --format chordpro song.pro

# Edit slide text
npx tsx src/cli.ts edit song.pro --cue 0 --text "New text"
npx tsx src/cli.ts edit song.pro --cue 0 --text "New text" --dry-run

# Export in different formats
npx tsx src/cli.ts export -f ccli-report song.pro  # CCLI reporting
npx tsx src/cli.ts export -f markdown song.pro     # Markdown
npx tsx src/cli.ts export -f lyrics-txt song.pro   # Plain text

# Batch operations
npx tsx src/cli.ts batch --list-songs *.pro        # List all songs
npx tsx src/cli.ts batch --ccli-report *.pro       # CCLI report for all

# Debug/development
npx tsx src/cli.ts dump song.pro                   # Full JSON dump
npx tsx src/cli.ts decode-rtf song.pro             # Show raw RTF
npx tsx src/cli.ts validate song.pro               # Verify file integrity
```

### Library

```typescript
import { 
  readPresentation, 
  writePresentation,
  getCues,
  getCuesByGroup,
  getCueText,
  setCueText,
  getCueChords,
  getCueNotes,
  getMultiTracksInfo,
  formatCCLI,
  getMusicKey,
  generateUuid,
} from './src/lib/index.js';

// Read a presentation
const pres = await readPresentation('song.pro');
console.log(pres.name);

// Get CCLI info
const ccli = formatCCLI(pres);
console.log(ccli);  // "Amazing Grace" by John Newton | © 1779 | CCLI #1234567

// Get music key
const key = getMusicKey(pres);
console.log(key);  // { original: 'G', current: 'A' }

// Check MultiTracks licensing
const mt = getMultiTracksInfo(pres);
if (mt) {
  console.log(`MultiTracks song ${mt.songId}, expires ${mt.licenseExpiration}`);
}

// Iterate through slides by group
const byGroup = getCuesByGroup(pres);
for (const [groupName, cues] of byGroup) {
  console.log(`[${groupName}]`);
  for (const cue of cues) {
    console.log(getCueText(cue));
    console.log('Chords:', getCueChords(cue));
    console.log('Notes:', getCueNotes(cue));
  }
}

// Modify a slide
const cues = getCues(pres);
setCueText(cues[0], 'Updated lyrics');
await writePresentation('song-modified.pro', pres);
```

## Schema Documentation

See [SCHEMA.md](./SCHEMA.md) for detailed documentation of the ProPresenter file format.

## Project Structure

```
├── proto/              # ProPresenter7-Proto submodule
├── src/
│   ├── generated/      # Generated protobuf code
│   ├── lib/            # Library code
│   └── cli.ts          # CLI tool
├── samples/            # Sample ProPresenter files for testing
└── docs/               # Additional documentation
```

## Credits

- Proto definitions by [greyshirtguy](https://github.com/greyshirtguy/ProPresenter7-Proto)
- Built for FBC Gulfport's media team

## License

MIT (tools only - proto files have their own license)
