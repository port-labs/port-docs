---
sidebar_position: 17
description: Ingest ArgoCD applications into your catalog
---

import ProjecttBlueprint from './resources/argocd/\_example_project_blueprint.mdx'
import ApplicationBlueprint from './resources/argocd/\_example_application_blueprint.mdx'

import ArgoCDWebhookConfig from './resources/argocd/\_example_webhook_configuration.mdx'

# ArgoCD

In this example you are going to create a webhook integration between [ArgoCD](https://argo-cd.readthedocs.io/en/stable/) and Port, which will ingest application entities and map them to your ArgoCD projects.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Project blueprint</summary>

<ProjecttBlueprint/>

</details>

<details>
<summary>Application blueprint</summary>

<ApplicationBlueprint/>

</details>

Create the following webhook configuration [using Port UI](../../webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Application webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `ArgoCD Application Mapper`;
   2. Identifier : `argocd_application_mapper`;
   3. Description : `A webhook configuration to map ArgoCD applications to Port`;
   4. Icon : `Argo`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <ArgoCDWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in ArgoCD

To set up a webhook configuration in ArgoCD for sending notifications to Port, follow these steps:

### Prerequisite

1. You have access to a Kubernetes cluster where ArgoCD is deployed.
2. You have `kubectl` installed and configured to access your cluster.

### Steps

1. Install ArgoCD notifications manifest;

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

2. Install ArgoCD triggers and templates manifest;

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/catalog/install.yaml
```

3. Use `kubectl` to connect to the Kubernetes cluster where your ArgoCD instance is deployed;

```bash showLineNumbers
kubectl config use-context <your-cluster-context>
```

4. Set the current namespace to your ArgoCD namespace, use the following command;

```bash showLineNumbers
kubectl config set-context --current --namespace=<your-namespace>
```

5. Create a YAML file (e.g. `argocd-webhook-config.yaml`) that configures the webhook notification service. The example below shows how to set up a webhook to send real-time events whenever ArgoCD applications are updated. The YAML file includes the following components:

   1. Notification service definition;
   2. Template for the webhook message body;
   3. Trigger definitions;
   4. Subscriptions to the notifications.

   Here's an example YAML. Make sure to replace `<YOUR_WEBHOOK_URL>` with the value of `url` key you received after creating the webhook configuration.

   <details>

   <summary>webhook manifest file </summary>

   ```yaml showLineNumbers
   apiVersion: v1
   kind: ConfigMap
   metadata:
   name: argocd-notifications-cm
   data:
   trigger.on-sync-operation-change: |
     - description: Application syncing has updated
     send:
     - app-status-change
     when: app.status.operationState.phase in ['Error', 'Failed', 'Succeeded', 'Running']
   trigger.on-deployed: |
     - description: Application is synced and healthy
     send:
     - app-status-change
     when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
   trigger.on-health-degraded: |
     - description: Application has degraded
     send:
     - app-status-change
     when: app.status.health.status == 'Degraded'
   service.webhook.port-webhook: |
     url: <YOUR_WEBHOOK_URL>
     headers:
     - name: Content-Type
     value: application/json
   template.app-status-change: |
     webhook:
     port-webhook:
         method: POST
         body: |
         {
             "uid": "{{.app.metadata.uid}}",
             "name": "{{.app.metadata.name}}",
             "namespace": "{{.app.metadata.namespace}}",
             "sync_status": "{{.app.status.sync.status}}",
             "health_status": "{{.app.status.health.status}}",
             "git_repo": "{{.app.spec.source.repoURL}}",
             "git_path": "{{.app.spec.source.path}}",
             "destination_server": "{{.app.spec.destination.server}}",
             "created_at": "{{.app.metadata.creationTimestamp}}",
             "project": "{{.app.spec.project}}"
         }
   subscriptions: |
     - recipients:
     - port-webhook
     triggers:
     - on-deployed
     - on-health-degraded
     - on-sync-operation-change
   ```

   </details>

6. Use `kubectl` to apply the YAML file to your cluster. Run the following command, replacing `<your-namespace>` with your ArgoCD namespace and `<path-to-yaml-file>` with the actual path to your YAML file:

```bash
kubectl apply -n <your-namespace> -f <path-to-yaml-file>
```

This command deploys the webhook notification configuration to your ArgoCD notification configmap (`argocd-notifications-cm`), allowing Port to receive real-time events.

Done! any change that happens to your applications in ArgoCD will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
