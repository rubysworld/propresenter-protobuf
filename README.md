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
# Dump presentation as JSON
npx tsx src/cli.ts dump /path/to/presentation.pro

# Edit slide text
npx tsx src/cli.ts edit /path/to/presentation.pro --slide 0 --text "New text"

# List slides
npx tsx src/cli.ts list /path/to/presentation.pro
```

### Library

```typescript
import { readPresentation, writePresentation, getSlideText, setSlideText } from './lib';

// Read a presentation
const pres = await readPresentation('song.pro');
console.log(pres.name);

// Get slide text
const text = getSlideText(pres, 0);
console.log(text);

// Modify and save
setSlideText(pres, 0, 'Updated lyrics');
await writePresentation('song.pro', pres);
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
