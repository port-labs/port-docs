// Inject Kapa search bar into navbar
(function() {
  function injectSearchBar() {
    // Check if search bar already exists
    if (document.querySelector('.kapa-search-trigger')) {
      return;
    }

    // Find the navbar items container
    const navbarItems = document.querySelector('.navbar__items--right');
    if (!navbarItems) {
      // Try again after a short delay if navbar isn't ready
      setTimeout(injectSearchBar, 100);
      return;
    }

    // Create search bar container
    const searchBarContainer = document.createElement('div');
    searchBarContainer.className = 'custom-search-bar';
    
    // Get theme to determine which icon to use
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const iconSrc = isDark ? '/img/icons/kapa-icon-dark.svg' : '/img/icons/kapa-icon.svg';
    
    searchBarContainer.innerHTML = `
      <button class="navbar__search kapa-search-trigger" type="button" aria-label="Search">
        <svg class="navbar__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C9.29583 14 10.4957 13.5892 11.4765 12.8907L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.8907 11.4765C13.5892 10.4957 14 9.29583 14 8C14 4.68629 11.3137 2 8 2ZM4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8Z" fill="currentColor"/>
        </svg>
        <span class="navbar__search-text">Search</span>
      </button>
      <button class="ask-kapa-button" type="button" aria-label="Ask AI">
        <span class="ask-kapa-button-text" style="color: white; font-family: 'Space Grotesk'; font-weight: 500; font-size: 15px; display: inline-flex; align-items: center; gap: 0.25rem;">
          <img src="${iconSrc}" alt="Kapa" style="vertical-align: text-top; width: 16px; height: 16px;" class="not-zoom" />
          Ask AI
        </span>
      </button>
    `;

    // Insert before the first item in the right navbar items
    navbarItems.insertBefore(searchBarContainer, navbarItems.firstChild);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSearchBar);
  } else {
    injectSearchBar();
  }

  // Also try after a delay to handle dynamic loading
  setTimeout(injectSearchBar, 500);
})();

