// Content script for manipulating webpage backgrounds

let originalBackground: string | null = null;
let currentBackgroundImage: string | null = null;
let isReady = false;

// Add global flag to detect content script presence
(window as any).aiBackgroundShifterLoaded = true;

// Wait for DOM to be ready
const init = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      isReady = true;
      console.log('AI Background Shifter content script ready');
    });
  } else {
    isReady = true;
    console.log('AI Background Shifter content script ready');
  }
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // Ensure we're ready to operate
  if (!isReady) {
    sendResponse({ success: false, error: 'Content script not ready' });
    return;
  }

  try {
    if (request.action === 'changeBackground') {
      changePageBackground(request.imageUrl);
      sendResponse({ success: true });
    } else if (request.action === 'restoreBackground') {
      restoreOriginalBackground();
      sendResponse({ success: true });
    } else if (request.action === 'getBackgroundInfo') {
      sendResponse({
        success: true,
        hasOriginal: originalBackground !== null,
        currentImage: currentBackgroundImage
      });
    } else {
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Content script error:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
  
  return true; // Keep message channel open for async response
});

function changePageBackground(imageUrl: string) {
  const body = document.body;
  
  if (!body) {
    throw new Error('Document body not available');
  }
  
  // Store original background if not already stored
  if (originalBackground === null) {
    originalBackground = window.getComputedStyle(body).background || '';
  }
  
  // Apply new background
  body.style.background = `url("${imageUrl}") center center / cover no-repeat fixed`;
  body.style.backgroundAttachment = 'fixed';
  currentBackgroundImage = imageUrl;
  
  console.log('Background changed to:', imageUrl);
}

function restoreOriginalBackground() {
  const body = document.body;
  
  if (!body) {
    throw new Error('Document body not available');
  }
  
  if (originalBackground !== null) {
    body.style.background = originalBackground;
    currentBackgroundImage = null;
    console.log('Background restored to original');
  } else {
    console.log('No original background to restore');
  }
}

// Initialize
init();
console.log('AI Background Shifter content script loaded');