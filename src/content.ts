// Content script for manipulating webpage backgrounds

let originalBackground: string | null = null;
let currentBackgroundImage: string | null = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'changeBackground') {
    changePageBackground(request.imageUrl);
    sendResponse({ success: true });
  } else if (request.action === 'restoreBackground') {
    restoreOriginalBackground();
    sendResponse({ success: true });
  } else if (request.action === 'getBackgroundInfo') {
    sendResponse({
      hasOriginal: originalBackground !== null,
      currentImage: currentBackgroundImage
    });
  }
});

function changePageBackground(imageUrl: string) {
  const body = document.body;
  
  // Store original background if not already stored
  if (originalBackground === null) {
    originalBackground = body.style.background || '';
  }
  
  // Apply new background
  body.style.background = `url("${imageUrl}") center center / cover no-repeat fixed`;
  body.style.backgroundAttachment = 'fixed';
  currentBackgroundImage = imageUrl;
  
  console.log('Background changed to:', imageUrl);
}

function restoreOriginalBackground() {
  if (originalBackground !== null) {
    document.body.style.background = originalBackground;
    currentBackgroundImage = null;
    console.log('Background restored to original');
  }
}

// Initialize
console.log('AI Background Shifter content script loaded');