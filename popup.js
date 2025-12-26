let isAutoRunning = false;
let currentInterval = 60;       // currently active interval
let pendingInterval = 60;       // what’s typed in input

// === Load current status ===
chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
  if (response) {
    isAutoRunning = response.isAutoRunning;
    currentInterval = response.intervalMinutes;
    pendingInterval = currentInterval;

    document.getElementById('intervalInput').value = currentInterval;
    document.getElementById('breaksCount').textContent = response.breaksToday;
    document.getElementById('waterAmount').textContent = (response.breaksToday * 250) + 'ml';
    updateUI();
  }
});

// === Handle typing in input ===
const intervalInput = document.getElementById('intervalInput');

intervalInput.addEventListener('input', (e) => {
  const newValue = parseInt(e.target.value);
  pendingInterval = newValue;

  if (isNaN(newValue)) return;

  // If user typed a different value → show "Apply New Interval"
  if (newValue !== currentInterval) {
    updateUI(true);
  } else {
    updateUI();
  }
});

// === On blur → restore old interval if empty or invalid ===
intervalInput.addEventListener('blur', (e) => {
  const value = e.target.value.trim();

  if (value === '' || isNaN(parseInt(value)) || parseInt(value) < 1) {
    // revert to last known interval
    pendingInterval = currentInterval;
    e.target.value = currentInterval;
    updateUI();
  }
});

// === Toggle auto mode (Start/Stop) ===
document.getElementById('toggleBtn').addEventListener('click', async () => {
  const interval = pendingInterval;

  // If interval changed or auto mode is off, (re)start auto mode
  if (!isAutoRunning || interval !== currentInterval) {
    await chrome.runtime.sendMessage({ 
      action: 'startAutoMode',
      interval: interval
    });

    isAutoRunning = true;
    currentInterval = interval;
    updateUI();
    startCountdown(interval);

  } else {
    // stop auto mode
    await chrome.runtime.sendMessage({ action: 'stopAutoMode' });
    isAutoRunning = false;
    stopCountdown();
    updateUI();
  }
});

// === Take break now ===
document.getElementById('breakNowBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'startBreakNow' });
  window.close();
});

// === Update UI state ===
function updateUI(isPending = false) {
  const statusCard = document.getElementById('statusCard');
  const statusText = document.getElementById('statusText');
  const toggleBtn = document.getElementById('toggleBtn');

  if (isPending) {
    // user modified input
    statusCard.classList.add('active');
    statusText.textContent = 'Interval changed — ready to apply';
    toggleBtn.textContent = '▶ Apply New Interval';
    toggleBtn.className = 'btn-primary';
    return;
  }

  if (isAutoRunning) {
    statusCard.classList.add('active');
    statusText.textContent = `✓ Auto Mode Active (${currentInterval} min)`;
    toggleBtn.textContent = '⏸ Stop Auto Mode';
    toggleBtn.className = 'btn-stop';
    startCountdown(currentInterval);
  } else {
    statusCard.classList.remove('active');
    statusText.textContent = 'Auto Mode Inactive';
    toggleBtn.textContent = '▶ Start Auto Mode';
    toggleBtn.className = 'btn-primary';
    stopCountdown();
  }
}

// === Countdown logic ===
let countdownInterval = null;
let nextBreakTime = null;

function startCountdown(minutes) {
  nextBreakTime = Date.now() + minutes * 60 * 1000;

  const countdownText = document.getElementById("countdownText");
  const countdownTimer = document.getElementById("countdownTimer");
  countdownText.style.display = "block";

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const diff = nextBreakTime - Date.now();
    if (diff <= 0) {
      countdownTimer.textContent = "00:00";
      clearInterval(countdownInterval);
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;

    countdownTimer.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, 1000);
}

function stopCountdown() {
  clearInterval(countdownInterval);
  document.getElementById("countdownText").style.display = "none";
}

// === Listen for resetCountdown from background ===
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "resetCountdown") {
    startCountdown(message.interval);
  }
});
