---
sidebar_position: 8
displayed_sidebar: null
description: Learn how to chain self service actions and automations to manage deployment in GitLab and ServiceNow
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Approval Workflows for Service Deployment

This guide demonstrates the power and flexibility of chaining self-service actions and automations in Port to deploy a service. The deployment process is integrated with GitLab pipelines and ServiceNow for handling approval workflows when thresholds are violated.

## Use-case

- A **developer** initiates a deployment via **Port's SSA**, triggering a **GitLab pipeline**.  
- Pipeline stages: **build**, **test**, and **deploy**.  
- If **code coverage** in **test** stage meets the threshold, deployment proceeds.  
- If coverage fails, a **ServiceNow Change Request (CR)** is created.  
- A **Platform Engineer** can **approve** or **decline** the CR in **Port**.
- CR decisions in **ServiceNow UI** trigger **Port automation** to update the pipeline.  


## Prerequisites

- **Port account**: If you don't have a Port account, you will need to [create one](https://app.getport.io/signup).
- **GitLab environment**: This guide includes the creation of actions and automations that use a GitLab pipeline as their backend.
- **ServiceNow instance access**: You need admin or developer-level access.
- Create the following GitLab secrets:
  - PORT_CLIENT_ID - Your port client id.
  - PORT_CLIENT_SECRET - Your port client secret.
  - SERVICENOW_INSTANCE_URL - The ServiceNow instance URL. For example https://example-id.service-now.com.
  - SERVICENOW_API_TOKEN - A base64 encoded string of your servicenow credentials generated as `<username>:<password>`.
  - Create a secret in Port named `SERVICENOW_API_TOKEN` with the base64 token content


## Data Model

Define a new <PortTooltip id="blueprint">blueprint</PortTooltip> in Port for the change request entity using the following JSON definition:

