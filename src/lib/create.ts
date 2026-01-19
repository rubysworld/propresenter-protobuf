/**
 * Create ProPresenter presentations from scratch
 */

import { Presentation, Cue, CueGroup, Action, Slide, SlideElement, GraphicsElement, TextElement, Color, generateUuid } from './index.js';
import { textToRtf } from './index.js';

/**
 * Default slide size (1920x1080 - Full HD)
 */
const DEFAULT_SLIDE_SIZE = { width: 1920, height: 1080 };

/**
 * Default text element bounds (full screen with 100px top margin)
 */
const DEFAULT_TEXT_BOUNDS = {
  origin: { x: 0, y: 100 },
  size: { width: 1920, height: 880 }
};

/**
 * Default font settings
 */
const DEFAULT_FONT = {
  name: 'Arial',
  size: 72,
  family: 'Arial',
  italic: false,
  bold: false,
  face: ''
};

/**
 * Default text color (white)
 */
const DEFAULT_TEXT_COLOR: Color = {
  red: 1,
  green: 1,
  blue: 1,
  alpha: 1
};

/**
 * Default stroke color (black)
 */
const DEFAULT_STROKE_COLOR: Color = {
  red: 0,
  green: 0,
  blue: 0,
  alpha: 1
};

/**
 * Default group colors
 */
const DEFAULT_GROUP_COLORS: Color[] = [
  { red: 0, green: 0, blue: 0.998, alpha: 1 },           // Blue
  { red: 0.135, green: 1, blue: 0.025, alpha: 1 },       // Green
  { red: 0.989, green: 0.415, blue: 0.032, alpha: 1 },   // Orange
  { red: 1, green: 0.999, blue: 0.041, alpha: 1 },       // Yellow
  { red: 0.986, green: 0.007, blue: 0.027, alpha: 1 },   // Red
  { red: 0.580, green: 0.404, blue: 0.741, alpha: 1 },   // Purple
];

export interface ChordPosition {
  /** Character position where chord starts */
  position: number;
  /** Chord name (e.g., "F", "Am", "C/E") */
  chord: string;
}

export interface SlideInput {
  /** Slide text content */
  text: string;
  /** Optional chords for this slide */
  chords?: ChordPosition[];
}

export interface SectionInput {
  /** Section name (e.g., "Verse 1", "Chorus") */
  name: string;
  /** Array of slide content - can be strings or SlideInput objects */
  slides: (string | SlideInput)[];
  /** Optional color for this section */
  color?: Color;
}

/** Music key enum values (matches ProPresenter MusicKey enum) */
export enum MusicKey {
  A_FLAT = 0,
  A = 1,
  A_SHARP = 2,
  B_FLAT = 3,
  B = 4,
  B_SHARP = 5,
  C_FLAT = 6,
  C = 7,
  C_SHARP = 8,
  D_FLAT = 9,
  D = 10,
  D_SHARP = 11,
  E_FLAT = 12,
  E = 13,
  E_SHARP = 14,
  F_FLAT = 15,
  F = 16,
  F_SHARP = 17,
  G_FLAT = 18,
  G = 19,
  G_SHARP = 20
}

/** Music scale enum */
export enum MusicScale {
  MAJOR = 0,
  MINOR = 1
}

/** Music key configuration for transposition support */
export interface MusicKeyConfig {
  /** Original key of the song */
  key: MusicKey;
  /** Scale (major or minor) */
  scale?: MusicScale;
}

export interface CreatePresentationOptions {
  /** Song title */
  title: string;
  /** Artist name (optional) */
  artist?: string;
  /** CCLI song number (optional) */
  ccliNumber?: number;
  /** CCLI author (optional) */
  ccliAuthor?: string;
  /** Copyright year (optional) */
  copyrightYear?: number;
  /** Publisher (optional) */
  publisher?: string;
  /** Category (optional) */
  category?: string;
  /** Presentation notes (optional) */
  notes?: string;
  /** Original music key for chord transposition (optional) */
  musicKey?: MusicKeyConfig;
  /** Sections/groups with their slides */
  sections: SectionInput[];
  /** Font name (default: 'Arial') */
  fontName?: string;
  /** Font size (default: 72) */
  fontSize?: number;
  /** Slide size (default: 1920x1080) */
  slideSize?: { width: number; height: number };
  /** Text bounds (default: full screen with 100px top margin) */
  textBounds?: { origin: { x: number; y: number }; size: { width: number; height: number } };
  /** Whether to create a default arrangement (default: true) */
  createArrangement?: boolean;
}

/**
 * Create a text element for a slide
 */
