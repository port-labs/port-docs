---
displayed_sidebar: null
description: Automatically map GitHub, GitLab, and Azure DevOps users to their Port user accounts for seamless integration
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Map Git users to Port user accounts

This guide demonstrates how to automatically map Git users to existing Port user accounts based on email addresses. 

Once implemented, users will be able to:
- Maintain a complete inventory of all Git users in your organization within Port.
- Automatically link Git users to their corresponding Port user accounts for seamless integration.
- Provide visibility into which Git users have Port accounts and which ones do not.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have the relevant Git integration installed and configured:
  - [Port's GitHub integrtion](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/).
  - [Port's GitLab integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/).
  - [Port's Azure DevOps integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/).
- You have permissions to create automations in Port.

## Set up data model

The relations between Git users and Port users are created automatically when we install the relevant Git integrations.   
If you haven't installed them yet, please do so first.

<h3>Optional: Add mirror properties to the Port User blueprint</h3>

If you want to display some Git user attributes e.g. username, email, etc. in the Port User blueprint, you can add a mirror property to the Port User blueprint.

Follow the steps below to add a mirror property to the Port User blueprint:

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Find the `User` blueprint and click on it.

3. Click on the `Edit JSON` button in the top right corner.

4. Add the following mirror properties to the `mirrorProperties` object to display Git user information:

    <details>
    <summary><b>Port User blueprint mirror properties (Click to expand)</b></summary>

    ```json showLineNumbers
    "mirrorProperties": {
      "github_login": {
        "title": "GitHub login",
        "path": "githubUser.login"
      },
      "gitlab_username": {
        "title": "GitLab username", 
        "path": "gitlabUser.username"
      },
      "azuredevops_display_name": {
        "title": "Azure DevOps display name",
        "path": "azureDevopsUser.displayName"
      }
    }
    ```

    </details>

5. Click on `Save` to update the blueprint.

:::info Additional mirror properties
You can add more mirror properties to display other Git user attributes or customize which properties are most relevant for your organization. Only add the mirror properties for the Git platforms you're using.
:::

## Implementation

Now we'll update the integration mapping to include the relation and create automations to sync Git users when a new Port user is added.

<Tabs>
<TabItem value="github" label="GitHub" default>

To update the GitHub integration mapping, follow the steps below:

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page.

2. Find your GitHub integration and click on it.

3. In the mapping configuration, add a new mapping for Port User entities to establish the relation with GitHub users:

    <details>
    <summary><b>Updated GitHub integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers  
    # Keep existing githubUser mapping 
    - kind: user
      selector:
        query: 'true'
      port:
        entity:
          mappings:
            identifier: .login
            title: .login
            blueprint: '"githubUser"'
            properties:
              email: .email

    # Add new mapping for Port Users with relation to GitHub users
    // highlight-start
    - kind: user
      selector:
        query: '.email != null'
      port:
        entity:
          mappings:
            identifier: .email
            blueprint: '"_user"'
            relations:
              githubUser: .login
    // highlight-end
    ```

    </details>

4. Click on `Save & Resync` to apply the changes

</TabItem>

<TabItem value="gitlab" label="GitLab">

To update the GitLab integration mapping, follow the steps below:

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page.

2. Find your GitLab integration and click on it.

3. In the mapping configuration, add a new mapping for Port User entities to establish the relation with GitLab users:

    <details>
    <summary><b>Updated GitLab integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    # Keep existing gitlabMember mapping 
    - kind: member
      selector:
        query: 'true'
      port:
        entity:
          mappings:
            identifier: .username
            title: .name
            blueprint: '"gitlabMember"'
            properties:
              url: .web_url
              state: .state
              email: .email
              locked: .locked

    # Add new mapping for Port Users with relation to GitLab users
    // highlight-start
    - kind: member
      selector:
        query: '.email != null'
      port:
        entity:
          mappings:
            identifier: .email
            blueprint: '"_user"'
            relations:
              gitlabUser: .username
    // highlight-end
    ```

    </details>

4. Click on `Save & Resync` to apply the changes

</TabItem>

<TabItem value="azuredevops" label="Azure DevOps">

To update the Azure DevOps integration mapping, follow the steps below:

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page.

2. Find your Azure DevOps integration and click on it.

3. In the mapping configuration, add a new mapping for Port User entities to establish the relation with Azure DevOps users:

    <details>
    <summary><b>Updated Azure DevOps integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    # Keep existing azureDevopsMember mapping
    - kind: user
      selector:
        query: 'true'
      port:
        entity:
          mappings:
            identifier: .id
            title: .user.displayName
            blueprint: '"azureDevopsMember"'
            properties:
              url: .user.url
              email: .user.mailAddress

    # Add new mapping for Port Users with relation to Azure DevOps users
    // highlight-start
    - kind: user
      selector:
        query: '.user.mailAddress != null'
      port:
        entity:
          mappings:
            identifier: .user.mailAddress
            blueprint: '"_user"'
            relations:
              azureDevopsUser: .id
    // highlight-end
    ```

    </details>

4. Click on `Save & Resync` to apply the changes.

</TabItem>

</Tabs>

## Set up automation

To ensure new Port users are automatically mapped to their corresponding Git user accounts when a new Port user is created, we'll create an automation that triggers when a new Port user is created.

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync Port users to Git user accounts (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sync_port_user_for_git_users",
      "title": "Sync Port User for Git Users",
      "description": "Automatically maps Port users to their corresponding Git user accounts across all platforms",
      "icon": "Git",
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
            "githubUser": {
              "combinator": "and",
              "rules": [
                {
                  "property": "$identifier",
                  "operator": "=",
                  "value": "{{ .event.diff.after.identifier }}"
                }
              ]
            },
            "gitlabUser": {
              "combinator": "and",
              "rules": [
                {
                  "property": "$identifier",
                  "operator": "=",
                  "value": "{{ .event.diff.after.identifier }}"
                }
              ]
            },
            "azureDevopsUser": {
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

    :::tip Select the relevant Git integration
    In this automation example, we show how to map Port users to all supported Git platforms (GitHub, GitLab, and Azure DevOps) at once. In practice, you should only configure the relation for the Git platform your organization actually uses. For example, if your users are only in GitHub, include the `githubUser` relation and remove the others. Adjust the configuration to match your organization's setup.
    :::

    </details>

5. Click `Save` to create the automation.

## Let's test it!

1. Go to your [Software catalog](https://app.getport.io/catalog) page

2. Search for a Git user entity (e.g., `GitHub User`, `GitLab User`, or `Azure DevOps User`)

3. Verify that the user has a relationship with the corresponding Port user account.

4. Check that the relationship is established automatically for new Git users.

