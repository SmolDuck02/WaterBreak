console.log('Offscreen document loaded!');

const canvas = document.getElementById('timerCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('pipVideo');

let timeLeft = 180; // 3 minutes
let isBreakActive = false;
let animationId = null;

// Listen for messages from background
console.log('Setting up message listener...');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message);
  
  if (message.action === 'startPiP') {
    console.log('Starting PiP break!');
    startBreak();
    sendResponse({ success: true });
  }
  return true;
});

console.log('Message listener set up!');

async function startBreak() {
  console.log('startBreak function called');
  isBreakActive = true;
  timeLeft = 180;
  
  // Setup video stream from canvas
  const stream = canvas.captureStream(30);
  video.srcObject = stream;
  
  console.log('Video stream setup, attempting to play...');
  
  try {
    await video.play();
    console.log('Video playing, requesting PiP...');
    
    await video.requestPictureInPicture();
    console.log('PiP mode activated!');
    
    // Start countdown
    updateTimer();
  } catch (err) {
    console.error('PiP failed:', err);
  }
}

function updateTimer() {
  if (!isBreakActive || timeLeft <= 0) {
    console.log('Timer finished');
    isBreakActive = false;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
    return;
  }

  drawTimer();
  
  setTimeout(() => {
    timeLeft--;
    updateTimer();
  }, 1000);
}

function drawTimer() {
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(0.5, '#0f172a');
  gradient.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);
  
  // Water drop
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💧', 300, 120);
  
  // Timer
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px Arial';
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  ctx.fillText(timeStr, 300, 260);
  
  // Text
  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('Water Break Time!', 300, 330);
  
  ctx.fillStyle = '#60a5fa';
  ctx.font = '24px Arial';
  ctx.fillText('Stay hydrated 🌊', 300, 370);
}

// Exit PiP when video ends
video.addEventListener('leavepictureinpicture', async () => {
  console.log('User closed PiP window');
  isBreakActive = false;
  await chrome.storage.local.set({ isBreakWindowOpen: false });
});

console.log('Offscreen script setup complete!');