---
title: Set actions RBAC
sidebar_label: Set actions RBAC
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set actions RBAC

Port provides granular control to make sure every user can only execute and invoke the actions that are relevant for them.

:::tip
This section covers the self-service actions section of Port's RBAC functionality, while it is not a prerequisite, it is highly recommended you also go over Port's [permission controls](../../sso-rbac/rbac/rbac.md).

In order to manage who can view which pages in Port, check out [page permissions](../../customize-pages-dashboards-and-plugins/page/page-permissions.md).
:::

## Common Self-service actions RBAC usage

Self-service actions RBAC allows admins to finely control which users can execute which self-service actions, for example:

- Let a developer provision a database only to his microservice or developer environment.
- Specify that a new cluster provision request requires manual approval by the DevOps team.

## Configure permissions for actions

When creating/editing self-service actions, you can set permissions using one of the following methods:

<Tabs groupId="config-method" queryString values={[
{label: "UI", value: "ui"},
{label: "Terraform", value: "terraform"},
]}>

<TabItem value="ui">

The last step of creating an action is configuring permissions:  

<img src='/img/self-service-actions/rbac/actionFormPermissions.png' width='70%' />
<br/><br/>

By default, the `Give access to everyone in the organization` toggle is enabled. To limit execution access to selected users/teams, switch off the toggle.

- To give access to specific users or teams, use the dropdown menus to select them. 
- You can also give access to the *owners* of the entity the action is associated with, by enabling the `owners` toggle. This means that the `Team` property of the entity will be used to determine who can execute the action.

</TabItem>

<TabItem value="terraform">

Port's Terraform provider allows you to control permissions via Terraform.  
Click [here](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/port_action_permissions) for more information and examples.

</TabItem>

</Tabs>

## Configure manual approval for actions

You have the ability to set up manual approval steps for your actions.

This feature is particularly useful in situations where an action has the potential to be dangerous, destructive, expensive, or when organizational policy mandates an additional level of review before proceeding.

When a user clicks on the `execute` button of an action that requires approval, a new `run` object will be created in Port. The `run` object will have the status `WAITING_FOR_APPROVAL` and will be visible in the `Runs` tab of the action.

When a new request requires approval, Port will send a notification via email to users that have the permissions to approve it, or it will send a notification to a configured url via a web request.

To configure a manual approval step:

<Tabs groupId="config-method" queryString values={[
{label: "UI", value: "ui"},
{label: "API", value: "api"},
]}>

<TabItem value="ui">

Scroll down the `Permissions` tab and set `Enforce manual approval` to `Yes`. This will introduce some new options:

<img src='/img/self-service-actions/rbac/manualApproval.png' width='70%' border='1px' />

</TabItem>

<TabItem value="api">

Add the `requiredApproval` field to your action:

```json showLineNumbers
[
  {
    ...
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "https://example.com"
    },
    "trigger": "CREATE",
    // highlight-next-line
    "requiredApproval": true,
    ...
  }
]
```

</TabItem>
</Tabs>

### Define approval notifications

By default manual approval notifications are sent via **Email** to users who have [approval permissions](#define-approvers).

Port offers two alternatives:

#### Webhook

You can configure a webhook URL which the approval notification will be sent to, using the following configuration:

```json showLineNumbers
{
    ...
    "requiredApproval": true,
    // highlight-start
    "approvalNotification": {
      "type": "webhook",
      "format": "json",
      "url": "https://my-webhook-url.com"
    },
    // highlight-end
    ...
}
```

#### Slack

You can have your approval notifications sent to a Slack channel of your choice. The configuration in Port is as follows:

```json showLineNumbers
{
    ...
    "requiredApproval": true,
    // highlight-start
    "approvalNotification": {
      "type": "webhook",
      "format": "slack",
      "url": "https://my-slack-webhook.com"
    },
    // highlight-end
    ...
}
```

To generate the needed URL, you need to create a Slack app and install it in your workspace by following steps 1-3 outlined in the [Slack API Documentation](https://api.slack.com/messaging/webhooks).

Once you have completed the installation process, you will obtain a webhook URL that looks like this:

```text
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

Use this URL in the `url` field of the `approvalNotification` object.

### Define approvers

You can define approvers for an action by `role`, `user`, or `team`.  


In this example, only users with the Admin role can approve the `clone_env` action:

```json showLineNumbers
{
  "actions": {
    "clone_env": {
      "approve": {
        "roles": ["Admin"],
        "users": [],
        "teams": []
      }
    }
  }
}
```