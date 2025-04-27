import PortApiRegion from "/docs/generalTemplates/_port_api_available_regions.md"

# Webhook

## Overview

The webhook backend allows you to trigger your own custom webhooks, for both self-service actions and automations.

<img src="/img/self-service-actions/portWebhookArchitecture.jpg" width="90%" border='1px' />
<br/><br/>

The steps shown in the image above are as follows:

1. Port generates an invocation of an action/automation.
2. Port signs the payload + timestamp using `HMAC-SHA-256` and puts it in the request header.
   :::info WEBHOOK SECURITY
   Verifying the webhook request using the request headers provides the following benefits:

   - Ensures that the request payload has not been tampered with.
   - Ensures that the sender of the message is Port.
   - Ensures that the received message is not a replay of an older message.

   To learn how to verify the webhook request, refer to the [Verifying Webhook Signature](../webhook/signature-verification) page.

   :::

3. Port publishes an invoked action/automation via a `POST` request to the customer defined `URL`.
4. A listener implemented on the Client side receives the `POST` request and runs custom logic provided by the user.

:::info
The listener can be anything that can read from a Kafka topic and run code based on the received message, for example:

- AWS Lambda.
- Python code that reads from the topic.
- Docker container running code.

You control how you interact with webhooks, in the way that best suits your organization and infrastructure.
:::

An example flow would be:

1. A developer asks to deploy a new version of an existing `Microservice`.
2. The `create` action is sent to the defined `URL`.
3. An AWS Lambda function is triggered by this new action message.
4. The Lambda function deploys a new version of the service.
5. When the Lambda is done, it reports back to Port about the new Microservice `Deployment`.

## Configuration

When using this backend, there are several configurations that you can customize:

### Use Port secrets for sensitive data

Sensitive data such as tokens and passwords can be stored using [Port secrets](/sso-rbac/port-secrets/).

Sometimes your webhook URL might contain sensitive data, such as a token.  
To use a secret in the URL, you can reference it using `{{ .secrets.secret_name }}`.

```bash
https://example.com?token={{ .secrets.secret_token_name }}
```

### Use Port agent

The [Port execution agent](/actions-and-automations/setup-backend/webhook/port-execution-agent/) provides you with a secure and convenient way to act upon webhook invocations of self-service actions and automations.  
The agent pulls the new invocation event from your dedicated Kafka topic, and sends it to the URL you specified.  

If you prefer to send a webhook without using the agent, you can [validate the webhook signature](https://docs.port.io/create-self-service-experiences/setup-backend/webhook/signature-verification) for increased security.

To use the agent, set the `agent` field to `true` in the `invocationMethod` object, or set the `Use self-hosted agent` toggle to `Yes` if using the UI.

### Request type - sync vs. async

By default, the action will be executed **asynchronous**, meaning that your backend will need to explicitly send Port its result via the API.

Alternatively, you can set the execution type to **synchronous**, which will cause the action to automatically report its result back to Port via the returned HTTP status code and payload.

### HTTP method

By default, a `POST` request will be sent to the specified endpoint URL.  
You can change the request to any of the supported types: `POST`, `PUT`, `DELETE`, or `PATCH`.

## Trigger Port API

You can use this backend type to trigger [Port's API](https://docs.port.io/api-reference/port-api), allowing you to execute any route you wish with automatic authentication.  
Port will automatically use the organization's API key to authenticate the request.

This can be useful when you want to perform an operation in Port, such as creating a new user or executing a self-service action, especially if you want to trigger logic that you have already defined.

### Example - Triggering a self-service action

Say you have a self-service action that sends a Slack notification, with the identifier `slack_notify`.  
The following example shows an automation definition that triggers this self-service action, when a service's `passed` property changes from `Passed` to `Not passed`:

<details>
<summary><b>Automation definition (click to expand)</b></summary>
<PortApiRegion />
```json showLineNumbers
{
  "identifier": "slack_notify_on_service_failure",
  "title": "Notify via Slack on service failure",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "service"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.passed == \"Passed\"",
        ".diff.after.properties.passed == \"Not passed\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/actions/slack_notify/runs?run_as=user-email@gmail.com",
    "synchronized": true,
    "method": "POST",
    "body": {
      "properties": {
        "message": "Service {{ .event.diff.before.title }} has degraded from `Passed` to `Not passed`."
      }
    }
  },
  "publish": true
}
```
</details>

- `synchronized` must be set to `true`, so that the automation's status will be updated when the action is triggered.
- In the `url` field, you can add `run_as` to the url to specify the user that will execute the action (replace `user-email@gmail.com` with the desired user's email).  
  If you don't specify a user, the action will be executed using the organization's default credentials.
- The `body.properties` object contains the action's user inputs. If the action does not require any inputs, pass an empty object:
   ```json
   "body": {
      "properties": {}
   }
   ```

## Local setup, debugging and security validation

- [Debugging webhooks locally](./local-debugging-webhook.md)
- [Validating webhook signatures](./signature-verification.md)

## Examples

For guides and examples of self-service actions using a webhook as the backend, check out the [**guides section**](/guides?tags=Webhook).