<details>
<summary><b>ServiceNow change request (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "servicenowChangeRequest",
  "title": "Servicenow Change Request",
  "icon": "Servicenow",
  "schema": {
    "properties": {
      "number": {
        "title": "Change Number",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "isActive": {
        "title": "Is active",
        "type": "boolean"
      },
      "priority": {
        "title": "Priority",
        "type": "string"
      },
      "state": {
        "icon": "DefaultProperty",
        "title": "State",
        "type": "string"
      },
      "createdOn": {
        "title": "Created On",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string"
      },
      "service": {
        "type": "string",
        "title": "Service"
      },
      "category": {
        "type": "string",
        "title": "Category"
      },
      "approval": {
        "title": "Approval",
        "icon": "DefaultProperty",
        "type": "string",
        "enum": [
          "approved",
          "not requested",
          "requested",
          "rejected"
        ],
        "enumColors": {
          "approved": "green",
          "not requested": "turquoise",
          "requested": "yellow",
          "rejected": "pink"
        }
      },
      "externalTags": {
        "type": "string",
        "title": "External Tags"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```
</details>

:::tip Add a New Column to the Change Request Table  
Add a new column named `external_tags` to your `change_request` table in ServiceNow to associate deployment requests with their corresponding Port context.  
Follow the [ServiceNow documentation](https://developer.servicenow.com/dev.do#!/learn/learning-plans/xanadu/new_to_servicenow/app_store_learnv2_buildneedit_xanadu_adding_fields_to_a_table) to complete this step.  
:::  


## Actions & automations

This workflow uses three self-service actions and two automations to manage the deployment of service and approval of change request.

### Self-service actions

Go to the [self-service page](https://app.getport.io/self-serve) of your portal and create the following actions using the JSON definitions below:

This action can be executed by a developer to request the deployment of a service.
  <details>
  <summary><b>Request deployment of service (click to expand)</b></summary>

  This action uses the `WEBHOOK` backend type, which directly invokes the `pre_deployment_check` action to trigger the GitLab pipeline. It passes a required `deploy_run_id` param to the request object for the purpose of streaming logs between the two actions.

  ```json showLineNumbers
    {
    "identifier": "deploy_service_to_cluster",
    "title": "Deploy Service to Cluster",
    "icon": "Deployment",
    "description": "Deploys a service to a cluster",
    "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
        "properties": {
            "environment": {
            "type": "string",
            "title": "Environment",
            "icon": "Environment",
            "default": "Staging",
            "enum": [
                "Development",
                "Staging",
                "Production"
            ],
            "enumColors": {
                "Development": "lightGray",
                "Staging": "lightGray",
                "Production": "lightGray"
            }
            }
        },
        "required": [],
        "order": []
        },
        "blueprintIdentifier": "service"
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "${PORT_API_URL}/actions/pre_deployment_check/runs",
        "agent": false,
        "synchronized": false,
        "method": "POST",
        "headers": {
        "RUN_ID": "{{ .run.id }}"
        },
        "body": {
        "properties": {
            "deploy_run_id": "{{ .run.id }}",
            "{{ spreadValue() }}": "{{ .inputs }}",
            "runId": "{{ .run.id }}",
            "blueprint": "{{ .action.blueprint }}",
            "entity": "{{ .entity.identifier }}"
        }
        }
    },
    "requiredApproval": false
    }
  ```
  </details>

This action triggers the GitLab pipeline which contains the deployment logic and streams log back to the `deploy_service_to_cluster` action in Port.

  <details>
  <summary><b>Pre deployment checks (click to expand)</b></summary>

  Remember to replace the `GITLAB_PROJECT_ID` and `GITLAB_TRIGGER_TOKEN` placeholders with your values.  
  To learn how to obtain these values, see the [GitLab backend documentation](/actions-and-automations/setup-backend/gitlab-pipeline/saas#create-the-webhook-url).

  ```json showLineNumbers
    {
    "identifier": "pre_deployment_check",
    "title": "Pre Deployment Check",
    "icon": "Deployment",
    "description": "Pre Deployment checks and change request creator",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "deploy_run_id": {
            "type": "string",
            "title": "Deploy Run Id"
            }
        },
        "required": [],
        "order": []
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://gitlab.com/api/v4/projects/{GITLAB_PROJECT_ID}/ref/main/trigger/pipeline?token={GITLAB_TRIGGER_TOKEN}",
        "agent": false,
        "synchronized": false,
        "method": "POST",
        "headers": {
        "RUN_ID": "{{ .run.id }}"
        },
        "body": {
        "{{ spreadValue() }}": "{{ .inputs }}",
        "approval_status": "pending",
        "port_context": {
            "runId": "{{ .run.id }}"
        }
        }
    },
    "requiredApproval": false
    }
  ```
  </details>


This action can be executed by an admin to approve the change request. It triggers the GitLab pipeline and updates the status of the `servicenowChangeRequest` entity in ServiceNow to *"approved/rejected"*.
  <details>
  <summary><b>Approve change request (click to expand)</b></summary>

  Remember to replace the `GITLAB_PROJECT_ID` and `GITLAB_TRIGGER_TOKEN` placeholders with your values.  
  To learn how to obtain these values, see the [GitLab backend documentation](/actions-and-automations/setup-backend/gitlab-pipeline/saas#create-the-webhook-url).

  ```json showLineNumbers
    {
    "identifier": "approve_and_deploy_service",
    "title": "Approve and Deploy Service",
    "icon": "Deployment",
    "description": "Approves a ServiceNow change request and triggers a GitLab pipeline",
    "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
        "properties": {
            "reason": {
            "type": "string",
            "title": "Reason"
            },
            "approval_status": {
            "icon": "DefaultProperty",
            "title": "Action",
            "type": "string",
            "default": "approved",
            "enum": [
                "approved",
                "declined"
            ],
            "enumColors": {
                "approved": "lightGray",
                "declined": "lightGray"
            }
            }
        },
        "required": [],
        "order": [
            "approval_status",
            "reason"
        ]
        },
        "blueprintIdentifier": "servicenowChangeRequest"
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://gitlab.com/api/v4/projects/{GITLAB_PROJECT_ID}/ref/main/trigger/pipeline?token={GITLAB_TRIGGER_TOKEN}",
        "agent": false,
        "synchronized": false,
        "method": "POST",
        "headers": {
        "RUN_ID": "{{ .run.id }}"
        },
        "body": {
        "{{ spreadValue() }}": "{{ .inputs }}",
        "port_context": {
            "runId": "{{ .run.id }}"
        },
        "deploy_run_id": "{{ .entity.properties.externalTags }}",
        "system_id": "{{ .entity.identifier }}"
        }
    },
    "requiredApproval": false
    }
  ```
  </details>

### Automations

Go to the [automations page](https://app.getport.io/settings/automations) of your portal, then create the following automations using the JSON definitions below:


This automation is triggered when a run of type `approve_and_deploy_service` action is created. It's purpose is to patch the approval field in ServiceNow to `approved` or `rejected`.

  <details>
  <summary><b>Patch change request in ServiceNow (click to expand)</b></summary>

  Remember to replace the `SERVICENOW_INSTANCE` placeholders with your values.

  ```json showLineNumbers
    {
    "identifier": "updateChangeRequestInSnow",
    "title": "Patch Change Request in ServiceNow",
    "description": "Sends a PATCH request to serviceNow when the admin approves or declines the change request",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "RUN_CREATED",
        "actionIdentifier": "approve_and_deploy_service"
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://{SERVICENOW_INSTANCE}/api/now/table/change_request/{{ .event.diff.after.entity.identifier }}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
        "Authorization": "Basic {{ .secrets.SERVICENOW_API_TOKEN }}"
        },
        "body": {
        "approval": "{{ .event.diff.after.properties.approval_status  }}"
        }
    },
    "publish": true
    }
  ```
  </details>


This automation is triggered when a `servicenowChangeRequest` is updated to *"approved"* or *"rejected"*

  <details>
  <summary><b>Trigger Gitlab pipeline from webhook listener (click to expand)</b></summary>

  Remember to replace the GITLAB_PROJECT_ID and GITLAB_TRIGGER_TOKEN placeholders with your values

  ```json showLineNumbers
    {
    "identifier": "approveSnowPipeline",
    "title": "Approve or Deny GitLab Pipeline from SNOW",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "ENTITY_UPDATED",
        "blueprintIdentifier": "servicenowChangeRequest"
        },
        "condition": {
        "type": "JQ",
        "expressions": [
            ".diff.after.properties.approval == \"approved\"",
            ".diff.after.properties.approval == \"rejected\""
        ],
        "combinator": "or"
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://gitlab.com/api/v4/projects/{GITLAB_PROJECT_ID}/ref/main/trigger/pipeline?token={GITLAB_TRIGGER_TOKEN}",
        "agent": false,
        "synchronized": false,
        "method": "POST",
        "headers": {
        "RUN_ID": "{{ .run.id }}"
        },
        "body": {
        "port_context": {
            "runId": "{{ .run.id }}"
        },
        "approval_status": "{{ .event.diff.after.properties.approval  }}",
        "system_id": "{{ .event.diff.after.identifier  }}",
        "deploy_run_id": "{{ .event.diff.after.properties.externalTags }}"
        }
    },
    "publish": true
    }
  ```
  </details>

:::tip configure webhooks in ServiceNow
Follow our documentation to [learn how to configure webhooks in ServiceNow](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow#alternative-installation-via-webhook)
:::

### GitLab pipeline script
This pipeline contains the logic for service deployment. The pipeline consists of three stages: **build**, **test** and **deploy**

<details>
<summary><b>GitLab pipeline</b></summary>

```yaml showLineNumbers
stages:
  - build
  - test
  - deploy

