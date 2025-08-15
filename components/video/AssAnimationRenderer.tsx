/**
 * ASS Animation Renderer
 * Handles complex ASS animations and effects
 */

import React, { useState, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

interface AssAnimationProps {
  children: React.ReactNode;
  originalText: string;
  duration: number; // Duration of the subtitle display
}

interface AnimationEffect {
  type: string;
  startTime: number;
  endTime: number;
  fromValue: any;
  toValue: any;
  property: string;
}

export const AssAnimationRenderer: React.FC<AssAnimationProps> = ({
  children,
  originalText,
  duration,
}) => {
  const [animatedValues] = useState({
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
    rotation: new Animated.Value(0),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
  });

  useEffect(() => {
    const animations = parseAnimations(originalText);
    const animationSequence: Animated.CompositeAnimation[] = [];

    animations.forEach(animation => {
      const animatedValue = getAnimatedValueForProperty(animation.property);
      if (animatedValue) {
        const timing = Animated.timing(animatedValue, {
          toValue: animation.toValue,
          duration: (animation.endTime - animation.startTime) * 1000,
          delay: animation.startTime * 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        });
        animationSequence.push(timing);
      }
    });

    // Handle fade in/out effects
    const fadeMatch = originalText.match(/\\fad\((\d+),(\d+)\)/);
    if (fadeMatch) {
      const fadeIn = parseInt(fadeMatch[1]);
      const fadeOut = parseInt(fadeMatch[2]);
      
      const fadeSequence = Animated.sequence([
        Animated.timing(animatedValues.opacity, {
          toValue: 1,
          duration: fadeIn,
          useNativeDriver: false,
        }),
        Animated.delay((duration * 1000) - fadeIn - fadeOut),
        Animated.timing(animatedValues.opacity, {
          toValue: 0,
          duration: fadeOut,
          useNativeDriver: false,
        }),
      ]);
      
      animationSequence.push(fadeSequence);
    }

    // Handle rotation animations
    const rotationMatch = originalText.match(/\\frz([+-]?\d+(?:\.\d+)?)/);
    if (rotationMatch) {
      const rotation = parseFloat(rotationMatch[1]);
      animatedValues.rotation.setValue(rotation);
    }

    // Handle position animations
    const moveMatch = originalText.match(/\\move\((\d+),(\d+),(\d+),(\d+)(?:,(\d+),(\d+))?\)/);
    if (moveMatch) {
      const [, x1, y1, x2, y2, t1, t2] = moveMatch;
      const startTime = t1 ? parseInt(t1) : 0;
      const endTime = t2 ? parseInt(t2) : duration * 1000;
      
      if (endTime - startTime > 1000) {
      //we only proceed if the animation is longer than 1 second
      //otherwise it will be too fast and not smooth  


      const moveAnimation = Animated.parallel([
        Animated.timing(animatedValues.translateX, {
          toValue: parseInt(x2) - parseInt(x1),
          duration: endTime - startTime,
          delay: startTime,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValues.translateY, {
          toValue: parseInt(y2) - parseInt(y1),
          duration: endTime - startTime,
          delay: startTime,
          useNativeDriver: false,
        }),
      ]);
      
      animationSequence.push(moveAnimation);
    }

  }
    // Start all animations
    if (animationSequence.length > 0) {
      Animated.parallel(animationSequence).start();
    }
    return () => {
      // Cleanup animations
      Object.values(animatedValues).forEach(value => {
        value.stopAnimation();
      });
    };
  }, [originalText, duration]);

  const getAnimatedValueForProperty = (property: string) => {
    switch (property) {
      case 'opacity':
        return animatedValues.opacity;
      case 'scale':
      case 'scaleX':
      case 'scaleY':
        return animatedValues.scale;
      case 'rotation':
        return animatedValues.rotation;
      case 'translateX':
        return animatedValues.translateX;
      case 'translateY':
        return animatedValues.translateY;
      default:
        return null;
    }
  };

  const parseAnimations = (text: string): AnimationEffect[] => {
    const animations: AnimationEffect[] = [];
    
    // Parse \t() transformation tags
    const transformMatches = text.matchAll(/\\t\(([^)]+)\)/g);
    for (const match of transformMatches) {
      const params = match[1].split(',');
      if (params.length >= 3) {
        const startTime = parseFloat(params[0]) / 1000;
        const endTime = parseFloat(params[1]) / 1000;
        const transform = params[2];
        
        // Parse different transformation types
        if (transform.includes('\\fscx') || transform.includes('\\fscy')) {
          const scaleMatch = transform.match(/\\fsc[xy](\d+)/);
          if (scaleMatch) {
            animations.push({
              type: 'scale',
              startTime,
              endTime,
              fromValue: 1,
              toValue: parseInt(scaleMatch[1]) / 100,
              property: 'scale',
            });
          }
        }
        
        if (transform.includes('\\frz')) {
          const rotationMatch = transform.match(/\\frz([+-]?\d+(?:\.\d+)?)/);
          if (rotationMatch) {
            animations.push({
              type: 'rotation',
              startTime,
              endTime,
              fromValue: 0,
              toValue: parseFloat(rotationMatch[1]),
              property: 'rotation',
            });
          }
        }
      }
    }
    
    return animations;
  };

  const animatedStyle = {
    opacity: animatedValues.opacity,
    transform: [
      { scale: animatedValues.scale },
      { rotate: animatedValues.rotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        })},
      { translateX: animatedValues.translateX },
      { translateY: animatedValues.translateY },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};
