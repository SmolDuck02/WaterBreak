# 💧 Hydration Break Reminder

A beautiful Chrome extension that helps you stay hydrated throughout the day with automatic water break reminders using Picture-in-Picture technology.

## ✨ Features

- **🔄 Auto Mode**: Set custom intervals (1-180 minutes) for automatic reminders
- **🎬 Picture-in-Picture Timer**: Break reminders appear as a floating PiP window with a countdown timer
- **📊 Daily Tracking**: Monitor your daily break count and estimated water intake
- **⏱️ Live Countdown**: See when your next break is coming in real-time
- **🎨 Modern UI**: Clean, glassmorphic design with smooth animations
- **💾 Persistent Settings**: Your preferences are saved and restored automatically
- **🔔 Non-Intrusive**: PiP window floats above other apps without blocking your work

## 🚀 Installation

### From Source

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/water-break.git
   cd water-break
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in the top right)
   - Click **Load unpacked**
   - Select the `water-break` folder

3. **Pin the extension** (optional but recommended)
   - Click the puzzle icon in Chrome's toolbar
   - Find "Hydration Break Reminder"
   - Click the pin icon to keep it visible

## 📖 How to Use

### Starting Auto Mode

1. Click the extension icon in your toolbar
2. Set your desired interval (default: 60 minutes)
3. Click **▶ Start Auto Mode**
4. The extension will now remind you automatically at the set interval

### Taking a Break

When a break is triggered (either automatically or manually):
- A popup window opens with a 3-minute countdown timer
- The timer automatically enters Picture-in-Picture mode
- You can move the PiP window anywhere on your screen
- The timer will close automatically after 3 minutes
- Or close it manually when you're ready

### Manual Break

Click **💧 Take Break Now** to start a break immediately, even if Auto Mode is off.

### Tracking Your Progress

The popup shows:
- **Breaks**: Number of water breaks taken today
- **Hydrated**: Estimated water intake (assumes 250ml per break)
- **Next break in**: Live countdown to your next scheduled break

### Daily Reset

Your break counter automatically resets at midnight each day.

## 🛠️ Technical Details

### Built With

- **Manifest V3**: Latest Chrome extension API
- **Chrome APIs Used**:
  - `chrome.alarms` - Scheduled reminders
  - `chrome.storage.local` - Persistent settings
  - `chrome.windows` - Popup management
  - Picture-in-Picture API - Floating timer window

### File Structure

```
water-break/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (alarm & state management)
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic & countdown
├── pip-window.html       # Break timer window
├── pip-window.js         # PiP timer & canvas rendering
├── offscreen.html        # Offscreen document for PiP
├── offscreen.js          # Offscreen logic
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
└── README.md             # This file
```

### Key Features Implementation

- **Persistent Alarms**: Uses `chrome.alarms` API to trigger breaks even when the browser restarts
- **State Management**: Tracks active breaks, prevents duplicate popups, and maintains settings
- **HiDPI Support**: Canvas rendering scales properly on high-DPI displays
- **Graceful Degradation**: Works even if Picture-in-Picture is blocked or unavailable

## ⚙️ Customization

### Changing Break Duration

Edit `pip-window.js`, line 7:
```javascript
let timeLeft = 180; // Change to desired seconds (180 = 3 minutes)
```

### Changing Default Interval

Edit `background.js`, line 3:
```javascript
let intervalMinutes = 60; // Change to your preferred default
```

### Changing Water Amount per Break

Edit `popup.js`, line 14:
```javascript
document.getElementById('waterAmount').textContent = (response.breaksToday * 250) + 'ml';
// Change 250 to your glass size in ml
```

### Styling the Timer

Edit `pip-window.js` in the `drawTimer()` function (lines 92-125) to customize:
- Colors
- Font sizes
- Text content
- Emojis

## 🔧 Development

### Prerequisites
- Chrome/Edge/Brave (or any Chromium-based browser)
- Basic knowledge of JavaScript and Chrome Extension APIs

### Testing
1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Debugging
- **Background script**: Right-click extension icon → Inspect service worker
- **Popup**: Right-click popup → Inspect
- **PiP window**: `chrome://inspect` → Find the pip-window.html

## 📋 Known Limitations

- Picture-in-Picture API may not work on all systems/browsers
- Break counter resets only at midnight (uses local timezone)
- Only one break window can be active at a time

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] Sound notifications (optional)
- [ ] Customizable break messages
- [ ] Multiple reminder types (stretch, eye break, etc.)
- [ ] Weekly/monthly statistics
- [ ] Themes and customization options
- [ ] Export hydration data
- [ ] Integration with health tracking apps

## 💡 Tips for Maximum Benefit

- Start with 60-minute intervals and adjust based on your needs
- Actually drink water during each break! 🚰
- Stand up and stretch while you're at it
- Aim for 8-10 breaks per workday for optimal hydration

---

**Stay hydrated, stay focused!** 💧✨

*Made with ❤️ for healthier work habits*

