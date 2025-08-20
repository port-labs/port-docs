---
displayed_sidebar: null
description: Automatically map Jira users to their Port user accounts for seamless integration
---

# Map Jira users to Port user accounts

This guide demonstrates how to automatically map Jira users to existing Port user accounts based on email addresses. 

Once implemented, users will be able to:
- Maintain a complete inventory of all Jira users in your organization within Port.
- Automatically link Jira users to their corresponding Port user accounts for seamless integration.
- Provide visibility into which Jira users have Port accounts and which ones do not.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have [Port's Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) installed and configured.
- You have permissions to create automations in Port.


## Set up data model

The relation between Jira users and Port users is created automatically when we install the [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/). If you haven't installed it yet, please do so first.

<h3>Add mirror properties to the Port User blueprint</h3>

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Find the `User` blueprint and click on it.

3. Click on the `Edit JSON` button in the top right corner.

4. Add the following mirror property to the `mirrorProperties` object to display the Jira display name:

    <details>
    <summary><b>Port User blueprint mirror property (Click to expand)</b></summary>

    ```json showLineNumbers
    "mirrorProperties": {
      "jira_display_name": {
        "title": "Jira display name",
        "path": "jiraUser.displayName"
      }
    }
    ```

    </details>

5. Click on `Save` to update the blueprint.

:::info Additional mirror properties
You can add more mirror properties to display other Jira user attributes like timezone (`jiraUser.timeZone`), account type (`jiraUser.accountType`), or any other property from the Jira User blueprint that would be useful for your organization.
:::


## Update Jira integration mapping

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page.

2. Find your Jira integration and click on it.

3. In the mapping configuration, add a new mapping for Port User entities to establish the relation with Jira users.

    <details>
    <summary><b>Updated Jira integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    # Keep existing jiraUser mapping 
    - kind: user
      selector:
        query: 'true'
      port:
        entity:
          mappings:
            identifier: .accountId
            title: .displayName
            blueprint: '"jiraUser"'
            properties:
              emailAddress: .emailAddress
              active: .active
              accountType: .accountType
              timeZone: .timeZone
              locale: .locale
              avatarUrl: .avatarUrls["48x48"]

    # Add new mapping for Port Users with relation to Jira users
    // highlight-start
    - kind: user
      selector:
        query: '.emailAddress != null'
      port:
        entity:
          mappings:
            identifier: .emailAddress
            blueprint: '"_user"'
            relations:
              jiraUser: .accountId
    // highlight-end
    ```
    </details>

4. Click on `Save & Resync` to apply the changes.



## Set up automations

To ensure new Port users are automatically mapped to their corresponding Jira user accounts when a new Port user is created, we'll create an automation that triggers when a new Port user is created.

Follow the steps below to create the automation:

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync Port users to Jira user account (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sync_port_user_for_jira_user",
      "title": "Sync Port User for Jira User",
      "description": "Automatically maps Port users to their corresponding Jira user accounts",
      "icon": "Jira",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_CREATED",
          "blueprintIdentifier": "_user"
        },
        "condition": {
          "type": "JQ",
          "expressions": [],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/entities/_user/{{ .event.diff.after.identifier }}/relations",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "relations": {
            "jiraUser": {
              "combinator": "and",
              "rules": [
                {
                  "property": "$identifier",
                  "operator": "=",
                  "value": "{{ .event.diff.after.identifier }}"
                }
              ]
            }
          }
        }
      },
      "publish": true
    }
    ```

    </details>

5. Click `Save` to create the automation.


## Let's test it

1. Go to your [software catalog](https://app.getport.io/catalog) page.

2. Search for a Jira user entity.

3. Verify that the user has a relationship with the corresponding Port user account.

4. Check that the relationship is established automatically for new Jira users.

