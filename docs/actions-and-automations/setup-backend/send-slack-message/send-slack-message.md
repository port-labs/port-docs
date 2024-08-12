# Send Slack message

The `Send Slack message` backend type allows you to send a message to a Slack channel, using a webhook URL.  
This can be useful when you want to notify certain users/teams about a specific event that occurred in your software catalog.

## Define the backend

This backend type requires a Slack webhook URL.  
To create a webhook in Slack, see the [Slack documentation](https://api.slack.com/messaging/webhooks).

Once you have the webhook URL, simply paste it into the `Webhook URL` field in the backend definition:

<img src='/img/self-service-actions/setup-backend/slack-message/slackUiExample.png' width='80%' border='1px' />

### Message

The message to be sent is defined under the `Message` section (see image above).

The message uses Slack's `mrkdwn` formatting, information and examples can be found in the [Slack documentation](https://api.slack.com/reference/surfaces/formatting).

### Using trigger data in the message

Just like other backend types, you can access available trigger data using `jq`, by wrapping the expression with `{{ . }}`.
:::info Trigger data structure reminder
See the data available to you when writing your message:
- [Trigger data structure for Self-service actions](/actions-and-automations/create-self-service-experiences/setup-the-backend/#trigger-data).
- [Trigger data structure for Automations](/actions-and-automations/define-automations/setup-action#trigger-data).
:::

For example, to include the run id of the action that sent the message, you can add the following text to your message:

```bash
This message was sent via an action run with the following id: {{ .run.id }}.
```