// Embed mode detection script
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Function to check for embed parameter and remove unwanted elements
  function prepareEmbeddedPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbed = urlParams.get('embed') === 'true';
    
    if (isEmbed) {
      document.body.classList.add('embed-mode');
      
      inheritParentTheme();
      removeElements();  
      adjustLayout();
      makeLinksOpenInNewTab();
      scrollToHash();
      
    } else {
      document.body.classList.remove('embed-mode');
    }
  }

  function inheritParentTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    
    if (themeParam && (themeParam === 'dark' || themeParam === 'light')) {
      console.log(`[embed-mode] Found theme parameter: ${themeParam}`);
      applyTheme(themeParam);
    } else {
      console.log('[embed-mode] No theme parameter found, using default theme');
    }
  }

  function scrollToHash() {
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
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    
    html.setAttribute('data-theme', theme);
    
    // Force a style recalculation
    body.style.display = 'none';
    body.offsetHeight; // Trigger reflow
    body.style.display = '';
  }

  function makeLinksOpenInNewTab() {
    // Select all anchor tags that do not already have target="_blank"
    const links = document.querySelectorAll('a[href]:not([target="_blank"])');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function removeElements() {
    const selectorsToRemove = [
      '.theme-doc-sidebar-container',
      '.theme-doc-breadcrumbs',
      '.footer',
      '.announcement',
      '.navbar',
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

  function adjustLayout() {
    // # TODO: Make bg transparent
    document.documentElement.style.setProperty('background-color', '#1e1c26');
    document.body.style.setProperty('background-color', '#1e1c26');

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

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prepareEmbeddedPage);
  } else {
    prepareEmbeddedPage();
  }

  // Listen for URL changes (for single page app navigation)
  window.addEventListener('popstate', prepareEmbeddedPage);
  
  // Also check when the page loads in case of direct navigation
  window.addEventListener('load', prepareEmbeddedPage);
})(); 