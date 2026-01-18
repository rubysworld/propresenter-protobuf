/**
 * ProPresenter Protobuf Library
 * 
 * Read, modify, and write ProPresenter 7+ files.
 */

import protobuf from 'protobufjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cached protobuf root
let protoRoot: protobuf.Root | null = null;

/**
 * Load and cache the protobuf definitions
 */
export async function loadProtoDefinitions(): Promise<protobuf.Root> {
  if (protoRoot) return protoRoot;

  const protoDir = path.resolve(__dirname, '../../proto/proto');
  
  // Load the main proto files
  protoRoot = new protobuf.Root();
  protoRoot.resolvePath = (origin, target) => {
    return path.resolve(protoDir, target);
  };

  // Load key proto files
  const protoFiles = [
    'presentation.proto',
    'propresenter.proto',
    'action.proto',
    'slide.proto',
    'graphicsData.proto',
    'presentationSlide.proto',
    'cue.proto',
    'groups.proto',
    'basicTypes.proto',
    'effects.proto',
    'background.proto',
    'rvtimestamp.proto',
  ];

  for (const file of protoFiles) {
    try {
      await protoRoot.load(path.join(protoDir, file));
    } catch (e) {
      // Some files may have already been loaded as dependencies
    }
  }

  return protoRoot;
}

/**
 * Get a protobuf message type by name
 */
export async function getMessageType(typeName: string): Promise<protobuf.Type> {
  const root = await loadProtoDefinitions();
  return root.lookupType(typeName);
}

// ============================================================================
// Presentation File Operations
// ============================================================================

export interface Presentation {
  applicationInfo?: any;
  uuid?: { string: string };
  name?: string;
  lastDateUsed?: any;
  lastModifiedDate?: any;
  category?: string;
  notes?: string;
  background?: any;
  selectedArrangement?: { string: string };
  arrangements?: any[];
  cueGroups?: CueGroup[];
  cues?: Cue[];
  ccli?: CCLI;
  bibleReference?: any;
  timeline?: any;
  transition?: any;
  [key: string]: any;
}

export interface CueGroup {
  group?: {
    uuid?: { string: string };
    name?: string;
    color?: Color;
  };
  cueIdentifiers?: { string: string }[];
}

export interface Cue {
  uuid?: { string: string };
  name?: string;
  hotKey?: any;
  actions?: Action[];
  isEnabled?: boolean;
  [key: string]: any;
}

export interface Action {
  uuid?: { string: string };
  name?: string;
  label?: any;
  type?: number;
  slide?: SlideAction;
  [key: string]: any;
}

export interface SlideAction {
  presentation?: Slide;
  prop?: any;
}

export interface Slide {
  elements?: SlideElement[];
  size?: { width: number; height: number };
  uuid?: { string: string };
  backgroundColor?: Color;
  [key: string]: any;
}

export interface SlideElement {
  element?: GraphicsElement;
  buildIn?: any;
  buildOut?: any;
  [key: string]: any;
}

export interface GraphicsElement {
  uuid?: { string: string };
  name?: string;
  bounds?: { origin: { x: number; y: number }; size: { width: number; height: number } };
  rotation?: number;
  opacity?: number;
  text?: TextElement;
  fill?: any;
  stroke?: any;
  [key: string]: any;
}

export interface TextElement {
  attributes?: any;
  shadow?: any;
  rtfData?: Uint8Array | Buffer;
  verticalAlignment?: number;
  scaleBehavior?: number;
  margins?: any;
  [key: string]: any;
}

