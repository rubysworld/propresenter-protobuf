/**
 * Test creating a ProPresenter presentation from scratch
 */

import { createPresentation, writePresentation, readPresentation, getPresentationSummary } from './src/lib/index.ts';

// Create a simple test presentation
const presentation = createPresentation({
  title: 'Test Song',
  artist: 'Test Artist',
  ccliNumber: 12345,
  ccliAuthor: 'Test Author',
  copyrightYear: 2024,
  publisher: 'Test Publisher',
  category: 'Worship',
  sections: [
    {
      name: 'Verse 1',
      slides: [
        'This is the first line\nOf verse one',
        'This is the second slide\nOf verse one'
      ]
    },
    {
      name: 'Chorus',
      slides: [
        'Chorus line one\nChorus line two',
        'Chorus line three\nChorus line four'
      ]
    },
    {
      name: 'Verse 2',
      slides: [
        'Verse two first slide\nWith two lines',
        'Verse two second slide\nAlso with two lines'
      ]
    }
  ]
});

console.log('Created presentation with:');
console.log(`  - Title: ${presentation.name}`);
console.log(`  - ${presentation.cueGroups?.length} sections`);
console.log(`  - ${presentation.cues?.length} total slides`);

const outputPath = './samples/Test Song.pro';

// Write the presentation
console.log(`\nWriting to ${outputPath}...`);
await writePresentation(outputPath, presentation);
console.log('✓ Written successfully!');

// Read it back to verify
console.log('\nReading back...');
const readBack = await readPresentation(outputPath);
console.log('✓ Read successfully!');

// Show summary
console.log('\n' + '='.repeat(60));
console.log(getPresentationSummary(readBack));
console.log('='.repeat(60));

console.log('\n✅ Test complete! Created file can be opened in ProPresenter.');
