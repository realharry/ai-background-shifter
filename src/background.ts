// Background script for Chrome extension
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Inject content script into tab if needed and ensure it's ready
async function ensureContentScript(tabId: number): Promise<boolean> {
  try {
    // First check if content script is already loaded
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return !!(window as any).aiBackgroundShifterLoaded;
      }
    });

    if (result.result) {
      console.log('Content script already loaded');
      return true;
    }

    console.log('Content script not loaded, injecting...');
    // Inject the content script manually
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });

    // Wait a moment for script to initialize
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify injection was successful
    const [verifyResult] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return !!(window as any).aiBackgroundShifterLoaded;
      }
    });

    return verifyResult.result || false;
  } catch (error) {
    console.error('Failed to ensure content script:', error);
    return false;
  }
}

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

// Handle content script ready signals
const contentScriptReadyTabs = new Set<number>();

// Enhanced message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle content script ready signal
  if (request.action === 'contentScriptReady' && sender.tab?.id) {
    contentScriptReadyTabs.add(sender.tab.id);
    console.log('Content script ready for tab:', sender.tab.id);
    sendResponse({ success: true });
    return true;
  }

  // Handle background change actions
  if (request.action === 'changeBackground' || request.action === 'restoreBackground' || request.action === 'getBackgroundInfo') {
    // Forward message to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        const tabId = tabs[0].id;
        
        // Ensure content script is available
        const scriptReady = await ensureContentScript(tabId);
        
        if (!scriptReady) {
          sendResponse({ 
            success: false, 
            error: 'Failed to load content script. Please refresh the page and try again.' 
          });
          return;
        }
        
        // Try to send message with retry
        const sendMessageWithRetry = (attempts: number = 3): void => {
          chrome.tabs.sendMessage(tabId, request, (response) => {
            if (chrome.runtime.lastError) {
              console.error(`Attempt ${4 - attempts}: Error sending message to content script:`, chrome.runtime.lastError.message);
              
              if (attempts > 1 && chrome.runtime.lastError.message?.includes('Could not establish connection')) {
                // Retry after a short delay
                setTimeout(() => sendMessageWithRetry(attempts - 1), 200);
              } else {
                sendResponse({ 
                  success: false, 
                  error: `Connection failed: ${chrome.runtime.lastError.message}. Please refresh the page and try again.` 
                });
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
  } 
  
  // Handle AI image generation
  if (request.action === 'generateImage') {
    generateImage(request.prompt)
      .then(imageUrl => {
        sendResponse({ success: true, imageUrl });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  // Unknown action
  sendResponse({ success: false, error: 'Unknown action: ' + request.action });
  return false;
});