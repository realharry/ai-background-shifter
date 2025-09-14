// Background script for Chrome extension
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Handle messages from content script and sidepanel
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'changeBackground' || request.action === 'restoreBackground' || request.action === 'getBackgroundInfo') {
    // Forward message to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to content script:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'generateImage') {
    // Handle AI image generation
    generateImage(request.prompt)
      .then(imageUrl => {
        sendResponse({ success: true, imageUrl });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

// Mock AI image generation - in production, you would integrate with actual AI services
async function generateImage(prompt: string): Promise<string> {
  // For demo purposes, return a placeholder image
  // In production, integrate with services like OpenAI DALL-E, Stable Diffusion, etc.
  console.log('Generating image for prompt:', prompt);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a placeholder image URL - in production, this would be the actual generated image
  return `https://picsum.photos/1920/1080?random=${Date.now()}`;
}