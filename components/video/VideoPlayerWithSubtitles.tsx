/**
 * Video Player with ASS Subtitle Support
 * Integrates expo-video with custom ASS subtitle rendering
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';

import { AssSubtitleParser, AssSubtitle, AssDialogue } from './AssSubtitleParser';
import { SubtitleOverlay } from './AssSubtitleRenderer';

interface VideoPlayerWithSubtitlesProps {
  videoSource: string | number; // URI string or require() asset
  subtitleSource: string | number; // URI string or require() asset
  style?: any;
  onLoad?: () => void;
  onError?: (error: string) => void;
  showControls?: boolean;
  autoPlay?: boolean;
}

export const VideoPlayerWithSubtitles: React.FC<VideoPlayerWithSubtitlesProps> = ({
  videoSource,
  subtitleSource,
  style,
  onLoad,
  onError,
  showControls = true,
  autoPlay = false,
}) => {
  const [subtitleData, setSubtitleData] = useState<AssSubtitle | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState<boolean>(true);
  const [videoUri, setVideoUri] = useState<string>('');
  
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: screenWidth } = Dimensions.get('window');
  
  // Initialize video player
  const player = useVideoPlayer(videoUri || '', (player) => {
    if (videoUri) {
      player.loop = false;
      player.muted = false;
      if (autoPlay) {
        player.play();
      }
    }
  });

  // expo video doesnt listen to event to react lifecycle events, so use event listener to update state
  const { isPlaying: playerIsPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  
  useEffect(() => {
    setIsPlaying(playerIsPlaying);
  }, [playerIsPlaying]);
  
  // Use interval for time updates to avoid complex event API issues
  useEffect(() => {
    const interval = setInterval(() => {
      if (player && !isLoading) {
        setCurrentTime(player.currentTime || 0);
        if (player.duration && duration === 0) {
          setDuration(player.duration);
          setIsLoading(false);
          onLoad?.();
        }
      }
    }, 100); // Update every 100ms for smooth subtitle sync
    
    return () => clearInterval(interval);
  }, [player, isLoading, duration, onLoad]);

  // Load video and subtitle assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setIsLoading(true);
        
        // Load video asset
        let videoAssetUri: string;
        if (typeof videoSource === 'string') {
          videoAssetUri = videoSource;
        } else {
          const videoAsset = Asset.fromModule(videoSource);
          await videoAsset.downloadAsync();
          videoAssetUri = videoAsset.localUri || videoAsset.uri;
        }
        console.log(videoAssetUri);
        setVideoUri(videoAssetUri);

        // Load subtitle content
        let subtitleContent: string;
        if (typeof subtitleSource === 'string') {
          // Check if it's ASS content, a filename, or URL
          if (subtitleSource.includes('[Script Info]')) {
            // Direct ASS content
            subtitleContent = subtitleSource;
          } else if (subtitleSource.startsWith('http')) {
            // Fetch from URL
            const response = await fetch(subtitleSource);
            subtitleContent = await response.text();
          } else {
            // Load from app bundle using Asset
            const bundleUri = Asset.fromURI(subtitleSource);
            await bundleUri.downloadAsync();
            const response = await fetch(bundleUri.localUri || bundleUri.uri);
            subtitleContent = await response.text();
          }
        } else {
          // Load from local asset
          const subtitleAsset = Asset.fromModule(subtitleSource);
          await subtitleAsset.downloadAsync();
          const response = await fetch(subtitleAsset.localUri || subtitleAsset.uri);
          subtitleContent = await response.text();
        }

        // Parse ASS subtitle
        const parsedSubtitles = AssSubtitleParser.parse(subtitleContent);
        console.log(parsedSubtitles);
        setSubtitleData(parsedSubtitles);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading assets:', error);
        onError?.(`Failed to load video or subtitle: ${error}`);
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [videoSource, subtitleSource, onLoad, onError]);

  // Get active subtitles for current time
  const activeDialogues: AssDialogue[] = subtitleData 
    ? AssSubtitleParser.getActiveDialogues(subtitleData, currentTime)
    : [];

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
    
    setShowControlsOverlay(true);
    
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControlsOverlay(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
        hideControlsTimeoutRef.current = null;
      }
    };
  }, [resetControlsTimer]);

  // Play/pause toggle
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimer();
  }, [isPlaying, player, resetControlsTimer]);

  // Seek to position
  const seekTo = useCallback((position: number) => {
    player.currentTime = position;
    setCurrentTime(position);
    resetControlsTimer();
  }, [player, resetControlsTimer]);

  // Handle screen tap
  const handleScreenPress = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get video dimensions for subtitle positioning
  const videoWidth = parseInt(subtitleData?.scriptInfo.PlayResX || '1920');
  const videoHeight = parseInt(subtitleData?.scriptInfo.PlayResY || '1080');

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" /> {/*loader */}
          <Text style={styles.loadingText}>Loading video and subtitles...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.videoContainer} 
        onPress={handleScreenPress}
        activeOpacity={1}
      >
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
        
        {/* Subtitle Overlay */}
        {subtitleData && (
          <SubtitleOverlay
            activeDialogues={activeDialogues}
            styles={subtitleData.styles}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
            currentTime={currentTime}
          />
        )}
        
        {/* Video Controls */}
        {showControls && showControlsOverlay && (
          <View style={styles.controlsOverlay}>
            {/* Play/Pause Button */}
            <TouchableOpacity 
              style={styles.playButton} 
              onPress={togglePlayPause}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={50} 
                color="rgba(255, 255, 255, 0.9)" 
              />
            </TouchableOpacity>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              
              <View style={styles.progressBar}>
                <View style={styles.progressBarBackground} />
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${(currentTime / duration) * 100}%` }
                  ]} 
                />
                <TouchableOpacity
                  style={[
                    styles.progressBarThumb,
                    { left: `${(currentTime / duration) * 100}%` }
                  ]}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    const progressBarWidth = screenWidth * 0.6;
                    const newPosition = (locationX / progressBarWidth) * duration;
                    seekTo(newPosition);
                  }}
                />
              </View>
              
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  playButton: {
    alignSelf: 'center',
    marginBottom: 20,
    padding: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 20,
    marginHorizontal: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBarFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressBarThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    marginLeft: -6,
    marginTop: -4,
  },
});

export default VideoPlayerWithSubtitles;
