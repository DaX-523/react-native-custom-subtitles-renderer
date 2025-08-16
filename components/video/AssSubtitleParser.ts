/**
 * ASS (Advanced SubStation Alpha) Subtitle Parser
 * Parses .ass files while preserving styling and timing information
 */

import { Platform } from "react-native";

export interface AssStyle {
  name: string;
  fontname: string;
  fontsize: number;
  primaryColour: string;
  secondaryColour: string;
  outlineColour: string;
  backColour: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeOut: boolean;
  scaleX: number;
  scaleY: number;
  spacing: number;
  angle: number;
  borderStyle: number;
  outline: number;
  shadow: number;
  alignment: number;
  marginL: number;
  marginR: number;
  marginV: number;
  encoding: number;
}

export interface OverrideTag {
  type: string; // e.g., 'c', '1c', '2c', '3c', 'alpha', 'frz', etc.
  value: string;
  startIndex: number; // position in text where this override starts
}

export interface Transition {
  startOffset: number; // relative to dialogue start (ms)
  endOffset: number; // relative to dialogue start (ms)
  targetChanges: Record<string, string>; // property -> target value
}

export interface TextSegment {
  text: string;
  overrides: OverrideTag[];
  startIndex: number;
  endIndex: number;
}

export interface FrameData {
  timestamp: number; // relative to dialogue start (ms)
  primaryColor?: string;
  secondaryColor?: string;
  outlineColor?: string;
  backColor?: string;
  alpha?: number;
  fontSize?: number;
  rotation?: number;
}

export interface AssDialogue {
  layer: number;
  start: number; // in seconds
  end: number; // in seconds
  style: string;
  name: string;
  marginL: number;
  marginR: number;
  marginV: number;
  effect: string;
  text: string;
  originalText: string; // with formatting tags
  segments?: TextSegment[]; // parsed text segments with overrides
  transitions?: Transition[]; // time-based transitions
  frames?: FrameData[]; // pre-computed frame data for smooth interpolation
}

export interface AssSubtitle {
  scriptInfo: Record<string, string>;
  styles: Record<string, AssStyle>;
  dialogues: AssDialogue[];
}

export class AssSubtitleParser {
  /**
   * Parse ASS file content
   */
  static parse(content: string): AssSubtitle {
    const lines = content.split('\n').map(line => line.trim());
    const result: AssSubtitle = {
      scriptInfo: {},
      styles: {},
      dialogues: []
    };

    let currentSection = '';
    let styleFormat: string[] = [];
    let dialogueFormat: string[] = [];

    for (const line of lines) {
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1);
        continue;
      }

      if (!line || line.startsWith(';')) continue;

