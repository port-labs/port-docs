---
sidebar_position: 11
title: Customization & accessibility
sidebar_label: Customization & accessibility
sidebar_class_name: custom-sidebar-item sidebar-menu-customization
---

# Customization & accessibility

Port offers various customization options to help you tailor the developer portal to your organization's branding and style.

## Portal customization

### Change organization name & logo

The title and logo of the portal (in the top left corner) are set to "Port" by default.  

To change them:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.

2. Click on `Organization settings` in the sidebar.

3. Change the `Title` and `Logo URL` to your desired values.  
   The previews will update automatically with your changes, one for light mode and one for dark mode.

   :::tip Title scope
   This title is intended for visual purposes, it will only affect the text in the top left corner of the portal.  

   It is not related to the title & identifier of your organization (i.e. the name & id returned by the [Get organization details](/api-reference/get-organization-details) API endpoint).
   :::

4. Click on `Save`.

#### Limitations

- The title is limited to 30 characters.
- The logo URL must be a valid public link (e.g. `https://example.com/logo.png`).

### Dark mode

To change the theme of the portal to dark mode:

1. Click on the user button in the top right corner of the portal.

2. Click on `Theme` to toggle between light and dark mode.

## Accessibility

Port supports various hotkeys to help you navigate the portal using a keyboard.

### Widget card navigation

In dashboards, you can use `Shift + Alt/Option + ArrowLeft/ArrowRight` to jump between widget cards (wrapping around is supported).

<video controls muted loop playsInline width="2560"
  height="1440"
  style={{
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    objectFit: 'cover',
  }}>
  <source src="/img/customization/widgetNavigation.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

### Table cell actions

In tables, you can use `Ctrl/Cmd + C` to copy cell contents, and `Ctrl/Cmd + E` to edit or expand a cell.

<video controls muted loop playsInline width="2560"
  height="1440"
  style={{
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    objectFit: 'cover',
  }}>
  <source src="/img/customization/tableNavigation.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

### Actions menu

Some components have an actions menu that can be opened by clicking on the component and pressing `Shift + Return (Enter)`.

This can also be used to drag/rearrange widgets in dashboards, or files/folders in the catalog sidebar:

<video controls muted loop playsInline width="2560"
  height="1440"
  style={{
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    objectFit: 'cover',
  }}>
  <source src="/img/customization/sidebarSort.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

### Search

Press `Ctrl/Cmd + K` to focus on the search bar.