function createTextElement(text: string, options: CreatePresentationOptions, chords?: ChordPosition[]): GraphicsElement {
  const fontName = options.fontName || DEFAULT_FONT.name;
  const fontSize = options.fontSize || DEFAULT_FONT.size;
  const bounds = options.textBounds || DEFAULT_TEXT_BOUNDS;

  // Create RTF data
  const rtfData = Buffer.from(textToRtf(text, fontName, fontSize));
  
  // Build customAttributes with optional chords
  const customAttributes: any[] = [];
  if (chords && chords.length > 0) {
    // Sort chords by position
    const sortedChords = [...chords].sort((a, b) => a.position - b.position);
    for (let i = 0; i < sortedChords.length; i++) {
      const chord = sortedChords[i];
      const nextPos = sortedChords[i + 1]?.position ?? text.length;
      customAttributes.push({
        range: {
          start: chord.position,
          end: nextPos
        },
        chord: chord.chord
      });
    }
  } else {
    // Default: single attribute covering whole text
    customAttributes.push({
      range: {
        start: 0,
        end: text.length
      }
    });
  }

  const element: GraphicsElement = {
    uuid: generateUuid(),
    name: text,
    bounds,
    rotation: 0,
    opacity: 1,
    locked: false,
    aspectRatioLocked: false,
    path: {
      points: [
        { point: { x: 0, y: 0 }, q0: { x: 0, y: 0 }, q1: { x: 0, y: 0 }, curved: false },
        { point: { x: 1, y: 0 }, q0: { x: 1, y: 0 }, q1: { x: 1, y: 0 }, curved: false },
        { point: { x: 1, y: 1 }, q0: { x: 1, y: 1 }, q1: { x: 1, y: 1 }, curved: false },
        { point: { x: 0, y: 1 }, q0: { x: 0, y: 1 }, q1: { x: 0, y: 1 }, curved: false },
      ],
      closed: true,
      shape: { type: 1 } // Rectangle
    },
    fill: {
      enable: false,
      color: { red: 0, green: 0, blue: 0, alpha: 0.4 }
    },
    stroke: {
      pattern: [],
      style: 0,
      width: 3,
      color: { red: 1, green: 1, blue: 1, alpha: 1 },
      enable: false
    },
    shadow: {
      style: 0,
      angle: 315,
      offset: 5,
      radius: 5,
      color: { red: 0, green: 0, blue: 0, alpha: 1 },
      opacity: 0.75,
      enable: false
    },
    feather: {
      style: 0,
      radius: 0.05,
      enable: false
    },
    text: {
      attributes: {
        customAttributes,
        font: {
          ...DEFAULT_FONT,
          name: fontName,
          size: fontSize,
          family: fontName
        },
        capitalization: 0,
        underlineStyle: {
          style: 0,
          pattern: 0,
          byWord: false
        },
        underlineColor: null,
        paragraphStyle: {
          tabStops: [],
          textLists: [],
          alignment: 2, // Center
          firstLineHeadIndent: 0,
          headIndent: 0,
          tailIndent: 0,
          lineHeightMultiple: 1,
          maximumLineHeight: 0,
          minimumLineHeight: 0,
          lineSpacing: 0,
          paragraphSpacing: 0,
          paragraphSpacingBefore: 0,
          defaultTabInterval: 84,
          textList: {
            isEnabled: false,
            numberType: 0,
            prefix: '',
            postfix: '',
            startingNumber: 0
          }
        },
        kerning: 2,
        superscript: 0,
        strikethroughStyle: {
          style: 0,
          pattern: 0,
          byWord: false
        },
        strikethroughColor: null,
        strokeWidth: -6, // Negative = outside stroke
        strokeColor: DEFAULT_STROKE_COLOR,
        backgroundColor: null,
        textSolidFill: DEFAULT_TEXT_COLOR
      },
      shadow: {
        style: 0,
        angle: 315,
        offset: 5,
        radius: 5,
        color: { red: 0, green: 0, blue: 0, alpha: 1 },
        opacity: 0.75,
        enable: false
      },
      rtfData,
      verticalAlignment: 1, // Middle
      scaleBehavior: 0, // None
      margins: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    }
  };

  return element;
}

/**
 * Create a slide with text
 */
function createSlide(text: string, options: CreatePresentationOptions, chords?: ChordPosition[]): Slide {
  const slideSize = options.slideSize || DEFAULT_SLIDE_SIZE;
  const element = createTextElement(text, options, chords);

  const slideElement: SlideElement = {
    element,
    buildIn: undefined,
    buildOut: undefined,
    dataLinks: [],
    childBuilds: []
  };

  const slide: Slide = {
    elements: [slideElement],
    size: slideSize,
    uuid: generateUuid(),
    backgroundColor: { red: 0, green: 0, blue: 0, alpha: 1 },
    drawsBackgroundColor: true
  };

  return slide;
}

/**
 * Create a cue (slide) for the presentation
 */