      switch (currentSection) {
        case 'Script Info':
          this.parseScriptInfo(line, result);
          break;
        case 'V4+ Styles':
          if (line.startsWith('Format:')) {
            styleFormat = line.substring(7).split(',').map(s => s.trim());
          } else if (line.startsWith('Style:')) {
            this.parseStyle(line, styleFormat, result);
          }
          break;
        case 'Events':
          if (line.startsWith('Format:')) {
            dialogueFormat = line.substring(7).split(',').map(s => s.trim());
          } else if (line.startsWith('Dialogue:')) {
            this.parseDialogue(line, dialogueFormat, result);
          }
          break;
      }
    }

    return result;
  }

  /**
   * Parse script info section
   */
  private static parseScriptInfo(line: string, result: AssSubtitle): void {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    result.scriptInfo[key] = value;
  }

  /**
   * Parse style definition
   */
  private static parseStyle(line: string, format: string[], result: AssSubtitle): void {
    const values = line.substring(6).split(',');
    if (values.length !== format.length) return;

    const style: Partial<AssStyle> = {};
    for (let i = 0; i < format.length; i++) {
      const field = format[i];
      const value = values[i]?.trim();

      switch (field) {
        case 'Name':
          style.name = value;
          break;
        case 'Fontname':
          style.fontname = value;
          break;
        case 'Fontsize':
          style.fontsize = parseInt(value) || 20;
          break;
        case 'PrimaryColour':
          style.primaryColour = this.parseColor(value);
          break;
        case 'SecondaryColour':
          style.secondaryColour = this.parseColor(value);
          break;
        case 'OutlineColour':
          style.outlineColour = this.parseColor(value);
          break;
        case 'BackColour':
          style.backColour = this.parseColor(value);
          break;
        case 'Bold':
          style.bold = value === '1' || value === '-1';
          break;
        case 'Italic':
          style.italic = value === '1' || value === '-1';
          break;
        case 'Underline':
          style.underline = value === '1';
          break;
        case 'StrikeOut':
          style.strikeOut = value === '1';
          break;
        case 'ScaleX':
          style.scaleX = parseFloat(value) || 100;
          break;
        case 'ScaleY':
          style.scaleY = parseFloat(value) || 100;
          break;
        case 'Spacing':
          style.spacing = parseFloat(value) || 0;
          break;
        case 'Angle':
          style.angle = parseFloat(value) || 0;
          break;
        case 'BorderStyle':
          style.borderStyle = parseInt(value) || 1;
          break;
        case 'Outline':
          style.outline = parseFloat(value) || 0;
          break;
        case 'Shadow':
          style.shadow = parseFloat(value) || 0;
          break;
        case 'Alignment':
          style.alignment = parseInt(value) || 2;
          break;
        case 'MarginL':
          style.marginL = parseInt(value) || 0;
          break;
        case 'MarginR':
          style.marginR = parseInt(value) || 0;
          break;
        case 'MarginV':
          style.marginV = parseInt(value) || 0;
          break;
        case 'Encoding':
          style.encoding = parseInt(value) || 1;
          break;
      }
    }

    if (style.name) {
      result.styles[style.name] = style as AssStyle;
    }
  }

  /**
   * Parse dialogue line
   */
  private static parseDialogue(line: string, format: string[], result: AssSubtitle): void {
    const values = line.substring(9).split(',');
    if (values.length < format.length) return;

    const dialogue: Partial<AssDialogue> = {};
    
    for (let i = 0; i < format.length; i++) {
      const field = format[i];
      let value = values[i]?.trim();

      // Handle the case where text field contains commas
      if (field === 'Text' && i < values.length - 1) {
        value = values.slice(i).join(',').trim();
      }

      switch (field) {
        case 'Layer':
          dialogue.layer = parseInt(value) || 0;
          break;
        case 'Start':
          dialogue.start = this.parseTime(value);
          break;
        case 'End':
          dialogue.end = this.parseTime(value);
          break;
        case 'Style':
          dialogue.style = value;
          break;
        case 'Name':
          dialogue.name = value;
          break;
        case 'MarginL':
          dialogue.marginL = parseInt(value) || 0;
          break;
        case 'MarginR':
          dialogue.marginR = parseInt(value) || 0;
          break;
        case 'MarginV':
          dialogue.marginV = parseInt(value) || 0;
          break;
        case 'Effect':
          dialogue.effect = value;
          break;
        case 'Text':
          dialogue.originalText = value;
          dialogue.text = this.stripFormattingTags(value);
          // Parse override tags and transitions
          dialogue.segments = this.parseTextSegments(value);
          dialogue.transitions = this.parseTransitions(value);
          break;
      }
    }

    if (dialogue.start !== undefined && dialogue.end !== undefined && dialogue.text) {
      result.dialogues.push(dialogue as AssDialogue);
    }
  }

  /**
   * Convert ASS time format (H:MM:SS.CS) to seconds
   */
  private static parseTime(timeStr: string): number {
    const parts = timeStr.split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const secondsAndCentiseconds = parseFloat(parts[2]) || 0;

    return hours * 3600 + minutes * 60 + secondsAndCentiseconds;
  }

  /**
   * Convert ASS color format (&HAABBGGRR) to hex color
   */
  private static parseColor(colorStr: string): string {
    if (!colorStr || !colorStr.startsWith('&H')) return 'rgba(255,255,255,1)';
    
    const hex = colorStr.substring(2).padStart(8, '0'); // ensure AA BB GG RR
  const aa = parseInt(hex.substring(0, 2), 16);
  const bb = parseInt(hex.substring(2, 4), 16);
  const gg = parseInt(hex.substring(4, 6), 16);
  const rr = parseInt(hex.substring(6, 8), 16);
  const alpha = (255 - aa) / 255; // invert alpha
  return `rgba(${rr}, ${gg}, ${bb}, ${alpha.toFixed(3)})`;
  }

  /**
   * Remove ASS formatting tags from text
   */
  private static stripFormattingTags(text: string): string {
    // Remove all ASS override tags
    return text.replace(/\{[^}]*\}/g, '').trim();
  }

  /**
   * Extract positioning information from ASS override tags
   */
  static extractPositioning(text: string): { x?: number; y?: number; alignment?: number } {
    const positioning: { x?: number; y?: number; alignment?: number } = {};
    
    // Extract \pos(x,y) tags
    const posMatch = text.match(/\\pos\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)/);
    if (posMatch) {
      positioning.x = parseFloat(posMatch[1]);
      positioning.y = parseFloat(posMatch[2]);
    }

    // Extract \an (alignment) tags
    const alignMatch = text.match(/\\an(\d+)/);
    if (alignMatch) {
      positioning.alignment = parseInt(alignMatch[1]);
    }

    return positioning;
  }

  /**
   * Extract color overrides from ASS override tags
   */
  static extractColors(text: string): { primaryColor?: string; outlineColor?: string } {
    const colors: { primaryColor?: string; outlineColor?: string } = {};
    
    // Extract \c or \1c (primary color)
    const primaryMatch = text.match(/\\(?:1c|c)&H([0-9A-Fa-f]{6,8})&/);
    if (primaryMatch) {
      colors.primaryColor = this.parseColor(`&H${primaryMatch[1]}`);
    }

    // Extract \3c (outline color)
    const outlineMatch = text.match(/\\3c&H([0-9A-Fa-f]{6,8})&/);
    if (outlineMatch) {
      colors.outlineColor = this.parseColor(`&H${outlineMatch[1]}`);
    }

    return colors;
  }

  /**
   * Parse text into segments with override tags
   */
  private static parseTextSegments(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const regex = /(\{[^}]*\})|([^{}]+)/g;
    let match;
    let currentIndex = 0;
    let currentOverrides: OverrideTag[] = [];

    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        // This is an override tag
        const overrides = this.parseOverrideTags(match[1]);
        currentOverrides.push(...overrides.map(override => ({
          ...override,
          startIndex: currentIndex
        })));
      } else if (match[2]) {
        // This is plain text
        segments.push({
          text: match[2],
          overrides: [...currentOverrides],
          startIndex: currentIndex,
          endIndex: currentIndex + match[2].length
        });
        currentIndex += match[2].length;
      }
    }

    return segments;
  }

  /**
   * Parse override tags from a single {...} block
   */
  private static parseOverrideTags(tagBlock: string): OverrideTag[] {
    const overrides: OverrideTag[] = [];
    const content = tagBlock.slice(1, -1); // Remove { and }
    
    // Parse different types of override tags
    const patterns = [
      { type: '1c', regex: /\\(?:1c|c)&H([0-9A-Fa-f]{6,8})&/g },
      { type: '2c', regex: /\\2c&H([0-9A-Fa-f]{6,8})&/g },
      { type: '3c', regex: /\\3c&H([0-9A-Fa-f]{6,8})&/g },
      { type: '4c', regex: /\\4c&H([0-9A-Fa-f]{6,8})&/g },
      { type: 'alpha', regex: /\\alpha&H([0-9A-Fa-f]{2})&/g },
      { type: '1a', regex: /\\1a&H([0-9A-Fa-f]{2})&/g },
      { type: '2a', regex: /\\2a&H([0-9A-Fa-f]{2})&/g },
      { type: '3a', regex: /\\3a&H([0-9A-Fa-f]{2})&/g },
      { type: '4a', regex: /\\4a&H([0-9A-Fa-f]{2})&/g },
      { type: 'fs', regex: /\\fs(\d+(?:\.\d+)?)/g },
      { type: 'frz', regex: /\\frz(-?\d+(?:\.\d+)?)/g },
      { type: 'fscx', regex: /\\fscx(\d+(?:\.\d+)?)/g },
      { type: 'fscy', regex: /\\fscy(\d+(?:\.\d+)?)/g }
    ];

    for (const pattern of patterns) {
      let match;
      pattern.regex.lastIndex = 0; // Reset regex
      while ((match = pattern.regex.exec(content)) !== null) {
        let value: string | number = match[1];
       
        overrides.push({
          type: pattern.type,
          value: value.toString(),
          startIndex: 0 // Will be set by caller
        });
      }
    }
    return overrides;
  }

  /**
   * Parse \t transitions from text
   */
  private static parseTransitions(text: string): Transition[] {
    const transitions: Transition[] = [];
    const regex = /\\t\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const params = match[1].split(',').map(p => p.trim());
      
      if (params.length >= 3) {
        const startOffset = parseFloat(params[0]) || 0;
        const endOffset = parseFloat(params[1]) || 0;
        const targetChanges: Record<string, string> = {};

        // Parse the target override tags
        const targetOverrides = params.slice(2).join(',');
        const parsedOverrides = this.parseOverrideTags(`{${targetOverrides}}`);
        
        for (const override of parsedOverrides) {
          targetChanges[override.type] = override.value;
        }

        transitions.push({
          startOffset,
          endOffset,
          targetChanges
        });
      }
    }

    return transitions;
  }

  /**
   * Generate frame data for smooth interpolation
   */
  static generateFrameData(dialogue: AssDialogue, style: AssStyle, frameRate: number = 30): FrameData[] {
    const frames: FrameData[] = [];
    const duration = (dialogue.end - dialogue.start) * 1000; // Convert to ms
    const frameInterval = 1000 / frameRate;
    
    // Initialize with style defaults
    let currentState = {
      primaryColor: style.primaryColour,
      secondaryColor: style.secondaryColour,
      outlineColor: style.outlineColour,
      backColor: style.backColour,
      alpha: 1,
      fontSize: style.fontsize,
      rotation: style.angle
    };

    // Apply initial overrides from segments
    if (dialogue.segments && dialogue.segments.length > 0) {
      const firstSegment = dialogue.segments[0];
      for (const override of firstSegment.overrides) {
        currentState = this.applyOverrideToState(currentState, override);
      }
    }

    for (let timestamp = 0; timestamp <= duration; timestamp += frameInterval) {
      let frameData: FrameData = { timestamp, ...currentState };
      
      // Apply transitions for this timestamp
      if (dialogue.transitions) {
        for (const transition of dialogue.transitions) {
          if (timestamp >= transition.startOffset && timestamp <= transition.endOffset) {
            const progress = (timestamp - transition.startOffset) / (transition.endOffset - transition.startOffset);
            frameData = this.interpolateFrameData(frameData, transition, progress);
          }
        }
      }
      
      frames.push(frameData);
    }

    return frames;
  }

  /**
   * Apply an override tag to the current state
   */
  private static applyOverrideToState(state: any, override: OverrideTag): any {
    const newState = { ...state };
    
    switch (override.type) {
      case '1c':
      case 'c':
        newState.primaryColor = this.parseColor(`&H${override.value}`);
        break;
      case '2c':
        newState.secondaryColor = this.parseColor(`&H${override.value}`);
        break;
      case '3c':
        newState.outlineColor = this.parseColor(`&H${override.value}`);
        break;
      case '4c':
        newState.backColor = this.parseColor(`&H${override.value}`);
        break;
      case 'alpha':
      case '1a':
        newState.alpha = (255 - parseInt(override.value, 16)) / 255;
        break;
      case 'fs':
        newState.fontSize = parseFloat(override.value);
        break;
      case 'frz':
        newState.rotation = parseFloat(override.value);
        break;
    }
    
    return newState;
  }

  /**
   * Interpolate frame data based on transition
   */
  private static interpolateFrameData(frameData: FrameData, transition: Transition, progress: number): FrameData {
    const result = { ...frameData };
    
    for (const [type, targetValue] of Object.entries(transition.targetChanges)) {
      switch (type) {
        case '1c':
        case 'c':
          if (frameData.primaryColor) {
            result.primaryColor = this.interpolateColor(frameData.primaryColor, this.parseColor(`&H${targetValue}`), progress);
          }
          break;
        case '2c':
          if (frameData.secondaryColor) {
            result.secondaryColor = this.interpolateColor(frameData.secondaryColor, this.parseColor(`&H${targetValue}`), progress);
          }
          break;
        case '3c':
          if (frameData.outlineColor) {
            result.outlineColor = this.interpolateColor(frameData.outlineColor, this.parseColor(`&H${targetValue}`), progress);
          }
          break;
        case 'alpha':
        case '1a':
          if (frameData.alpha !== undefined) {
            const targetAlpha = (255 - parseInt(targetValue, 16)) / 255;
            result.alpha = frameData.alpha + (targetAlpha - frameData.alpha) * progress;
          }
          break;
        case 'fs':
          if (frameData.fontSize !== undefined) {
            const targetSize = parseFloat(targetValue);
            result.fontSize = frameData.fontSize + (targetSize - frameData.fontSize) * progress;
          }
          break;
        case 'frz':
          if (frameData.rotation !== undefined) {
            const targetRotation = parseFloat(targetValue);
            result.rotation = frameData.rotation + (targetRotation - frameData.rotation) * progress;
          }
          break;
      }
    }
    
    return result;
  }

  /**
   * Interpolate between two colors
   */
  private static interpolateColor(fromColor: string, toColor: string, progress: number): string {
    const fromRgba = this.parseRgbaColor(fromColor);
    const toRgba = this.parseRgbaColor(toColor);
    
    if (!fromRgba || !toRgba) return fromColor;
    
    const r = Math.round(fromRgba.r + (toRgba.r - fromRgba.r) * progress);
    const g = Math.round(fromRgba.g + (toRgba.g - fromRgba.g) * progress);
    const b = Math.round(fromRgba.b + (toRgba.b - fromRgba.b) * progress);
    const a = fromRgba.a + (toRgba.a - fromRgba.a) * progress;
    
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
  }

  /**
   * Parse rgba color string to components
   */
  private static parseRgbaColor(color: string): { r: number; g: number; b: number; a: number } | null {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;
    
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }

  /**
   * Apply alpha to a color string
   */
  static applyAlphaToColor(color: string, alpha: number): string {
    const rgba = this.parseRgbaColor(color);
    if (!rgba) return color;
    
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha.toFixed(3)})`;
  }

  /**
   * Get frame data for a specific time within a dialogue
   */
  static getFrameDataAtTime(dialogue: AssDialogue, currentTime: number, style: AssStyle): FrameData | null {
    if (!dialogue.frames) {
      // Generate frames on demand if not already computed
      dialogue.frames = this.generateFrameData(dialogue, style);
    }
    
    const relativeTime = (currentTime - dialogue.start) * 1000; // Convert to ms
    
    // Find the closest frame
    let closestFrame = dialogue.frames[0];
    let minDiff = Math.abs(relativeTime - closestFrame.timestamp);
    
    for (const frame of dialogue.frames) {
      const diff = Math.abs(relativeTime - frame.timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closestFrame = frame;
      }
    }
    
    return closestFrame;
  }

  /**
   * Get active dialogues for a given time
   */
  static getActiveDialogues(subtitle: AssSubtitle, currentTime: number): AssDialogue[] {
    return subtitle.dialogues.filter(
      dialogue => currentTime >= dialogue.start && currentTime <= dialogue.end
    );
  }
}
