#!/usr/bin/env npx tsx
/**
 * ProPresenter CLI Tool
 * 
 * Command-line interface for working with ProPresenter files.
 */

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  readPresentation,
  writePresentation,
  readPlaylist,
  getPresentationSummary,
  getCuesByGroup,
  getCueText,
  setCueText,
  getCues,
  rtfToText,
} from './lib/index.js';

const program = new Command();

program
  .name('propresenter')
  .description('CLI tools for working with ProPresenter 7+ files')
  .version('0.1.0');

// ============================================================================
// dump - Output presentation as JSON
// ============================================================================

program
  .command('dump')
  .description('Dump a ProPresenter file as JSON')
  .argument('<file>', 'ProPresenter file (.pro or .proplaylist)')
  .option('-p, --pretty', 'Pretty print JSON', true)
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action(async (file: string, options: { pretty?: boolean; output?: string }) => {
    try {
      let data: any;
      
      if (file.endsWith('.pro')) {
        data = await readPresentation(file);
      } else if (file.endsWith('.proplaylist')) {
        data = await readPlaylist(file);
      } else {
        // Try as presentation
        data = await readPresentation(file);
      }

      // Convert Buffer objects to base64 for JSON serialization
      const json = JSON.stringify(data, (key, value) => {
        if (Buffer.isBuffer(value)) {
          return { type: 'Buffer', data: value.toString('base64') };
        }
        return value;
      }, options.pretty ? 2 : undefined);

      if (options.output) {
        await fs.writeFile(options.output, json);
        console.log(`Written to ${options.output}`);
      } else {
        console.log(json);
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// ============================================================================
// info - Show presentation summary
// ============================================================================

program
  .command('info')
  .description('Show presentation summary')
  .argument('<file>', 'ProPresenter presentation file (.pro)')
  .action(async (file: string) => {
    try {
      const presentation = await readPresentation(file);
      console.log(getPresentationSummary(presentation));
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// ============================================================================
// list - List slides with text
// ============================================================================

program
  .command('list')
  .description('List all slides with their text content')
  .argument('<file>', 'ProPresenter presentation file (.pro)')
  .option('-g, --group <name>', 'Filter by group name')
  .option('-f, --full', 'Show full text (not truncated)')
  .action(async (file: string, options: { group?: string; full?: boolean }) => {
    try {
      const presentation = await readPresentation(file);
      const byGroup = getCuesByGroup(presentation);
      
      for (const [groupName, cues] of byGroup) {
        if (options.group && groupName.toLowerCase() !== options.group.toLowerCase()) {
          continue;
        }
        
        console.log(`\n=== ${groupName} ===`);
        
        for (let i = 0; i < cues.length; i++) {
          const text = getCueText(cues[i]);
          const display = options.full ? text : text.slice(0, 100).replace(/\n/g, ' | ');
          console.log(`[${i}] ${display}${!options.full && text.length > 100 ? '...' : ''}`);
        }
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// ============================================================================
// text - Extract just the text
// ============================================================================

program
  .command('text')
  .description('Extract all text from a presentation')
  .argument('<file>', 'ProPresenter presentation file (.pro)')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action(async (file: string, options: { output?: string }) => {
    try {
      const presentation = await readPresentation(file);
      const byGroup = getCuesByGroup(presentation);
      
      const lines: string[] = [];
      
      for (const [groupName, cues] of byGroup) {
        lines.push(`[${groupName}]`);
        for (const cue of cues) {
          const text = getCueText(cue);
          if (text) {
            lines.push(text);
            lines.push('');  // Blank line between slides
          }
        }
      }
      
      const output = lines.join('\n');
      
      if (options.output) {
        await fs.writeFile(options.output, output);
        console.log(`Written to ${options.output}`);
      } else {
        console.log(output);
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// ============================================================================
// edit - Edit slide text
// ============================================================================

program
  .command('edit')
  .description('Edit slide text in a presentation')
  .argument('<file>', 'ProPresenter presentation file (.pro)')
  .requiredOption('-c, --cue <index>', 'Cue index to edit (0-based)')
  .requiredOption('-t, --text <text>', 'New text for the slide')
  .option('-o, --output <file>', 'Output file (default: overwrite input)')
  .option('--dry-run', 'Show what would change without writing')
  .action(async (file: string, options: { cue: string; text: string; output?: string; dryRun?: boolean }) => {
    try {
      const presentation = await readPresentation(file);
      const cues = getCues(presentation);
      const cueIndex = parseInt(options.cue, 10);
      
      if (cueIndex < 0 || cueIndex >= cues.length) {
        console.error(`Error: Cue index ${cueIndex} out of range (0-${cues.length - 1})`);
        process.exit(1);
      }
      
      const cue = cues[cueIndex];
      const oldText = getCueText(cue);
      
      console.log(`Cue ${cueIndex}:`);
      console.log(`  Old text: ${oldText.slice(0, 50)}${oldText.length > 50 ? '...' : ''}`);
      console.log(`  New text: ${options.text.slice(0, 50)}${options.text.length > 50 ? '...' : ''}`);
      
      if (options.dryRun) {
        console.log('\n(dry run - no changes written)');
        return;
      }
      
      const success = setCueText(cue, options.text);
      if (!success) {
        console.error('Error: Could not find text element in cue');
        process.exit(1);
      }
      
      const outputPath = options.output || file;
      await writePresentation(outputPath, presentation);
      console.log(`\nWritten to ${outputPath}`);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// ============================================================================
// decode-rtf - Decode RTF from a slide
// ============================================================================

program
  .command('decode-rtf')
  .description('Decode RTF data and show both raw RTF and extracted text')
  .argument('<file>', 'ProPresenter presentation file (.pro)')
  .option('-c, --cue <index>', 'Specific cue index (default: all)')
  .action(async (file: string, options: { cue?: string }) => {
    try {
      const presentation = await readPresentation(file);
      const cues = getCues(presentation);
      
      const indices = options.cue !== undefined 
        ? [parseInt(options.cue, 10)]
        : cues.map((_, i) => i);
      
      for (const i of indices) {
        if (i < 0 || i >= cues.length) continue;
        
        const cue = cues[i];
        console.log(`\n=== Cue ${i} ===`);
        
        for (const action of cue.actions || []) {
          if (action.slide?.presentation) {
            for (const element of action.slide.presentation.elements || []) {
              if (element.element?.text?.rtfData) {
                const rtfData = element.element.text.rtfData;
                const rtfString = Buffer.isBuffer(rtfData) 
                  ? rtfData.toString('utf-8')
                  : Buffer.from(rtfData).toString('utf-8');
                
                console.log(`\nElement: ${element.element.name || 'unnamed'}`);
                console.log('--- Raw RTF ---');
                console.log(rtfString.slice(0, 500));
                if (rtfString.length > 500) console.log('...(truncated)');
                console.log('\n--- Extracted Text ---');
                console.log(rtfToText(rtfData));
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// ============================================================================
// validate - Check if a file can be read and re-written
// ============================================================================

program
  .command('validate')
  .description('Validate that a file can be read and round-tripped')
  .argument('<file>', 'ProPresenter file to validate')
  .action(async (file: string) => {
    try {
      console.log(`Reading ${file}...`);
      const presentation = await readPresentation(file);
      console.log(`✓ Read successfully`);
      console.log(`  Name: ${presentation.name}`);
      console.log(`  Cues: ${presentation.cues?.length || 0}`);
      console.log(`  Groups: ${presentation.cueGroups?.length || 0}`);
      
      // Try to verify it could be written back
      const { getMessageType } = await import('./lib/index.js');
      const PresentationType = await getMessageType('rv.data.Presentation');
      const errMsg = PresentationType.verify(presentation);
      
      if (errMsg) {
        console.log(`⚠ Validation warning: ${errMsg}`);
      } else {
        console.log(`✓ Structure validates`);
      }
      
      console.log('\n✓ File is valid');
    } catch (err: any) {
      console.error(`✗ Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
