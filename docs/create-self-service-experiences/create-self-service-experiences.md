---
title: ⚡️ Create Self-Service Experiences
sidebar_label: ⚡️ Create Self-Service Experiences
---

Drive developer productivity by allowing developers to run free and use self-service actions like scaffolding a service or provisioning a cloud resource. Developer self-service brings consistency and repeatability and ensures that developers do the right thing because it’s intuitive and clear, all with guardrails like manual approval or consumption policies to comply with organizational standards.

1. **Not Opinionated** - Set any Self-Service action UI with low-code UI component
2. **Async**
3. **Leverages existing infrastructure** and automations as the backend of the defined action
4. **Loosely coupled** from your infrastructure and architecture
5. **Stateful** - Every action taking place affects the software catalog by adding/modifying/deleting one or more entities
6. **Secured by design** - Does not require keys to sensitive infrastructure by operating in event-based model, all actions are audited, embedded guardrails like manual approval and TTL are baked inside

<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/fee8fe438f00483981ea9368bb10385b" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

# 💡 Common Self-Service actions

- **Scaffold** new service
- **Open** terraform PR to create cloud account
- **Launch** a jupyter notebook
- **Create** cloud resource
- **Scaffold** new in-house package
- **Provision** DevEnv
- **Redeploy** image tag
- **Rollback** running service
- **Change** replica count

In this [live demo](https://demo.getport.io/self-serve) example, we can see examples to self-service experiences. 🎬

# How does it work?

1. A user **perform an action** from Port's UI interface
2. **A payload** that include the user inputs and relevant action metadata is **sent**
3. **Job is triggered** and the **user gets a continuos indication** about the progress

<!--
| Step        | Description                                                                                            | Provision Development Environment                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Form Submission` | The user submits a form/wizard from Port                                                                          | The user submitted a **Update replica count** form |
| `API endpoint Trigger`      | Port triggers an API call that includes relevant metadata to handle the action (user inputs + action_id)                                                             | xyz + id                                                                                                                                                                                                                    |
| `Run Backend Logic`     | The API endpoint handles the action request by running the relevant logic                                                                            | Open a PR with a Terraform file that triggers a GitOps pipeline to run tf apply                                                                                                                                                                                                         |
| `Reflect action progress`   | Action progress is reflected to the user and updates the software catalog accordingly | Adding a new environment to the catalog & mark action_status as success -->

![Self-Service-Architecture](../../static/img/self-service-actions/selfserviceHLarch.png)

# Steps to enable an action from Port

Creating a self-service experience in port is very similar to a frontend-backend traditional model.
Port gives you no-code components to create the experience you want for your users and integrates with existing workflows and automatons provided by you.

### Step 1 - Setup action

Choose what is the name of the action, the icon, and the user inputs you would like the user to fill out.
Port supports various input types, including constructing wizards with conditions and steps to best fit the experience you want for your users.

![Self-Service-Architecture](../../static/img/self-service-actions/Setup%20UI.png)

### Step 2 - Setup backend

Setting up the action's logic responsible to handle the form submission can take place with various methods that will best fit your need.
Either creating a Pull Request for a IaC file with injected values, running a Github Workflow or custom Python/Bash script.
Port supports a handful methods to setup the backend for actions with a secured and compliant architecture.

Part of the logic implementation, you are able to keep the software catalog up to date by CRUD one item or more according to the action (For example, adding a service once the scaffolded ended up successfully)

![Self-Service-Architecture](../../static/img/self-service-actions/backend-integrations.png)

### Step 3 - Reflect action progress

Port lets you reflect your user with a rich indication on the current state of the action's progress.
Including a success/in-progress/failure status, live logs, ChatOps notification, friendly and indicative error messages and more.

### Optional Step - ✋🏼 Set guardrails

Port support ways to add manual approvals, policies, and TTL for consumed actions to make sure specific actions are allowed with organizational standards in mind.
