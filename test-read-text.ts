import { readPresentation, getCueText, getCues } from './src/lib/index.ts';

const presentation = await readPresentation('./samples/Test Song.pro');
const cues = getCues(presentation);

console.log('Checking text extraction:');
for (const cue of cues) {
  console.log(`\nCue: ${cue.name}`);
  const text = getCueText(cue);
  console.log(`Text: "${text}"`);
  
  // Debug: check the raw structure
  const slide = cue.actions?.[0]?.slide?.presentation;
  if (slide) {
    console.log('Slide elements:', slide.elements?.length || 0);
    if (slide.elements?.[0]?.element?.text?.rtfData) {
      const rtf = Buffer.from(slide.elements[0].element.text.rtfData).toString('utf-8');
      console.log('RTF length:', rtf.length);
      console.log('RTF preview:', rtf.substring(0, 200));
    }
  }
}
