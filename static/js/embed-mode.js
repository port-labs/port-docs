// Embed mode detection script
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Function to check for embed parameter and apply class
  function checkEmbedMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbed = urlParams.get('embed') === 'true';
    
    if (isEmbed) {
      document.body.classList.add('embed-mode');
      // Also hide any scrollbars for a cleaner embedded experience
      document.documentElement.style.overflow = 'auto';
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        console.log(`[embed-mode] Detected hash in URL: #${targetId}`);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          console.log(`[embed-mode] Scrolling to element with id: ${targetId}`);
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.warn(`[embed-mode] No element found with id: ${targetId}`);
        }
      } else {
        console.log('[embed-mode] No hash found in URL, no scrolling performed.');
      }
            
    } else {
      document.body.classList.remove('embed-mode');
    }
  }

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkEmbedMode);
  } else {
    checkEmbedMode();
  }

  // Listen for URL changes (for single page app navigation)
  window.addEventListener('popstate', checkEmbedMode);
  
  // Also check when the page loads in case of direct navigation
  window.addEventListener('load', checkEmbedMode);
})(); 