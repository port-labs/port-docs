---
title: Setup Actions
---

import ApiRef from "../../api-reference/\_learn_more_reference.mdx";

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Setup frontend

<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/DhDQ_lucdgM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

After selecting the blueprint you want to add an action to, we need to define the action's frontend - its structure and interface.

This is done in the first two tabs of the action creation form in Port's UI:

<img src='/img/self-service-actions/setup-frontend/action-form-frontend.png' width='60%' border='1px' />
<br/><br/>

Click [here](/create-self-service-experiences/#action-json-structure) for a reminder of an action's JSON structure.

## Basic details

Here we will define the action's `title`, `icon`, and `description`.

We will also choose the action's `type`:

- **Create** - the action will result in the creation of a new <PortTooltip id="entity">entity</PortTooltip> in Port by triggering a provisioning process in your infrastructure. Since these actions create a new entity, they are not tied to an existing entity in your software catalog.
- **Delete** - the action will result in the deletion of an existing entity by triggering delete logic in your infrastructure.
- **Day-2** - the action will trigger logic in your infrastructure to update or modify an existing entity in your catalog.

## User form

Port allows you to create a wizard-like experience for your developers by utilizing a variety of input types they will need to fill, while also including input validations.  

See the [user inputs](./user-inputs/user-inputs.md) page for more details about the available input types.

You can even define more advanced forms with dynamic fields that change according to your data or other inputs in the form. See [advanced input configurations](/create-self-service-experiences/setup-ui-for-action/advanced-form-configurations) for more information and examples.

## Next step

Once the frontend is set up, we will move on to the action's [backend configuration](/create-self-service-experiences/setup-backend/).
