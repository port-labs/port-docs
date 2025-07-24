---
displayed_sidebar: null
description: Automatically map Jira users to their Port user accounts for seamless integration
---

# Map Jira users to Port user accounts

This guide demonstrates how to automatically map Jira users to existing Port user accounts based on email addresses. 

Once implemented, users will be able to:
- Maintain a complete inventory of all Jira users in your organization within Port.
- Automatically link Jira users to their corresponding Port user accounts for seamless integration.
- Provide visibility into which Jira users have Port accounts and which one do not.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have [Port's Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) installed and configured.
- You have permissions to create automations in Port.


## Set up data model

To establish relationships between Jira users and Port user accounts, we need to add a relation to the existing `jiraUser` blueprint.

<h3> Update the Jira user blueprint</h3>

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Find the `Jira User` blueprint and click on it.

3. Click on the `...` button in the top right corner.

4. Click on `Edit JSON`.

5. Add the following relation to the `relations` section.

    ```json showLineNumbers
    "user": {
      "title": "Port User",
       "target": "_user",
       "required": false,
       "many": false
    }
    ```

6. Click on `Save` to update the blueprint.


## Update Jira integration mapping

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page.

2. Find your Jira integration and click on it.

3. In the mapping configuration, update the user mapping to include the relation.

    <details>
    <summary><b>Jira integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
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
            // highlight-start
          relations:
            user:
              combinator: '"and"'
              rules:
                - property: '"$identifier"'
                  operator: '"="'
                  value: .emailAddress
            // highlight-end
    ```
    </details>

4. Click on `Save & Resync` to apply the changes.

:::tip Mapping explanation
This configuration automatically establishes a relationship between Jira users and Port user accounts by matching the Jira user's email address with the Port user's identifier (which is typically the email address).
:::

## Set up automations

To ensure new Jira users are automatically mapped to their corresponding Port user accounts when a new Port user is added, we'll create an automation that triggers when a new Port user is created.

Follow the steps below to create the automation:

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync Jira users to new Port user account (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sync_jira_user_for_new_port_user",
      "title": "Sync Jira User for New Port User",
      "description": "Automatically maps Jira users to newly created Port user accounts",
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
        "url": "https://api.getport.io/v1/entities/jiraUser/{{ .event.diff.after.identifier }}/relations",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "relations": {
            "user": {
              "identifier": "{{ .event.diff.after.identifier }}"
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

