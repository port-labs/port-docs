---
sidebar_position: 3
---

import SaveTableView from "/docs/customize-pages-dashboards-and-plugins/templates/_save_table_view.md"

# Custom widgets

Custom widgets are specialized widgets that provide additional functionality beyond data visualization, such as executing actions, displaying external content, or showing formatted markdown.

## Iframe visualization

You can create an iframe widget to display an embedded url in the dashboard. The iframe widget is useful to display external dashboards or other external content. It also appends to the iframe URL query params the entity identifier and the blueprint identifier so the embedded page can use it for various purposes.

The entity identifier will be concatenated under the `entity` query param and the blueprint identifier will be concatenated under the `blueprint` query param. For example: `https://some-iframe-url.com?entity=entity_identifier&blueprint=blueprint_identifier`.

:::info Embedded Dashboard Access
Note that the iframe request is made directly from the end user’s browser, not from Port’s backend.  
If you are implementing IP whitelisting at the network or firewall level, you will need to account for the IP addresses of the users accessing the embedded dashboard - not the IP of Port itself.
:::

<img src="/img/software-catalog/widgets/iframeWidget.png" border='1px' width='70%' style={{borderRadius:'6x'}} />

### URL type

When configuring an **Iframe widget**, you can specify whether the URL is `public` or `protected`.

For the `protected` URL type, you can configure how the OAuth authentication flow is handled using the **"Use pop-up for authentication URL"** toggle:

- **Toggle off (default)**: The OAuth login flow runs inside the Iframe.
- **Toggle on**: The OAuth login flow opens in a separate pop-up window.

If the **Authentication URL** points to Microsoft Entra ID (`https://login.microsoftonline.com`), the toggle is automatically turned on, since Entra ID login pages include security headers that prevent them from being displayed inside an Iframe.

Make sure your application allows CORS requests from the Port app origin for the authentication flow to work correctly:

- For the EU region, add `https://app.port.io` to your allowed origins.
- For the US region, add `https://app.us.port.io` to your allowed origins.

:::info Browser pop-up settings
If you enable the pop-up option, ensure your browser allows pop-ups for the Port app’s domain. If pop-ups are blocked at the browser level, the authentication window will not open and the Iframe widget will fail to load.
:::

### Widget properties

| Field  | Type |Description | Default | Required |
| ------- | -------------- | ---------------- | ------- | -------- |
| `Title`   | `String`       | Iframe widget title   | `null`  | `true`   |
| `Icon`              | `String`       | Iframe widget icon.  | `null`  | `false`  |
| `Description`       | `String`       | Iframe widget description.      | `null`  | `false`  |
| `URL`               | `String`       | Iframe widget url.           | `null`  | `false`  |
| `URL type`          | `String`       | `public` or `protect`.     | `null`  | `false`  |
| `Authentication Url` | `URL String`   | If the `URL type` is `protected` this will be required. <br></br>Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce). | `null`  | `false`  |
| `clientId`          | `String`       | If the `URL type` is `protected` this will be required. <br></br>Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce). | `null`  | `false`  |
| `Scopes`            | `String Array` | If the `URL type` is `protected` this will be required. <br></br>Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce). | `null`  | `false`  |
| `Token URL`         | `URL String`   | If the `URL type` is `protected` this will be required. <br></br>Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce). | `null`  | `false`  |

## Action card

This widget allows you to execute [self-service actions](/actions-and-automations/create-self-service-experiences) directly from any dashboard (including your homepage).

A single action card can contain one or multiple actions:

**Single action**  
To execute the action, click on the button in the bottom left corner of the widget:

<img src='/img/software-catalog/widgets/actionCardSingle.png' width='50%' style={{borderRadius:'8px'}}/>
<br/><br/>

**Multiple actions**  
When choosing multiple actions, you can choose your own title for the widget.  
To execute an action, click on the ⚡ button next to it:

<img src='/img/software-catalog/widgets/actionCardMultiple.png' width='45%' style={{borderRadius:'8px'}}/>


## Action history

This widget allows you to create a table displaying all past runs of a [self-service action](/actions-and-automations/create-self-service-experiences) in your portal.  
The table will automatically display data about each run, including status, input parameters, the executing user, and more. 

<img src='/img/software-catalog/widgets/actionRunsTableExample.png' width='100%' style={{borderRadius:'8px'}}/>

