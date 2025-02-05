---
sidebar_label: Share a pre-filled action URL
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import ActionUrlGenerator from '@site/src/components/ActionUrlGenerator';

# Share a pre-filled action URL

Port allows you to generate links that pre-fill action inputs, making it easy to share action execution URLs with your developers.  
This is particularly useful when you want to:

1. Create bookmarks for commonly used actions with specific inputs.
2. Share action execution links in documentation.
3. Programmatically generate action links from your systems.

## How it works

The action execution URL follows this structure:
```
https://app.getport.io/self-serve?action=ACTION_IDENTIFIER&actionInputs=ENCODED_INPUTS
```

- `ACTION_IDENTIFIER` is your action's unique identifier
- `ENCODED_INPUTS` is a minified version of your inputs using JSURL encoding

## Generate action execution URL

To generate an action execution URL, you will need to use the `JSURL` library to properly encode the action inputs.

<details>
<summary><b>Code example (click to expand)</b></summary>

```javascript
// Load jsurl2 library
let script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/jsurl2";
document.head.appendChild(script);

script.onload = function() {
    // Your action inputs
    let actionInputs = {
        input1: "value1",
        input2: "value2"
    };

    // Encode the inputs
    let encodedInputs = JSURL.stringify(actionInputs);
    
    // Generate the full URL
    let actionIdentifier = "your_action_id";
    let url = `https://app.getport.io/self-serve?action=${actionIdentifier}&actionInputs=${encodedInputs}`;
    
    console.log("Action URL:", url);
};
```
</details>

## Example

Let's say you have a "Report Bug" action with identifier `report_bug` that accepts the following inputs:
- `title`: The bug title
- `severity`: Bug severity level
- `description`: Detailed bug description

The following code will generate a link for it:

```javascript
let actionInputs = {
    title: "UI Performance Issue",
    severity: "High",
    description: "The dashboard is loading slowly when displaying more than 100 items"
};

// Using JSURL to encode
let encodedInputs = JSURL.stringify(actionInputs);
let url = `https://app.getport.io/self-serve?action=report_bug&actionInputs=${encodedInputs}`;
```

The generated URL will lead to the action's execution form, pre-filled with the defined input values.

:::tip JSURL
For complex inputs with special characters, spaces, or nested objects, using JSURL encoding is essential as it properly handles these cases while keeping the URL compact.
:::

## Interactive URL generator

To simplify the process described in this page, you can use this interactive tool to generate the finalized URL:

<ActionUrlGenerator />