// Background script for Chrome extension
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Inject content script into tab if needed
async function ensureContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Check if our content script is already loaded
        if (!(window as any).aiBackgroundShifterLoaded) {
          console.log('Content script not detected, will be injected via manifest');
        }
      }
    });
  } catch (error) {
    console.log('Could not check content script status:', error);
  }
}

// Handle messages from content script and sidepanel
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'changeBackground' || request.action === 'restoreBackground' || request.action === 'getBackgroundInfo') {
    // Forward message to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        const tabId = tabs[0].id;
        
        // Ensure content script is available
        await ensureContentScript(tabId);
        
        // Try to send message with retry
        const sendMessageWithRetry = (attempts: number = 3) => {
          chrome.tabs.sendMessage(tabId, request, (response) => {
            if (chrome.runtime.lastError) {
              console.error(`Attempt ${4 - attempts}: Error sending message to content script:`, chrome.runtime.lastError.message);
              
              if (attempts > 1 && chrome.runtime.lastError.message?.includes('Could not establish connection')) {
                // Retry after a short delay
                setTimeout(() => sendMessageWithRetry(attempts - 1), 100);
              } else {
                sendResponse({ success: false, error: `Connection failed: ${chrome.runtime.lastError.message}. Please refresh the page and try again.` });
              }
            } else {
              sendResponse(response || { success: false, error: 'No response from content script' });
            }
          });
        };
        
        sendMessageWithRetry();
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