---
sidebar_position: 18
description: Ingest Falco alerts into your catalog
---

import AlertBlueprint from './resources/falco/\_example_alert_blueprint.mdx'
import AlertWebhookConfig from './resources/falco/\_example_webhook_configuration.mdx'

# Falco Sidekick

In this example you are going to create a webhook integration between [Falco Sidekick](https://github.com/falcosecurity/falcosidekick) and Port, which will ingest alert entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Alert blueprint</summary>

<AlertBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Alert webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Falco Alert Mapper`;
   2. Identifier : `falco_alert_mapper`;
   3. Description : `A webhook configuration to map Falco sidekicks alerts to Port`;
   4. Icon : `Alert`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <AlertWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Configure Falco Sidekick to send webhook

1. If you're using Falcosidekick with [Docker](https://github.com/falcosecurity/falcosidekick#with-docker), use the following command for installation. Replace `YOUR_WEBHOOK_URL` with the value of the `url` key you received after creating the webhook configuration;

   ```bash showLineNumbers
   docker run -d -p 2801:2801 -e WEBHOOK_ADDRESS=YOUR_WEBHOOK_URL falcosecurity/falcosidekick
   ```

2. If you prefer installing Falcosidekick with [Helm](https://github.com/falcosecurity/falcosidekick#with-helm), follow these steps:

   1. Add the webhook configuration to your config.yaml file, replacing `YOUR_WEBHOOK_URL` with the actual URL from the webhook setup.

   <details>
   <summary>Example configuration file</summary>

   ```yaml showLineNumbers
   webhook:
     address: YOUR_WEBHOOK_URL
   ```

   </details>

   2. Install or upgrade the Helm chart with the following commands:

   ```bash showLineNumbers
   helm repo add falcosecurity https://falcosecurity.github.io/charts
   helm repo update

   helm install falco --config-file=config.yaml falcosecurity/falco
   ```

Done! Any change that happens to your alerts in your server will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample response data from Falco Sidekick. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Falco Sidekick:

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "hostname": "falco-xczjd",
  "output": "13:44:05.478445995: Critical A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=kubecon container=ee97d9c4186f shell=sh parent=runc cmdline=sh -c clear; (bash || ash || sh) terminal=34816 container_id=ee97d9c4186f image=docker.io/library/alpine)",
  "priority": "Critical",
  "rule": "Terminal shell in container",
  "source": "syscall",
  "tags": ["container", "mitre_execution", "shell"],
  "time": "2023-05-25T13:44:05.478445995+00:00",
  "output_fields": {
    "container.id": "ee97d9c4186f",
    "container.image.repository": "docker.io/library/alpine",
    "evt.time": 1685022245478445995,
    "k8s.ns.name": "default",
    "k8s.pod.name": "kubecon",
    "proc.cmdline": "sh -c clear; (bash || ash || sh)",
    "proc.name": "sh",
    "proc.pname": "runc",
    "proc.tty": 34816,
    "user.loginuid": -1,
    "user.name": "root"
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Alert entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "",
  "title": "falco-xczjd - 2023-05-25T13:44:05.478445995+00:00",
  "blueprint": "falco_alert",
  "team": [],
  "icon": "Falcosidekick",
  "properties": {
    "priority": "Critical",
    "rule": "Terminal shell in container",
    "time": "2023-05-25T13:44:05.478445995+00:00",
    "source": "syscall",
    "tags": ["container", "mitre_execution", "shell"],
    "hostname": "falco-xczjd",
    "output_field": {
      "container.id": "ee97d9c4186f",
      "container.image.repository": "docker.io/library/alpine",
      "evt.time": 1685022245478445995,
      "k8s.ns.name": "default",
      "k8s.pod.name": "kubecon",
      "proc.cmdline": "sh -c clear; (bash || ash || sh)",
      "proc.name": "sh",
      "proc.pname": "runc",
      "proc.tty": 34816,
      "user.loginuid": -1,
      "user.name": "root"
    },
    "output": "13:44:05.478445995: Critical A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=kubecon container=ee97d9c4186f shell=sh parent=runc cmdline=sh -c clear; (bash || ash || sh) terminal=34816 container_id=ee97d9c4186f image=docker.io/library/alpine)"
  },
  "relations": {},
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>
