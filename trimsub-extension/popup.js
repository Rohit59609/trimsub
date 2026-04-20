// Default subscriptions (fallback if content script sync hasn't happened)
const DEFAULT_SUBS = [
  { id: 'sub_1', name: 'Netflix', status: 'active' },
  { id: 'sub_2', name: 'Adobe Creative Cloud', status: 'active' },
  { id: 'sub_3', name: 'Spotify Premium', status: 'active' },
  { id: 'sub_5', name: 'Forgotten VPN Service', status: 'active' },
  { id: 'sub_6', name: 'Amazon Prime', status: 'active' }
];

const listEl = document.getElementById('sub-list');
let currentSubs = [];

// Initialize UI
chrome.storage.local.get(null, (allData) => {
  currentSubs = allData.trimsub_subs || DEFAULT_SUBS;
  
  currentSubs.forEach(sub => {
    if (sub.status !== 'active') return;
    
    const currentMs = allData[sub.id] || 0;
    const currentHours = (currentMs / (1000 * 60 * 60)).toFixed(1);
    
    const div = document.createElement('div');
    div.className = 'sub-item';
    div.innerHTML = `
      <span class="sub-name">${sub.name}</span>
      <div>
        <input type="number" id="input-${sub.id}" class="sub-input" value="${currentHours}" min="0" step="0.5"> hrs
      </div>
    `;
    listEl.appendChild(div);
  });
});

document.getElementById('sim-sync').addEventListener('click', () => {
  const updates = {};
  const activeSubs = currentSubs.filter(s => s.status === 'active');
  
  activeSubs.forEach(sub => {
    const inputEl = document.getElementById(`input-${sub.id}`);
    if (inputEl) {
      const hours = parseFloat(inputEl.value) || 0;
      updates[sub.id] = hours * 60 * 60 * 1000; // Convert hours to milliseconds
    }
  });
  
  const btn = document.getElementById('sim-sync');
  btn.innerText = 'Syncing...';
  
  // Step 1: Save to chrome.storage.local
  chrome.storage.local.set(updates, () => {
    // Step 2: Tell background.js to POST to the Next.js API
    chrome.runtime.sendMessage({ action: 'forceSync' }, (response) => {
      btn.innerText = response?.success ? 'Synced to Dashboard!' : 'Sync Failed';
      setTimeout(() => btn.innerText = 'Sync to Dashboard', 2000);
    });
  });
});
