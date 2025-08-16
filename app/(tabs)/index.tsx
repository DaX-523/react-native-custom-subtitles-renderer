import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { VideoPlayerWithSubtitles } from '@/components/video/VideoPlayerWithSubtitles';
import { subtitleContent } from '@/assets/subtitles';

export default function HomeScreen() {
  const handleVideoLoad = () => {
    console.log('Video and subtitles loaded successfully!');
  };

  const handleVideoError = (error: string) => {
    console.error('Video error:', error);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <VideoPlayerWithSubtitles
      videoSource={require('@/assets/Instagram Reels Video 949.mp4')}
        // videoSource="https://drive.google.com/uc?export=download&id=1pSsVlQog-XSMrXTKXCANejkJLm4roejo"
        subtitleSource={subtitleContent}
        style={styles.videoPlayer}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        showControls={true}
        autoPlay={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
});