image: alpine:latest

variables:
  PORT_CLIENT_ID: ${PORT_CLIENT_ID}
  PORT_CLIENT_SECRET: ${PORT_CLIENT_SECRET}
  PORT_API_URL: "${PORT_API_URL}"
  SERVICENOW_INSTANCE_URL: ${SERVICENOW_INSTANCE_URL}
  SERVICENOW_API_TOKEN: ${SERVICENOW_API_TOKEN} # Base64 encoded version of SNOW username:password
  APPROVAL_STATUS: "pending" # Default status for all pipelines


initialize-build:
  stage: build
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |
      echo "Initiating build checks"
      echo "Getting access token from Port API"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s '${PORT_API_URL}/auth/access_token' | jq -r '.accessToken')
  
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.port_context.runId')
      deployActionRunId=$(cat $TRIGGER_PAYLOAD | jq -r '.deploy_run_id')
      APPROVAL_STATUS=$(cat "$TRIGGER_PAYLOAD" | jq -r '.approval_status // "pending"')


      echo "DEPLOY_ACTION_RUN_ID=$deployActionRunId" >> data.env
      echo "TRIGGER_ACTION_RUN_ID=$runId" >> data.env
      echo "APPROVAL_STATUS=$APPROVAL_STATUS" >> data.env


      # Check APPROVAL STATUS
      if [ "$APPROVAL_STATUS" = "approved" ]; then
        echo "Deployment approved by platform engineer. Skipping initial logs and proceeding directly."
        # Log the approval message to Port action run logs
        curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $accessToken" \
          -d '{"message":"✅ Deployment approved by platform engineer, proceeding with deployment"}' \
          "${PORT_API_URL}/actions/runs/$deployActionRunId/logs"

      elif [ "$APPROVAL_STATUS" = "declined" ]; then
          echo "Deployment declined by platform engineer. Notifying developer."
          # Send the decline notification to Port logs for developer
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $accessToken" \
            -d '{"terminationStatus":"FAILURE", "message":"❌ Deployment declined by platform engineer. Please review the change request and take necessary actions."}' \
            "${PORT_API_URL}/actions/runs/$deployActionRunId/logs"
        
          # Send the decline notification to Port logs
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $accessToken" \
            -d '{"terminationStatus":"SUCCESS", "message":"❌ Declined deployment"}' \
            "${PORT_API_URL}/actions/runs/$runId/logs"
          exit 1  # Exit pipeline due to declined approval
      else
        curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $accessToken" \
          -d '{"message":"🚀 Initiating deployment sequence, preparing environment and resources"}' \
          "${PORT_API_URL}/actions/runs/$runId/logs"

        curl -X PATCH \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $accessToken" \
          -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
          "${PORT_API_URL}/actions/runs/$runId"

        curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $accessToken" \
          -d '{"message":"🔄 Deployment preparation underway, validating resources and configurations"}' \
          "${PORT_API_URL}/actions/runs/$deployActionRunId/logs"

        # HERE IS WHERE YOU CAN ADD YOU BUILD SCRIPTS
      fi
  artifacts:
    reports:
      dotenv: data.env

