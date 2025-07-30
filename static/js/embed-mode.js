// Minimal embed mode script - only handles what CSS can't do
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const isEmbed = urlParams.get('docusaurus-data-embed-mode') === 'iframe';

  if (!isEmbed) return;

  // Only handle functionality that CSS can't do
  function handleEmbedMode() {
    // 1. Make external links open in new tab (CSS can't do this)
    makeLinksOpenInNewTab();
    
    // 2. Handle external link button click (CSS can't do this)
    setupExternalLinkButton();
    
    // 3. Handle 404
    if (is404()) {
      sendNotFoundEvent();
      return;
    }

    // 4. Send finished ack
    sendFinishedLoadingEvent();
  }

  function makeLinksOpenInNewTab() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      if (link.getAttribute('href').startsWith('#')) {
        return;
      }
      
      // Add click event listener to force opening in new tab
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(this.href, '_blank', 'noopener,noreferrer');
      });
    });
  }

  function setupExternalLinkButton() {
    // Add click handler to the external link icon created by CSS
    document.addEventListener('click', function(e) {
      if (e.target.closest('.navbar') && e.clientX > window.innerWidth - 60) {
        // Clicked on the right side of navbar (where the icon is)
        const url = new URL(window.location.href);
        url.searchParams.delete('docusaurus-data-embed-mode');
        url.searchParams.delete('docusaurus-data-theme');
        url.searchParams.delete('origin-hostname');
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      }
    });
  }

  function assumeParentOrigin() {
    const originHostname = urlParams.get('origin-hostname') ?? 'localhost';
    const protocol = originHostname.split(':')?.[0] === 'localhost' ? 'http' : 'https';
    return `${protocol}://${originHostname}`;
  }

  function is404() {
    const h1 = document.querySelector('h1');
    return h1 && h1.textContent === 'Page Not Found';
  }

  function sendFinishedLoadingEvent() {
    window.parent.postMessage({
      type: 'finished_load_ack'
    }, assumeParentOrigin());
  }

  window.addEventListener('load', handleEmbedMode);
  window.addEventListener('popstate', handleEmbedMode);
})(); 