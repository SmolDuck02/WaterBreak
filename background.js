console.log("Background script loaded!");

let intervalMinutes = 60;
let isAutoRunning = false;
let breaksToday = 0;
let breakWindowId = null; // Track single popup ID
let isBreakOpening = false;

// === Load settings ===
chrome.storage.local.get(["intervalMinutes", "isAutoRunning", "breaksToday"], (result) => {
  console.log("Loaded settings:", result);
  if (result.intervalMinutes) intervalMinutes = result.intervalMinutes;
  if (result.breaksToday) breaksToday = result.breaksToday;

  if (result.isAutoRunning) {
    isAutoRunning = true;
    startAlarm();
  }
});

// === Message handling ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.action === "startAutoMode") {
    isAutoRunning = true;
    intervalMinutes = message.interval;
    chrome.storage.local.set({ isAutoRunning: true, intervalMinutes });
    startAlarm();
    sendResponse({ success: true });

  } else if (message.action === "stopAutoMode") {
    isAutoRunning = false;
    chrome.storage.local.set({ isAutoRunning: false });
    chrome.alarms.clear("waterBreak");
    sendResponse({ success: true });

  } else if (message.action === "startBreakNow") {
    triggerBreak(true); // force mode
    sendResponse({ success: true });

  } else if (message.action === "getStatus") {
    sendResponse({ isAutoRunning, intervalMinutes, breaksToday });
  }

  return true;
});

// === Create periodic alarm ===
function startAlarm() {
  chrome.alarms.clear("waterBreak");
  chrome.alarms.create("waterBreak", {
    delayInMinutes: intervalMinutes,
    periodInMinutes: intervalMinutes,
  });
  console.log(`Alarm created to trigger every ${intervalMinutes} minutes.`);
}

// === Alarm handler ===
chrome.alarms.onAlarm.removeListener(handleAlarm);
chrome.alarms.onAlarm.addListener(handleAlarm);
async function handleAlarm(alarm) {
  if (alarm.name === "waterBreak") triggerBreak();
}

// === Trigger Break ===
async function triggerBreak(force = false) {
  console.log("triggerBreak called!", { force });

  if (isBreakOpening) {
    console.log("⚠️ Break creation already in progress.");
    return;
  }
  isBreakOpening = true;

  try {
    // Check if a popup already exists
    if (breakWindowId !== null) {
      const win = await chrome.windows.get(breakWindowId).catch(() => null);
      if (win) {
        if (force) {
          console.log("Force mode — closing existing popup.");
          await chrome.windows.remove(breakWindowId);
          await new Promise((r) => setTimeout(r, 400));
        } else {
          console.log("Popup already open — focusing.");
          await chrome.windows.update(breakWindowId, { focused: true });
          isBreakOpening = false;
          return;
        }
      } else {
        // Stale ID
        breakWindowId = null;
      }
    }

    breaksToday++;
    chrome.storage.local.set({ breaksToday });

    console.log("🚀 Creating popup...");
    const win = await chrome.windows.create({
      url: "pip-window.html",
      type: "popup",
      width: 600,
      height: 400,
      focused: true,
    });

    breakWindowId = win.id;
    console.log("✅ Break popup created:", win.id);

    chrome.runtime.sendMessage({ action: "resetCountdown", interval: intervalMinutes });
  } catch (err) {
    console.error("❌ Error creating popup:", err);
  } finally {
    isBreakOpening = false;
  }
}

// === Monitor popup close ===
chrome.windows.onRemoved.addListener(async (closedId) => {
  if (closedId === breakWindowId) {
    console.log("Popup closed — clearing breakWindowId.");
    breakWindowId = null;
    isBreakOpening = false;
  }
});

// === Daily reset ===
chrome.alarms.create("resetDaily", {
  when: getNextMidnight(),
  periodInMinutes: 1440,
});

chrome.alarms.onAlarm.removeListener(handleDailyReset);
chrome.alarms.onAlarm.addListener(handleDailyReset);

async function handleDailyReset(alarm) {
  if (alarm.name === "resetDaily") {
    breaksToday = 0;
    await chrome.storage.local.set({ breaksToday: 0 });
  }
}

function getNextMidnight() {
  const now = new Date();
  now.setHours(24, 0, 0, 0);
  return now.getTime();
}

console.log("Background script setup complete!");
