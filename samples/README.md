# Sample ProPresenter Files

Drop sample ProPresenter files here for testing.

## Recommended Samples

For best testing coverage, please provide:

1. **Presentation files (`.pro`)** - The main files we want to work with
   - A song/hymn with multiple slides (verse, chorus, etc.)
   - A presentation with images or video backgrounds
   - Something with CCLI copyright info filled in
   - Maybe a simple text-only slide

2. **Playlist files (`.proplaylist`)** - Service playlists
   - A typical Sunday service playlist

3. **Optional extras:**
   - Template files
   - Stage display layouts
   - Any other .pro* files

## File Locations

On macOS, ProPresenter files are typically in:
- `~/Documents/ProPresenter/`
- `~/Library/Application Support/RenewedVision/ProPresenter/`

On Windows:
- `Documents\ProPresenter\`
- `%APPDATA%\RenewedVision\ProPresenter\`

## Usage

Once you have samples here:

```bash
# View presentation info
npx tsx src/cli.ts info samples/song.pro

# List all slides with text
npx tsx src/cli.ts list samples/song.pro

# Extract just the text
npx tsx src/cli.ts text samples/song.pro

# Dump as JSON
npx tsx src/cli.ts dump samples/song.pro

# Decode RTF to see raw formatting
npx tsx src/cli.ts decode-rtf samples/song.pro
```
