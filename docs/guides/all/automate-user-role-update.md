---
displayed_sidebar: null
title:  Automate Admin Role Assignment
description: Automatically assign an Admin role to users upon joining the admins group.
---


#  Automate admin role assignment

Managing users permissions is critical for maintaining security. Whether you’re using an SSO provider or managing access manually, assigning roles like `Admin` shouldn’t require repetitive manual updates each time someone joins an administrative group.

This guide demonstrates how to set up an **automation in Port** that handles this process. Once configured, the automation updates a user's role to `Admin` whenever a user is added to a designated `admins` team. This helps keep users access up to date and easy to manage.

## Common use cases

The following are possible scenarios where you would want to use this automation:  

- When new users log in through SSO, you want those in the `admins` group to automatically get the `Admin` role in Port without needing manual role assignment every time.
- If your organization manages permissions directly in Port, you want role updates to happen automatically when a user is added to the `admins` team.

## Prerequisites

Before implementing this guide, ensure you have an admins [team](https://docs.port.io/getting-started/set-up-service-catalog#users--teams) already defined in Port.  
If you are using SSO, ensure the team name in Port matches the name of the admins group from your identity provider.


## Automation Setup
Now, let's set up the automation that assigns the `Admin` role when a user is added to the `admins` team.  

The automation is triggered when a user is added to the `admins` team. When this condition is met, the automation updates the `port_role` property of the `_user` blueprint, setting its value to `Admin`.  

Follow these steps to add the automation:

1. Head to the [automations](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON into the editor.


    <details>
    <summary>Automation: Assign Admin Role (click to expand)</summary>

    ```json showLineNumbers
    {
      "identifier": "newAdmin",
      "title": "Make user an admin",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "_user"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            # highlight-start
            ".diff.before.team | index(\"admins\") == null",
            ".diff.after.team | index(\"admins\") != null"
            # highlight-end
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "_user",
        "mapping": {
          "identifier": "{{.event.context.entityIdentifier}}",
          "properties": {
            "port_role": "Admin"
          }
        }
      },
      "publish": true
    }
    ```

    </details>
        
:::tip Change the group's name
Make sure to change the `admins` group name in the script's highlighted lines if yours is named differently.
:::

