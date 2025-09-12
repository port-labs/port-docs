---
displayed_sidebar: null
description: Learn how to use Port's AI capabilities to detect unhealthy Kubernetes pods and automatically trigger remediation actions to restore service health.
---
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Auto-heal unhealthy kubernetes pods

Kubernetes pods can become unhealthy due to various issues like resource constraints, configuration problems, or application failures. Manual intervention to diagnose and fix unhealthy pods creates operational overhead and delays in service recovery.

This guide demonstrates how to create an AI-powered system that automatically detects unhealthy pods and triggers appropriate remediation actions to restore service health.

<img src="/img/guides/k8s-pod-healing-architecture.png" border="1px" width="100%" />

## Common use cases

- **Automatically restart pods** that are in CrashLoopBackOff state due to application errors.
- **Scale up resources** when pods are failing due to memory limits or CPU constraints.
- **Apply configuration fixes** for common pod health issues like missing environment variables or incorrect resource requests.
- **Trigger rollback procedures** when pods fail after recent deployments.
- **Notify teams** about critical pod health issues requiring immediate attention.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's Kubernetes integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/kubernetes/) is configured in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) in Port.
- You have a Kubernetes cluster with pods that can be monitored and managed.


## Set up self-service actions

We will create self-service actions that the AI agent can use for pod remediation.

