import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Actions and automations

One of Port's core offerings is the ability to automate and simplify the processes and routines of your developers.  
This is done using two powerful tools:

## 1. Self-service actions

Create a wide range of personalized, controlled actions that developers can use to scaffold a service, provision a cloud resource, or any other logic that serves your organization.  
Self-service actions drive developer productivity by providing a consistent and repeatable way to perform common tasks, all with guardrails like manual approvals or consumption policies to comply with organizational standards.

:::tip Live demo
For real-world examples of self-service actions, check out our [live demo](https://demo.getport.io/self-serve).
:::

For more information and instructions for creating self-service actions, click [here](/actions-and-automations/create-self-service-experiences).

## 2. Automations

Use events in your infrastructure as triggers to run custom workflows. Automations can be used to enforce policies, send notifications, or run any other logic you wish.  
They are a safe and efficient way to perform routine and repetitive tasks, freeing up your team to focus on other priorities.

For more information and instructions for defining automations, click [here](/actions-and-automations/define-automations).

## Comparison

Technically speaking, the difference between self-service actions and automations is the **trigger**:

- **Self-service actions** are triggered manually by a user, and are typically used for tasks that require user input and/or approval. Actions can have defined user inputs.
- **Automations** are triggered by events in your infrastructure, and are typically used for tasks that are routine and repetitive. Automations do not have user inputs.

### Identical backend & progress reflection

#### Backend

For both self-service actions and automations, you define the logic that runs when the action is triggered.  
Port supports a wide range of backend options to execute your logic, including GitHub workflows, Jenkins pipelines, custom webhooks, and more.

The same backend infrastructure is used for self-service actions and automations, making the backend part of the process identical for both.

For more information about available backends and how to set them up, click [here](/actions-and-automations/setup-backend).

#### Progress reflection

When an action or automation is triggered, Port creates an "Action run" object that represents the execution. You can interact with this object to get/set the status of the run, view/add logs, and more.

This object is identical for both self-service actions and automations.

For more information about the "Action run" object and how to interact with it, click [here](/actions-and-automations/reflect-action-progress).
