import React from 'react';
import SearchBar from '@theme-original/SearchBar';
import { Typography } from '@mui/material';

export default function SearchBarWrapper(props) {
  return (
    <div className="custom-search-bar">
      <SearchBar {...props} />
      {/* <Typography position={"relative"} fontSize={"small"} fontFamily="Space Grotesk" fontWeight='500'>OR</Typography> */}
      <button className="ask-kapa-button">
        <Typography className='ask-kapa-button-text' color='white' fontFamily="Space Grotesk" fontWeight='500' fontSize="15px">✨ Ask AI</Typography>
      </button>
    </div>
  );
}