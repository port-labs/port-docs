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
      transformNavbar();
      adjustLayout(urlParams.get('theme') ?? 'light');
      makeLinksOpenInNewTab();
      scrollToHash();
      
    } else {
      document.body.classList.remove('embed-mode');
    }
  }

  function transformNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      // Remove all children from the navbar
      while (navbar.firstChild) {
        navbar.removeChild(navbar.firstChild);
      }
      
      
      // Build a URL without 'embed' and 'theme' params
      const url = new URL(window.location.href);
      url.searchParams.delete('embed');
      url.searchParams.delete('theme');

      // Create a container for flex layout
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.justifyContent = 'space-between';
      container.style.alignItems = 'center';
      container.style.width = '100%';

      // Create the "Documentation" label
      const label = document.createElement('span');
      label.textContent = 'Documentation';
      label.style.fontWeight = 'bold';
      label.style.fontSize = '1rem';

      // Create the button with the external link icon
      const button = document.createElement('a');
      button.href = url.toString();
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      button.style.display = 'inline-flex';
      button.style.alignItems = 'center';
      button.style.padding = '6px 12px';
      button.style.border = '1px solid #ccc';
      button.style.borderRadius = '4px';
      button.style.background = '#fff';
      button.style.color = '#444';
      button.style.textDecoration = 'none';
      button.style.fontSize = '1rem';
      button.style.gap = '6px';

      // Add the icon (SVG) to the button
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('width', '20');
      icon.setAttribute('height', '20');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('stroke-width', '2');
      icon.setAttribute('stroke-linecap', 'round');
      icon.setAttribute('stroke-linejoin', 'round');
      icon.style.verticalAlign = 'middle';

      // SVG path for external link icon
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6');
      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      path2.setAttribute('points', '15 3 21 3 21 9');
      const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      path3.setAttribute('x1', '10');
      path3.setAttribute('y1', '14');
      path3.setAttribute('x2', '21');
      path3.setAttribute('y2', '3');

      icon.appendChild(path1);
      icon.appendChild(path2);
      icon.appendChild(path3);

      
      // Set icon color based on current theme
      function setIconColor() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
          icon.setAttribute('stroke', '#fff');
        } else {
          icon.setAttribute('stroke', '#000');
        }
      }

      // Initial color set
      setIconColor();

      button.appendChild(icon);
      button.style.setProperty('background-color', 'transparent', 'important');
      button.style.setProperty('border', 'none', 'important');
      button.style.setProperty('padding', '0', 'important');
      button.style.setProperty('margin', '0', 'important');
      button.style.setProperty('display', 'flex', 'important');
      button.style.setProperty('align-items', 'center', 'important');
      button.style.setProperty('justify-content', 'center', 'important');
      // Add label and button to the container
      container.appendChild(label);
      container.appendChild(button);



      // Add the container to the navbar
      navbar.appendChild(container);
      
      const params = new URLSearchParams(window.location.search);
      if (params.get('theme') === 'dark') {
        navbar.style.setProperty('background-color', '#1e1c26', 'important');
      } else {
        navbar.style.setProperty('background-color', '#ffffff', 'important');
      }

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

    if (theme === 'dark') {
      html.style.setProperty('background-color', '#1e1c26', 'important');
      body.style.setProperty('background-color', '#1e1c26', 'important');
    } else {
      html.style.setProperty('background-color', '#ffffff', 'important');
      body.style.setProperty('background-color', '#ffffff', 'important');
    }
    
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
      // '.navbar',
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