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
  // Ensure the navbar bottom border is visible in both light and dark themes
  function adjustNavbarBorder(theme) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    // Remove any previous custom border style
    navbar.style.borderBottom = '';
    // Set border color based on theme
    if (theme === 'dark') {
      navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.45)';
    } else {
      navbar.style.borderBottom = '1px solid rgba(0, 0, 0, 0.45)';
    }
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
    const theme = new URLSearchParams(window.location.search).get('theme');
    navbar.style.setProperty(
      'background-color',
      theme === 'dark' ? '#1e1c26' : '#ffffff',
      'important'
    );

    adjustNavbarBorder(theme);
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
    // Select all anchor tags that do not already have target="_blank" and are not anchor links (headings)
    // Anchor links typically have hrefs that start with '#'
    const links = document.querySelectorAll('a[href]:not([target="_blank"])');
    links.forEach(link => {
      const href = link.getAttribute('href');
      // Exclude anchor links (href starts with '#')
      if (href && !href.startsWith('#')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
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