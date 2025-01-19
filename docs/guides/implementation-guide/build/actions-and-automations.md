---
sidebar_position: 4
---

# Create actions and automations

Now that you have set up your software catalog, it's time to create self-service actions and automations to use the data you've ingested to automate common tasks and trigger actions based on events. 

## Set up self-service actions

[Self-service actions](https://docs.port.io/actions-and-automations/create-self-service-experiences/) enable users to perform routine tasks in a safe, repeatable, and auditable way.  

<img src="/img/guides/implementation-guide/ssa-example.png" width="50%" border="1px" />
<br/><br/>

Actions are made up of two parts:
- **Frontend**: The UI that users interact with to execute the action. This includes the form inputs and any additional information needed to execute the action.
- **Backend**: The logic that executes the action. This can be a webhook, a CI/CD pipeline, or even a direct update to the software catalog.

:::tip Self-service actions permissions
When creating self-service actions, you can [define which users or teams](https://docs.port.io/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/) can **execute** and/or **approve** execution of actions in your portal.
:::
<br/>



[**Start here**](https://docs.port.io/actions-and-automations/create-self-service-experiences/#create-a-self-service-action) to create self-service actions for your MVP user-stories.

Some common examples of self-service actions include:
- Scaffolding a new microservice.
- Requesting a cloud resource.
- Reporting an incident.  

Check out Port's [live demo](https://demo.getport.io/self-serve) for more real-world examples.

## Set up automations

[Automations](https://docs.port.io/actions-and-automations/define-automations/) are used to trigger actions based on events in your portal.  
They can be used to automate routine tasks, trigger alerts, create/delete resources, and much more.

Automations are made up of two parts:
- **Trigger**: An event in your software catalog that starts the automation.
- **Action**: The logic that is executed when the automation is triggered. This is identical to the backend of a self-service action, and supports the same options.

<img src="/img/guides/implementation-guide/automation-example.svg" width="60%" border="1px" />
<br/><br/>

[**Start here**](https://docs.port.io/actions-and-automations/define-automations/) to create automations for your MVP user-stories.

Some common examples of automations include:
- Send notifications to relevant users when a new service is created/updated.
- Trigger an incident when a service degrades.

Check out Port's [live demo](https://demo.getport.io/settings/automations) for more real-world examples.

## Next step - launch

Now that the significant components in your portal have been created, you are ready to launch your portal.  

Before announcing the launch, there are several steps we recommend you take to ensure a successful and effective launch, proceed to the [Launch phase](/guides/implementation-guide/launch/) for more information.