---
displayed_sidebar: null
description: Learn how to create a GitHub issue in Port, streamlining issue categorization and tracking.
---

import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create a Github issue

## Overview
This guide will demonstrate how to implement a self-service action that creates GitHub issues directly from Port using **synced webhooks**.

This functionality streamlines project management by enabling users to create issues without leaving Port.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your GitHub organization with permissions to manage issues.
- Optional - Install Port's [GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/).

## Set up data model

If you haven't installed the GitHub integration, you will need to manually create a blueprint for GitHub repository.  
We highly recommend that you install the GitHub integration to have such resources automatically set up for you. 

<h3> Create the repository blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub Repository Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "githubRepository",
    "title": "Repository",
    "icon": "Microservice",
    "schema": {
        "properties": {
        "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown"
        },
        "url": {
            "title": "Repository URL",
            "type": "string",
            "format": "url"
        },
        "defaultBranch": {
            "title": "Default branch",
            "type": "string"
        }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {}
    }
    ```
    </details>
5. Click `Save` to create the blueprint.


## Implementation

You can create GitHub issues by leveraging Port's **synced webhooks** and **secrets** to directly interact with GitHub's REST API.

### Add Port secrets

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `GITHUB_TOKEN`: Your [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with the permission to create issue.
    - `GITHUB_ORG`: Your GitHub organization or username


### Set up self-service action

Follow these steps to create the self-service action:

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste this JSON configuration into the editor.

    <details>
    <summary><b>Create GitHub Issue (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "create_github_issue",
    "title": "Create GitHub Issue",
    "icon": "Github",
    "description": "A self service action to open a GitHub repository issue with labels",
    "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
        "properties": {
            "title": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Issue Title"
            },
            "labels": {
            "type": "array",
            "title": "Label",
            "description": "issue label",
            "default": [
                "bug"
            ],
            "items": {
                "enum": [
                "bug",
                "enhancement",
                "documentation",
                "dependencies",
                "question",
                "invalid",
                "duplicate"
                ],
                "enumColors": {
                "bug": "red",
                "enhancement": "turquoise",
                "documentation": "blue",
                "dependencies": "purple",
                "question": "lime",
                "invalid": "yellow",
                "duplicate": "orange"
                },
                "type": "string"
            }
            },
            "content": {
            "type": "string",
            "title": "Content",
            "format": "markdown"
            }
        },
        "required": [
            "title"
        ],
        "order": [
            "title",
            "content",
            "labels"
        ]
        },
        "blueprintIdentifier": "githubRepository"
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/{{ .secrets.GITHUB_ORG }}/{{ .entity.identifier }}/issues",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer {{ .secrets.GITHUB_TOKEN }}",
        "Accept": "application/vnd.github+json"
        },
        "body": {
        "title": "{{ .inputs.title }}",
        "labels": "{{ .inputs.labels }}",
        "body": "{{ .inputs.content }}"
        }
    },
    "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create GitHub Issue` action in the self-service page. 🎉


## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Choose the `Create GitHub Issue` action:

3. Enter the required information:
   - Issue name.
   - Description of the issue.
   - Label.

4. Click on `Execute`.

5. Done! Wait for the issue to be created in GitHub.
