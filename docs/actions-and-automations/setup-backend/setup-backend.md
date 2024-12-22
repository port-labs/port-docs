---
title: Setup backend
---

import DocCardList from '@theme/DocCardList';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import BackendTypesJson from '/docs/actions-and-automations/templates/_backend-types-json.md'

# Backend types

Port's self-service actions and automations support a variety of backends that can be used when triggered.

The process contains the following steps:

1. **The action is triggered in Port** - the trigger can either be a user executing a self-service action via the UI, or an automation triggering an action.
2. **The payload is sent to your backend** - the payload, as defined by the action's creator, is sent to your backend. The backend can be a URL, a dedicated Kafka topic or one of your CI/CD workflows/pipelines.
3. **Your backend receives the payload and handles the request** - depending on the action, your backend might open a PR, create a cloud resource, provision a new environment, or perform any other logic you would like.
4. **Your backend updates Port on the status of the execution** - You can [enrich the action run object](/actions-and-automations/reflect-action-progress/) in Port by adding logs, attaching links to other workflows or pipelines that help fulfill the request and add a final success/fail status once the action is complete.

## Supported backends

Port supports the backends listed below.  
Examples can be found under each type, under the `Self-service examples` section in the sidebar.

<DocCardList/>

## JSON structure

For both self-service actions and automations, the backend is defined under the `invocationMethod` object.  
The following example shows a backend definition that uses a GitHub workflow:

```json showLineNumbers
{
  "invocationMethod": {
    "type": "GITHUB",
    "org": "Port-samples",
    "repo": "Port-actions",
    "workflow": "reportBug.yaml",
    "workflowInputs": {
      "port_context": {
        "user_first_name": "{{ .trigger.by.user.firstName }}",
        "user_last_name": "{{ .trigger.by.user.lastName }}",
        "runId": "{{.run.id}}"
      },
      "short_title": "{{ .inputs.short_title }}",
      "description": "{{ .inputs.description }}"
    },
    "reportWorkflowStatus": true
  },
}
```

### Invocation method structure fields

<BackendTypesJson />
