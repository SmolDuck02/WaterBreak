console.log('PiP window loaded!');

const canvas = document.getElementById('timerCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('pipVideo');

let timeLeft = 180; // 3 minutes
let isBreakActive = false;

// === Fix for HiDPI screens ===
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// === Setup video stream ===
const stream = canvas.captureStream(30);
video.srcObject = stream;
console.log('Video stream configured');

// === Auto-start ===
window.addEventListener('DOMContentLoaded', async () => {
  console.log('Page loaded — forcing initial frame...');
  drawTimer();
  await new Promise(r => setTimeout(r, 100));
  startBreak();
});

// === Start break ===
async function startBreak() {
  if (isBreakActive) return;
  isBreakActive = true;
  timeLeft = 180;
  drawTimer();

  try {
    await video.play();
    console.log('Video playing...');
  } catch (e) {
    console.warn('Autoplay blocked:', e.message);
  }

  try {
    console.log('Requesting PiP...');
    await video.requestPictureInPicture();
    console.log('✅ PiP started.');
  } catch (err) {
    console.warn('PiP failed or blocked:', err.message);
  }

  startTimerLoop();
}

// === Countdown (unthrottled) ===
function startTimerLoop() {
  const timer = setInterval(() => {
    if (!isBreakActive) {
      clearInterval(timer);
      return;
    }

    chrome.runtime.sendMessage({ action: "timeleft", interval: timeLeft / 60 });
    timeLeft--;
    drawTimer();

    if (timeLeft <= 0) {
      clearInterval(timer);
      finishBreak();
    }
  }, 1000);
}

// === End Break ===
function finishBreak() {
  isBreakActive = false;

  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {});
  }

  setTimeout(() => window.close(), 1000);
  console.log('Break finished — closing window.');
}

// === Draw Timer ===
function drawTimer() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(0.5, '#0f172a');
  gradient.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const centerX = w / 2;
  const centerY = h / 2;

  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('💧', centerX, centerY - 100);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, centerX, centerY);

  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Water Break Time!', centerX, centerY + 90);

  ctx.fillStyle = '#60a5fa';
  ctx.font = '22px Arial';
  ctx.fillText('Stay hydrated 🌊', centerX, centerY + 130);
}

video.addEventListener('leavepictureinpicture', () => {
  console.log('PiP manually closed.');
});
