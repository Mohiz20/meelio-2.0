import { TimerMessage } from '@repo/shared'

let interval: NodeJS.Timeout | null = null
let endTime = 0

const clean = () => {
  if (interval) clearInterval(interval);
  interval = null;
  endTime = 0;
};

const remaining = (): number =>
  Math.max(0, Math.ceil((endTime - Date.now()) / 1000))

// Timer message listener
chrome.runtime.onMessage.addListener((msg: TimerMessage) => {
  switch (msg.type) {
    case 'START':
      clean();
      endTime = Date.now() + msg.duration * 1000;
      chrome.runtime.sendMessage({ type: 'TICK', remaining: msg.duration });
      interval = setInterval(() => {
        const left = remaining();
        if (left <= 0) {
          chrome.runtime.sendMessage({ type: 'TICK', remaining: 0 });
          chrome.runtime.sendMessage({ type: 'STAGE_COMPLETE' });
          clean();
        } else {
          chrome.runtime.sendMessage({ type: 'TICK', remaining: left });
        }
      }, 1000);
      break;
    case 'PAUSE':
      if (interval) {
        clearInterval(interval);
        interval = null;
        chrome.runtime.sendMessage({ type: 'PAUSED', remaining: remaining() });
      }
      break;
    case 'RESET':
      clean();
      chrome.runtime.sendMessage({ type: 'RESET_COMPLETE' });
      break;
    case 'UPDATE_DURATION':
      endTime = Date.now() + msg.duration * 1000;
      break;
    case 'SKIP_TO_NEXT_STAGE':
      clean();
      break;
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("newtab.html") })
})

// ============================================
// Dawlance Portal Auto-Refresh Functionality
// ============================================

const DAWLANCE_ALARM_NAME = 'dawlanceRefresh';
const DEFAULT_REFRESH_INTERVAL = 30; // minutes

// Setup auto-refresh alarm on install/update
chrome.runtime.onInstalled.addListener(async () => {
  // Get settings from storage
  const result = await chrome.storage.local.get(['meelio:local:dawlance-portal']);

  if (result['meelio:local:dawlance-portal']) {
    const stored = JSON.parse(result['meelio:local:dawlance-portal']);
    const settings = stored.state?.settings;

    if (settings?.autoRefresh) {
      const interval = settings.refreshInterval || DEFAULT_REFRESH_INTERVAL;

      // Create alarm for periodic refresh
      chrome.alarms.create(DAWLANCE_ALARM_NAME, {
        periodInMinutes: interval
      });

      console.log(`Dawlance Portal auto-refresh enabled (every ${interval} minutes)`);
    }
  }
});

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === DAWLANCE_ALARM_NAME) {
    console.log('Dawlance Portal: Auto-refresh triggered');
    refreshDawlanceData();
  }
});

// Refresh Dawlance Portal data
async function refreshDawlanceData() {
  try {
    // Query for active tabs
    const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL("newtab.html") });

    if (tabs.length > 0) {
      // If extension tab is open, send message to trigger refresh
      for (const tab of tabs) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'refreshDawlancePortal' });
          } catch (error) {
            console.log('Could not send message to tab:', error);
          }
        }
      }
    } else {
      // No extension tab open, fetch data directly via service worker
      // This would require importing the service, but we'll skip for now
      // Users can manually refresh when they open the extension
      console.log('No extension tab open, skipping auto-refresh');
    }
  } catch (error) {
    console.error('Failed to refresh Dawlance Portal data:', error);
  }
}

// Listen for settings changes to update alarm
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes['meelio:local:dawlance-portal']) {
    const newValue = changes['meelio:local:dawlance-portal'].newValue;

    if (newValue) {
      const stored = JSON.parse(newValue);
      const settings = stored.state?.settings;

      if (settings?.autoRefresh) {
        const interval = settings.refreshInterval || DEFAULT_REFRESH_INTERVAL;

        // Update alarm with new interval
        chrome.alarms.clear(DAWLANCE_ALARM_NAME).then(() => {
          chrome.alarms.create(DAWLANCE_ALARM_NAME, {
            periodInMinutes: interval
          });
          console.log(`Dawlance Portal auto-refresh updated (every ${interval} minutes)`);
        });
      } else {
        // Auto-refresh disabled, clear alarm
        chrome.alarms.clear(DAWLANCE_ALARM_NAME);
        console.log('Dawlance Portal auto-refresh disabled');
      }
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'dataUpdated') {
    console.log('Dawlance Portal data updated by content script');
    // Optionally notify any open extension tabs
    chrome.runtime.sendMessage({ action: 'dawlanceDataUpdated' }).catch(() => {
      // Ignore if no listeners
    });
  }
  return true;
});