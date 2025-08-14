/**
 * ASS (Advanced SubStation Alpha) Subtitle Parser
 * Parses .ass files while preserving styling and timing information
 */

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
    if (!colorStr || !colorStr.startsWith('&H')) return '#FFFFFF';
    
    const hex = colorStr.substring(2);
    if (hex.length === 8) {
      // ASS format: AABBGGRR -> RRGGBBAA
      const bb = hex.substring(2, 4);
      const gg = hex.substring(4, 6);
      const rr = hex.substring(6, 8);
      
      // Convert to standard hex color (ignore alpha for now)
      return `#${rr}${gg}${bb}`;
    } else if (hex.length === 6) {
      // RGB format: BBGGRR -> RRGGBB
      const bb = hex.substring(0, 2);
      const gg = hex.substring(2, 4);
      const rr = hex.substring(4, 6);
      return `#${rr}${gg}${bb}`;
    }
    
    return '#FFFFFF';
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
   * Get active dialogues for a given time
   */
  static getActiveDialogues(subtitle: AssSubtitle, currentTime: number): AssDialogue[] {
    return subtitle.dialogues.filter(
      dialogue => currentTime >= dialogue.start && currentTime <= dialogue.end
    );
  }
}
