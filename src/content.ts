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
  const html = document.documentElement;
  
  if (!body) {
    throw new Error('Document body not available');
  }
  
  // Store original background if not already stored
  if (originalBackground === null) {
    const bodyStyle = window.getComputedStyle(body);
    const htmlStyle = window.getComputedStyle(html);
    originalBackground = JSON.stringify({
      body: {
        background: bodyStyle.background || '',
        backgroundColor: bodyStyle.backgroundColor || '',
        backgroundImage: bodyStyle.backgroundImage || '',
        backgroundSize: bodyStyle.backgroundSize || '',
        backgroundPosition: bodyStyle.backgroundPosition || '',
        backgroundRepeat: bodyStyle.backgroundRepeat || '',
        backgroundAttachment: bodyStyle.backgroundAttachment || ''
      },
      html: {
        background: htmlStyle.background || '',
        backgroundColor: htmlStyle.backgroundColor || '',
        backgroundImage: htmlStyle.backgroundImage || ''
      }
    });
  }
  
  // Create or update CSS injection for better control and higher specificity
  let styleElement = document.getElementById('ai-background-shifter-style') as HTMLStyleElement;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'ai-background-shifter-style';
    document.head.appendChild(styleElement);
  }
  
  // Enhanced CSS with background on html/body and transparent children for visibility
  // This approach targets common layout wrappers that block backgrounds
  const css = `
    /* Set background on html and body elements */
    html {
      background-image: url("${imageUrl}") !important;
      background-size: cover !important;
      background-position: center center !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
      min-height: 100vh !important;
    }
    
    body {
      background: transparent !important;
      min-height: 100vh !important;
    }
    
    /* Make all child elements transparent so background shows through */
    body * {
      background-color: transparent !important;
      background-image: none !important;
    }
    
    /* Target common layout wrappers specifically for maximum compatibility */
    body > div,
    body > main,
    body > section,
    body > article,
    [class*="wrapper"],
    [class*="container"],
    [class*="layout"],
    [class*="page"],
    [class*="main"],
    [class*="content"],
    [class*="app"],
    [class*="root"],
    [id*="wrapper"],
    [id*="container"],
    [id*="layout"],
    [id*="page"],
    [id*="main"],
    [id*="content"],
    [id*="app"],
    [id*="root"] {
      background-color: transparent !important;
      background-image: none !important;
      background: transparent !important;
    }
    
    /* Target GitHub-specific and common site-specific wrappers with maximum specificity */
    .application-main,
    .js-header-wrapper,
    .Header,
    .PageLayout,
    .PageLayout-content,
    .js-page-layout,
    #js-pjax-container,
    .container-xl,
    .container-lg,
    .Layout,
    .Layout-main,
    .Layout-sidebar,
    main[role="main"],
    div[data-pjax-container],
    .site-wrapper,
    .page-wrapper,
    .main-wrapper,
    .content-wrapper {
      background-color: transparent !important;
      background-image: none !important;
      background: transparent !important;
    }
    
    /* Extra aggressive approach - target divs that are likely full-page wrappers */
    body > div:first-child,
    body > div[class]:first-child,
    body > div[id]:first-child,
    body > main:first-child,
    div[style*="height: 100"],
    div[style*="min-height: 100"],
    div[class][style*="background"] {
      background-color: transparent !important;
      background-image: none !important;
      background: transparent !important;
    }
    
    /* Preserve backgrounds for specific elements that need them for functionality */
    img, video, canvas, iframe, 
    input[type="submit"], input[type="button"], button,
    .btn, [role="button"],
    select, textarea, input[type="text"], input[type="email"], input[type="password"], input[type="search"],
    .dropdown-menu, .modal, .popup, .tooltip, .alert, .notification,
    pre, code, .code, .highlight,
    .logo, .icon, [class*="icon"], [class*="logo"],
    .avatar, .profile-picture,
    .card, .panel, .widget {
      background-color: revert !important;
      background-image: revert !important;
    }
    
    /* Ensure proper contrast for text readability while keeping backgrounds transparent */
    body *, body *:before, body *:after {
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.3) !important;
    }
    
    /* Don't apply text shadow to buttons and form elements */
    button, input, select, textarea, .btn, [role="button"],
    img, video, canvas, .avatar, .profile-picture,
    .card, .panel, .widget {
      text-shadow: none !important;
    }
  `;
  
  styleElement.textContent = css;
  
  // Dynamic element detection and handling - find elements that might be blocking
  // Target elements that are likely to be full-page wrappers
  const findAndProcessWrapperElements = () => {
    // Look for elements with specific characteristics that suggest they're blocking wrappers
    const potentialWrappers = Array.from(document.querySelectorAll('div, main, section')).filter(el => {
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el);
      
      // Check if element takes up significant screen space and has a background
      return (
        rect.width >= window.innerWidth * 0.8 && // Takes up most of width
        rect.height >= window.innerHeight * 0.5 && // Takes up significant height
        (
          computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          computedStyle.backgroundColor !== 'transparent' &&
          computedStyle.backgroundColor !== ''
        )
      );
    });
    
    // Make these wrapper elements transparent
    potentialWrappers.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.setProperty('background-color', 'transparent', 'important');
      htmlEl.style.setProperty('background-image', 'none', 'important');
      htmlEl.style.setProperty('background', 'transparent', 'important');
      
      console.log('Made wrapper element transparent:', htmlEl.className || htmlEl.tagName, htmlEl);
    });
    
    return potentialWrappers.length;
  };
  
  // Apply dynamic processing immediately and after a short delay for late-loading content
  const wrappersFound = findAndProcessWrapperElements();
  setTimeout(() => {
    const laterWrappers = findAndProcessWrapperElements();
    if (laterWrappers > 0) {
      console.log(`Found and processed ${laterWrappers} additional wrapper elements after delay`);
    }
  }, 500);
  
  // Also apply directly to html as fallback
  html.style.backgroundImage = `url("${imageUrl}")`;
  html.style.backgroundSize = 'cover';
  html.style.backgroundPosition = 'center center';
  html.style.backgroundRepeat = 'no-repeat';
  html.style.backgroundAttachment = 'fixed';
  html.style.minHeight = '100vh';
  
  // Make body transparent so html background shows through
  body.style.background = 'transparent';
  body.style.minHeight = '100vh';
  
  currentBackgroundImage = imageUrl;
  
  console.log('Background changed to:', imageUrl);
  console.log('Applied enhanced transparent child elements approach with dynamic wrapper detection');
  console.log(`Found and processed ${wrappersFound} wrapper elements initially`);
}

