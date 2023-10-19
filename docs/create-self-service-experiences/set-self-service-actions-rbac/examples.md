---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Examples

In this section we'll show you a few examples of ways to use self-service action permissions in your organization, and how to apply them.

## Use cases 💡

The following configurations, among others, are available when using self-service action permissions management:

1. Self-service actions can be enabled only for specific users;
2. Allow specific users/roles to only execute specific self-service actions;
3. Specify users that are allowed to approve self-service action requests;

## Setting blueprint permissions

To set permissions for a self-service action, click on the permissions button of the blueprint with the desired self-service action in the DevPortal Builder page. This will open a modal that contains the permissions JSON and allows you to control every operation that can be performed on the blueprint or its entities.

## Setting action permissions

### Role examples

<Tabs groupId="action-permissions" defaultValue="action-only-admin-moderator" values={[
{label: "Only let admins/moderators run action", value: "action-only-admin-moderator"}
]}>

<TabItem value="action-only-admin-moderator">

By default, **Member** users can execute every action defined on a blueprint. In this example, we allow only **Moderators** (and **Admins**) to only execute the action `clone_env` (and disabling Member's permission to execute it):

```json showLineNumbers
{
  "actions": {
    "clone_env": {
      "execute": {
        // highlight-next-line
        "roles": ["Admin", "Env-moderator"], // changed from ["Admin", "Env-moderator", "Member"]
        "users": [],
        "teams": [],
        "ownedByTeam": false
      }
    }
  }
}
```

</TabItem>

</Tabs>

## Setting up a Slack notification

To enable Slack notifications, you need to create a Slack app and install it in your workspace by following steps 1-3 outlined in the [Slack API Documentation](https://api.slack.com/messaging/webhooks).

Once you have completed the installation process, you will obtain a webhook URL that looks like this:

```text
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

Now, you can use your webhook URL to send the manual approval notification to the Slack channel tied to the webhook URL.

To do this, modify the `approvalNotification` field in your action configuration as shown below:

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
