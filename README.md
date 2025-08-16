# Video Player with ASS Subtitle Support

A React Native Expo video player that renders ASS (Advanced SubStation Alpha) subtitles with full styling, positioning, and animation support.

## 🎥 Demo

Check out the video demo: [https://www.loom.com/share/4579635162c04329a0d4d64a83e57b0e?sid=ae33acfc-5d09-4a72-a844-4fbe4c7ee22a](https://www.loom.com/share/4579635162c04329a0d4d64a83e57b0e?sid=ae33acfc-5d09-4a72-a844-4fbe4c7ee22a)

## 📱 Try It Now

Want to test the app immediately? Scan this QR code with the **Expo Go** app on your mobile device:

![QR Code](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAEDElEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4Awz8AAE=)

**To get started:**
1. Download **Expo Go** from your app store ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Open Expo Go and scan the QR code above
3. The app will load directly on your device!

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

Before setting up this project, ensure you have the following installed:

### Required Software

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Expo CLI** - Install globally:
  ```bash
  npm install -g @expo/cli
  ```

### For Mobile Development

#### iOS Development (macOS only)
- **Xcode** (latest version) - Available from Mac App Store
- **iOS Simulator** (included with Xcode)
- **Xcode Command Line Tools**:
  ```bash
  xcode-select --install
  ```

#### Android Development (All platforms)
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Android SDK** (included with Android Studio)
- **Java Development Kit (JDK)** - Use the one bundled with Android Studio or install separately
- **Android Emulator** (configured through Android Studio)

### For Web Development
- Any modern web browser (Chrome, Firefox, Safari, Edge)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/DaX-523/react-native-custom-subtitles-renderer
cd video-player
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```
This opens Expo DevTools in your browser where you can choose how to run the app.

### 4. (Optional) Prebuild for Native Development
If you need to customize native code or add native dependencies:
```bash
npm run prebuild
```
This generates native iOS and Android folders for advanced customization.

## Running the Project

### Method 1: Universal Development Server (Recommended)

Start the Expo development server:
```bash
npm start
```

This opens Expo DevTools in your browser with multiple options:

#### On iOS Simulator (macOS only)
- Press `i` in the terminal or click "Run on iOS simulator" in DevTools
- Simulator will launch automatically

#### On Android Emulator
- Start your Android emulator first (through Android Studio)
- Press `a` in the terminal or click "Run on Android device/emulator"

#### On Physical Device
- Install **Expo Go** app from App Store (iOS) or Google Play (Android)
- Scan the QR code displayed in the terminal/DevTools
- App will load directly on your device

**Note**: If the QR code doesn't work, see the [Network Issues](#network-issues) section below for ngrok tunnel setup.

#### On Web Browser
- Press `w` in the terminal or click "Run in web browser"
- App opens at `http://localhost:8081`

### Method 2: Platform-Specific Commands

#### iOS Development
```bash
npm run ios
```
- Automatically starts iOS Simulator
- Builds and installs the app
- Requires macOS and Xcode

#### Android Development
```bash
npm run android
```
- Connects to running Android emulator or connected device
- Builds and installs the app
- Requires Android Studio setup

#### Web Development
```bash
npm run web
```
- Starts web development server
- Opens browser at `http://localhost:8081`
- Hot reloading enabled

### Development Features

- **Hot Reloading**: Changes appear instantly without losing app state
- **Error Overlay**: Detailed error information displayed in app
- **DevTools**: Access to React DevTools and network inspector
- **Live Reload**: Automatic app restart on file changes

## Prebuild for Native Development

### When to Use Prebuild

Use `npm run prebuild` when you need to:

- **Add custom native modules** that require native code modifications
- **Customize app icons, splash screens**, or other native assets
- **Configure specific iOS/Android permissions** beyond Expo's defaults
- **Integrate third-party SDKs** that require native setup
- **Access platform-specific features** not available through Expo SDK

### Prebuild Process

```bash
npm run prebuild
```

This command:
1. **Generates** native `ios/` and `android/` directories
2. **Configures** native projects based on your `app.json`/`app.config.js`
3. **Installs** necessary native dependencies
4. **Sets up** build configurations for both platforms

### After Prebuilding

Once you've run prebuild, you can:

```bash
# Open iOS project in Xcode
npx expo run:ios

# Open Android project in Android Studio
npx expo run:android

# Or continue using Expo development builds
npm start
```

### Important Notes

⚠️ **Warning**: After running prebuild:
- Native folders (`ios/`, `android/`) are generated locally
- You can no longer use Expo Go app for testing
- You'll need to use Expo Development Builds or native builds
- Changes to native code require rebuilding the app

📁 **Git Considerations**: 
- Add `ios/` and `android/` to `.gitignore` if using Expo's cloud build services
- Commit native folders if you're doing local native development

🔄 **Regenerating**: You can re-run `npm run prebuild` to regenerate native folders, but custom native modifications will be lost.

## Available Scripts

The project includes several npm scripts for different development tasks:

```bash
npm start          # Start Expo development server (Metro bundler)
npm run prebuild   # Generate native iOS and Android folders
npm run ios        # Build and run on iOS simulator/device
npm run android    # Build and run on Android emulator/device
npm run web        # Start web development server
npm run lint       # Run ESLint to check code quality
npm run reset-project  # Reset project to initial state (removes custom changes)

# Network troubleshooting commands
expo start --tunnel   # Start with ngrok tunnel (for network issues)
ngrok http 8081       # Create tunnel manually (run in separate terminal)
```

### Script Details

- **`npm start`**: Most commonly used command, opens development server with platform options
- **`npm run prebuild`**: Generates native iOS and Android folders for advanced customization and native module integration
- **`npm run ios`**: Direct iOS development, automatically opens simulator
- **`npm run android`**: Direct Android development, requires emulator or connected device
- **`npm run web`**: Web-only development, good for quick testing
- **`npm run lint`**: Code quality checks, automatically fixes some issues
- **`expo start --tunnel`**: Alternative start command that uses ngrok tunnel (slower but works around network issues)
- **`ngrok http 8081`**: Manual tunnel creation for network troubleshooting

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

### Setup Issues

**Node.js version errors:**
```bash
# Check your Node.js version
node --version
# Should be v18.0.0 or higher
```
- Update Node.js if version is too old
- Use nvm to manage multiple Node.js versions

**Expo CLI installation issues:**
```bash
# If global install fails, try:
npx @expo/cli --version
# Or install with yarn:
yarn global add @expo/cli
```

**Permission errors on macOS/Linux:**
```bash
# Fix npm permissions:
sudo chown -R $(whoami) ~/.npm
# Or use nvm to avoid permission issues
```

### Platform-Specific Issues

**iOS Simulator not starting:**
- Ensure Xcode is installed and updated
- Open Xcode and accept license agreements
- Try resetting simulator: `Device → Erase All Content and Settings`

**Android Emulator issues:**
- Start emulator manually from Android Studio first
- Check that ANDROID_HOME environment variable is set
- Ensure emulator has enough RAM allocated (4GB+ recommended)

**Web browser issues:**
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check browser console for JavaScript errors

### Network Issues

**Physical device connection problems:**

If your physical device can't connect to the development server (QR code scanning fails), use ngrok to create a tunnel:

#### Setting up ngrok

1. **Install ngrok:**
   ```bash
   # Using npm
   npm install -g ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Create an account at ngrok.com** (free tier available)

3. **Authenticate ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

#### Using ngrok with Expo

1. **Start your Expo development server:**
   ```bash
   npm start
   ```
   Note the port number (usually 8081)

2. **In a new terminal, create ngrok tunnel:**
   ```bash
   ngrok http 8081
   ```

3. **Copy the HTTPS URL** from ngrok output (e.g., `https://abc123.ngrok.io`)

4. **Set Expo to use ngrok URL:**
   ```bash
   # Stop current server and restart with tunnel
   expo start --tunnel
   ```
   
   Or manually set the URL in Expo DevTools

5. **Scan the new QR code** that appears - it will use the ngrok tunnel

#### Alternative: Manual Connection

If ngrok doesn't work, you can manually enter the connection URL in Expo Go:

1. In Expo Go app, tap "Enter URL manually"
2. Enter: `exp://YOUR_NGROK_URL`
3. Replace `YOUR_NGROK_URL` with your ngrok URL (without https://)

#### Common Network Issues

- **Corporate firewalls**: ngrok bypasses most firewall restrictions
- **Different WiFi networks**: Device and computer must be on same network (or use ngrok)
- **Router restrictions**: Some routers block local network access (use ngrok)
- **VPN conflicts**: Disable VPN or use ngrok tunnel
- **Antivirus software**: May block local connections (whitelist Expo or use ngrok)

### App-Specific Issues

**Video not loading:**
- Check video file format (MP4 recommended)
- Verify file path in `require()` statement
- Ensure video file is in `assets/` folder

**Subtitles not appearing:**
- Check that the .ass file is properly formatted
- Verify file paths are correct
- Check console for parsing errors
- Ensure subtitle file encoding is UTF-8

**Timing issues:**
- Ensure video and subtitle timestamps match
- Check for timezone/offset issues in the ASS file
- Verify video duration matches expected length

**Performance problems:**
- Large subtitle files may impact performance
- Consider subtitle optimization for mobile devices
- Close other apps when testing on physical devices

**Animation issues:**
- Complex animations may be simplified on mobile
- Check React Native Animated API limitations
- Test on actual device vs simulator for accurate performance

**Seeking/Progress bar errors (Web):**
- This was a known issue that has been fixed
- Clear browser cache if still experiencing issues
- Check browser console for any remaining errors

**Prebuild issues:**
- **"expo prebuild failed"**: Ensure you have the latest Expo CLI version
- **Native folders already exist**: Delete `ios/` and `android/` folders before running prebuild
- **Missing dependencies**: Run `npm install` before prebuilding
- **Platform not supported**: Check that your app.json has correct platform configurations
- **Xcode/Android Studio errors**: Ensure development tools are properly installed and updated

### Getting Help

**Enable detailed logging:**
```tsx
// Add to VideoPlayerWithSubtitles.tsx
console.log('Active subtitles:', activeDialogues);
console.log('Current time:', currentTime);
console.log('Duration:', duration);
```

**Check Expo diagnostics:**
```bash
npx expo doctor
```

**Reset project state:**
```bash
# Clear Expo cache
npx expo r -c
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Common error solutions:**
- `Module not found`: Check import paths and file names
- `Metro bundler failed`: Clear cache with `npx expo r -c`
- `Network request failed`: Check firewall settings and network connection
- `Unable to connect to development server`: Use `expo start --tunnel` or ngrok
- `QR code scanning fails`: Try ngrok tunnel or manual URL entry in Expo Go

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Acknowledgments

- Built with Expo and React Native
- Uses expo-video for media playback
- ASS subtitle format specification
- React Native Animated API for effects