function restoreOriginalBackground() {
  const body = document.body;
  const html = document.documentElement;
  
  if (!body) {
    throw new Error('Document body not available');
  }
  
  // Remove the injected CSS
  const styleElement = document.getElementById('ai-background-shifter-style');
  if (styleElement) {
    styleElement.remove();
  }
  
  if (originalBackground !== null) {
    try {
      const original = JSON.parse(originalBackground);
      
      // Restore body styles
      const bodyOriginal = original.body || {};
      body.style.backgroundImage = bodyOriginal.backgroundImage || '';
      body.style.backgroundSize = bodyOriginal.backgroundSize || '';
      body.style.backgroundPosition = bodyOriginal.backgroundPosition || '';
      body.style.backgroundRepeat = bodyOriginal.backgroundRepeat || '';
      body.style.backgroundAttachment = bodyOriginal.backgroundAttachment || '';
      body.style.backgroundColor = bodyOriginal.backgroundColor || '';
      body.style.background = bodyOriginal.background || '';
      body.style.minHeight = '';
      
      // Restore html styles
      const htmlOriginal = original.html || {};
      html.style.backgroundImage = htmlOriginal.backgroundImage || '';
      html.style.backgroundColor = htmlOriginal.backgroundColor || '';
      html.style.background = htmlOriginal.background || '';
      html.style.minHeight = '';
      
      currentBackgroundImage = null;
      console.log('Background restored to original with child elements restored');
    } catch (error) {
      console.error('Error restoring background:', error);
      // Fallback: just clear all background styles
      body.style.backgroundImage = '';
      body.style.backgroundSize = '';
      body.style.backgroundPosition = '';
      body.style.backgroundRepeat = '';
      body.style.backgroundAttachment = '';
      body.style.backgroundColor = '';
      body.style.background = '';
      body.style.minHeight = '';
      
      html.style.backgroundImage = '';
      html.style.backgroundColor = '';
      html.style.background = '';
      html.style.minHeight = '';
      
      currentBackgroundImage = null;
      console.log('Background cleared (fallback restoration)');
    }
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