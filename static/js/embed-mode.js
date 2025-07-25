// Embed mode detection script
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbed = urlParams.get('embed') === 'true';
    const themeParam = urlParams.get('theme');
    
    if (isEmbed && themeParam) {
      const html = document.documentElement;
      html.setAttribute('data-theme', themeParam);
    }
  } catch (e) {
    console.log('[embed-mode] Early theme application failed:', e.message);
  }

  // Function to check for embed parameter and remove unwanted elements
  function checkEmbedMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbed = urlParams.get('embed') === 'true';
    
    if (isEmbed) {
      document.body.classList.add('embed-mode');
      
      // Apply theme FIRST before anything else
      inheritParentTheme();
      
      // Wait a bit for theme to apply, then proceed with layout changes
      setTimeout(() => {
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
      }, 100);
    } else {
      document.body.classList.remove('embed-mode');
    }
  }

  // Function to inherit theme from URL parameter
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

  // Function to apply theme using Docusaurus's built-in theme system
  function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    
    html.setAttribute('data-theme', theme);
    
    // Force a style recalculation
    body.style.display = 'none';
    body.offsetHeight; // Trigger reflow
    body.style.display = '';
  }

  // Function to remove unwanted elements from DOM and replace navbar
  function removeElements() {
    // Replace navbar with custom embed navbar
    // replaceNavbar();
    
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

  // Function to replace the navbar with a custom embed navbar
  function replaceNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      // Get the current page URL without the embed parameter
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('embed');
      const docsUrl = currentUrl.toString();
      
      // Get current theme
      const urlParams = new URLSearchParams(window.location.search);
      const currentTheme = urlParams.get('theme') || 'light';
      
      // Create custom embed navbar
      const embedNavbar = document.createElement('nav');
      embedNavbar.className = 'navbar navbar--fixed-top navbar--dark embed-navbar';
      
      // Force a reflow to ensure CSS variables are available
      setTimeout(() => {
        embedNavbar.style.cssText = `
          background-color: var(--ifm-navbar-background-color) !important;
          border-bottom: 1px solid var(--ifm-color-emphasis-200) !important;
          padding: 0.5rem 1rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          min-height: 60px !important;
          box-shadow: var(--ifm-navbar-shadow) !important;
          z-index: var(--ifm-z-index-fixed) !important;
        `;
      }, 50);
      
      // Create logo/title section
      const logoSection = document.createElement('div');
      logoSection.className = 'navbar__brand';
      setTimeout(() => {
        logoSection.style.cssText = `
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          font-weight: 600 !important;
          color: var(--ifm-navbar-link-color) !important;
          font-size: 1.1rem !important;
          font-family: var(--ifm-font-family-base) !important;
        `;
      }, 50);
      logoSection.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        Port Documentation
      `;
      
      // Create "View Full Docs" button
      const docsButton = document.createElement('a');
      docsButton.href = docsUrl;
      docsButton.target = '_blank';
      docsButton.rel = 'noopener noreferrer';
      docsButton.className = 'button button--primary';
      setTimeout(() => {
        docsButton.style.cssText = `
          background-color: var(--ifm-color-primary) !important;
          color: var(--ifm-color-primary-contrast-foreground) !important;
          padding: 0.5rem 1rem !important;
          border-radius: 6px !important;
          text-decoration: none !important;
          font-weight: 500 !important;
          font-size: 0.9rem !important;
          font-family: var(--ifm-font-family-base) !important;
          transition: all 0.2s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          border: 1px solid var(--ifm-color-primary) !important;
        `;
      }, 50);
      
      // Add external link icon
      docsButton.innerHTML = `
        View Full Docs
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
        </svg>
      `;
      
      // Add hover effect
      docsButton.addEventListener('mouseenter', () => {
        docsButton.style.opacity = '0.85';
        docsButton.style.transform = 'translateY(-1px)';
      });
      docsButton.addEventListener('mouseleave', () => {
        docsButton.style.opacity = '1';
        docsButton.style.transform = 'translateY(0)';
      });
      
      embedNavbar.appendChild(logoSection);
      embedNavbar.appendChild(docsButton);
      
      // Replace the original navbar
      navbar.parentNode.replaceChild(embedNavbar, navbar);
      console.log(`[embed-mode] Replaced navbar with embed navbar (theme: ${currentTheme})`);
    }
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
    // Apply theme immediately if embed mode is detected
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbed = urlParams.get('embed') === 'true';
    const themeParam = urlParams.get('theme');
    
    if (isEmbed && themeParam) {
      console.log(`[embed-mode] Applying theme immediately: ${themeParam}`);
      applyTheme(themeParam);
    }
    
    // Then proceed with full embed mode setup
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
            (node.classList?.contains('navbar') && !node.classList?.contains('embed-navbar') || 
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