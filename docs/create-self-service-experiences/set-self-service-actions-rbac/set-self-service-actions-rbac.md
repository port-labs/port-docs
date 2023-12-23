---
title: Set Self-Service Actions RBAC
sidebar_label: Set Self-Service Actions RBAC
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set Self-Service Actions RBAC

Port provides granular control to make sure every user can only execute and invoke the actions that are relevant for them.

:::tip
This section covers the self-service actions section of Port's RBAC functionality, while it is not a prerequisite, it is highly recommended you also go over Port's [permission controls](../../sso-rbac/rbac/rbac.md).

In order to manage who can view which pages in Port, check out [page permissions](../../customize-pages-dashboards-and-plugins/page/page-permissions.md).
:::

## 💡 Common Self-service actions RBAC usage

Self-service actions RBAC allows admins to finely control which users can execute which self-service actions, for example:

- Let a developer provision a database only to his microservice or developer environment;
- Specify that a new cluster provision request requires manual approval by the DevOps team;
- etc.

## Configure permissions for actions

When creating/editing self-service actions, you can set permissions using one of the following methods:

<Tabs groupId="config-method" queryString values={[
{label: "UI", value: "ui"},
{label: "Terraform", value: "terraform"},
]}>

<TabItem value="ui">

The last step of creating an action is configuring permissions.  
By default, the `Give access to everyone in the organization` toggle is enabled. To limit execution access to selected users/teams, switch off the toggle and use the dropdowns to select them.

<img src='/img/self-service-actions/rbac/actionFormPermissions.png' width='70%' />

</TabItem>

<TabItem value="terraform">

Port's Terraform provider allows you to control permissions via Terraform.  
Click [here](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/port_action_permissions) for more information and examples.

</TabItem>

</Tabs>

## Configure manual approval for actions & give approval permissions

You have the ability to set up manual approval steps for your actions.

This feature is particularly useful in situations where an action has the potential to be dangerous, destructive, expensive, or when organizational policy mandates an additional level of review before proceeding.

When a user clicks on the `execute` button of an action that requires approval, a new `run` object will be created in Port. The `run` object will have the status `WAITING_FOR_APPROVAL` and will be visible in the `Runs` tab of the action.

When a new request requires approval, Port will send a notification via email to users that have the permissions to approve it, or it will send a notification to a configured url via a web request.

To configure a manual approval step, add the `requiredApproval` field to your action:

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

To configure which users can approve the action, see [Managing permissions](/docs/create-self-service-experiences/set-self-service-actions-rbac/examples.md#setting-action-permissions).

## Configuring approval notifications

by default manual approval notifications are sent via email to users who have approval permissions.

It is also possible to configure a webhook URL which the approval notification will be sent to.

This allows you to receive notifications in a format of your choice, either as a plain JSON object or as a Slack message.

To send an approval notification to a URL, add the `approvalNotification` field to your action configuration:

```json showLineNumbers
{
    ...
    "requiredApproval": true,
    // highlight-start
    "approvalNotification": {
      "type": "webhook",
      "format": "json / slack",
      "url": "https://my-slack-webhook.com"
    },
    // highlight-end
    ...
}
```

Click [here](/docs/create-self-service-experiences/set-self-service-actions-rbac/examples.md#setting-up-a-slack-notification) to learn how to send manual approval requests to Slack.

## Self-service actions RBAC examples

Refer to the [examples](./examples.md) page for practical examples of Port's RBAC.
