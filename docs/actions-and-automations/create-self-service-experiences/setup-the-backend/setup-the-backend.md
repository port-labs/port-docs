---
title: Set up backend
---

import DocCardList from '@theme/DocCardList';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import BackendTypesJson from '/docs/actions-and-automations/templates/_backend-types-json.md'
import ExecuteActionLocations from '/docs/actions-and-automations/create-self-service-experiences/templates/_execute_action_locations.mdx'
import BackendDefintion from '/docs/actions-and-automations/templates/_define_the_backend_self_service_and_automations.md'

# Set up backend

<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/cU7W3xYbsEw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

A self-service action's backend is the logic that runs when the action is triggered. The implementation of the backend is done by you, using one of the various backend types that Port supports.

:::tip Identical backends for self-service actions and automations
Port uses the same backend types and configurations for both self-service actions and [automations](/actions-and-automations/define-automations/), so any backend option available for self-service actions can be used in automations as well.
:::

<BackendDefintion/>

## JSON structure

In some cases, you may prefer to define the backend configuration using a JSON object.  
The backend is defined under the `invocationMethod` object in the action's JSON structure.

<BackendTypesJson />

___

## Next step

Once the backend is set up, the action is ready to be used.  
Optionally, you can [configure permissions and/or manual approval](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/) for your actions to control who is allowed to execute them.

### Execute the action

<ExecuteActionLocations />