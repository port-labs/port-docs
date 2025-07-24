---
displayed_sidebar: null
description: Automatically map GitHub, GitLab, and Azure DevOps users to their Port user accounts for seamless integration
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Map Git users to Port user accounts

This guide demonstrates how to automatically map Git users to existing Port user accounts based on email addresses. 

Once implemented, users will be able to:
- Maintain a complete inventory of all Git users in your organization within Port
- Automatically link Git users to their corresponding Port user accounts for seamless integration
- Provide visibility into which Git users have Port accounts and which don't

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have the relevant Git integration installed and configured:
  - [Port's GitHub App](/build-your-software-catalog/sync-data-to-catalog/git/github-exporter/).
  - [Port's GitLab integration](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-exporter/).
  - [Port's Azure DevOps integration](/build-your-software-catalog/sync-data-to-catalog/git/azure-devops-exporter/).
- You have permissions to create automations in Port.

## Set up data model

To establish relationships between Git users and Port user accounts, we need to add a relation to the existing Git user blueprints.

<h3> Update the Git user blueprints</h3>

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Find the relevant Git user blueprint (`GitHub User`, `GitLab User`, or `Azure DevOps User`) and click on it.

3. Click on the `Edit JSON` button in the top right corner.

4. Add the following relation to the `relations` section:

    ```json showLineNumbers
    "user": {
        "title": "Port User",
        "target": "_user",
        "required": false,
        "many": false
    }
    ```

5. Click on `Save` to update the blueprint.

## Implementation

Now we'll update the integration mapping to include the relation and create automations to sync Git users when a new Port user is added.

<Tabs>
<TabItem value="github" label="GitHub" default>

<h4> Update the GitHub integration mapping</h4>

To update the GitHub integration mapping, follow the steps below:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page.

2. Find your GitHub integration and click on it.

3. In the mapping configuration, update the user mapping to include the relation:

    <details>
    <summary><b>GitHub integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers  
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
            relations:
                user:
                combinator: '"and"'
                rules:
                    - property: '"$identifier"'
                    operator: '"="'
                    value: .email
    ```

    </details>

4. Click on `Save & Resync` to apply the changes

<h4> Create automation to sync GitHub users when a new Port user is added</h4>

To ensure new Port users get mapped to GitHub users automatically, we'll create an automation that triggers when a new Port user is created.

Follow the steps below to create the automation:

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync GitHub users when a new Port user is added (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "sync_github_user_for_new_port_user",
    "title": "Sync GitHub User for New Port User",
    "description": "Automatically maps GitHub users to newly created Port user accounts",
    "icon": "GitHub",
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
        "url": "https://api.getport.io/v1/entities/gitHubUser/{{ .event.diff.after.identifier }}/relations",
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

5. Click `Save` to create the automation

</TabItem>

<TabItem value="gitlab" label="GitLab">

<h4> Update the GitLab integration mapping</h4>

To update the GitLab integration mapping, follow the steps below:

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page.

2. Find your GitLab integration and click on it.

3. In the mapping configuration, update the user mapping to include the relation:

    <details>
    <summary><b>GitLab integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
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
            // highlight-start
            relations:
            user:
                combinator: '"and"'
                rules:
                - property: "$identifier"
                    operator: '"="'
                    value: .email
            // highlight-end
    ```

    </details>

4. Click on `Save & Resync` to apply the changes

<h4> Create automation to sync GitLab users when a new Port user is added</h4>

To ensure new Port users get mapped to GitLab users automatically, we'll create an automation that triggers when a new Port user is created.

Follow the steps below to create the automation:

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync GitLab users when a new Port user is added (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "sync_gitlab_user_for_new_port_user",
    "title": "Sync GitLab User for New Port User",
    "description": "Automatically maps GitLab users to newly created Port user accounts",
    "icon": "GitLab",
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
        "url": "https://api.getport.io/v1/entities/gitLabUser/{{ .event.diff.after.identifier }}/relations",
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

5. Click `Save` to create the automation

</TabItem>

<TabItem value="azuredevops" label="Azure DevOps">

<h4> Update the Azure DevOps integration mapping</h4>

To update the Azure DevOps integration mapping, follow the steps below:

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page.

2. Find your Azure DevOps integration and click on it.

3. In the mapping configuration, update the user mapping to include the relation:

    <details>
    <summary><b>Azure DevOps integration mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
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
            // highlight-start
            relations:
                user:
                combinator: '"and"'
                rules:
                    - property: "$identifier"
                    operator: '"="'
                    value: .user.mailAddress
                // highlight-end
    ```

    </details>

4. Click on `Save & Resync` to apply the changes.

<h4> Create automation to sync Azure DevOps users when a new Port user is added</h4>

To ensure new Port users get mapped to Azure DevOps users automatically, we'll create an automation that triggers when a new Port user is created.

Follow the steps below to create the automation:

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync Azure DevOps users when a new Port user is added (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "sync_azuredevops_user_for_new_port_user",
    "title": "Sync Azure DevOps User for New Port User",
    "description": "Automatically maps Azure DevOps users to newly created Port user accounts",
    "icon": "AzureDevops",
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
        "url": "https://api.getport.io/v1/entities/azureDevopsUser/{{ .event.diff.after.identifier }}/relations",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
        "Content-Type": "application/json",
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

</TabItem>

</Tabs>

:::tip Mapping explanation
These configurations automatically establish relationships between Git users and Port user accounts by matching the Git user's email address with the Port user's identifier (which is typically the email address).
:::

## Let's test it!

1. Go to your [software catalog](https://app.getport.io/catalog) page

2. Search for a Git user entity (e.g., `GitHub User`, `GitLab User`, or `Azure DevOps User`)

3. Verify that the user has a relationship with the corresponding Port user account.

4. Check that the relationship is established automatically for new Git users.


## Conclusion

You've successfully set up automatic mapping between Git users and Port user accounts.

