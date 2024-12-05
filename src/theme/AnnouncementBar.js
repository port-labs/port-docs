import React from 'react';
import AnnouncementBar from '@theme-original/AnnouncementBar';
import { Typography } from '@mui/material';

export default function SearchBarWrapper(props) {
  return (
    <div className="custom-announcement-bar">
      {/* <AnnouncementBar {...props} /> */}
      <Typography position={'relative'} fontSize={'small'} fontFamily='DM Sans' color='#FFFFFF' fontWeight='500'>Check out Port for yourself&nbsp;</Typography>
      <button className='navbar-signup-button'>Sign up</button>
      <button  className='navbar-live-demo-button'>Live demo</button>
    </div>
  );
}