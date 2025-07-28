// Embed mode detection script
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  const Theme = {
    LIGHT: 'light',
    DARK: 'dark',
  }

  const urlParams = new URLSearchParams(window.location.search);
  const portThemeDarkBg = '#1e1c26';
  const portThemeLightBg = '#ffffff';
  const isEmbed = urlParams.get('embed') === 'true';
  const origins = ['https://app.getport.io', 'https://app.port.io', 'http://localhost:3001'];

  if (!isEmbed) return;

  function prepareEmbeddedPage() {
      applyTheme(urlParams.get('theme') ?? Theme.LIGHT);
      removeElements(); 
      transformNavbar();
      makeLinksOpenInNewTab();
      scrollToHash();

      if (is404()) {
        send404Event();
      } else {
        sendFinishedLoadingEvent();
      }
  }
  
  function send404Event() {
    origins.forEach(origin => {
      window.parent.postMessage({
        type: 'page_not_found'
      }, origin);
    });
  }

  function is404() {
    const h1 = document.querySelector('h1');
    return h1 && h1.textContent === 'Page Not Found';
  }

  function transformNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Remove all children from the navbar
    navbar.innerHTML = '';

    // Build a URL without 'embed' and 'theme' params
    const url = new URL(window.location.href);
    url.searchParams.delete('embed');
    url.searchParams.delete('theme');

    // Create flex container
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    });

    // Create label
    const label = document.createElement('span');
    label.textContent = 'Documentation';
    Object.assign(label.style, {
      fontWeight: 'bold',
      fontSize: '1rem',
    });

    // Create external link button
    const button = document.createElement('a');
    button.href = url.toString();
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    Object.assign(button.style, {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      padding: '0',
      margin: '0',
      borderRadius: '4px',
      color: '#444',
      textDecoration: 'none',
      fontSize: '1rem',
      gap: '6px',
      justifyContent: 'center',
    });

    // Create SVG icon for external link
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

    // SVG paths for external link icon
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6');
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    path2.setAttribute('points', '15 3 21 3 21 9');
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path3.setAttribute('x1', '10');
    path3.setAttribute('y1', '14');
    path3.setAttribute('x2', '21');
    path3.setAttribute('y2', '3');
    icon.append(path1, path2, path3);

    // Set icon color based on current theme
    const setIconColor = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      icon.setAttribute('stroke', theme === 'dark' ? '#fff' : '#000');
    };
    
    setIconColor();

    button.appendChild(icon);

    // Assemble navbar
    container.append(label, button);
    navbar.appendChild(container);

    // Set navbar background color based on theme
    const theme = urlParams.get('theme') ?? Theme.LIGHT;
    navbar.style.setProperty(
      'background-color',
      theme === Theme.DARK ? portThemeDarkBg : portThemeLightBg,
      'important'
    );

        // Ensure the navbar bottom border is visible in both light and dark themes
    function adjustNavbarBorder(theme) {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;
      // Remove any previous custom border style
      navbar.style.borderBottom = '';

      if (theme === Theme.DARK) {
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.45)';
      } else {
        navbar.style.borderBottom = '1px solid rgba(0, 0, 0, 0.45)';
      }
    }

    adjustNavbarBorder(theme);
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
    
    if (theme !== Theme.LIGHT && theme !== Theme.DARK) {
      console.warn(`[embed-mode] Invalid theme: ${theme}, using default theme`);
      theme = Theme.LIGHT;
    }

    html.setAttribute('data-theme', theme);
    
    // Force a style recalculation
    body.style.display = 'none';
    body.offsetHeight; // Trigger reflow
    body.style.display = '';

    if (theme === Theme.DARK) {
      html.style.setProperty('background-color', portThemeDarkBg, 'important');
      body.style.setProperty('background-color', portThemeDarkBg, 'important');
    } else {
      html.style.setProperty('background-color', portThemeLightBg, 'important');
      body.style.setProperty('background-color', portThemeLightBg, 'important');
    }
    
  }

  function makeLinksOpenInNewTab() {  
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      if (link.getAttribute('href').startsWith('#')) {
        return;
      }
      
      // Adding target=_blank does not work due to interception by Docusaurus
      // Therefore we need to use a click event listener to force opening in new tab
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(this.href, '_blank', 'noopener,noreferrer');
      });
    });
    
    // Also handle dynamically added links using MutationObserver
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            const newLinks = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
            newLinks.forEach(link => {
              // Skip internal anchors
              if (link.getAttribute('href').startsWith('#')) {
                return;
              }
              
              // Set attributes
              link.setAttribute('target', '_blank');
              link.setAttribute('rel', 'noopener noreferrer');
              
              // Add click event listener
              link.addEventListener('click', function(e) {
                if (this.getAttribute('href').startsWith('#')) {
                  return;
                }
                e.preventDefault();
                window.open(this.href, '_blank', 'noopener,noreferrer');
              });
            });
          }
        });
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function removeElements() {
    const selectorsToRemove = [
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

  function sendFinishedLoadingEvent() {
    setTimeout(() => {
      origins.forEach(origin => {
        window.parent.postMessage({
          type: 'finished_load_ack'
        }, origin);
      });
    }, 1000);
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