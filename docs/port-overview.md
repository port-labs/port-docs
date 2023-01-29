---
sidebar_position: 2
---

# Port Overview

## What is Port

Welcome to Port! :wave:

Whether you are a DevEx, platform, or DevOps engineer, Port helps you create your custom Developer Portal in no time! With Port, you can build the perfect setup and workflow for your organizational needs, in order to make your developer's lives much easier with self-service capabilities

![Developer Platform complete vision](../static/img/quickstart/platform-vision.png)

### Port as a Builder

Our approach is to let you build anything with maximum flexibility. Therefore, we took a **builder-based** approach, in which you can build your asset landscape whichever way works for you. We don't enforce anything on how you build your catalog.

### We are API-first

<sup><mark>And it is not just an empty claim.</mark></sup>

We built Port with an **API-First approach**, meaning that our product and API go hand in hand, consequently benefiting our development velocity and our users, too. You can use our API to perform any operation on the Platform, while we provide you with the logic and the detailed documentation.

:::note
We Use the **OpenAPI 3** specification.  
Visit our [Swagger.](https://api.getport.io/static/index.html#/)
:::

We will now list the core components that construct Port, with short explanations and links to the comprehensive documentation of each component:

## Software Catalog

- **Blueprints** are our basic building blocks in Port. They represent assets that can be managed in Port, such as `Microservice`, `Environments`, `Packages`, `Clusters`, `Databases`, and many more;
- **Relations** enable us to create connections and link between Blueprints, doing so provides logical context to the Software Catalog;
- **Entities** are objects that match the types defined by Blueprints;
- **Widgets** and **Dashboards** allow you to extend your Software Catalog with convenient and intuitive visual representations of data.

:::tip
To learn more about the components listed above and more, refer to the Software Catalog page.
:::

## Self-Service Actions

In Port, you can make your Software Catalog active by defining Self-Service Actions for your developers to perform, without assistance or dependency on DevOps teams.

Port Self-Service Actions are enabled using several convenient integrations with your infrastructure:

- **Webhook Actions** - Port can trigger webhooks based on a customer provided `URL` Both for `Action` and `Changelog` events;
- **Execution Agent** - our execution agent provides you with a secure and convenient way to listen and act on invocations of Self-Service Actions and changes in the software catalog;
- **Kafka Actions** - Port manages a Kafka Topic per customer that publishes the execution run requests.
  You can listen to a Kafka Topic with any code platform you wish to use, and also use it as a trigger for a serverless function. For example, AWS Lambda.
- **GitHub Workflow Actions** - Port's GitHub application can trigger a GitHub workflow using a customer provided input and `port_payload`.

:::tip
To learn more about the Self-Service Actions and more, refer to the Self-Service Actions page and the Self-Service Actions Deep Dive.
:::

## Integrations

In addition to Port's core components, we provide you with multiple integrations, exporters and data ingestion methods:

- Via the **UI**;
- Using our **API**;
- Using 3rd party app integrations, for example GitHub App, GitHub Action, K8s Exporter and Terraform Provider.

:::tip
Refer to Port's API providers and exporters pages to learn more.
:::

## Management

Port provides enterprise-grade management tools and integrations to keep track of your Software Catalog and provide access to large R&D teams

### The audit log

In Port, we store every event in a visual log that shows which events took place on different Blueprints and Entities. For example: which Entity was modified, who invoked a Self-Service Action, what is an event’s status and more.

### The users page and the teams page

Port has pages dedicated for managing all users and teams in the system:

- The users page: shows a list of all users, including their roles and group membership;
- The teams page: shows a list of all teams, including a list of team members for each team.

#### Managing users and teams

In Port, you can control and manage all your users and teams, in one place. To learn more, refer to the Users and Teams management page.

## Getting help

| Source                                                                                                  | Description                                                                                                                         |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Documentation                                                                                           | You are here!                                                                                                                       |
| API Docs                                                                                                | Our full API docs                                                                                                                   |
| [API Swagger](https://api.getport.io/static/index.html#/)                                               | Our Swagger UI                                                                                                                      |
| [Community](https://join.slack.com/t/devex-community/shared_invite/zt-1bmf5621e-GGfuJdMPK2D8UN58qL4E_g) | Our DevEx community will help you with best practices and success stories                                                           |
| Contact Us                                                                                              | You can message us directly by logging in to [Port](https://app.getport.io) and clicking the chat bubble in the bottom right corner |

## Next steps

The best way to get started with Port is by configuring some initial Blueprints and ingesting data into the platform. To do that, move on to the Software Catalog page.
