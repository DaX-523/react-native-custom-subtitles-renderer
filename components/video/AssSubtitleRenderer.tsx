/**
 * ASS Subtitle Renderer Component
 * Renders ASS subtitles with proper styling and positioning
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { AssDialogue, AssStyle, AssSubtitleParser } from './AssSubtitleParser';
import { AssAnimationRenderer } from './AssAnimationRenderer';

interface AssSubtitleRendererProps {
  dialogue: AssDialogue;
  style: AssStyle;
  videoWidth: number;
  videoHeight: number;
  currentTime: number;
}

export const AssSubtitleRenderer: React.FC<AssSubtitleRendererProps> = ({
  dialogue,
  style,
  videoWidth,
  videoHeight,
  currentTime,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const getHAlign = (an: number) =>
  [1,4,7].includes(an) ? 'left' : [3,6,9].includes(an) ? 'right' : 'center';

const getVAlign = (an: number) =>
  [7,8,9].includes(an) ? 'top' : [4,5,6].includes(an) ? 'middle' : 'bottom';

// measure container to center precisely
const [containerSize, setContainerSize] = React.useState({ w: 0, h: 0 });

  // Calculate responsive font scaling based on screen size
   const getResponsiveFontScale = () => {
    const baseMobileWidth = 375;   // iPhone reference
    const baseWebWidth = 1366;     // common laptop width
  
    if (Platform.OS === "web") {
      // For web: keep sizes closer to constant, avoid huge jumps on big monitors
      const scaleFactor = screenWidth / baseWebWidth;
      return Math.max(0.4, Math.min(1.0, scaleFactor * 0.45));
    } else {
        // For mobile: proportional scaling works better
        const scaleFactor = screenWidth / baseMobileWidth;
      return Math.max(0.35, Math.min(0.8, scaleFactor * 0.35));
    }
  };

  // Extract positioning and color overrides from the original text
  const positioning = AssSubtitleParser.extractPositioning(dialogue.originalText);
  const colorOverrides = AssSubtitleParser.extractColors(dialogue.originalText);
  
  // Get frame data for current time to support smooth transitions
  const frameData = AssSubtitleParser.getFrameDataAtTime(dialogue, currentTime, style);
  // Calculate position based on alignment and positioning
  const getPosition = () => {
    let x = positioning.x || 0;
    let y = positioning.y || 0;
    const alignment = positioning.alignment || style.alignment;
    
    // If no absolute positioning, use alignment-based positioning
    if (!positioning.x || !positioning.y) {
        switch (alignment) {
            case 1: // Bottom left
                x = style.marginL;
                y = videoHeight - style.marginV;
                break;
            case 2: // Bottom center
                x = videoWidth / 2;
                y = videoHeight * 0.87; // 87% down the screen
                break;
            case 3: // Bottom right
                x = videoWidth - style.marginR;
                y = videoHeight - style.marginV;
                break;
            case 4: // Middle left
                x = style.marginL;
                y = videoHeight / 2;
                break;
            case 5: // Center
                x = videoWidth / 2;
                y = videoHeight / 2;
                break;
            case 6: // Middle right
                x = videoWidth - style.marginR;
                y = videoHeight / 2;
                break;
            case 7: // Top left
                x = style.marginL;
                y = style.marginV;
                break;
            case 8: // Top center
                x = videoWidth / 2;
                y = style.marginV;
                break;
            case 9: // Top right
                x = videoWidth - style.marginR;
                y = style.marginV;
                break;
            default: // Bottom center
                x = videoWidth / 2;
                y = videoHeight - style.marginV;
        }
    }
    
    // Scale positions to fit current video dimensions
    const scaleX = screenWidth / (videoWidth || screenWidth);
    const scaleY = screenHeight / (videoHeight || screenHeight);
    
    let scaledX = x * scaleX;
    let scaledY = y * scaleY;
    
    // Center-tending logic for Y-axis
    const screenCenterY = screenHeight / 2;
    const isMobile = screenWidth < 768; // Adjust mobile breakpoint as needed
    
    if (isMobile) {
        const centerPullStrength = 0.4; 
        
        if (scaledY > screenCenterY) {
            // Position is in bottom half - lift up toward center
            scaledY = scaledY - (scaledY - screenCenterY) * centerPullStrength;
        } else if (scaledY < screenCenterY) {
            // Position is in top half - push down toward center
            scaledY = scaledY + (screenCenterY - scaledY) * centerPullStrength;
        }
        
        // For bottom-aligned positions
        if (alignment >= 1 && alignment <= 3) { // Bottom alignments
            const minDistanceFromBottom = screenHeight * 0.10; // Keep at least 15% from bottom
            scaledY = Math.min(scaledY, screenHeight - minDistanceFromBottom);
        }
        
        // For top-aligned positions
        if (alignment >= 7 && alignment <= 9) { // Top alignments
            const minDistanceFromTop = screenHeight * 0.2; // Keep at least 15% from top
            scaledY = Math.max(scaledY, minDistanceFromTop);
        }
    }
    
    // Ensure positions stay within screen bounds
    const safeX = Math.max(0, Math.min(screenWidth, scaledX));
    const safeY = Math.max(0, Math.min(screenHeight, scaledY));
    
    return {
        x: safeX,
        y: safeY,
        alignment
    };
};

  const position = getPosition();
  // Calculate container style based on alignment
  const getContainerStyle = () => {
    const an = position.alignment ?? 2; // default bottom-center like ASS
    const hAlign = getHAlign(an);
    const vAlign = getVAlign(an);
    
    const maxW = Math.min(screenWidth * 0.75, screenWidth - 24); // keep safe margins
    const base: any = {
        position: 'absolute',
        maxWidth: maxW,
        paddingHorizontal: 4,
    };

    // Horizontal anchoring
    if (hAlign === 'left') {
        base.left = position.x || screenWidth / 2; // fallback to center if x is 0
        base.alignItems = 'flex-start';
        base.textAlign = 'left';
    } else if (hAlign === 'right') {
        base.right = screenWidth - (position.x || screenWidth / 2); // fallback to center if x is 0
        base.alignItems = 'flex-end';
        base.textAlign = 'right';
    } else {
        // center alignment - dynamic based on content width
        const contentWidth = Math.min(containerSize.w, maxW);
        const halfWidth = contentWidth / 2;
        
        // Calculate left position with clamping to keep within screen bounds
        let leftPos = (position.x || screenWidth / 2) - halfWidth;
        leftPos = Math.max(8, Math.min(leftPos, screenWidth - contentWidth - 8));
        
        base.left = leftPos;
        base.alignItems = 'center';
        base.textAlign = 'center';
    }

    // Vertical anchoring (unchanged from your original)
    if (vAlign === 'top') {
        base.top = clamp(position.y, 8, screenHeight - 8);
    } else if (vAlign === 'middle') {
        const halfH = (containerSize.h || 40) / 2;

        base.top = clamp(position.y - halfH, 8, screenHeight - (containerSize.h || 40) - 8);
    } else {
        // bottom
        const distFromBottom = screenHeight - position.y;
        base.bottom = clamp(distFromBottom, 8, screenHeight - 100);
    }
  
    return base;
};
  

  // Calculate text style using frame data for smooth transitions
  const getTextStyle = () => {
    // Use frame data if available, otherwise fall back to static overrides and style
    const primaryColor = frameData?.primaryColor || colorOverrides.primaryColor || style.primaryColour;
    const outlineColor = frameData?.outlineColor || colorOverrides.outlineColor || style.outlineColour;
    const fontSize = frameData?.fontSize || style.fontsize;
    const rotation = frameData?.rotation || style.angle;
    const alpha = frameData?.alpha !== undefined ? frameData.alpha : 1;

    // Apply alpha to primary color if frame data provides it
    const finalPrimaryColor = frameData?.alpha !== undefined 
      ? AssSubtitleParser.applyAlphaToColor(primaryColor, alpha)
      : primaryColor;

    return {
      fontFamily: style.fontname || 'System',
      fontSize: fontSize * getResponsiveFontScale(), // Use frame data fontSize if available
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      color: finalPrimaryColor,
      textAlign: position.alignment === 1 || position.alignment === 4 || position.alignment === 7 
        ? 'left' 
        : position.alignment === 3 || position.alignment === 6 || position.alignment === 9 
          ? 'right' 
          : 'center',
      textShadowColor: outlineColor,
      textShadowOffset: { 
        width: style.outline * getResponsiveFontScale(), 
        height: style.outline * getResponsiveFontScale() 
      },
      textShadowRadius: style.outline * getResponsiveFontScale(),
      letterSpacing: style.spacing,
      textDecorationLine: style.underline ? 'underline' : style.strikeOut ? 'line-through' : 'none',
      transform: [
        { scaleX: style.scaleX / 100 },
        { scaleY: style.scaleY / 100 },
        { rotate: `${rotation}deg` } // Use frame data rotation if available
      ],
    } as any;
  };

  // Handle special formatting in text
  const renderFormattedText = () => {
    const text = dialogue.text;
    const duration = dialogue.end - dialogue.start;
    
    // Wrap in animation renderer for complex effects
    return (
      <AssAnimationRenderer 
        originalText={dialogue.originalText} 
        duration={duration}
      >
        <Text
  style={[getTextStyle(), { flexWrap: 'wrap' }]}
  numberOfLines={0}
>
  {text}
</Text>

      </AssAnimationRenderer>
    );
  };

  return (
    <View
      style={getContainerStyle()}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== containerSize.w || height !== containerSize.h) {
          setContainerSize({ w: width, h: height });
        }
      }}
      pointerEvents="none"
    >
      {renderFormattedText()}
    </View>
  );
  
};

interface SubtitleOverlayProps {
  activeDialogues: AssDialogue[];
  styles: Record<string, AssStyle>;
  videoWidth: number;
  videoHeight: number;
  currentTime: number;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  activeDialogues,
  styles,
  videoWidth,
  videoHeight,
  currentTime,
}) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {activeDialogues.map((dialogue, index) => {
        const style = styles[dialogue.style];
        if (!style) return null;

        return (
          <AssSubtitleRenderer
            key={`${dialogue.start}-${dialogue.end}-${index}`}
            dialogue={dialogue}
            style={style}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
            currentTime={currentTime}
          />
        );
      })}
    </View>
  );
};
