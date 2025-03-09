import React from 'react';
import NavbarItem from '@theme-original/NavbarItem';
import PortLoginNavbarItem from './PortLoginNavbarItem';

export default function NavbarItemWrapper(props) {
  if (props.type === 'custom-portLogin') {
    return <PortLoginNavbarItem {...props} />;
  }
  return <NavbarItem {...props} />;
} 