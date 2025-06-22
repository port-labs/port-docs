---
sidebar_position: 8
displayed_sidebar: null
description: Learn how to implement comprehensive service locking in Port with self-service actions and automated deployment checks in GitHub workflows.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Lock and unlock service in Port

## Overview
This guide will help you implement a comprehensive service locking mechanism in Port that allows you to lock and unlock services during critical periods while ensuring deployment safety through automated checks.

You can implement this functionality in two ways:
1. **Self-service actions**: A streamlined approach using Port's built-in capabilities for locking/unlocking services with automated notifications (recommended).
2. **GitHub workflow checks**: An automated approach that checks lock status during CI/CD pipelines and blocks deployments when services are locked.


## Common use cases

- **Maintenance & Critical Events**: Lock deployment during maintenance, peak traffic periods (campaigns, holidays), or critical events to maintain stability
- **Emergency Situations**: Lock deployment in emergencies such as security breaches or vulnerabilities to mitigate risks and prevent further issues
- **Post-Incident Fixes**: Unlock deployment to allow teams to implement necessary fixes or updates swiftly and restore system functionality
- **Automated Compliance**: Ensure deployment policies are enforced automatically through CI/CD pipelines

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Port organization with permissions to create blueprints and self-service actions.
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed (required for GitHub workflow implementation).
- [Slack webhook URL](https://api.slack.com/messaging/webhooks) for notifications (optional).

## Set up data model

The `service` blueprint that was created for you as part of the onboarding process will need to be extended with additional properties for managing lock states across different environments.

<h3> Update the service blueprint</h3>

1. Head to the [data model](https://app.getport.io/data-model) page.

2. Click on the `Service` blueprint.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

        <details>
    <summary><b>Additional properties to add (click to expand)</b></summary>

    Add the following properties to the existing `properties` section of your service blueprint:

    ```json showLineNumbers
    "locked_in_prod": {
      "icon": "DefaultProperty",
      "title": "Locked in Prod",
      "type": "boolean",
      "default": false
    },
    "locked_reason_prod": {
      "icon": "DefaultProperty",
      "title": "Locked Reason Prod",
      "type": "string"
    },
    "locked_in_test": {
      "icon": "DefaultProperty",
      "title": "Locked in Test",
      "type": "boolean",
      "default": false
    },
    "locked_reason_test": {
      "icon": "DefaultProperty",
      "title": "Locked Reason Test",
      "type": "string"
    },
    "trigger_type": {
      "icon": "DefaultProperty",
      "title": "Lock or Unlock",
      "type": "string"
    },
    "triggered_environment": {
      "icon": "DefaultProperty",
      "title": "Triggered Environment",
      "type": "string"
    }
    ```
    </details>

5. Click `Save`.



## Implementation

<Tabs>

<TabItem value="self-service-actions" label="Self-service actions" default>

You can implement service locking functionality using Port's self-service actions combined with automations.   
This approach provides a user-friendly interface for managing service locks with automatic notifications.

<h3>Create self-service actions</h3>

Follow these steps to create the lock and unlock actions:

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration for the lock action.

    <details>
    <summary><b>Lock Service action (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "lock_service",
      "title": "Lock Service",
      "icon": "Lock",
      "description": "Lock service in Port",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "reason": {
              "type": "string",
              "title": "Reason"
            },
            "environment": {
              "type": "string",
              "title": "Environment",
              "enum": [
                "Production",
                "Staging",
                "Development"
              ],
              "enumColors": {
                "Production": "green",
                "Staging": "orange",
                "Development": "blue"
              }
            }
          },
          "required": ["reason", "environment"],
          "order": [
            "reason",
            "environment"
          ]
        },
        "blueprintIdentifier": "service"
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
          "identifier": "{{ .entity.identifier }}",
          "title": "{{ .entity.title }}",
          "properties": {
            "{{ if .inputs.environment == 'Production' then 'locked_in_prod' else 'locked_in_test' end }}": true,
            "{{ if .inputs.environment == 'Production' then 'locked_reason_prod' else 'locked_reason_test' end }}": "{{ .inputs.reason }}",
            "trigger_type": "Locked",
            "triggered_environment": "{{ .inputs.environment }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save`.

6. Create another action for unlocking services with the following JSON configuration:

    <details>
    <summary><b>Unlock service action (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "unlock_service",
      "title": "Unlock Service",
      "icon": "Unlock",
      "description": "Unlock service in Port",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "reason": {
              "type": "string",
              "title": "Reason"
            },
            "environment": {
              "type": "string",
              "title": "Environment",
              "enum": [
                "Production",
                "Staging",
                "Development"
              ],
              "enumColors": {
                "Production": "green",
                "Staging": "orange",
                "Development": "blue"
              }
            }
          },
          "required": ["reason", "environment"],
          "order": [
            "reason",
            "environment"
          ]
        },
        "blueprintIdentifier": "service"
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
          "identifier": "{{ .entity.identifier }}",
          "title": "{{ .entity.title }}",
          "properties": {
            "{{ if .inputs.environment == 'Production' then 'locked_in_prod' else 'locked_in_test' end }}": false,
            "{{ if .inputs.environment == 'Production' then 'locked_reason_prod' else 'locked_reason_test' end }}": "{{ .inputs.reason }}",
            "trigger_type": "Unlocked",
            "triggered_environment": "{{ .inputs.environment }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```

    </details>

7. Click `Save`.

<h3>Set up Slack notifications</h3>

Create an automation that sends Slack notifications when service lock status changes.

1. Head to the [automation](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    :::info Slack webhook URL
    Replace `<Your Generated Slack Webhook>` in the automation definition with your actual Slack webhook URL.
    :::

    <details>
    <summary><b>Slack notification automation (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "serviceLockStatusChange",
      "title": "Notify Slack on Service Lock Status Change",
      "icon": "Slack",
      "description": "Sends a Slack message when the service lock status changes.",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "service"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.locked_in_prod != .diff.before.properties.locked_in_prod or .diff.after.properties.locked_in_test != .diff.before.properties.locked_in_test"
          ],
          "combinator": "or"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "<Your Generated Slack Webhook>",
        "agent": false,
        "synchronized": true,
        "body": {
          "text": "*Port Service {{ .event.diff.after.properties.trigger_type }}*\n\n*Service Name*: {{ .event.diff.after.title }}\n*Link*: https://app.getport.io/{{ .event.context.blueprintIdentifier }}Entity?identifier={{ .event.context.entityIdentifier }}\n\n*Environment:* {{ .event.diff.after.properties.triggered_environment }}\n*Reason:* {{ if .event.diff.after.properties.triggered_environment == 'Production' then .event.diff.after.properties.locked_reason_prod else .event.diff.after.properties.locked_reason_test end }}"
        }
      },
      "publish": true
    }
    ```

    </details>

4. Click `Save`.

</TabItem>

<TabItem value="github-workflow" label="GitHub workflow">

To implement deployment checks using GitHub workflows, follow these steps:

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
- `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

<h3>Add GitHub workflow</h3>

Create the file `.github/workflows/check-service-lock.yml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>GitHub workflow configuration (click to expand)</b></summary>

```yml showLineNumbers title="check-service-lock.yml"
name: Check Service Lock Status Before Deployment
on:
  push:
    branches:
      - "main"
  pull_request:
    branches:
      - "main"
    types: [opened, synchronize, reopened]

jobs:
  get-entity:
    runs-on: ubuntu-latest
    outputs:
      entity: ${{ steps.port-github-action.outputs.entity }}
    steps:
      - id: port-github-action
        name: Get entity from Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          identifier: notification-service # Replace with your service identifier
          blueprint: service
          operation: GET

  check-production-lock:
    runs-on: ubuntu-latest
    needs: get-entity
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Get production lock status
        run: echo "PROD_LOCK_STATUS=$(echo '${{needs.get-entity.outputs.entity}}' | jq -r .properties.locked_in_prod)" >> $GITHUB_ENV
      
      - name: Get production lock reason
        run: echo "PROD_LOCK_REASON=$(echo '${{needs.get-entity.outputs.entity}}' | jq -r .properties.locked_reason_prod)" >> $GITHUB_ENV
      
      - name: Check production lock status 🚧
        if: ${{ env.PROD_LOCK_STATUS == 'true' }}
        run: |
          echo "❌ Service is locked in production"
          echo "🔒 Lock reason: ${{ env.PROD_LOCK_REASON }}"
          echo "🛑 Deployment blocked until service is unlocked"
          exit 1
      
      - name: Production lock check passed ✅
        if: ${{ env.PROD_LOCK_STATUS == 'false' }}
        run: |
          echo "✅ Service is not locked in production"
          echo "🚀 Ready to proceed with deployment"

  check-test-lock:
    runs-on: ubuntu-latest
    needs: get-entity
    if: github.event_name == 'pull_request'
    steps:
      - name: Get test environment lock status
        run: echo "TEST_LOCK_STATUS=$(echo '${{needs.get-entity.outputs.entity}}' | jq -r .properties.locked_in_test)" >> $GITHUB_ENV
      
      - name: Get test environment lock reason
        run: echo "TEST_LOCK_REASON=$(echo '${{needs.get-entity.outputs.entity}}' | jq -r .properties.locked_reason_test)" >> $GITHUB_ENV
      
      - name: Check test environment lock status 🚧
        if: ${{ env.TEST_LOCK_STATUS == 'true' }}
        run: |
          echo "❌ Service is locked in test environment"
          echo "🔒 Lock reason: ${{ env.TEST_LOCK_REASON }}"
          echo "🛑 Test deployment blocked until service is unlocked"
          exit 1
      
      - name: Test environment lock check passed ✅
        if: ${{ env.TEST_LOCK_STATUS == 'false' }}
        run: |
          echo "✅ Service is not locked in test environment"
          echo "🚀 Ready to proceed with test deployment"

  run-production-deployment:
    runs-on: ubuntu-latest
    needs: [check-production-lock]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production 🚀
        run: |
          echo "🚀 Deploying service to production environment"
          echo "✅ Production deployment completed successfully"
          # Add your actual deployment commands here

  run-test-deployment:
    runs-on: ubuntu-latest
    needs: [check-test-lock]
    if: github.event_name == 'pull_request'
    steps:
      - name: Deploy to Test Environment 🧪
        run: |
          echo "🧪 Deploying service to test environment"
          echo "✅ Test deployment completed successfully"
          # Add your actual test deployment commands here
```

<PortApiRegionTip/>
</details>

</TabItem>

</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Click on the `Lock Service` action

3. Choose the service you want to lock

4. Enter a reason for the lock (e.g., "Maintenance window for database upgrade")

5. Select the environment (Production, Staging, or Development)

6. Click on `Execute`

7. Check your Slack channel for the lock notification (if configured)

8. If using the GitHub workflow approach, try pushing code to your repository - the workflow should fail with a lock message

9. Execute the `Unlock Service` action to unlock the service

10. Check your Slack channel for the unlock notification

11. If using the GitHub workflow approach, push code again - the workflow should now succeed



Here are some visual examples of the workflow in action:

<h4>When a service is locked:</h4>  

If you try to push code to your repository when the `locked_in_prod` field is set to `true`, the deployment workflow will stop:

<img src="/img/guides/serviceInProdLocked.png" border="1px" />

When you look at the step that failed, you will see that the failure is due to the value of the locked field:

<img src="/img/guides/serviceInProdLockedDetails.png" border="1px" />

**When a service is unlocked:**

If you set the value of the `locked_in_prod` field to `false`, the workflow will perform the deployment without any issue:

<img src="/img/guides/serviceInProdNotLocked.png" border="1px" />

**Slack notifications:**

Below is the result of successful service lock and unlock alerts sent to a Slack channel after triggering the actions:

<img src="/img/guides/lockServiceSlackAlert.png" border="1px" />
<img src="/img/guides/unlockServiceSlackAlert.png" border="1px" />

