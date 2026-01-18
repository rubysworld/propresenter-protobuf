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
  getCueChords,
  getCueNotes,
  getMultiTracksInfo,
  formatCCLI,
  getMusicKey,
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
  .option('-v, --verbose', 'Show detailed information')
  .action(async (file: string, options: { verbose?: boolean }) => {
    try {
      const presentation = await readPresentation(file);
      
      console.log(`\n📄 ${presentation.name || 'Untitled'}`);
      console.log('─'.repeat(50));
      
      if (presentation.category) {
        console.log(`Category: ${presentation.category}`);
      }
      
      // CCLI Info
      const ccli = formatCCLI(presentation);
      if (ccli) {
        console.log(`\n🎵 ${ccli}`);
      }
      
      // Music Key
      const musicKey = getMusicKey(presentation);
      if (musicKey.original || musicKey.current) {
        const keyInfo = musicKey.current || musicKey.original;
        const transposed = musicKey.original && musicKey.current && musicKey.original !== musicKey.current;
        console.log(`Key: ${keyInfo}${transposed ? ` (transposed from ${musicKey.original})` : ''}`);
      }
      
      // MultiTracks
      const mt = getMultiTracksInfo(presentation);
      if (mt) {
        console.log(`\n🎹 MultiTracks: ${mt.subscription} license`);
        console.log(`   Song ID: ${mt.songId}`);
        if (mt.licenseExpiration) {
          console.log(`   Expires: ${mt.licenseExpiration.toLocaleDateString()}`);
        }
      }
      
      // Slides summary
      const byGroup = getCuesByGroup(presentation);
      const totalCues = presentation.cues?.length || 0;
      const groupCount = presentation.cueGroups?.length || 0;
      
      console.log(`\n📊 ${totalCues} slides in ${groupCount} groups`);
      
      // Check for chords
      let hasChords = false;
      for (const cue of presentation.cues || []) {
        if (getCueChords(cue).length > 0) {
          hasChords = true;
          break;
        }
      }
      if (hasChords) {
        console.log(`🎸 Has embedded chords`);
      }
      
      // Arrangements
      if (presentation.arrangements && presentation.arrangements.length > 0) {
        console.log(`\n🎼 Arrangements: ${presentation.arrangements.map(a => a.name).join(', ')}`);
      }
      
      // Verbose: show all slides
      if (options.verbose) {
        console.log('\n' + '─'.repeat(50));
        console.log('SLIDES:');
        
        for (const [groupName, cues] of byGroup) {
          console.log(`\n[${groupName}]`);
          for (let i = 0; i < cues.length; i++) {
            const text = getCueText(cues[i]);
            const chords = getCueChords(cues[i]);
            const notes = getCueNotes(cues[i]);
            
            console.log(`  ${i + 1}. ${text.slice(0, 60).replace(/\n/g, ' | ')}${text.length > 60 ? '...' : ''}`);
            
            if (chords.length > 0) {
              console.log(`     Chords: ${chords.map(c => c.chord).join(' ')}`);
            }
            if (notes) {
              console.log(`     Notes: ${notes.slice(0, 40)}${notes.length > 40 ? '...' : ''}`);
            }
          }
        }
      }
      
      console.log('');
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
// chords - Extract chord chart
// ============================================================================

program
  .command('chords')
  .description('Extract chord chart from a presentation')
  .argument('<file>', 'ProPresenter presentation file (.pro)')
  .option('-f, --format <format>', 'Output format: text, chordpro', 'text')
  .action(async (file: string, options: { format: string }) => {
    try {
      const presentation = await readPresentation(file);
      const byGroup = getCuesByGroup(presentation);
      
      const musicKey = getMusicKey(presentation);
      if (musicKey.current) {
        console.log(`Key: ${musicKey.current}\n`);
      }
      
      for (const [groupName, cues] of byGroup) {
        console.log(`[${groupName}]`);
        
        for (const cue of cues) {
          const text = getCueText(cue);
          const chords = getCueChords(cue);
          
          if (options.format === 'chordpro') {
            // Output ChordPro format
            let output = text;
            // Insert chords at positions (work backwards to preserve positions)
            const sortedChords = [...chords].sort((a, b) => b.position.start - a.position.start);
            for (const chord of sortedChords) {
              const pos = chord.position.start;
              output = output.slice(0, pos) + `[${chord.chord}]` + output.slice(pos);
            }
            console.log(output);
          } else {
            // Plain text with chord line above
            if (chords.length > 0) {
              // Build chord line
              const lines = text.split('\n');
              for (const line of lines) {
                const lineChords = chords.filter(c => c.position.start < text.indexOf(line) + line.length);
                if (lineChords.length > 0) {
                  console.log(`  ${lineChords.map(c => c.chord).join('  ')}`);
                }
                console.log(line);
              }
            } else {
              console.log(text);
            }
          }
          console.log('');
        }
      }
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

// ============================================================================
// export - Export in various formats
// ============================================================================

program
  .command('export')
  .description('Export presentation in various formats')
  .argument('<file>', 'ProPresenter presentation file (.pro)')
  .requiredOption('-f, --format <format>', 'Output format: ccli-report, lyrics-txt, markdown')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action(async (file: string, options: { format: string; output?: string }) => {
    try {
      const presentation = await readPresentation(file);
      let output = '';
      
      switch (options.format) {
        case 'ccli-report': {
          // Format for CCLI reporting
          const ccli = presentation.ccli;
          output = [
            `Song Title: ${ccli?.songTitle || presentation.name || 'Unknown'}`,
            `Author: ${ccli?.author || 'Unknown'}`,
            `CCLI Number: ${ccli?.songNumber || 'N/A'}`,
            `Publisher: ${ccli?.publisher || 'N/A'}`,
            `Copyright Year: ${ccli?.copyrightYear || 'N/A'}`,
            '',
            '---',
            '',
            'Lyrics:',
          ].join('\n');
          
          const byGroup = getCuesByGroup(presentation);
          for (const [groupName, cues] of byGroup) {
            output += `\n[${groupName}]\n`;
            for (const cue of cues) {
              output += getCueText(cue) + '\n\n';
            }
          }
          break;
        }
        
        case 'lyrics-txt': {
          // Plain text lyrics
          const byGroup = getCuesByGroup(presentation);
          for (const [groupName, cues] of byGroup) {
            output += `[${groupName}]\n`;
            for (const cue of cues) {
              output += getCueText(cue) + '\n\n';
            }
          }
          break;
        }
        
        case 'markdown': {
          // Markdown format
          const ccli = presentation.ccli;
          output = `# ${ccli?.songTitle || presentation.name || 'Untitled'}\n\n`;
          
          if (ccli?.author) output += `**Author:** ${ccli.author}\n`;
          if (ccli?.songNumber) output += `**CCLI:** ${ccli.songNumber}\n`;
          
          const musicKey = getMusicKey(presentation);
          if (musicKey.current) output += `**Key:** ${musicKey.current}\n`;
          
          output += '\n---\n\n';
          
          const byGroup = getCuesByGroup(presentation);
          for (const [groupName, cues] of byGroup) {
            output += `## ${groupName}\n\n`;
            for (const cue of cues) {
              const text = getCueText(cue);
              const chords = getCueChords(cue);
              
              if (chords.length > 0) {
                output += `*Chords: ${chords.map(c => c.chord).join(' ')}*\n\n`;
              }
              
              output += text.split('\n').map(l => `> ${l}`).join('\n') + '\n\n';
            }
          }
          break;
        }
        
        default:
          console.error(`Unknown format: ${options.format}`);
          console.error('Available formats: ccli-report, lyrics-txt, markdown');
          process.exit(1);
      }
      
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
// batch - Batch operations
// ============================================================================

program
  .command('batch')
  .description('Batch operations on multiple files')
  .argument('<files...>', 'ProPresenter files')
  .option('--ccli-report', 'Generate CCLI report for all songs')
  .option('--list-songs', 'List all songs with CCLI info')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action(async (files: string[], options: { ccliReport?: boolean; listSongs?: boolean; output?: string }) => {
    try {
      const results: any[] = [];
      
      for (const file of files) {
        try {
          const presentation = await readPresentation(file);
          results.push({
            file: path.basename(file),
            name: presentation.name,
            ccli: presentation.ccli,
            category: presentation.category,
          });
        } catch (e: any) {
          console.error(`Warning: Could not read ${file}: ${e.message}`);
        }
      }
      
      let output = '';
      
      if (options.listSongs) {
        output = 'Song Title\tAuthor\tCCLI #\tPublisher\tFile\n';
        for (const r of results) {
          output += [
            r.ccli?.songTitle || r.name || 'Unknown',
            r.ccli?.author || '',
            r.ccli?.songNumber || '',
            r.ccli?.publisher || '',
            r.file,
          ].join('\t') + '\n';
        }
      } else if (options.ccliReport) {
        output = 'CCLI Song Report\n';
        output += '================\n\n';
        for (const r of results) {
          if (r.ccli?.songNumber) {
            output += `${r.ccli.songNumber}\t${r.ccli.songTitle || r.name}\n`;
          }
        }
      } else {
        output = JSON.stringify(results, null, 2);
      }
      
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

program.parse();