function createCue(name: string, slideText: string, options: CreatePresentationOptions, chords?: ChordPosition[]): Cue {
  const slide = createSlide(slideText, options, chords);
  
  // Wrap the slide in a PresentationSlide structure
  const presentationSlide = {
    baseSlide: slide,
    notes: null,
    templateGuidelines: [],
    chordChart: null,
    transition: null
  };
  
  const action: Action = {
    uuid: generateUuid(),
    name: '',
    label: null,
    delayTime: 0,
    oldType: null,
    isEnabled: true,
    layerIdentification: null,
    duration: 0,
    type: 11, // ACTION_TYPE_PRESENTATION_SLIDE
    slide: {
      presentation: presentationSlide as any,
      prop: null
    }
  };

  const cue: Cue = {
    uuid: generateUuid(),
    name,
    hotKey: {
      code: 0,
      controlIdentifier: ''
    },
    actions: [action],
    isEnabled: true
  };

  return cue;
}

/**
 * Create a ProPresenter presentation from scratch
 * 
 * @param options - Configuration options for the presentation
 * @returns A complete Presentation object ready to be written to a .pro file
 * 
 * @example
 * ```typescript
 * const presentation = createPresentation({
 *   title: 'Amazing Grace',
 *   artist: 'John Newton',
 *   ccliNumber: 22025,
 *   sections: [
 *     {
 *       name: 'Verse 1',
 *       slides: [
 *         'Amazing grace how sweet the sound\nThat saved a wretch like me',
 *         'I once was lost but now am found\nWas blind but now I see'
 *       ]
 *     },
 *     {
 *       name: 'Verse 2',
 *       slides: [
 *         'Twas grace that taught my heart to fear\nAnd grace my fears relieved',
 *         'How precious did that grace appear\nThe hour I first believed'
 *       ]
 *     }
 *   ]
 * });
 * 
 * await writePresentation('./Amazing Grace.pro', presentation);
 * ```
 */
export function createPresentation(options: CreatePresentationOptions): Presentation {
  const cues: Cue[] = [];
  const cueGroups: CueGroup[] = [];
  const groupIdentifiers: { string: string }[] = [];

  // Process each section
  options.sections.forEach((section, sectionIndex) => {
    const groupUuid = generateUuid();
    const cueIdentifiers: { string: string }[] = [];

    // Create cues for each slide in this section
    section.slides.forEach((slideInput, slideIndex) => {
      const cueName = `${section.name} - Slide ${slideIndex + 1}`;
      // Handle both string and SlideInput formats
      const slideText = typeof slideInput === 'string' ? slideInput : slideInput.text;
      const chords = typeof slideInput === 'string' ? undefined : slideInput.chords;
      const cue = createCue(cueName, slideText, options, chords);
      cues.push(cue);
      cueIdentifiers.push(cue.uuid!);
    });

    // Create the cue group
    const color = section.color || DEFAULT_GROUP_COLORS[sectionIndex % DEFAULT_GROUP_COLORS.length];
    const cueGroup: CueGroup = {
      group: {
        uuid: groupUuid,
        name: section.name,
        color,
        hotKey: {
          code: 0,
          controlIdentifier: ''
        },
        applicationGroupIdentifier: null,
        applicationGroupName: ''
      },
      cueIdentifiers
    };

    cueGroups.push(cueGroup);
    groupIdentifiers.push(groupUuid);
  });

  // Create presentation
  const presentation: Presentation = {
    uuid: generateUuid(),
    name: options.title,
    category: options.category || '',
    notes: options.notes || '',
    cues,
    cueGroups
  };

  // Add CCLI info if provided
  if (options.ccliNumber || options.ccliAuthor || options.artist) {
    presentation.ccli = {
      songTitle: options.title,
      author: options.ccliAuthor || options.artist || '',
      artistCredits: options.artist || '',
      publisher: options.publisher || '',
      copyrightYear: options.copyrightYear || 0,
      songNumber: options.ccliNumber || 0,
      display: true,
      album: '',
      artwork: new Uint8Array(0)
    };
  }

  // Add music key info for chord transposition
  if (options.musicKey) {
    const keyNames = ['Ab', 'A', 'A#', 'Bb', 'B', 'B#', 'Cb', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb', 'F', 'F#', 'Gb', 'G', 'G#'];
    const keyName = keyNames[options.musicKey.key] || '';
    const scale = options.musicKey.scale ?? MusicScale.MAJOR;
    
    (presentation as any).music = {
      originalMusicKey: keyName,
      userMusicKey: keyName,  // Default to same as original (no transpose)
      original: {
        musicKey: options.musicKey.key,
        musicScale: scale
      },
      user: {
        musicKey: options.musicKey.key,
        musicScale: scale
      }
    };
  }

  // Create default arrangement if requested
  if (options.createArrangement !== false) {
    presentation.arrangements = [
      {
        uuid: generateUuid(),
        name: 'Default',
        groupIdentifiers
      }
    ];
    presentation.selectedArrangement = presentation.arrangements[0].uuid;
  }

  return presentation;
}
