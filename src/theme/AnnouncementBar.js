import React from 'react';
import AnnouncementBar from '@theme-original/AnnouncementBar';
import { Typography } from '@mui/material';

export default function SearchBarWrapper(props) {
  return (
    <div className="custom-announcement-bar">
      {/* <AnnouncementBar {...props} /> */}
      <Typography position={'relative'} fontSize={'small'} fontFamily='DM Sans' color='#FFFFFF' fontWeight='500'>Check out Port for yourself&nbsp;</Typography>
      <a href="http://app.getport.io" target='_blank'><button className='navbar-signup-button'>Sign up</button></a>
      <a href="http://demo.getport.io" target='_blank'><button className='navbar-live-demo-button'>Live demo</button></a>
    </div>
  );
}