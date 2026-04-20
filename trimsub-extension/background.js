let activeTabId = null;
let activeDomain = null;
let startTime = null;

const knownSubscriptions = {
  "netflix.com": "sub_1",
  "adobe.com": "sub_2",
  "spotify.com": "sub_3",
  "amazon.com": "sub_6"
};

function getDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '');
  } catch(e) {
    return null;
  }
}

function updateTimeSpent() {
  if (activeDomain && startTime && knownSubscriptions[activeDomain]) {
    const timeSpent = Date.now() - startTime;
    const subId = knownSubscriptions[activeDomain];
    
    chrome.storage.local.get([subId], (result) => {
      const currentTotal = result[subId] || 0;
      chrome.storage.local.set({ [subId]: currentTotal + timeSpent });
    });
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTimeSpent();
  
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    activeTabId = activeInfo.tabId;
    activeDomain = getDomain(tab.url);
    startTime = Date.now();
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (activeTabId === tabId && tab.url) {
    updateTimeSpent();
    activeDomain = getDomain(tab.url);
    startTime = Date.now();
  }
});

// Set up periodic sync alarm
chrome.alarms.create("syncData", { periodInMinutes: 1 });

async function flushToBackend() {
  const data = await chrome.storage.local.get(null);
  
  // Extract only usage data (sub_* keys with number values)
  const usageStats = {};
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('sub_') && typeof value === 'number') {
      usageStats[key] = value;
    }
  }

  if (Object.keys(usageStats).length === 0) {
    console.log("[TrimSub BG] No usage data to sync.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usageStats)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("[TrimSub BG] Synced OK:", result);
    } else {
      console.error("[TrimSub BG] Server responded with:", response.status);
    }
  } catch (err) {
    console.error("[TrimSub BG] Sync failed:", err);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncData") {
    flushToBackend();
  }
});

// Listen for manual force sync from popup UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'forceSync') {
    flushToBackend().then(() => sendResponse({ success: true }));
    return true;
  }
});
