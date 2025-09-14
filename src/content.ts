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

// Robust message listener with proper error handling
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // Always acknowledge the message
  let responseHandled = false;
  
  const handleResponse = (response: any) => {
    if (!responseHandled) {
      responseHandled = true;
      sendResponse(response);
    }
  };

  // Ensure we're ready to operate
  if (!isReady) {
    handleResponse({ success: false, error: 'Content script not ready' });
    return true;
  }

  try {
    if (request.action === 'changeBackground') {
      if (!request.imageUrl) {
        handleResponse({ success: false, error: 'No image URL provided' });
        return true;
      }
      
      changePageBackground(request.imageUrl);
      handleResponse({ success: true, message: 'Background changed successfully' });
    } else if (request.action === 'restoreBackground') {
      restoreOriginalBackground();
      handleResponse({ success: true, message: 'Background restored successfully' });
    } else if (request.action === 'getBackgroundInfo') {
      handleResponse({
        success: true,
        hasOriginal: originalBackground !== null,
        currentImage: currentBackgroundImage
      });
    } else {
      handleResponse({ success: false, error: 'Unknown action: ' + request.action });
    }
  } catch (error) {
    console.error('Content script error:', error);
    handleResponse({ success: false, error: (error as Error).message });
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
    const computedStyle = window.getComputedStyle(body);
    originalBackground = computedStyle.background || computedStyle.backgroundColor || '';
  }
  
  // Apply new background with better styling
  body.style.backgroundImage = `url("${imageUrl}")`;
  body.style.backgroundSize = 'cover';
  body.style.backgroundPosition = 'center center';
  body.style.backgroundRepeat = 'no-repeat';
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
    // Clear all background properties first
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundRepeat = '';
    body.style.backgroundAttachment = '';
    
    // Restore original background
    body.style.background = originalBackground;
    currentBackgroundImage = null;
    console.log('Background restored to original');
  } else {
    console.log('No original background to restore');
  }
}

// Initialize content script
init();
console.log('AI Background Shifter content script loaded');

// Send ready signal to background script
try {
  chrome.runtime.sendMessage({ action: 'contentScriptReady' }, (_response) => {
    // Ignore response, this is just to establish connection
    if (chrome.runtime.lastError) {
      console.log('Could not signal ready state:', chrome.runtime.lastError.message);
    }
  });
} catch (error) {
  console.log('Could not send ready signal:', error);
}