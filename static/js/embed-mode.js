// Embed mode detection script
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Function to check for embed parameter and remove unwanted elements
  function checkEmbedMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbed = urlParams.get('embed') === 'true';
    
    if (isEmbed) {
      document.body.classList.add('embed-mode');
      
      // Remove unwanted elements from DOM
      removeElements();
      
      // Adjust layout for embedded experience
      adjustLayoutForEmbed();
      
      // Handle hash scrolling if present
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        console.log(`[embed-mode] Detected hash in URL: #${targetId}`);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          console.log(`[embed-mode] Scrolling to element with id: ${targetId}`);
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
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

  // Function to remove unwanted elements from DOM
  function removeElements() {
    const selectorsToRemove = [
      '.navbar',
      '.theme-doc-sidebar-container',
      '.theme-doc-breadcrumbs',
      '.footer',
      '.announcement',
      '.custom-announcement-bar',
      '.table-of-contents',
      '.theme-doc-toc-desktop',
      '.theme-doc-toc-mobile',
      '.pagination-nav',
      '.theme-edit-this-page',
      '.theme-last-updated',
      '.col--3' // Table of contents column
    ];

    selectorsToRemove.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        console.log(`[embed-mode] Removing element: ${selector}`);
        element.remove();
      });
    });
  }

  // Function to adjust layout for embedded experience
  function adjustLayoutForEmbed() {
    // Set CSS custom properties for layout adjustments
    document.documentElement.style.setProperty('--doc-sidebar-width', '0px');
    
    // Adjust main wrapper and content
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
      mainWrapper.style.marginLeft = '0';
    }

    const docPageWrapper = document.querySelector('.theme-doc-page-wrapper');
    if (docPageWrapper) {
      docPageWrapper.style.marginLeft = '0';
    }

    // Adjust container padding
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      container.style.maxWidth = '100%';
      container.style.padding = '1rem';
    });

    // Expand markdown content to full width
    const markdownContent = document.querySelector('.theme-doc-markdown');
    if (markdownContent) {
      markdownContent.style.maxWidth = '100%';
    }

    // Remove top margin
    const docusaurusMtLg = document.querySelector('.docusaurus-mt-lg');
    if (docusaurusMtLg) {
      docusaurusMtLg.style.marginTop = '0';
    }

    console.log('[embed-mode] Layout adjusted for embedded experience');
  }

  // Function to run embed mode with proper timing
  function runEmbedMode() {
    // Add a small delay to ensure DOM is fully rendered
    setTimeout(checkEmbedMode, 50);
  }

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEmbedMode);
  } else {
    runEmbedMode();
  }

  // Listen for URL changes (for single page app navigation)
  window.addEventListener('popstate', runEmbedMode);
  
  // Also check when the page loads in case of direct navigation
  window.addEventListener('load', runEmbedMode);

  // Watch for dynamic content changes (for SPAs)
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      // Only run if we're in embed mode and significant DOM changes occurred
      const urlParams = new URLSearchParams(window.location.search);
      const isEmbed = urlParams.get('embed') === 'true';
      
      if (isEmbed) {
        const significantChange = mutations.some(mutation => 
          mutation.type === 'childList' && 
          mutation.addedNodes.length > 0 &&
          Array.from(mutation.addedNodes).some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node.classList?.contains('navbar') || 
             node.classList?.contains('theme-doc-sidebar-container') ||
             node.classList?.contains('footer'))
          )
        );
        
        if (significantChange) {
          console.log('[embed-mode] Detected re-added navigation elements, removing again');
          setTimeout(() => {
            removeElements();
            adjustLayoutForEmbed();
          }, 100);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})(); 