export interface Color {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

export interface CCLI {
  author?: string;
  artistCredits?: string;
  songTitle?: string;
  publisher?: string;
  copyrightYear?: number;
  songNumber?: number;
  display?: boolean;
  album?: string;
  artwork?: Uint8Array;
}

/**
 * Read a ProPresenter presentation file
 */
export async function readPresentation(filePath: string): Promise<Presentation> {
  const PresentationType = await getMessageType('rv.data.Presentation');
  const buffer = await fs.readFile(filePath);
  const message = PresentationType.decode(buffer);
  return PresentationType.toObject(message, {
    longs: String,
    bytes: Buffer,
    defaults: true,
  }) as Presentation;
}

/**
 * Write a ProPresenter presentation file
 */
export async function writePresentation(filePath: string, presentation: Presentation): Promise<void> {
  const PresentationType = await getMessageType('rv.data.Presentation');
  const errMsg = PresentationType.verify(presentation);
  if (errMsg) throw new Error(`Invalid presentation: ${errMsg}`);
  
  const message = PresentationType.create(presentation);
  const buffer = PresentationType.encode(message).finish();
  await fs.writeFile(filePath, buffer);
}

/**
 * Read a ProPresenter playlist file
 */
export async function readPlaylist(filePath: string): Promise<any> {
  const PlaylistType = await getMessageType('rv.data.PlaylistDocument');
  const buffer = await fs.readFile(filePath);
  const message = PlaylistType.decode(buffer);
  return PlaylistType.toObject(message, {
    longs: String,
    bytes: Buffer,
    defaults: true,
  });
}

// ============================================================================
// RTF Utilities
// ============================================================================

/**
 * Extract plain text from RTF data
 */
export function rtfToText(rtfData: Uint8Array | Buffer | string): string {
  let rtf: string;
  if (typeof rtfData === 'string') {
    rtf = rtfData;
  } else if (Buffer.isBuffer(rtfData)) {
    rtf = rtfData.toString('utf-8');
  } else {
    rtf = Buffer.from(rtfData).toString('utf-8');
  }

  // Simple RTF to text conversion
  // Strip RTF control words and groups
  let text = rtf
    // Remove RTF header
    .replace(/^\{\\rtf1[^}]*\}?/, '')
    // Handle line breaks
    .replace(/\\par\b/g, '\n')
    .replace(/\\line\b/g, '\n')
    // Remove font tables
    .replace(/\{\\fonttbl[^}]*\}/g, '')
    // Remove color tables
    .replace(/\{\\colortbl[^}]*\}/g, '')
    // Remove stylesheet
    .replace(/\{\\stylesheet[^}]*\}/g, '')
    // Remove other control words
    .replace(/\\[a-z]+[-]?\d*\s?/gi, '')
    // Remove groups
    .replace(/[{}]/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Decode hex characters
  text = text.replace(/\\'([0-9a-f]{2})/gi, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return text;
}

/**
 * Convert plain text to simple RTF
 */
export function textToRtf(text: string, fontName = 'Arial', fontSize = 48): string {
  // Escape special characters
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par ');

  // Simple RTF with one font
  return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 ${fontName};}}\\f0\\fs${fontSize * 2} ${escaped}}`;
}

// ============================================================================
// Slide Text Utilities
// ============================================================================

/**
 * Get all text elements from a slide
 */
export function getSlideTextElements(slide: Slide): TextElement[] {
  const textElements: TextElement[] = [];
  
  for (const element of slide.elements || []) {
    if (element.element?.text?.rtfData) {
      textElements.push(element.element.text);
    }
  }
  
  return textElements;
}

/**
 * Get combined text from a slide
 */
export function getSlideText(slide: Slide): string {
  const texts = getSlideTextElements(slide)
    .map(te => rtfToText(te.rtfData!))
    .filter(t => t.length > 0);
  return texts.join('\n');
}

/**
 * Get slide from a cue's actions
 */
export function getCueSlide(cue: Cue): Slide | null {
  for (const action of cue.actions || []) {
    if (action.slide?.presentation) {
      return action.slide.presentation;
    }
  }
  return null;
}

/**
 * Get text from a specific cue
 */
export function getCueText(cue: Cue): string {
  const slide = getCueSlide(cue);
  if (!slide) return '';
  return getSlideText(slide);
}

/**
 * Set text on a slide's first text element
 */
export function setSlideText(slide: Slide, text: string): boolean {
  for (const element of slide.elements || []) {
    if (element.element?.text?.rtfData) {
      element.element.text.rtfData = Buffer.from(textToRtf(text));
      return true;
    }
  }
  return false;
}

/**
 * Set text on a cue's slide
 */
export function setCueText(cue: Cue, text: string): boolean {
  const slide = getCueSlide(cue);
  if (!slide) return false;
  return setSlideText(slide, text);
}

// ============================================================================
// Presentation Utilities
// ============================================================================

/**
 * Get all cues from a presentation
 */
export function getCues(presentation: Presentation): Cue[] {
  return presentation.cues || [];
}

/**
 * Get cues organized by group
 */
export function getCuesByGroup(presentation: Presentation): Map<string, Cue[]> {
  const cueMap = new Map<string, Cue>();
  for (const cue of presentation.cues || []) {
    if (cue.uuid?.string) {
      cueMap.set(cue.uuid.string, cue);
    }
  }

  const result = new Map<string, Cue[]>();
  
  for (const group of presentation.cueGroups || []) {
    const groupName = group.group?.name || 'Unnamed';
    const cues: Cue[] = [];
    
    for (const id of group.cueIdentifiers || []) {
      const cue = cueMap.get(id.string);
      if (cue) cues.push(cue);
    }
    
    result.set(groupName, cues);
  }
  
  return result;
}

/**
 * Get presentation summary
 */
export function getPresentationSummary(presentation: Presentation): string {
  const lines: string[] = [];
  
  lines.push(`Name: ${presentation.name || 'Untitled'}`);
  lines.push(`Category: ${presentation.category || 'None'}`);
  
  if (presentation.ccli) {
    lines.push(`CCLI: ${presentation.ccli.songTitle || ''} by ${presentation.ccli.author || 'Unknown'}`);
    if (presentation.ccli.songNumber) {
      lines.push(`CCLI #: ${presentation.ccli.songNumber}`);
    }
  }
  
  lines.push(`\nCue Groups: ${presentation.cueGroups?.length || 0}`);
  lines.push(`Total Cues: ${presentation.cues?.length || 0}`);
  
  lines.push('\nSlides:');
  const byGroup = getCuesByGroup(presentation);
  
  for (const [groupName, cues] of byGroup) {
    lines.push(`\n[${groupName}]`);
    for (let i = 0; i < cues.length; i++) {
      const text = getCueText(cues[i]);
      const preview = text.slice(0, 50).replace(/\n/g, ' ');
      lines.push(`  ${i + 1}. ${preview}${text.length > 50 ? '...' : ''}`);
    }
  }
  
  return lines.join('\n');
}

// ============================================================================
// UUID Utilities
// ============================================================================

/**
 * Generate a new UUID
 */
export function generateUuid(): { string: string } {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase();
  });
  return { string: uuid };
}
