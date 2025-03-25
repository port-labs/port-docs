---
displayed_sidebar: null
description: Learn how to add tags to your SonarQube projects in Port, improving project categorization and streamlined workflows.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Add Tags to SonarQube Project

## Overview
This guide will help you implement a self-service action in Port that allows you to add tags to SonarQube projects directly from Port.
This functionality streamlines project management by enabling users to categorize and label projects based on various attributes such as technology stack, business domain, or team ownership without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with SonarQube's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your SonarQube instance with permissions to manage projects.
- SonarQube API token with 'Administer' rights on the specified project. Check [SonarQube's documentation](https://docs.sonarsource.com/sonarqube/latest/user-guide/user-account/generating-and-using-tokens/) on how to retrieve your API Token.
- Optional - Install Port's SonarQube integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)

	:::tip SonarQube Integration
	This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with your SonarQube projects.
	:::

## Set up data model

If you haven't installed the SonarQube integration, you'll need to create a blueprint for SonarQube projects.
However, we highly recommend you install the SonarQube integration to have these automatically set up for you.

<h3>Create the SonarQube project blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>SonarQube Project Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sonarQubeProject",
      "title": "SonarQube Project",
      "icon": "sonarqube",
      "schema": {
        "properties": {
          "organization": {
            "type": "string",
            "title": "Organization",
            "icon": "TwoUsers"
          },
          "link": {
            "type": "string",
            "format": "url",
            "title": "Link",
            "icon": "Link"
          },
          "lastAnalysisDate": {
            "type": "string",
            "format": "date-time",
            "icon": "Clock",
            "title": "Last Analysis Date"
          },
          "numberOfBugs": {
            "type": "number",
            "title": "Number Of Bugs"
          },
          "numberOfCodeSmells": {
            "type": "number",
            "title": "Number Of CodeSmells"
          },
          "numberOfVulnerabilities": {
            "type": "number",
            "title": "Number Of Vulnerabilities"
          },
          "numberOfHotSpots": {
            "type": "number",
            "title": "Number Of HotSpots"
          },
          "numberOfDuplications": {
            "type": "number",
            "title": "Number Of Duplications"
          },
          "coverage": {
            "type": "number",
            "title": "Coverage"
          },
          "mainBranch": {
            "type": "string",
            "icon": "Git",
            "title": "Main Branch"
          },
          "tags": {
            "type": "array",
            "title": "Tags"
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

5. Click "Save" to create the blueprint.

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can add tags to SonarQube projects by leveraging Port's **synced webhooks** and **secrets** to directly interact with the SonarQube's API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="SonarQube" />


    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
       - `SONARQUBE_HOST_URL`: Your SonarQube instance URL
       - `SONARQUBE_API_TOKEN`: Your SonarQube API token

    <h3>Set up self-service action</h3>

    We will create a self-service action to handle adding tags to SonarQube projects using webhooks.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Add Tags to SonarQube Project (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "add_tags_to_sonarqube_project_webhook",
          "title": "Add Tags to SonarQube Project (Webhook)",
          "icon": "sonarqube",
          "description": "Add tags to a SonarQube project using a webhook",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "tags": {
                  "title": "Tags",
                  "description": "Comma separated list of tags",
                  "icon": "DefaultProperty",
                  "type": "string"
                }
              },
              "required": [
                "tags"
              ],
              "order": [
                "tags"
              ]
            },
            "blueprintIdentifier": "sonarQubeProject"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "{{.secrets.SONARQUBE_HOST_URL}}/api/project_tags/set",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Authorization": "Bearer {{.secrets.SONARQUBE_API_TOKEN}}",
              "Content-Type": "application/x-www-form-urlencoded"
            },
            "queryParams": {
              "project": "{{.entity.identifier}}",
              "tags": "{{.inputs.tags}}"
            }
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Add Tags to SonarQube Project (Webhook)` actions in the self-service page. 🎉

    <h3> Create an automation to update entity in port </h3>

    To keep your catalog updated with the latest tags, you can create an automation that will update the SonarQube project entity in Port immediately after the webhook action completes successfully.

    Follow these steps to add the automation:

    1. Head to the [automation](https://app.getport.io/settings/automations) page.

    2. Click on the `+ Automation` button.

    3. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Update SonarQube project tags in Port automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "sonarQubeProject_sync_tags",
          "title": "Sync SonarQube Project Tags",
          "description": "Update SonarQube project tags in Port after adding tags",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "RUN_UPDATED",
              "actionIdentifier": "add_tags_to_sonarqube_project_webhook"
            },
            "condition": {
              "type": "JQ",
              "expressions": [
                ".diff.after.status == \"SUCCESS\""
              ],
              "combinator": "and"
            }
          },
          "invocationMethod": {
            "type": "UPSERT_ENTITY",
            "blueprintIdentifier": "sonarQubeProject",
            "mapping": {
              "identifier": "{{.event.diff.after.entity.identifier}}",
              "properties": {
                "tags": "{{.event.diff.after.inputs.tags | split(\",\")}}"
              }
            }
          },
          "publish": true
        }
        ```
        </details>

    4. Click `Save`.

    Now when you execute the webhook action, the project tags in Port will be automatically updated with the latest information from SonarQube.

    :::info API limitations
    Due to SonarQube API's limitation, this action replaces the tags on the project with the new ones specified. If you want to add to the already existing tags, copy the existing tags and add them with the new ones you are adding.
    :::

  </TabItem>
  <TabItem value="github" label="GitHub workflow">

    To implement this use-case using a GitHub workflow, follow these steps:

    <h3> Add GitHub secrets </h3>

    In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    - `SONARQUBE_HOST_URL` - SonarQube instance URL. `https://sonarqube.com` if using Sonarcloud.
    - `SONARQUBE_API_TOKEN` - SonarQube API token. This can be a Project Analysis token for the specific project, a Global Analysis token or a user token.
    - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
    - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

    <h3>Add GitHub workflow</h3>

    Create the file `.github/workflows/add-tags-to-sonarqube-project.yml` in the `.github/workflows` folder of your repository.

    <GithubDedicatedRepoHint/>

    <details>
    <summary><b>GitHub Workflow (Click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Add tags to SonarQube project
    on:
      workflow_dispatch:
        inputs:
          tags:
            type: string
            required: true
          port_context:
            required: true
            type: string

    jobs:
      create-entity-in-port-and-update-run:
        runs-on: ubuntu-latest
        steps:
          - name: Inform Port of start of request to SonarQube
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).run_id}}
              logMessage: Starting request to add tags to SonarQube project
          
          - name: Add tags to SonarQube project
            uses: fjogeleit/http-request-action@v1
            with:
              url: "${{ secrets.SONARQUBE_HOST_URL }}/api/project_tags/set?project=${{ fromJson(inputs.port_context).entity }}&tags=${{ inputs.tags }}"
              method: "POST"
              bearerToken: ${{ secrets.SONARQUBE_API_TOKEN }}
              customHeaders: '{"Content-Type": "application/json"}'

          - name: Inform Port of completion of request to SonarQube
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).run_id }}
              logMessage: Finished request to add tags to SonarQube project
    ```
    </details>

    <h3>Set up self-service action</h3>

    We will create a self-service action to handle adding tags to SonarQube projects.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Add Tags to SonarQube Project (Click to expand)</b></summary>

        <GithubActionModificationHint/>

        ```json showLineNumbers
        {
          "identifier": "sonarQubeProject_add_tags_to_sonar_qube_project",
          "title": "Add Tags to SonarQube project",
          "icon": "sonarqube",
          "description": "Adds additional tags to a project in SonarQube",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "tags": {
                  "title": "Tags",
                  "description": "Comma separated list of tags",
                  "icon": "DefaultProperty",
                  "type": "string"
                }
              },
              "required": [
                "tags"
              ],
              "order": [
                "tags"
              ]
            },
            "blueprintIdentifier": "sonarQubeProject"
          },
          "invocationMethod": {
            "type": "GITHUB",
            "org": "<GITHUB_ORG>",
            "repo": "<GITHUB_REPO>",
            "workflow": "add-tags-to-sonarqube-project.yml",
            "workflowInputs": {
              "tags": "{{.inputs.\"tags\"}}",
              "port_context": {
                "entity": "{{.entity.identifier}}",
                "run_id": "{{.run.id}}"
              }
            },
            "reportWorkflowStatus": true
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Add Tags to SonarQube project` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Add Tags to SonarQube project`
   - For webhook: Click on `Add Tags to SonarQube Project (Webhook)`

3. Select the SonarQube project where you want to add tags

4. Enter the required information:
   - Enter a comma-separated list of tags (e.g., "backend,java,microservice")

5. Click on `Execute`

6. Done! Wait for the tags to be added to the SonarQube project

## More relevant guides and examples
- [Connect SonarQube project to a service](https://docs.port.io/guides/all/connect-sonar-project-to-service)
- [Create a SonarQube project](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/SonarQube/create-sonarqube-project)
- [Delete a SonarQube project](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/SonarQube/delete-sonarqube-project)