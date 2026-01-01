import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Typography } from '@mui/material';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function SearchBarWrapper(props) {
  const { colorMode } = useColorMode();
  const lightSrc = useBaseUrl("/img/icons/kapa-icon.svg");
  const darkSrc = useBaseUrl("/img/icons/kapa-icon-dark.svg");

  const handleSearchClick = () => {
    // Open Kapa widget in search mode
    if (window.Kapa) {
      window.Kapa.open({ mode: "search" });
    }
  };

  return (
    <div className="custom-search-bar">
      <button 
        className="navbar__search kapa-search-trigger" 
        onClick={handleSearchClick}
        type="button"
        aria-label="Search"
      >
        <svg
          className="navbar__search-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C9.29583 14 10.4957 13.5892 11.4765 12.8907L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.8907 11.4765C13.5892 10.4957 14 9.29583 14 8C14 4.68629 11.3137 2 8 2ZM4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8Z"
            fill="currentColor"
          />
        </svg>
        <span className="navbar__search-text">Search</span>
      </button>
      <button className="ask-kapa-button">
        <Typography className='ask-kapa-button-text' color='white' fontFamily="Space Grotesk" fontWeight='500' fontSize="15px">
          <ThemedImage sources={{light: lightSrc, dark: darkSrc}} style={{"vertical-align": "text-top"}} className="not-zoom" /> Ask AI
        </Typography>
      </button>
    </div>
  );
}