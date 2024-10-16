---
displayed_sidebar: null
title: Automating self service action approval
description: Learn how to set up automated approvals for self service actions, improving efficiency and reducing manual overhead.
---

# Automate self-service action approvals

In this guide, we will walk you through the process of setting up an automated approval system for self service actions. We will use a specific example of a developer requesting a cloud resource, such as a database, with a certain level of permissions.

## Prerequisites

Before we begin, make sure you have:

- Access to your Port account.
- Permissions to create and edit self service actions and automations.

## Create the self-service action

Let's start by creating a self service action for requesting permissions:

1. Navigate to the [Self-service](https://app.getport.io/self-serve) page in your portal.
2. Click on `+ Action` to create a new self service action.
3. Use the following JSON structure for your action:

<details>
<summary> Request Database Access (click to expand) </summary>
```json
{
  "identifier": "request_permissions",
  "title": "Request Database Access",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "permissions": {
          "type": "string",
          "title": "Permissions",
          "enum": [
            "ReadOnly",
            "ReadWrite"
          ],
          "enumColors": {
            "ReadOnly": "lightGray",
            "ReadWrite": "lightGray"
          }
        },
        "reason": {
          "type": "string",
          "title" : "Reason for Requesting Permission"
          }
      },
      "required": [],
      "order": []
    }
  },
  "invocationMethod": {
    "type": "SLACK",
    "url": "https://hooks.slack.com/services/xyz", //Replace this with your slack webhook url
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {},
    "body": {
      "text": "hello from Port :slightly_smiling_face:, {.trigger.by.user.email} from your organization has requested access to a database. The reason: {.payload.properties.reason}"
      }
  },
  "requiredApproval": {
    "type": "ANY"
  },
  "approvalNotification": {
    "type": "email"
  }
}
```
</details>


This self service configuration does the following:

- Defines an action with the identifier "request_permissions".
- Sets up user inputs for selecting permission types (ReadOnly or ReadWrite).
- Configures a Slack webhook invocation method to notify about new requests.
- Specifies that approval is required.
- Sets up email notifications for approvals.

## Set up the automation

Now that we have our self service action, let's create an automation that will approve certain requests:

1. In the [Automations page](https://app.getport.io/settings/automations), click on `+ Automation`.
2. Use the following JSON structure for your automation:

<details>
<summary> Automation definition - auto approve cloud resources (click to expand) </summary>
```json
{
  "identifier": "auto-approve",
  "title": "Auto Approve Cloud Resource Access",
  "description": "Auto Approve",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "RUN_CREATED",
      "actionIdentifier": "request_permissions"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.permissions == \"ReadOnly\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/actions/runs/{{ .event.diff.after.id }}/approval",
    "agent": false,
    "synchronized": true,
    "method": "PATCH",
    "headers": {},
    "body": {
      "status": "APPROVE",
      "description": "auto approved by automation"
    }
  },
  "publish": true
}
```
</details>


This automation configuration:

- Triggers when a new run of the "request_permissions" action is created.
- Checks if the requested permission type is "ReadOnly".
- If the condition is met, it automatically approves the request via Port's API.

## How It Works

When a user submits a permissions request:

- If they select **ReadOnly**, the automation triggers and automatically approves the request.
- If they select **ReadWrite**, the automation doesn't trigger, and the request requires manual approval.

The automation uses a JQ expression to check the permission type:

`.diff.after.properties.permissions == "ReadOnly"`

When the condition is met, it sends a PATCH request to Port's API to approve the action run.

## Customize the automation

You can customize the automation to fit your specific needs:

- **Modify the condition**: Change the JQ expression to check for different properties or values.
- **Add multiple conditions**: Use the combinator field to combine multiple expressions with "and" or "or" logic.
- **Customize the approval message**: Modify the description in the webhook body to provide more context.



## Conclusion

By leveraging Port's automation capabilities, we have created an efficient, secure workflow that reduces manual overhead for permission requests. This system streamlines the approval process for **ReadOnly** permissions while ensuring that **ReadWrite** requests still go through manual review.