### Restart kubernetes workload action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on `+ New Action`.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Restart kubernetes workload action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "restart_k8s_workload",
      "title": "Restart Kubernetes Workload",
      "icon": "Cluster",
      "description": "Restart a Kubernetes workload (Deployment, StatefulSet, or DaemonSet) to resolve transient issues",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "reason": {
              "type": "string",
              "title": "Reason for Restart",
              "description": "Brief explanation of why this workload needs to be restarted",
              "default": "Healing unhealthy workload"
            }
          },
          "required": []
        },
        "blueprintIdentifier": "k8s_workload"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<YOUR-GITHUB-ORG>",
        "repo": "<YOUR-GITHUB-REPO>",
        "workflow": "restart-k8s-workload.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "runId": "{{ .run.id }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.

### Scale up kubernetes workload action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on `+ New Action`.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Scale up kubernetes workload action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "scale_k8s_workload",
      "title": "Scale Kubernetes Workload",
      "icon": "Cluster",
      "description": "Scale a Kubernetes workload up or down to resolve resource issues",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "desired_replicas": {
              "type": "number",
              "title": "Desired Replicas",
              "description": "Number of replicas to scale to",
              "default": 3,
              "minimum": 1,
              "maximum": 20
            },
            "reason": {
              "type": "string",
              "title": "Reason for Scaling",
              "description": "Brief explanation of why this workload needs to be scaled",
              "default": "Scaling to resolve resource constraints"
            }
          },
          "required": [
            "desired_replicas"
          ]
        },
        "blueprintIdentifier": "k8s_workload"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<YOUR-GITHUB-ORG>",
        "repo": "<YOUR-GITHUB-REPO>",
        "workflow": "scale-k8s-workload.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "runId": "{{ .run.id }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.

### Update kubernetes config action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on `+ New Action`.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Update kubernetes config action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_k8s_workload_config",
      "title": "Update Kubernetes Workload Configuration",
      "icon": "Cluster",
      "description": "Update resource limits and requests for a Kubernetes workload",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "memory_limit": {
              "type": "string",
              "title": "Memory Limit",
              "description": "Memory limit (e.g., 512Mi, 1Gi)",
              "default": "512Mi",
              "pattern": "^[0-9]+(Mi|Gi)$"
            },
            "cpu_limit": {
              "type": "string",
              "title": "CPU Limit",
              "description": "CPU limit (e.g., 500m, 1)",
              "default": "500m",
              "pattern": "^[0-9]+(m|)$"
            },
            "memory_request": {
              "type": "string",
              "title": "Memory Request",
              "description": "Memory request (e.g., 256Mi, 512Mi)",
              "default": "256Mi",
              "pattern": "^[0-9]+(Mi|Gi)$"
            },
            "cpu_request": {
              "type": "string",
              "title": "CPU Request",
              "description": "CPU request (e.g., 250m, 500m)",
              "default": "250m",
              "pattern": "^[0-9]+(m|)$"
            },
            "reason": {
              "type": "string",
              "title": "Reason for Update",
              "description": "Brief explanation of why this configuration needs to be updated",
              "default": "Updating resource configuration to resolve health issues"
            }
          },
          "required": [
            "memory_limit",
            "cpu_limit",
            "memory_request",
            "cpu_request"
          ]
        },
        "blueprintIdentifier": "k8s_workload"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<YOUR-GITHUB-ORG>",
        "repo": "<YOUR-GITHUB-REPO>",
        "workflow": "update-k8s-workload-config.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "runId": "{{ .run.id }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.

## Set up GitHub workflows

We will create GitHub workflows to be triggered by the self-service actions.

<GithubDedicatedRepoHint/>

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
- `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).


### Restart kubernetes workload GitHub workflow

1. Create the file `.github/workflows/restart-k8s-workload.yaml` in the `.github/workflows` folder of your repository.

2. Copy and paste the following content:

    <details>
    <summary><b>Restart kubernetes workload GitHub workflow (Click to expand)</b></summary>
    
    
    ```yaml showLineNumbers
    name: Restart Kubernetes Workload

    on:
      workflow_dispatch:
        inputs:
          port_context:
            required: true
            description: 'Action and general context (blueprint, entity, run id, etc...)'
            type: string

    jobs:
      restart-workload:
        runs-on: ubuntu-latest
        steps:
          - uses: 'actions/checkout@v4'
          
          - name: Inform Port of workflow start
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{fromJson(inputs.port_context).runId}}
              logMessage: Starting restart of Kubernetes workload ${{ fromJson(inputs.port_context).entity.title }}

          - name: Configure kubectl for local cluster
            run: |
              echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig.yaml
              export KUBECONFIG=kubeconfig.yaml
              kubectl config current-context

          - name: Restart Kubernetes workload
            run: |
              WORKLOAD_NAME="${{ fromJson(inputs.port_context).entity.title }}"
              NAMESPACE="${{ fromJson(inputs.port_context).entity.properties.namespace }}"
              WORKLOAD_TYPE="${{ fromJson(inputs.port_context).entity.properties.kind }}"
              
              echo "Restarting $WORKLOAD_TYPE: $WORKLOAD_NAME in namespace: $NAMESPACE"
              
              case $WORKLOAD_TYPE in
                "Deployment")
                  kubectl rollout restart deployment/$WORKLOAD_NAME -n $NAMESPACE
                  kubectl rollout status deployment/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                "StatefulSet")
                  kubectl rollout restart statefulset/$WORKLOAD_NAME -n $NAMESPACE
                  kubectl rollout status statefulset/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                "DaemonSet")
                  kubectl rollout restart daemonset/$WORKLOAD_NAME -n $NAMESPACE
                  kubectl rollout status daemonset/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                *)
                  echo "Unsupported workload type: $WORKLOAD_TYPE"
                  exit 1
                  ;;
              esac
              
          - name: Verify workload health
            run: |
              WORKLOAD_NAME="${{ fromJson(inputs.port_context).entity.title }}"
              NAMESPACE="${{ fromJson(inputs.port_context).entity.properties.namespace }}"
              WORKLOAD_TYPE="${{ fromJson(inputs.port_context).entity.properties.kind }}"
              
              echo "Checking health of $WORKLOAD_TYPE: $WORKLOAD_NAME"
              kubectl get $WORKLOAD_TYPE $WORKLOAD_NAME -n $NAMESPACE
              kubectl get pods -l app=$WORKLOAD_NAME -n $NAMESPACE
              
          - name: Inform Port about restart success
            if: success()
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).runId }}
              status: 'SUCCESS'
              logMessage: ✅ Successfully restarted Kubernetes workload ${{ fromJson(inputs.port_context).entity.title }}
              summary: Kubernetes workload restart completed successfully

          - name: Inform Port about restart failure
            if: failure()
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).runId }}
              status: 'FAILURE'
              logMessage: ❌ Failed to restart Kubernetes workload ${{ fromJson(inputs.port_context).entity.title }}
              summary: Kubernetes workload restart failed
    ```
    </details>

### Scale up kubernetes workload GitHub workflow

1. Create the file `.github/workflows/scale-k8s-workload.yaml` in the `.github/workflows` folder of your repository.

2. Copy and paste the following content:

    <details>
    <summary><b>Scale up kubernetes workload GitHub workflow (Click to expand)</b></summary>
    

    ```yaml showLineNumbers
    name: Scale Kubernetes Workload

    on:
      workflow_dispatch:
        inputs:
          port_context:
            required: true
            description: 'Action and general context (blueprint, entity, run id, etc...)'
            type: string

    jobs:
      scale-workload:
        runs-on: ubuntu-latest
        steps:
          - uses: 'actions/checkout@v4'
          
          - name: Inform Port of workflow start
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{fromJson(inputs.port_context).runId}}
              logMessage: Starting scale operation for Kubernetes workload ${{ fromJson(inputs.port_context).entity.title }}

          - name: Configure kubectl for local cluster
            run: |
              echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig.yaml
              export KUBECONFIG=kubeconfig.yaml
              kubectl config current-context

          - name: Scale Kubernetes workload
            run: |
              WORKLOAD_NAME="${{ fromJson(inputs.port_context).entity.title }}"
              NAMESPACE="${{ fromJson(inputs.port_context).entity.properties.namespace }}"
              WORKLOAD_TYPE="${{ fromJson(inputs.port_context).entity.properties.kind }}"
              REPLICAS="${{ fromJson(inputs.port_context).entity.properties.desired_replicas }}"
              
              echo "Scaling $WORKLOAD_TYPE: $WORKLOAD_NAME to $REPLICAS replicas in namespace: $NAMESPACE"
              
              case $WORKLOAD_TYPE in
                "Deployment")
                  kubectl scale deployment/$WORKLOAD_NAME --replicas=$REPLICAS -n $NAMESPACE
                  kubectl rollout status deployment/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                "StatefulSet")
                  kubectl scale statefulset/$WORKLOAD_NAME --replicas=$REPLICAS -n $NAMESPACE
                  kubectl rollout status statefulset/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                "ReplicaSet")
                  kubectl scale replicaset/$WORKLOAD_NAME --replicas=$REPLICAS -n $NAMESPACE
                  ;;
                *)
                  echo "Unsupported workload type for scaling: $WORKLOAD_TYPE"
                  exit 1
                  ;;
              esac
              
          - name: Verify scaling
            run: |
              WORKLOAD_NAME="${{ fromJson(inputs.port_context).entity.title }}"
              NAMESPACE="${{ fromJson(inputs.port_context).entity.properties.namespace }}"
              WORKLOAD_TYPE="${{ fromJson(inputs.port_context).entity.properties.kind }}"
              
              echo "Checking scaled $WORKLOAD_TYPE: $WORKLOAD_NAME"
              kubectl get $WORKLOAD_TYPE $WORKLOAD_NAME -n $NAMESPACE
              kubectl get pods -l app=$WORKLOAD_NAME -n $NAMESPACE
              
          - name: Inform Port about scaling success
            if: success()
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).runId }}
              status: 'SUCCESS'
              logMessage: ✅ Successfully scaled Kubernetes workload ${{ fromJson(inputs.port_context).entity.title }}
              summary: Kubernetes workload scaling completed successfully

          - name: Inform Port about scaling failure
            if: failure()
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).runId }}
              status: 'FAILURE'
              logMessage: ❌ Failed to scale Kubernetes workload ${{ fromJson(inputs.port_context).entity.title }}
              summary: Kubernetes workload scaling failed
    ```
    </details>

### Update kubernetes config GitHub workflow

1. Create the file `.github/workflows/update-k8s-workload-config.yaml` in the `.github/workflows` folder of your repository.

2. Copy and paste the following content:

    <details>
    <summary><b>Update kubernetes config GitHub workflow (Click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Update Kubernetes Workload Configuration

    on:
      workflow_dispatch:
        inputs:
          port_context:
            required: true
            description: 'Action and general context (blueprint, entity, run id, etc...)'
            type: string

    jobs:
      update-workload-config:
        runs-on: ubuntu-latest
        steps:
          - uses: 'actions/checkout@v4'
          
          - name: Inform Port of workflow start
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{fromJson(inputs.port_context).runId}}
              logMessage: Starting configuration update for Kubernetes workload ${{ fromJson(inputs.port_context).entity.title }}

          - name: Configure kubectl for local cluster
            run: |
              echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig.yaml
              export KUBECONFIG=kubeconfig.yaml
              kubectl config current-context

          - name: Update workload configuration
            run: |
              WORKLOAD_NAME="${{ fromJson(inputs.port_context).entity.title }}"
              NAMESPACE="${{ fromJson(inputs.port_context).entity.properties.namespace }}"
              WORKLOAD_TYPE="${{ fromJson(inputs.port_context).entity.properties.kind }}"
              MEMORY_LIMIT="${{ fromJson(inputs.port_context).entity.properties.memory_limit }}"
              CPU_LIMIT="${{ fromJson(inputs.port_context).entity.properties.cpu_limit }}"
              MEMORY_REQUEST="${{ fromJson(inputs.port_context).entity.properties.memory_request }}"
              CPU_REQUEST="${{ fromJson(inputs.port_context).entity.properties.cpu_request }}"
              
              echo "Updating $WORKLOAD_TYPE: $WORKLOAD_NAME configuration in namespace: $NAMESPACE"
              echo "Memory Limit: $MEMORY_LIMIT, CPU Limit: $CPU_LIMIT"
              echo "Memory Request: $MEMORY_REQUEST, CPU Request: $CPU_REQUEST"
              
              # Create a patch for resource limits and requests
              cat > resource-patch.json << EOF
              {
                "spec": {
                  "template": {
                    "spec": {
                      "containers": [
                        {
                          "name": "$WORKLOAD_NAME",
                          "resources": {
                            "limits": {
                              "memory": "$MEMORY_LIMIT",
                              "cpu": "$CPU_LIMIT"
                            },
                            "requests": {
                              "memory": "$MEMORY_REQUEST",
                              "cpu": "$CPU_REQUEST"
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
              EOF
              
              case $WORKLOAD_TYPE in
                "Deployment")
                  kubectl patch deployment $WORKLOAD_NAME -n $NAMESPACE --type='merge' -p "$(cat resource-patch.json)"
                  kubectl rollout status deployment/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                "StatefulSet")
                  kubectl patch statefulset $WORKLOAD_NAME -n $NAMESPACE --type='merge' -p "$(cat resource-patch.json)"
                  kubectl rollout status statefulset/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                "DaemonSet")
                  kubectl patch daemonset $WORKLOAD_NAME -n $NAMESPACE --type='merge' -p "$(cat resource-patch.json)"
                  kubectl rollout status daemonset/$WORKLOAD_NAME -n $NAMESPACE --timeout=300s
                  ;;
                *)
                  echo "Unsupported workload type for configuration update: $WORKLOAD_TYPE"
                  exit 1
                  ;;
              esac
              
          - name: Verify configuration update
            run: |
              WORKLOAD_NAME="${{ fromJson(inputs.port_context).entity.title }}"
              NAMESPACE="${{ fromJson(inputs.port_context).entity.properties.namespace }}"
              WORKLOAD_TYPE="${{ fromJson(inputs.port_context).entity.properties.kind }}"
              
              echo "Checking updated $WORKLOAD_TYPE: $WORKLOAD_NAME"
              kubectl get $WORKLOAD_TYPE $WORKLOAD_NAME -n $NAMESPACE
              kubectl describe $WORKLOAD_TYPE $WORKLOAD_NAME -n $NAMESPACE | grep -A 10 "Resources:"
              
          - name: Inform Port about config update success
            if: success()
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).runId }}
              status: 'SUCCESS'
              logMessage: ✅ Successfully updated Kubernetes workload configuration ${{ fromJson(inputs.port_context).entity.title }}
              summary: Kubernetes workload configuration update completed successfully

          - name: Inform Port about config update failure
            if: failure()
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).runId }}
              status: 'FAILURE'
              logMessage: ❌ Failed to update Kubernetes workload configuration ${{ fromJson(inputs.port_context).entity.title }}
              summary: Kubernetes workload configuration update failed
    ```
    </details>
    
    
    