run-tests:
  stage: test
  dependencies:
    - initialize-build  # Ensure the data.env artifact is downloaded
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |

      # Check if TRIGGER_PAYLOAD is set and the file exists
      if [ -z "$TRIGGER_PAYLOAD" ] || [ ! -f "$TRIGGER_PAYLOAD" ]; then
        echo "Error: TRIGGER_PAYLOAD is not set or the file does not exist."
        exit 1
      fi

      # Check if we need to skip tests and threshold checks
      APPROVAL_STATUS=$(cat "$TRIGGER_PAYLOAD" | jq -r '.approval_status // "pending"')

      if [ "$APPROVAL_STATUS" = "approved" ]; then
        echo "Skipping tests and threshold checks...";
        echo "COVERAGE_MET=true" >> data.env
        exit 0;
      fi

      echo "🧪 Running tests and checking thresholds..."
      # Simulate threshold check (e.g., code coverage)
      COVERAGE=65

      if [ "$COVERAGE" -lt 70 ]; then
        echo "⚠️ Coverage is below the 70% threshold, initiating ServiceNow change request..."

        # Extract the service entity from the trigger payload
        serviceEntity=$(cat "$TRIGGER_PAYLOAD" | jq -r '.entity')
        echo "COVERAGE_MET=false" >> data.env

        echo "Creating a change request in ServiceNow"
        changeRequestResponse=$(curl -X POST \
          -H "Authorization: Basic $SERVICENOW_API_TOKEN" \
          -H 'Content-Type: application/json' \
          -d "{\"short_description\": \"Automated change request from GitLab CI/CD\", \"business_service\": \"$serviceEntity\", \"priority\": \"1\", \"u_external_tag\": \"$DEPLOY_ACTION_RUN_ID\"}" \
          -s "$SERVICENOW_INSTANCE_URL/api/now/table/change_request")

        # Check if the request was successful and extract important details
        if [[ $(echo "$changeRequestResponse" | jq -r '.result.number') != "null" ]]; then
          changeNumber=$(echo "$changeRequestResponse" | jq -r '.result.number')
          changeSysId=$(echo "$changeRequestResponse" | jq -r '.result.sys_id')
          changeState=$(echo "$changeRequestResponse" | jq -r '.result.state')
          changeCreatedOn=$(echo "$changeRequestResponse" | jq -r '.result.sys_created_on')
          changeCreatedBy=$(echo "$changeRequestResponse" | jq -r '.result.sys_created_by')
          changeCategory=$(echo "$changeRequestResponse" | jq -r '.result.category')
          changePriority=$(echo "$changeRequestResponse" | jq -r '.result.priority')
          changeDescription=$(echo "$changeRequestResponse" | jq -r '.result.short_description')
          changeApproval=$(echo "$changeRequestResponse" | jq -r '.result.approval')
          changeTags=$(echo "$changeRequestResponse" | jq -r '.result.external_tags')
          changeService=$(echo "$changeRequestResponse" | jq -r '.result.business_service.value')

          echo "Change Request Created Successfully: Number: $changeNumber, Sys ID: $changeSysId, State: $changeState"
          logMessage="⚠️ Pipeline did not meet the deployment checks, so a ServiceNow Change Request with Number $changeNumber and system ID $changeSysId has been created. An admin will need to review and approve this request before the deployment can proceed."

          runId=$(cat $TRIGGER_PAYLOAD | jq -r '.port_context.runId')
          
          # Send the details to Port action run logs
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d "{\"message\":\"$logMessage\"}" \
            "${PORT_API_URL}/actions/runs/$DEPLOY_ACTION_RUN_ID/logs"

          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d "{\"terminationStatus\":\"SUCCESS\", \"message\":\"$logMessage\"}" \
            "${PORT_API_URL}/actions/runs/$runId/logs"

          # Create the change request in Port
          portPayload="{
            \"identifier\": \"$changeSysId\",
            \"title\": \"$changeDescription\",
            \"icon\": \"Servicenow\",
            \"properties\": {
              \"number\": \"$changeNumber\",
              \"createdBy\": \"$changeCreatedBy\",
              \"createdOn\": \"$changeCreatedOn\",
              \"state\": \"$changeState\",
              \"category\": \"$changeCategory\",
              \"priority\": \"$changePriority\",
              \"description\": \"$changeDescription\",
              \"approval\": \"$changeApproval\",
              \"externalTags\": \"$changeTags\",
              \"service\": \"$changeService\"
            },
            \"relations\": {}
          }"

          # Send the change request data to Port API
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d "$portPayload" \
            "${PORT_API_URL}/blueprints/servicenowChangeRequest/entities"

        else
          echo "Failed to create ServiceNow Change Request: $changeRequestResponse"

          # Send failure message to Port action run logs
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d '{"message":"❌ Failed to create ServiceNow Change Request with response: '"$changeRequestResponse"'"}' \
            "${PORT_API_URL}/actions/runs/$DEPLOY_ACTION_RUN_ID/logs"

          exit 1  # Exit with failure
        fi
      else
        echo "✅ Coverage is sufficient (≥ 70%), no need to create a ServiceNow change request."
        echo "COVERAGE_MET=true" >> data.env
      fi
  artifacts:
    reports:
      dotenv: data.env

