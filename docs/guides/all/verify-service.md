---
displayed_sidebar: null
description: Learn how to keep your service catalog data up to date with Port's automation and self-service features
---

# Remind service owners to update their catalog data

This guide helps you set up a verification workflow that notifies service owners to update and verify their service details every three months, ensuring that data stays reliable and current.

## Common use cases

- Remind service owners to confirm or update ownership and metadata every quarter.
- Ensure service records remain accurate for audits, incident response, and reporting.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have access to Slack developers page and have created a Slack webhook URL. Follow the steps in the [Slack Incoming Webhooks Guide](https://api.slack.com/messaging/webhooks) to create a webhook URL.


## Set up data model

Follow the steps below to **update** the `Service` blueprint:

1. Navigate to the `Service` blueprint in your Port [Builder](https://app.getport.io/settings/data-model).
2. Hover over it, click on the `...` button on the right, and select `Edit JSON`.
3. Add the verification status property:

   <details>
   <summary><b>Is Verified property (Click to expand)</b></summary>

   ```json showLineNumbers
    "is_verified": {
        "type": "boolean",
        "title": "Is Verified",
        "description": "Whether the service data has been verified by the owner team"
    },
   ```

   </details>

4. Add the verification TTL to leave properties:

   <details>
   <summary><b>Verification TTL property (Click to expand)</b></summary>

   ```json showLineNumbers
    "verification_ttl": {
        "type": "string",
        "title": "Verification TTL",
        "format": "timer"
    }
   ```

   </details>
5. Click `Save` to update the blueprint.

## Set up self-service action

Follow these steps to create the self-service action that verifies the service and sets the verification timer to expire in 3 months:

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Verify Service (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "verify_service",
    "title": "Verify Service",
    "description": "A self service action to verify a service entity",
    "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
        "properties": {},
        "required": [],
        "order": []
        },
        "blueprintIdentifier": "service"
    },
    "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
        "identifier": "{{ .entity.identifier }}",
        "title": "{{ .entity.title }}",
        "properties": {
            "is_verified": true,
            "verification_ttl": "{{ (90 * 86400 + now | strftime(\"%Y-%m-%dT%H:%M:%S\") + \".000Z\") }}"
        }
        }
    },
    "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Verify Service` action in the self-service page. 🎉

## Create an automation to update your catalog

We’ll now set up two automations:

- One to clear and set the verification status when the timer expires.
- One to notify the service owner to re-verify the service.

### Automation to update service verification status

When the verification timer property expires, this automation sets `is_verified` property as `false`. Follow the steps below to create this automation:

1. Head to the [automation](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Update service verification status in Port automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "clear_service_verification",
    "title": "Clear Service Verification Status",
    "description": "When the verification timer property on the service blueprint expires, run this automation to update the verification status of the service to false",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "TIMER_PROPERTY_EXPIRED",
        "blueprintIdentifier": "service",
        "propertyIdentifier": "verification_ttl"
        }
    },
    "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
        "identifier": "{{ .event.context.entityIdentifier }}",
        "properties": {
            "is_verified": false
        }
        }
    },
    "publish": true
    }
    ```
    </details>

4. Click `Save`.

Now when the verification timer (`Verification TTL`) of a service entity expires, the entity's `Verification Status` property in Port will be automatically updated.


### Automation to notify service owners

When `is_verified` changes from `true` to `false`, this automation sends a Slack message to the service owners. Follow the steps below to create this automation:

1. Head to the [automation](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Notify service owners automation (Click to expand)</b></summary>

    ```json showLineNumbers

    :::tip Slack Webhook Url
    Replace the `<SLACK_WEBHOOK_URL>` placeholder with your actual incoming webhook URL from Slack.
    :::

    {
    "identifier": "notify_on_expired_verification",
    "title": "Notify On Expired Verification",
    "description": "When the verification timer property on the service blueprint expires, run this automation to send a slack message to the service owners",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "ENTITY_UPDATED",
        "blueprintIdentifier": "service"
        },
        "condition": {
        "type": "JQ",
        "expressions": [
            ".diff.before.properties.is_verified == true",
            ".diff.after.properties.is_verified == false"
        ],
        "combinator": "and"
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "<SLACK_WEBHOOK_URL>",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {},
        "body": {
        "text": "\n :warning: *Attention - Verification Required* :warning: \n\nThe verification for the service `{{ .event.context.entityIdentifier }}` has expired.\n\nPlease <https://app.getport.io/{{ .event.context.blueprintIdentifier }}Entity?identifier={{ .event.context.entityIdentifier }}|click here> to verify it."
        }
    },
    "publish": true
    }
    ```
    </details>

4. Click `Save`.

## Let's test it!

1. Observe a service entity whose verification timer has expired. The Slack message may look like this:

    <img src="/img/guides/serviceVerificationMessage.png" width="50%" border="1px" />

2. Follow the link in the Slack message to access the entity page.

3. Click the `Actions` button on the page.

4. Choose the `Verify Service` action.

5. Click on `Execute`.

6. Done! Wait for the service entity to be verified again.

