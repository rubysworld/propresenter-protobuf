/**
 * Test script for ProPresenter Protobuf library
 */

import { loadProtoDefinitions } from './lib/index.js';

async function test() {
  console.log('Loading proto definitions...\n');
  const root = await loadProtoDefinitions();
  
  // Check if we can find key types
  const types = [
    'rv.data.Presentation',
    'rv.data.PlaylistDocument', 
    'rv.data.Cue',
    'rv.data.Slide',
    'rv.data.Action',
    'rv.data.Graphics.Element',
    'rv.data.Graphics.Text',
  ];
  
  console.log('Checking proto types:');
  for (const t of types) {
    try {
      const type = root.lookupType(t);
      const fieldCount = Object.keys(type.fields).length;
      console.log(`  ✓ ${t} (${fieldCount} fields)`);
    } catch (e: any) {
      console.log(`  ✗ ${t}: ${e.message}`);
    }
  }
  
  console.log('\n✓ Proto definitions loaded successfully!');
  console.log('\nTo test with a real file, run:');
  console.log('  npx tsx src/cli.ts info <path-to-file.pro>');
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
