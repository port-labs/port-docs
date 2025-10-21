import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Actions and automations

One of Port's core offerings is the ability to automate and simplify the processes and routines of your developers.  
This is done using two powerful tools:

## 1. Actions

Create a wide range of personalized, controlled actions that can be executed through self-service by developers, triggered by AI agents, or invoked by workflow automations. Actions can scaffold a service, provision a cloud resource, or perform any other logic that serves your organization.  
Actions drive developer productivity by providing a consistent and repeatable way to perform common tasks, all with guardrails like manual approvals or consumption policies to comply with organizational standards.

:::tip Live demo
For real-world examples of actions, check out our [live demo](https://showcase.port.io/self-serve).
:::

For more information and instructions for creating actions, click [here](/actions-and-automations/create-self-service-experiences).

## 2. Automations

Use events in your infrastructure as triggers to run custom workflows. Automations can be used to enforce policies, send notifications, or run any other logic you wish.  
They are a safe and efficient way to perform routine and repetitive tasks, freeing up your team to focus on other priorities.

For more information and instructions for defining automations, click [here](/actions-and-automations/define-automations).

## Comparison

Technically speaking, the difference between actions and automations is the **trigger**:

- **Actions** can be triggered manually by a user (self-service), by AI agents, or invoked programmatically. Actions are typically used for tasks that may require user input and/or approval. Actions can have defined user inputs.
- **Automations** are triggered by events in your infrastructure, and are typically used for tasks that are routine and repetitive. Automations do not have user inputs.

### Identical backend & progress reflection

#### Backend

For both actions and automations, you define the logic that runs when they are triggered.  
Port supports a wide range of backend options to execute your logic, including GitHub workflows, Jenkins pipelines, custom webhooks, and more.

The same backend infrastructure is used for actions and automations, making the backend part of the process identical for both.

For more information about available backends and how to set them up, click [here](/actions-and-automations/setup-backend).

#### Progress reflection

When an action or automation is triggered, Port creates an "Action run" object that represents the execution. You can interact with this object to get/set the status of the run, view/add logs, and more.

This object is identical for both actions and automations.

For more information about the "Action run" object and how to interact with it, click [here](/actions-and-automations/reflect-action-progress).