# Deployment job
deploy-to-cloud:
  stage: deploy
  dependencies:
    - run-tests
    - initialize-build
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |
      # Check if APPROVAL_STATUS or COVERAGE_MET is true
      if [ "$APPROVAL_STATUS" = "approved" ] || [ "$COVERAGE_MET" = "true" ]; then
        echo "Conditions met, deploying service to the cluster..."
        # HERE IS WHERE YOU CAN ADD YOUR DEPLOYMENT SCRIPT

        # Update port run status and logs
        runId=$(cat $TRIGGER_PAYLOAD | jq -r '.port_context.runId')
        curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -d '{"terminationStatus":"SUCCESS", "message":"✅ Service has been successfully deployed to the cluster"}' \
          "${PORT_API_URL}/actions/runs/$runId/logs"

        # Update developer that deployment was successful
        curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -d '{"terminationStatus":"SUCCESS", "message":"✅ Service has been successfully deployed to the cluster"}' \
          "${PORT_API_URL}/actions/runs/$DEPLOY_ACTION_RUN_ID/logs"
      else
        echo "Conditions not met, skipping deployment"
        exit 0
      fi
```
</details>

## Conclusion

Once all of the above components are created, you will have a the necessary setup to run the workflow described in the [scenario overview](#overview-of-use-case).

You can use this chaining mechanism to create complex workflows for many use-cases, that involve multiple actions and automations, enabling you to streamline your DevOps processes. 

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Deploy Service to Cluster` action
3. Choose the service you want to deploy and select your environment
    <img src='/img/guides/gitlabSnowGuide/deployToClusterAction.png' width='50%' border='1px' />
4. A GitLab pipeline will be triggered but will fail on the **test** stage due to not meeting coverage threshold
    <img src='/img/guides/gitlabSnowGuide/gitlabPipelineFailure.png' width='50%' border='1px' />
5. The developer can see the logs on the runs page
    <img src='/img/guides/gitlabSnowGuide/coverageFailureLogInPort.png' width='50%' border='1px' />
6. The platform engineer can see the `servicenowChangeRequest` entity displayed in Port
    <img src='/img/guides/gitlabSnowGuide/changeRequestEntity.png' width='50%' border='1px' />

7. Once the change request is either approved or declined, the GitLab pipeline will be re-triggered and the log stream will be shared with the developer
    <img src='/img/guides/gitlabSnowGuide/approveChangeRequest.png' width='50%' border='1px' />
    <img src='/img/guides/gitlabSnowGuide/notifyDeveloperOfApproval.png' width='50%' border='1px' />

8. The GitLab pipeline will be retriggered and Port context variable will be passed to instruct the pipeline script to deploy the service
    <img src='/img/guides/gitlabSnowGuide/successGitlabPipelineDeployment.png' width='50%' border='1px' />

