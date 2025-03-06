---
sidebar_position: 2
displayed_sidebar: null
description: Follow this guide to create a Kubernetes namespace in Port, enabling organized and efficient resource management.
---

# Create a Kubernetes namespace

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

## Overview

In the following guide, you are going to create a self-service action in Port that executes a [GitLab pipeline](/actions-and-automations/setup-backend/gitlab-pipeline/) to create a Kubernetes namespace.

## Prerequisites
1. Ensure you have a working Kubernetes cluster and a GitLab project.
:::tip Don't have a Kubernetes cluster? 
Quickly create a local one using [kind](https://kind.sigs.k8s.io/docs/user/quick-start/).
:::
2. In the same GitLab project, [register and install the GitLab agent.](https://docs.gitlab.com/ee/user/clusters/agent/install/index.html#register-the-agent-with-gitlab)
3. In your GitLab project, go to the `Settings` menu at the sidebar on the left, select `CI/CD` and create the following `Variables`:
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `KUBE_CONTEXT` - This is obtained after [registering and installing the GitLab agent.](https://docs.gitlab.com/ee/user/clusters/agent/install/index.html#register-the-agent-with-gitlab)
        - **Find Your Project URL**: It will look like this:  `https://gitlab.com/your-group/your-project`
        - **Compose Your Context**: Use this format: `your-group/your-project:agent-name`
        - **Set** `KUBE_CONTEXT`


## GitLab Pipeline

Create a `.gitlab-ci.yaml` file in the root of your gitlab project with the following content:

<details>
<summary><b>GitLab workflow</b></summary>

```yml showLineNumbers title="gitlab-ci.yaml"
stages:
  - prerequisites
  - deploy
  - port-update

image: alpine:latest

variables:
  PORT_CLIENT_ID: ${PORT_CLIENT_ID}
  PORT_CLIENT_SECRET: ${PORT_CLIENT_SECRET}
  KUBE_CONTEXT: ${KUBE_CONTEXT}

before_script:
  - apk update
  - apk add --upgrade curl jq -q
  
fetch-port-access-token:
  stage: prerequisites
  except:
    - pushes
  script:
    - |
      echo "Getting access token from Port API"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')

      echo "ACCESS_TOKEN=$accessToken" >> fetch-port-access-token-data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Starting action to create a k8s namespace"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"

      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$runId"
  artifacts:
    reports:
      dotenv: fetch-port-access-token-data.env

create-manifest:
  stage: deploy
  needs:
    - job: fetch-port-access-token
      artifacts: true
  except:
    - pushes
  script:
    - echo "Creating k8s namespace manifest"
    - |
      NAMESPACE_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.name')
      MIN_CPU=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.min_cpu')
      MAX_CPU=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.max_cpu')
      MIN_MEMORY=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.min_memory')
      MAX_MEMORY=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.max_memory')
      MIN_STORAGE=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.min_storage')
      MAX_STORAGE=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.max_storage')

      cat <<EOF > manifest.yml
      apiVersion: v1
      kind: ResourceQuota
      metadata:
        name: $NAMESPACE_NAME-quota
        namespace: $NAMESPACE_NAME  # Consider if this should be dynamic too
      spec:
        hard:
          requests.cpu: $MIN_CPU
          requests.memory: ${MIN_MEMORY}Gi
          requests.storage: ${MIN_STORAGE}Gi
          limits.cpu: $MAX_CPU
          limits.memory: ${MAX_MEMORY}Gi
      EOF


      # log the manifest
      cat manifest.yml

      echo "NAMESPACE_NAME=$NAMESPACE_NAME" >> create-manifest-data.env
  artifacts:
    paths:
      - manifest.yml
    reports:
      dotenv: create-manifest-data.env

log-pre-create:
  stage: deploy
  needs:
    - job: fetch-port-access-token
      artifacts: true
  except:
    - pushes
  script:
    - |
      echo "Logging pre-create action"
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"statusLabel": "Creating Namespace", "message":"🔧 Creating the namespace in k8s!"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"

create-k8s-namespace:
  stage: deploy
  before_script: [] # Empty before_script to override the global one
  needs:
    - job: log-pre-create
    - job: create-manifest
      artifacts: true
  except:
    - pushes
  image:
    name: bitnami/kubectl:latest
    entrypoint: [""]
  script:
    - |
      echo "Creating k8s namespace"
      cat manifest.yml
      kubectl config get-contexts
      kubectl config use-context $KUBE_CONTEXT
      kubectl create namespace $NAMESPACE_NAME
      kubectl apply -f manifest.yml
  
create-port-entity:
  stage: port-update
  needs:
    - job: fetch-port-access-token
      artifacts: true
    - job: create-k8s-namespace
      artifacts: true
    - job: create-manifest
      artifacts: true
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |
      echo "Creating Port entity to match new k8s namespace"

      NAMESPACE_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.name')
      MIN_CPU=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.min_cpu')
      MAX_CPU=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.max_cpu')
      MIN_MEMORY=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.min_memory')
      MAX_MEMORY=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.max_memory')
      MIN_STORAGE=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.min_storage')
      MAX_STORAGE=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.max_storage')
      
      BLUEPRINT=$(cat $TRIGGER_PAYLOAD | jq -r '.context.blueprint')
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -d '{"statusLabel": "Creating Entity", "message":"🔧 Creating the namespace entity in Port!"}' \
          "https://api.getport.io/v1/actions/runs/$runId/logs"

      log='{
         "identifier": "'"$NAMESPACE_NAME"'",
         "title": "'"$NAMESPACE_NAME"'",
         "blueprint": "'"$BLUEPRINT"'",
         "properties": {
            "min_cpu": "'"$MIN_CPU"'",
            "max_cpu": "'"$MAX_CPU"'",
            "min_memory": "'"$MIN_MEMORY"'",
            "max_memory": "'"$MAX_MEMORY"'",
            "min_storage": "'"$MIN_STORAGE"'"
         },
         "relations": {}
        }'

      echo "$log"

      curl --location --request POST "https://api.getport.io/v1/blueprints/$BLUEPRINT/entities?create_missing_related_entities=false&run_id=$runId" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$log"

update-run-status:
  stage: port-update
  needs:
    - job: create-port-entity
      artifacts: true
    - job: fetch-port-access-token
      artifacts: true
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |
      echo "Updating Port action run status and final logs"
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"terminationStatus":"SUCCESS", "message":"✅ Created new k8s namespace!"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
```
</details>


## Port Configuration

1. Head over to the [Builder](https://app.getport.io/settings/data-model) page to create the following <PortTooltip id="blueprint">blueprint</PortTooltip>:
    - Click on the `+ Blueprint` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.
    - Click `Save`.

<details>
<summary><b>Namespace Blueprint</b></summary>

```json showLineNumbers
{
  "identifier": "namespace",
  "description": "Kubernetes Namespace",
  "title": "Namespace",
  "icon": "AmazonEKS",
  "schema": {
    "properties": {
      "min_cpu": {
        "icon": "AmazonEKS",
        "type": "number",
        "title": "Min CPU",
        "description": "The minimum CPU resource guaranteed for containers within the namespace. ",
        "default": 1
      },
      "max_cpu": {
        "type": "number",
        "title": "Max CPU",
        "description": "Maximum CPU",
        "icon": "AmazonEKS",
        "default": 2
      },
      "min_memory": {
        "type": "number",
        "title": "Min Memory",
        "description": "The minimum memory resource guaranteed for containers within the namespace",
        "icon": "AmazonEKS",
        "default": 0.5
      },
      "min_storage": {
        "type": "number",
        "title": "Min Storage",
        "description": "The minimum storage resource guaranteed for persistent volumes within the namespace",
        "icon": "AmazonEKS",
        "default": 0.5
      },
      "max_memory": {
        "type": "number",
        "title": "Max Memory",
        "description": " The maximum memory that containers in the namespace are allowed to use",
        "icon": "AmazonEKS",
        "default": 2
      },
      "project_name": {
        "type": "string",
        "title": "Project Name",
        "description": "The AWS Account ID",
        "icon": "AWS"
      }
    },
    "required": [
      "min_cpu",
      "max_cpu",
      "min_memory",
      "min_storage",
      "max_memory"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```
</details>


<br />


2. To create the Port action, go to the [self-service page](https://app.getport.io/self-serve):
    - Click on the `+ New Action` button.
    - Choose the `Namespace` blueprint and click `Next`.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.

<details>
  <summary> <b> Port Action: Create a Namespace </b> </summary>
:::tip

- `<PROJECT_ID>` - Your project ID.
<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/gitlabProjectID.png" width="100%" border="1px" />

- `<PIPELINE_TRIGGER_TOKEN>` - Your pipeline trigger token. Learn [more](https://docs.gitlab.com/ee/ci/triggers/#create-a-pipeline-trigger-token).
:::

```json showLineNumbers
{
  "identifier": "namespace_create_namespace",
  "title": "Create Namespace",
  "icon": "AmazonEKS",
  "description": "Create a Kubernetes Namespace",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "project_name": {
          "type": "string",
          "title": "Project Name"
        },
        "name": {
          "icon": "DefaultProperty",
          "type": "string",
          "title": "Name"
        },
        "min_cpu": {
          "type": "number",
          "title": "Min CPU",
          "default": 0.5
        },
        "max_cpu": {
          "icon": "DefaultProperty",
          "type": "number",
          "title": "Max CPU",
          "description": "The maximum number of CPU cores a container can use in the namespace",
          "default": 1.5
        },
        "min_memory": {
          "type": "number",
          "title": "Min Memory",
          "default": 0.5,
          "description": "The minimum memory resource guaranteed for containers within the namespace"
        },
        "max_memory": {
          "type": "number",
          "title": "Max Memory",
          "description": "The maximum memory that containers in the namespace are allowed to use",
          "default": 2
        },
        "min_storage": {
          "type": "number",
          "title": "Min Storage",
          "description": "The minimum storage resource guaranteed for persistent volumes within the namespace ",
          "default": 0.5
        }
      },
      "required": [
        "project_name",
        "min_cpu",
        "max_cpu",
        "min_memory",
        "max_memory",
        "min_storage",
        "name"
      ],
      "order": [
        "project_name",
        "name",
        "min_cpu",
        "max_cpu",
        "min_memory",
        "max_memory",
        "min_storage"
      ]
    },
    "blueprintIdentifier": "namespace"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://gitlab.com/api/v4/projects/<PROJECT_ID>/ref/main/trigger/pipeline?token=<PIPELINE_TRIGGER_TOKEN>",
    "agent": false,
    "synchronized": false,
    "method": "POST",
    "body": {
      "action": "{{ .action.identifier[(\"namespace_\" | length):] }}",
      "resourceType": "run",
      "status": "TRIGGERED",
      "trigger": "{{ .trigger | {by, origin, at} }}",
      "context": {
        "entity": "{{.entity.identifier}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}"
      },
      "payload": {
        "entity": "{{ (if .entity == {} then null else .entity end) }}",
        "action": {
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://gitlab.com/api/v4/projects/<PROJECT_ID>/ref/main/trigger/pipeline?token=<PIPELINE_TRIGGER_TOKEN>",
            "agent": false,
            "synchronized": false,
            "method": "POST"
          },
          "trigger": "{{.trigger.operation}}"
        },
        "properties": {
          "{{if (.inputs | has(\"project_name\")) then \"project_name\" else null end}}": "{{.inputs.\"project_name\"}}",
          "{{if (.inputs | has(\"name\")) then \"name\" else null end}}": "{{.inputs.\"name\"}}",
          "{{if (.inputs | has(\"min_cpu\")) then \"min_cpu\" else null end}}": "{{.inputs.\"min_cpu\"}}",
          "{{if (.inputs | has(\"max_cpu\")) then \"max_cpu\" else null end}}": "{{.inputs.\"max_cpu\"}}",
          "{{if (.inputs | has(\"min_memory\")) then \"min_memory\" else null end}}": "{{.inputs.\"min_memory\"}}",
          "{{if (.inputs | has(\"max_memory\")) then \"max_memory\" else null end}}": "{{.inputs.\"max_memory\"}}",
          "{{if (.inputs | has(\"min_storage\")) then \"min_storage\" else null end}}": "{{.inputs.\"min_storage\"}}"
        },
        "censoredProperties": "{{.action.encryptedProperties}}"
      }
    }
  },
  "requiredApproval": false
  
}
```
</details>

- Fill out the `backend` form section with your values:
    - For the Endpoint URL you need to add a URL in the following format:
        - To create a pipeline trigger token, follow this [guide](https://docs.gitlab.com/ee/ci/triggers/#create-a-pipeline-trigger-token).
    ```bash
        https://gitlab.com/api/v4/projects/{PROJECT_ID}/ref/main/trigger/pipeline?token={PIPELINE_TRIGGER_TOKEN}
    ```
    - Set HTTP method to `POST`.
    - Set Request type to `Async`.
    - Set Use self-hosted agent to No.

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/actionBackendForm.png" width="70%" border="1px" />


## Let's test it!

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/namespaceCreate.png" width="100%" border="1px" />

1. Head to the [Namespace catalog page](https://app.getport.io/namespaces)
2. Click on the `+ Namespace` button
3. Choose the `Create Namespace` option
4. Fill in the form
5. Click on `Execute`
6. Wait for the namespace to be created.

Done 🎉 You've created an namespace using an action in Port 🔥
