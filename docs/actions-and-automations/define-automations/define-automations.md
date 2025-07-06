---
sidebar_position: 1
title: Define automations
---

# Define automations

Naturally, your developer portal holds valuable information about your organization’s techstack, environments and dependencies. Port enables you to use this data to automate workflows and business logic, simplifying routine processes and making your organization more efficient and secure.

Automations in Port are triggered by events in your infrastructure, such as a new service being created, a cloud account being provisioned, or a new package being added to your software catalog. These events can be used to trigger a pre-defined backend running any logic, such as updating your software catalog, sending notifications, or provisioning new resources.

Port uses the same backend types for both automations and [self-service actions](/actions-and-automations/create-self-service-experiences/).

## 💡 Common automations

- Create a new incident in PagerDuty when CPU usage is greater than X%.
- Destroy an ephemeral environment when its TTL expires.
- Send a Slack message for each new alert.

## How does it work?

Automations are comprised of two parts:

1. **Trigger** - An event in your software catalog that you want to act upon. This can be any one of the events defined [here](/actions-and-automations/define-automations/setup-trigger).
2. **Backend** - The logic that you want to execute when the trigger event occurs. This can be any one of the backends defined [here](/actions-and-automations/define-automations/setup-action). This part includes defining a payload that will be sent to your handler upon execution.

<br/><center>
<img src="/img/automations/architecture.jpg" width="80%" border='1px' />
</center><br/>

When an event occurs in your software catalog, Port will automatically trigger the associated backend, given that the automation is enabled.

## Define an automation

Automations are defined in the [Automations page](https://app.getport.io/settings/automations) of your portal.  
Here you can create, edit, and delete automations, as well as enable or disable them.  

Click on the `+ Automation` button in the top-right corner, then follow the steps below:

  1. In the first tab (`Basic Details`) of the automation creation form in Port's UI:  
      Specify your automation’s basic details: 

      - `title` - The automation's title.
      - `identifier` - The automation's unique identifier.
      - `description`- A description that can be used to explain the automation.
      - `icon` - The automation's icon.
      - `active` - A toggle button indicating whether the automation is enabled or disabled. (`true` by default).

  2. In the second tab (`Trigger`), set up the [trigger](/actions-and-automations/define-automations/setup-trigger). 

  3. In the third tab (`Backend`), define the [backend](/actions-and-automations/define-automations/setup-action) that will be executed when the trigger event occurs, then click `Save`.

## Automation JSON structure

Automations can also be defined using a JSON format.  
The JSON structure looks like this:

```json showLineNumbers
{
  "identifier": "unique_id",
  "title": "Title",
  "icon": "icon_identifier",
  "description": "automation description",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "event_type",
      "blueprintIdentifier": "blueprint_id"
    },
    "condition": {
      "type": "JQ",
      "expressions": ["expression1", "expression2"],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://example.com"
  },
  "publish": true
}
```
<br/>
Make sure to set the `publish` field to `true` if you want to enable the automation.

The table below describes the fields in the JSON structure (fields in **bold** are required):
| Field | Description |
| --- | --- |
| **`identifier`** | The automation's unique identifier. |
| `title` | The automation's title. |
| `icon` | The automation's icon. |
| `description` | A description that can be used to explain the automation. |
| **`trigger`** | An object containing data about the automation's trigger. See [Setup trigger](/actions-and-automations/define-automations/setup-trigger) for more information. |
| **`invocationMethod`** | An object containing data about the automation's invocation method. See [Setup action](/actions-and-automations/define-automations/setup-action) for more information. |
| `publish` | A boolean value indicating whether the automation is enabled or disabled (`true` by default). |

## Examples

See some examples of automation definitions [here](/actions-and-automations/define-automations/examples).
