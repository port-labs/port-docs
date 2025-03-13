import React from 'react';
import SearchBar from '@theme-original/SearchBar';
import { Typography } from '@mui/material';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function SearchBarWrapper(props) {
  const lightSrc = useBaseUrl("/img/icons/kapa-icon.svg");
  const darkSrc = useBaseUrl("/img/icons/kapa-icon-dark.svg");

  return (
    <div className="custom-search-bar">
      <SearchBar {...props} />
      <button className="ask-kapa-button">
        <Typography className='ask-kapa-button-text' color='white' fontFamily="Space Grotesk" fontWeight='500' fontSize="15px">
          <ThemedImage sources={{light: lightSrc, dark: darkSrc}} style={{"vertical-align": "text-top"}} className="not-zoom" /> Ask AI
        </Typography>
      </button>
    </div>
  );
}