## Create k8s pod healing AI agent

Next, we will create an AI agent that analyzes pod health issues and creates comprehensive remediation workflows.


1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.

2. Click on `+ AI Agent`.

3. Toggle `Json mode` on.

4. Copy and paste the following JSON schema:

    <details>
    <summary><b>K8s Pod healing AI agent configuration (Click to expand)</b></summary>
    ```json showLineNumbers
    {
      "identifier": "k8s_healing_agent",
      "title": "Kubernetes Healing Agent",
      "icon": "Cluster",
      "properties": {
        "description": "AI agent specialized in diagnosing and automatically fixing unhealthy Kubernetes workloads. Monitors pod health, identifies root causes, and applies appropriate fixes.",
        "status": "active",
        "allowed_blueprints": [
          "k8s_workload",
          "k8s_pod",
          "k8s_replicaSet",
          "k8s_namespace",
          "k8s_cluster"
        ],
        "allowed_actions": [
          "restart_k8s_workload",
          "scale_k8s_workload",
          "update_k8s_workload_config",
          "create_k8s_fix_pr"
        ],
        "prompt": "You are a Kubernetes healing AI agent.   \n\nYour job is simple:\n1. **Diagnose** unhealthy workloads by looking at pod status, error messages, and resource usage\n2. **Fix** the issue using the appropriate action: Restart for crashes and transient issues, Scale for resource constraints (CPU/memory) , Update config for resource limit issues   - Create a PR for the fix and Explain what you found and the fix you provided in the PR description.",
        "execution_mode": "Automatic",
        "conversation_starters": [
          "Analyze this unhealthy workload and suggest fixes",
          "This pod is in CrashLoopBackOff, what should I do?",
          "Help me diagnose why this workload is failing",
          "Scale up resources for this memory-constrained workload",
          "What's causing this ImagePullBackOff error?",
          "Why are my pods stuck in Pending state?"
        ]
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.

## Set up automation

We will create an automation to trigger the ai agent when the health of a kubernetespod moves from healthy to unhealthy 

Follow the steps below to create the automation:

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Kubernetes workload healing automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "k8s_workload_healing_automation",
      "title": "Kubernetes Workload Healing Automation",
      "description": "Automatically trigger AI healing agent when Kubernetes workloads become unhealthy",
      "icon": "Cluster",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "k8s_workload"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.properties.isHealthy == \"Healthy\"",
            ".diff.after.properties.isHealthy == \"Unhealthy\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/agent/k8s_healing_agent/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "A Kubernetes workload '{{ .event.diff.after.identifier }}' in namespace '{{ .event.diff.after.properties.namespace }}' has become unhealthy. Analyze and apply appropriate healing actions. Workload type: {{ .event.diff.after.properties.kind }}, Current replicas: {{ .event.diff.after.properties.replicas }}, Available replicas: {{ .event.diff.after.properties.availableReplicas }}. Diagnose the issue and execute healing actions",
          "labels": {
            "source": "Automation",
            "workload_name": "{{ .event.diff.after.identifier }}",
            "namespace": "{{ .event.diff.after.properties.namespace }}",
            "trigger_type": "health_degradation"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.


## Let's test it

Now let us test the complete workflow to ensure everything works correctly.

1. Go to your Kubernetes cluster and create a pod with an intentionally failing configuration (e.g., wrong image name, missing environment variables, or resource limits too low).
2. Wait for the pod to enter an unhealthy state (CrashLoopBackOff, ImagePullBackOff, etc.).
3. Verify that the pod appears in Port with the correct health status.
4. Check the audit log to monitor the automation and the ai agent.
5. Check your GitHub repository to monitor the workflow that has been triggered by the agent.
6. Check the PR that has been created by the agent for the fix.
7. Approve the PR to fix the issue and have pod healed.


## Related guides

- [Manage Kubernetes clusters](/guides/all/manage-clusters)
- [Trigger GitHub Copilot from Port](/guides/all/trigger-github-copilot-from-port)
- [Set up the Task Manager AI agent](/guides/all/setup-task-manager-ai-agent)
- [Automate Jira to GitHub Copilot](/guides/all/automate-jira-to-github-copilot)
