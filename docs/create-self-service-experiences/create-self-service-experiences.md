---
title: Create self-service actions
sidebar_label: ⚡️ Create self-service actions
---

# ⚡️ Create self-service actions

<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/KHuGBQlErWo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

Drive developer productivity by allowing developers to use self-service actions like scaffolding a service or provisioning a cloud resource. Developer self-service drives consistency and repeatability and ensures that their routines are intuitive and clear, all with guardrails like manual approvals or consumption policies to comply with organizational standards.

Port's action model is designed to be flexible and can be used to cover a wide range of use-cases:

1. **Unopinionated** - flexible UI to create a wide range of self-service actions.
2. **Leverages existing infrastructure** and automations as the backend of your actions.
3. **Loosely coupled** to your infrastructure and architecture.
4. **Stateful** - every invoked action affects the software catalog by adding/modifying/deleting one or more entities.
5. **Secure by design** - does not require keys to sensitive infrastructure by using an event-based model. All actions are audited and can include guardrails like manual approval and TTL.

## 💡 Common self-service actions

- **Scaffold** a new service.
- **Open** a terraform PR to create a cloud account.
- **Launch** a jupyter notebook.
- **Create** a cloud resource.
- **Scaffold** a new in-house package.
- **Provision** a temporary DevEnv.
- **Redeploy** an image tag.
- **Rollback** a running service.
- **Change** replica count.

In our [live demo](https://demo.getport.io/self-serve), you can see examples for self-service experiences. 🎬

## How does it work?

1. A user **performs an action** from Port's UI interface.
2. **A payload** that includes the user inputs and relevant action metadata is **sent** to your infrastructure.
3. **A job is triggered** and the **user gets a continuous indication** about its progress.
4. Once the action is running, you can use Port's API to update Port on its status and provide information such as logs and links to the resulting handlers.

<img src='/img/self-service-actions/selfserviceHLarch.png' width='100%' border='1px' />

## Steps to enable an action from Port

Creating a self-service experience in port is very similar to a traditional frontend-backend model.
Port gives you no-code components to create the experience you want for your users and integrates with existing workflows and automations provided by you.

Self-service actions are created and managed in the [Self-service](https://app.getport.io/self-serve) page of your portal.  
To begin, click on the `+ New Action` button in the top right corner. Choose the blueprint for which you would like to create the action, then follow the steps below.

### Step 1 - setup the action's frontend

Choose the name of the action, its icon, and the inputs you would like the user to fill out when executing it.
Port supports a wide variety of input types, including more advanced conditions to best fit the experience you want for your users.

See [Setup UI for actions](/create-self-service-experiences/setup-ui-for-action/) for instructions and examples.

### Step 2 - setup backend

Setup the logic responsible to handle the action after it is executed.

The backend logic is yours, so it can do whatever you need it to do. Some examples include:

- Create a pull request for a IaC file with injected values.
- Trigger a Github Workflow or custom Python/Bash script.
- Make an API call to one of your internal APIs.

Port supports many different backends for actions, offering a secure and compliant architecture.

As part of your backend and its logic implementation, you are able to keep the software catalog up to date by sending API requests or ingesting new data that is tied to the performed action (for example, adding a new service entity in Port once the scaffold process has finished).

See [Setup backend](/create-self-service-experiences/setup-backend/) for instructions and examples.

<center>

![](/img/self-service-actions/backend-integrations.png)

</center>

### Step 3 - reflect action progress

Port allows you update your users on the current state of the action's progress, using a `success/in-progress/failure` status, live logs, ChatOps notifications, friendly and indicative error messages, and more.

See [Reflect action progress](/create-self-service-experiences/reflect-action-progress/) for instructions and examples.

### Optional Step - ✋🏼 set guardrails

Port supports a variety of ways to add manual approvals, policies, and TTL to actions, to ensure that organizational standards are met.

See [Set actions RBAC](/create-self-service-experiences/set-self-service-actions-rbac/) for instructions and examples.