## Markdown

This widget allows you to display any markdown content you wish in formatted form:

<img src='/img/software-catalog/widgets/markdownWidget.png' width='500rem' style={{borderRadius:'8px'}}/>
<br/><br/>

The widget also supports a wide variety of HTML tags, allowing you to create rich content:
<details>
<summary>**Supported HTML tags (click to expand)**</summary>
```bash
'iframe',
'a',
'style',
'h1',
'h2',
'h3',
'h4',
'h5',
'h6',
'nav',
'blockquote',
'dd',
'div',
'pre',
'dl',
'hr',
'li',
'menu',
'ol',
'p',
'ul',
'b',
'br',
'cite',
'code',
'em',
'i',
'mark',
'q',
's',
'samp',
'small',
'span',
'strong',
'sub',
'sup',
'time',
'u',
'var',
'wbr',
'img',
'video',
'caption',
'col',
'colgroup',
'table',
'tbody',
'td',
'tfoot',
'th',
'thead',
'tr'
```
</details>

**Note:** For external video URLs from providers such as YouTube, use the [iframe visualization widget](/customize-pages-dashboards-and-plugins/dashboards/custom-widgets/#iframe-visualization).

:::tip Practical example
A practical example of using HTML in a markdown widget can be found in Port's [live demo](https://showcase.port.io/organization/home), in the `Catalog quick access` widget. 
:::

### Markdown widget properties

| Field      | Type     | Description           | Default | Required |
| ---------- | -------- | --------------------- | ------- | -------- |
| `Title`    | `String` | Markdown widget title | `null`  | `true`   |
| `Icon`     | `String` | Markdown widget Icon  | `null`  | `false`  |
| `markdown` | `String` | Markdown content      | `null`  | `false`  |

### Internal markdown links

When linking to other pages in your portal, you can use `/` as the URL base, instead of using full URLs.  

For example, you can use `<a href="/plan_my_day">` instead of `<a href="https://showcase.port.io/plan_my_day">`.

## AI Agent

The AI Agent widget provides an interactive chat interface that helps you work with Port. You can ask questions and get assistance with various tasks in your software catalog.

<img src='/img/software-catalog/widgets/aiAgentWidget.png' width='50%' border='1px' style={{borderRadius:'8px'}}/>
<br/><br/>

The AI Agent can help you with:

- **Exploring your data model** - viewing blueprints, entities, and relationships.
- **Understanding your integrations** - checking integration status, sync metrics, and configurations.
- **Managing scorecards** - viewing scorecard details and rules.
- **Executing actions** - running self-service and automation actions.
- **Finding Port documentation** - searching for help and best practices.

## Links

This widget allows you to display a list of links, both internal and external, for quick access to useful pages.

<img src='/img/software-catalog/widgets/linksExample.png' width='50%' border='1px' style={{borderRadius:'8px'}}/>

- **External links** - links to external websites, such as documentation, 3rd party tools, etc.  
  These links will open in a new tab when clicked.  
  For example: "https://www.google.com".

- **Internal links** - links to internal pages in your portal, such as an entity page, a catalog page, an entity's audit log page, etc.  
  These links will open in the same tab when clicked.  
  For example: "https://app.getport.io/serviceEntity?identifier=frontend".

- **Dynamic links** (available in specific entity page only) - links to external websites or internal pages while using the identifier of an entity.  
These links will open according to the methods mentioned above.  
For example: Let's take the following specific entity page `/Services?identifier=myService`.<br/>
  - An external link: `https://slack.com/myOrganization/channel={{url.identifier}}` -> translated into `https://slack.com/myOrganization/channel=myService`.<br/>
  
  - An internal link: `https://app.getport.io/PagerDutyService?identifier={{url.identifier}}` -> translated into `https://app.getport.io/PagerDutyService?identifier=myService`.

During creation/editing of the widget, you can sort the links by dragging and dropping them.

## Widget type identifiers (Terraform)

When creating widgets using [Port's Terraform provider](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/port_page), you need to provide the widget type's identifier in the `type` key.  
The following table lists the identifiers for each custom widget type:

| Widget type | Identifier |
| ----------- | ---------- |
| IFrame | `iframe-widget` |
| Action card | `action-card-widget` |
| Action history | `action-runs-table-widget` |
| Markdown | `markdown` |
