// Inject data on load
chrome.storage.local.get(null, (allData) => {
  const script = document.createElement('script');
  script.textContent = `
    window.__TRIMSUB_USAGE__ = ${JSON.stringify(allData)}; 
    window.dispatchEvent(new CustomEvent('TrimSubUsageUpdated'));
  `;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
});

// Listen for updates and inject immediately
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(null, (allData) => {
      const script = document.createElement('script');
      script.textContent = `
        window.__TRIMSUB_USAGE__ = ${JSON.stringify(allData)}; 
        window.dispatchEvent(new CustomEvent('TrimSubUsageUpdated'));
      `;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    });
  }
});

// Listen for updates from the dashboard (e.g., manual adds)
window.addEventListener('TrimSubSubscriptionsUpdated', (e) => {
  try {
    const subs = typeof e.detail === 'string' ? JSON.parse(e.detail) : e.detail;
    chrome.storage.local.set({ 'trimsub_subs': subs });
  } catch (err) {
    console.error("Failed to parse subscriptions from dashboard", err);
  }
});
