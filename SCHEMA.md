# ProPresenter 7 File Format Schema

This document describes the reverse-engineered structure of ProPresenter 7+ files.

## Overview

ProPresenter 7 uses Google Protocol Buffers (protobuf) for data serialization. Files are binary-encoded protobuf messages.

## Main Data Structures

### Presentation (`.pro` files)

The root message for presentation documents.

```protobuf
message Presentation {
  ApplicationInfo application_info = 1;  // App version info
  UUID uuid = 2;                         // Unique identifier
  string name = 3;                       // Presentation name
  Timestamp last_date_used = 4;
  Timestamp last_modified_date = 5;
  string category = 6;
  string notes = 7;
  Background background = 8;             // Default background
  URL chord_chart = 9;
  UUID selected_arrangement = 10;
  repeated Arrangement arrangements = 11;
  repeated CueGroup cue_groups = 12;     // Groups of cues (slides)
  repeated Cue cues = 13;                // Individual cues
  CCLI ccli = 14;                        // Copyright info
  BibleReference bible_reference = 15;
  SocialMedia social_media = 16;
  Timeline timeline = 17;
  Transition transition = 18;
  ContentDestination content_destination = 19;
  // ... more fields
}
```

### Cue Groups and Cues

Cues are the "slides" in a presentation. They're organized into groups (like Verse, Chorus, Bridge).

```protobuf
message CueGroup {
  Group group = 1;           // Group metadata (name, color)
  repeated UUID cue_identifiers = 2;  // References to cues
}

message Cue {
  UUID uuid = 1;
  string name = 2;
  HotKey hot_key = 8;
  repeated Action actions = 10;  // Actions triggered by this cue
  bool isEnabled = 12;
}
```

### Actions and Slides

Actions define what happens when a cue is triggered. The most important action type is the slide action.

```protobuf
message Action {
  UUID uuid = 1;
  string name = 2;
  Label label = 3;
  ActionType type = 9;
  
  // One of many action types:
  SlideType slide = 23;       // Slide content
  MediaType media = 20;       // Media playback
  TimerType timer = 25;       // Timer control
  // ... many more
}

message SlideType {
  oneof Slide {
    PresentationSlide presentation = 2;
    PropSlide prop = 3;
  }
}
```

### Slide Elements

Slides contain graphical elements (text boxes, shapes, images).

```protobuf
message Slide {
  repeated Element elements = 1;
  repeated UUID element_build_order = 2;
  repeated AlignmentGuide guidelines = 3;
  bool draws_background_color = 4;
  Color background_color = 5;
  Size size = 6;
  UUID uuid = 7;
}

message Element {
  Graphics.Element element = 1;  // The actual graphical element
  Build build_in = 2;
  Build build_out = 3;
  repeated DataLink data_links = 6;  // Dynamic data bindings
}
```

### Graphics Elements

The graphical content including text.

```protobuf
message Graphics.Element {
  UUID uuid = 1;
  string name = 2;
  Rect bounds = 3;          // Position and size
  double rotation = 4;
  double opacity = 5;
  bool locked = 6;
  Path path = 8;            // Shape path
  Fill fill = 9;            // Fill color/gradient/media
  Stroke stroke = 10;       // Border
  Shadow shadow = 11;
  Feather feather = 12;
  Text text = 13;           // TEXT CONTENT IS HERE!
  FlipMode flipMode = 15;
  bool hidden = 16;
}
```

### Text Content

Text is stored as RTF (Rich Text Format) data.

```protobuf
message Graphics.Text {
  Attributes attributes = 3;       // Default text attributes
  Shadow shadow = 4;
  bytes rtf_data = 5;              // RTF-encoded text content!
  VerticalAlignment vertical_alignment = 6;
  ScaleBehavior scale_behavior = 7;
  EdgeInsets margins = 8;
  // ...
}
```

## Key Insight: RTF Data

**The actual text content is stored in `Graphics.Text.rtf_data` as RTF bytes.**

RTF (Rich Text Format) is a document format that includes formatting. Example:
```rtf
{\rtf1\ansi\deff0 {\fonttbl {\f0 Arial;}}
\f0\fs48 Amazing Grace\par
How sweet the sound
}
```

To extract plain text from RTF:
1. Parse the RTF data
2. Strip formatting commands
3. Extract text content

## CCLI (Copyright Info)

```protobuf
message CCLI {
  string author = 1;
  string artist_credits = 2;
  string song_title = 3;
  string publisher = 4;
  uint32 copyright_year = 5;
  uint32 song_number = 6;
  bool display = 7;
  string album = 8;
  bytes artwork = 9;
}
```

## Playlist (`.proplaylist` files)

```protobuf
message PlaylistDocument {
  ApplicationInfo application_info = 1;
  Type type = 2;  // PRESENTATION, MEDIA, or AUDIO
  Playlist root_node = 3;
  repeated Tag tags = 4;
  Playlist live_video_playlist = 5;
  Playlist downloads_playlist = 6;
}
```

## Common Types

### UUID
```protobuf
message UUID {
  string string = 1;  // Standard UUID format
}
```

### Color
```protobuf
message Color {
  float red = 1;    // 0.0 - 1.0
  float green = 2;
  float blue = 3;
  float alpha = 4;
}
```

### URL (File References)
```protobuf
message URL {
  Platform platform = 3;
  oneof Storage {
    string absolute_string = 1;
    string relative_path = 2;
  }
  oneof RelativeFilePath {
    LocalRelativePath local = 4;
    ExternalRelativePath external = 5;
  }
}
```

## Tips for Working with ProPresenter Files

1. **Always backup** before modifying files
2. **Preserve unknown fields** - protobuf silently preserves fields it doesn't recognize
3. **RTF handling** - Be careful with RTF, malformed RTF will crash ProPresenter
4. **UUIDs** - Generate proper UUIDs for new elements
5. **Test with copies** - Never test on production files

## Version Differences

The proto definitions may vary between ProPresenter versions:
- `proto/` - Generic/latest definitions
- `Proto 7.16/` - Version 7.16 specific
- `Proto 7.16.2/` - Version 7.16.2 specific  
- `Proto 19beta/` - Version 19 beta
