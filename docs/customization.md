---
sidebar_position: 11
title: Portal customization
sidebar_label: Portal customization
sidebar_class_name: custom-sidebar-item sidebar-menu-customization
---

# Portal customization

Port offers various customization options to help you tailor the developer portal to your organization's branding and style.

## Change organization name & logo

The title and logo of the portal (in the top left corner) are set to "Port" by default.  

To change them:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.

2. Click on `Organization settings` in the sidebar.

3. Change the `Title` and `Logo URL` to your desired values.  
   The previews will update automatically with your changes, one for light mode and one for dark mode.

   :::tip Title scope
   This title is intended to be used for visual purposes, it will only affect the text in the top left corner of the portal.  

   It is not related to the title & identifier of your organization (i.e. the name & id returned by the [Get ortanization details](/api-reference/get-organization-details) API endpoint).
   :::

4. Click on `Save`.

### Limitations

- The title is limited to 30 characters.
- The logo URL must be a valid public link (e.g. `https://example.com/logo.png`).

## Dark mode

To change the theme of the portal to dark mode:

1. Click on the user button in the top right corner of the portal.

2. Click on `Theme` to toggle between light and dark mode.
