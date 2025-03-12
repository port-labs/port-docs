import React from 'react';
import SearchBar from '@theme-original/SearchBar';
import { Typography } from '@mui/material';
import { useColorMode } from '@docusaurus/theme-common';

export default function SearchBarWrapper(props) {
  const { colorMode } = useColorMode();
  const iconSrc = colorMode === 'dark' ? '/img/icons/kapa-icon-dark.svg' : '/img/icons/kapa-icon.svg';

  return (
    <div className="custom-search-bar">
      <SearchBar {...props} />
      <button className="ask-kapa-button">
        <Typography className='ask-kapa-button-text' color='white' fontFamily="Space Grotesk" fontWeight='500' fontSize="15px">
          <img src={iconSrc} style={{"vertical-align": "text-top"}} className="not-zoom" /> Ask AI
        </Typography>
      </button>
    </div>
  );
}