# Video Player with ASS Subtitle Support

A React Native Expo video player that renders ASS (Advanced SubStation Alpha) subtitles with full styling, positioning, and animation support.

## Features

- **Full ASS Subtitle Support**: Parses and renders .ass files with complete styling preservation
- **Rich Text Formatting**: Supports colors, fonts, bold, italic, underline, and stroke effects
- **Advanced Positioning**: Handles absolute positioning, alignment, and margin controls
- **Animation Support**: Renders complex ASS animations including:
  - Fade in/out effects (`\fad()`)
  - Scale transformations (`\fscx`, `\fscy`)
  - Rotation effects (`\frz`)
  - Movement animations (`\move()`)
  - Timing-based transformations (`\t()`)
- **Synchronized Playback**: Subtitles remain perfectly synced during play, pause, and seeking
- **Cross-Platform**: Works on iOS, Android, and Web
- **Clean UI**: Modern video player controls with auto-hide functionality

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd video-player
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

### Development Mode

Start the Expo development server:
```bash
npm start
```

This will open the Expo DevTools in your browser. From there you can:

- Press `i` to run on iOS Simulator
- Press `a` to run on Android Emulator  
- Scan the QR code with Expo Go app on your device

### Platform-Specific Commands

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

For Web:
```bash
npm run web
```

## Project Structure

```
components/video/
├── AssSubtitleParser.ts          # Core ASS subtitle parsing logic
├── AssSubtitleRenderer.tsx       # Subtitle rendering with styling
├── AssAnimationRenderer.tsx      # Animation and effects handler
└── VideoPlayerWithSubtitles.tsx  # Main video player component

app/(tabs)/
└── index.tsx                     # Home screen with video player

assets/
├── Instagram Reels Video 949.mp4 # Sample video file
└── subtitles.ass                 # Sample ASS subtitle file
```

## How It Works

### ASS Subtitle Parsing

The `AssSubtitleParser` class handles:

1. **Script Info**: Resolution, metadata parsing
2. **Style Definitions**: Font, color, positioning styles  
3. **Dialogue Events**: Timing, text, and styling overrides
4. **Time Conversion**: ASS timestamp format to seconds
5. **Color Processing**: ASS color format (&HAABBGGRR) to hex

### Subtitle Rendering

The `AssSubtitleRenderer` component:

1. **Position Calculation**: Converts ASS coordinates to React Native positioning
2. **Style Application**: Maps ASS styles to React Native text styles
3. **Alignment Handling**: Supports all 9 ASS alignment modes
4. **Override Processing**: Handles inline style overrides in dialogue text

### Animation System

The `AssAnimationRenderer` component:

1. **Effect Parsing**: Extracts animation tags from ASS override codes
2. **Timing Coordination**: Synchronizes animations with video playback
3. **Transform Mapping**: Converts ASS animations to React Native Animated API
4. **Composite Effects**: Handles multiple simultaneous animations

## ASS Format Support

### Supported Features

- ✅ Basic text styling (bold, italic, underline)
- ✅ Colors (primary, outline, shadow)  
- ✅ Font family and size
- ✅ Positioning (\pos, \move)
- ✅ Alignment (\an)
- ✅ Fade effects (\fad)
- ✅ Scale transformations (\fscx, \fscy)
- ✅ Rotation (\frz)
- ✅ Timed transformations (\t)
- ✅ Layer support
- ✅ Margin controls

### Limitations

- Some advanced karaoke effects may not be fully supported
- Complex drawing commands are not implemented
- 3D rotations are simplified to 2D

## Customization

### Adding Your Own Video and Subtitles

1. Place your video file in the `assets/` folder
2. Place your .ass subtitle file in the `assets/` folder  
3. Update the file references in `app/(tabs)/index.tsx`:

```tsx
<VideoPlayerWithSubtitles
  videoSource={require('@/assets/your-video.mp4')}
  subtitleSource={require('@/assets/your-subtitles.ass')}
  // ... other props
/>
```

### Styling the Player

Modify the styles in `VideoPlayerWithSubtitles.tsx` to customize:

- Control button appearance
- Progress bar styling
- Loading indicator
- Background colors

### Extending Subtitle Support

To add support for additional ASS features:

1. Extend the parsing logic in `AssSubtitleParser.ts`
2. Add rendering support in `AssSubtitleRenderer.tsx`
3. Implement animations in `AssAnimationRenderer.tsx`

## Troubleshooting

### Common Issues

**Subtitles not appearing:**
- Check that the .ass file is properly formatted
- Verify file paths are correct
- Check console for parsing errors

**Timing issues:**
- Ensure video and subtitle timestamps match
- Check for timezone/offset issues in the ASS file

**Performance problems:**
- Large subtitle files may impact performance
- Consider subtitle optimization for mobile devices

**Animation issues:**
- Complex animations may be simplified on mobile
- Check React Native Animated API limitations

### Debugging

Enable console logging by adding:
```tsx
console.log('Active subtitles:', activeDialogues);
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Acknowledgments

- Built with Expo and React Native
- Uses expo-video for media playback
- ASS subtitle format specification
- React Native Animated API for effects