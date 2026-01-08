---
sidebar_position: 11
title: Customization & accessibility
sidebar_label: Customization & accessibility
sidebar_class_name: custom-sidebar-item sidebar-menu-customization
---

# Customization & accessibility

Port offers various customization options to help you tailor the developer portal to your organization's branding and style as well as communicate important information to your users.

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

### Add an announcement banner

Organization admins can configure an **announcement banner** that appears at the top of the portal for all users. The banner can be enabled or disabled at any time.  

Users can dismiss the banner and it will remain hidden until the admin updates the announcement.

To add the banner:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.

2. Click on `Organization settings` in the sidebar.

3. Open the `Announcment` tab, and toggle `Enable announcement` to turn it on.

4. Fill in the banner details:
    - **Announcement:** The text that will appear in the banner. (Maximum 300 characters)
    - **Color:** Choose a color for your banner. Currently, the available colors are **blue** and **red**.
    - **Link (optional):** Add a URL to make the banner clickable and direct users to the provided link. (Maximum 300 characters)

5. Click `Save`.

### Custom icons

Organization admins can upload custom icons to use throughout Port. Once uploaded, they will be available for all users in your organization and can be used for blueprints, properties, actions, etc. Allowing you to align the portal with your organization's branding and visual identity.

**Prerequisites**

- **Enterprise plan:** This feature is part of Port's Enterprise plan. If you're interested in accessing this feature, please contact [Port's support team](https://support.port.io).
- **Multi-organization structure:** Your account needs to be migrated to the [multi-organization structure](/sso-rbac/multi-organization). Contact [Port's support team](https://support.port.io) to request account migration.

**To upload a custom icon:**

1. Navigate to any location in Port where you can select an icon (such as when creating or editing a blueprint, etc).

2. Click on the **Upload icon** button at the top of the icon selection panel.

3. Upload your icon file. You can:
   - Select a file from your computer.
   - Copy and paste the file directly into the upload area (hover over the upload area first to enable paste).
   
   Supported formats: PNG, SVG, or JPEG (maximum dimensions: 512x512 pixels). For SVG files, the dimension is enforced on the viewbox first, then on the width and height properties if there is no usable viewbox.

4. Enter a name for your custom icon (between 1-30 characters).

5. Click **Save**.

Your custom icon is now available throughout your Port organization. Custom icons will appear in a dedicated **Custom icons** section at the top of the icon selection panel, above the default Port icons.

**Limitations**

- **Maximum file size:** 10MB.
- **Maximum icon dimensions:** 512x512 pixels.
- **Icon name length:** 1-30 characters.
- **Platform URL:** Custom icons work reliably when accessing Port via `app.port.io`. While you can upload icons using `app.getport.io`, custom icons currently won't be visible when accessing the platform through that URL.

### Dark mode

To change the theme of the portal to dark mode:

1. Click on the user button in the top right corner of the portal.

2. Click on `Theme` to toggle between light and dark mode.

## Accessibility

Port is fully compliant with WCAG 2.2 (Level A & AA), Section 508, and EN 301 549 standards, making the platform more accessible to developers of all abilities. This includes enhanced keyboard navigation, screen reader compatibility, improved color contrast, and detailed ARIA labeling.

Various supported hotkeys are listed below to help you navigate the portal using a keyboard.

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