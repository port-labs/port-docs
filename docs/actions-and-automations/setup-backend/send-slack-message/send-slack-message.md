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

:::tip Slack Block Kit Builder
You can use the [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/T0206G5RTJQ#%7B%22blocks%22:%5B%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22%5CnHello%20from%20Port%20:slightly_smiling_face:%5Cn%5Cn:white_circle:%20%20%20Read%20more%20about%20Slack%20wehooks%20%3Chttps://api.slack.com/messaging/webhooks%7Chere.%3E%5Cn%5Cn:white_circle:%20%20%20Read%20more%20about%20formating%20your%20message%20%3Chttps://api.slack.com/reference/surfaces/formatting%7Chere.%3E%5Cn%5CnThis%20message%20was%20triggered%20by%20%7B%7B%20.trigger.by.user.email%20%7D%7D%22%7D%7D%5D%7D) to create and preview your message before sending it.  
Note that this will require you to log in to your Slack workspace.
:::

### Using trigger data in the message

Just like other backend types, you can access available trigger data using `jq`. , by wrapping the expression with `{{ . }}`.
:::info Trigger data structure reminder
See the data available to you when writing your message:
- [Trigger data structure for Self-service actions](/actions-and-automations/create-self-service-experiences/setup-the-backend/#trigger-data).
- [Trigger data structure for Automations](/actions-and-automations/define-automations/setup-action#trigger-data).
:::

For example, to include the run id of the action that sent the message, you can add the following text to your message:

```bash
This message was sent via an action run with the following id: {{ .run.id }}.
```