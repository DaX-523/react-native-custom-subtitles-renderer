/**
 * ASS Subtitle Renderer Component
 * Renders ASS subtitles with proper styling and positioning
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
  
  // Calculate responsive font scaling based on screen size
  const getResponsiveFontScale = () => {
    const baseWidth = 375; // iPhone standard width
    const scaleFactor = screenWidth / baseWidth;
    
    // Cap the scaling between 0.3 and 0.6 for reasonable sizes
    return Math.max(0.3, Math.min(0.6, scaleFactor * 0.35));
  };

  // Extract positioning and color overrides from the original text
  const positioning = AssSubtitleParser.extractPositioning(dialogue.originalText);
  const colorOverrides = AssSubtitleParser.extractColors(dialogue.originalText);

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
          // For mobile, use a more conservative bottom position
          y = videoHeight * 0.87; // 87% down the screen instead of full height
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

    // Scale positions to fit current video dimensions with safe bounds
    const scaleX = screenWidth / (videoWidth || screenWidth);
    const scaleY = screenHeight / (videoHeight || screenHeight);
    
    // Apply conservative scaling for mobile screens
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    
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
    const baseStyle: any = {
      position: 'absolute',
      maxWidth: screenWidth * 0.9,
    };

    switch (position.alignment) {
      case 1: // Bottom left
      case 4: // Middle left
      case 7: // Top left
        baseStyle.left = position.x;
        baseStyle.alignItems = 'flex-start';
        break;
      case 2: // Bottom center
      case 5: // Center
      case 8: // Top center
        baseStyle.left = position.x - (screenWidth * 0.45); // Center the container
        baseStyle.alignItems = 'center';
        break;
      case 3: // Bottom right
      case 6: // Middle right
      case 9: // Top right
        baseStyle.right = screenWidth - position.x;
        baseStyle.alignItems = 'flex-end';
        break;
      default:
        baseStyle.left = position.x - (screenWidth * 0.45);
        baseStyle.alignItems = 'center';
    }

    // Vertical positioning with safe bounds
    if ([1, 2, 3].includes(position.alignment)) {
      // Bottom alignment - ensure subtitles stay on screen
      const bottomDistance = screenHeight - position.y;
      const minBottomMargin = 10; // Minimum distance from bottom edge
      const maxBottomDistance = screenHeight - 100; // Maximum allowed distance
      
      baseStyle.bottom = Math.max(minBottomMargin, Math.min(maxBottomDistance, bottomDistance));
    } else if ([4, 5, 6].includes(position.alignment)) {
      // Middle alignment
      baseStyle.top = Math.max(20, Math.min(screenHeight / 2, position.y - 20));
    } else {
      // Top alignment
      baseStyle.top = Math.max(20, position.y);
    }

    return baseStyle;
  };

  // Calculate text style
  const getTextStyle = () => {
    const primaryColor = colorOverrides.primaryColor || style.primaryColour;
    const outlineColor = colorOverrides.outlineColor || style.outlineColour;

    return {
      fontFamily: style.fontname || 'System',
      fontSize: style.fontsize * getResponsiveFontScale(), // Responsive scaling for different devices
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      color: primaryColor,
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
        { rotate: `${style.angle}deg` }
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
        <Text style={getTextStyle()}>
          {text}
        </Text>
      </AssAnimationRenderer>
    );
  };

  return (
    <View style={getContainerStyle()}>
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
