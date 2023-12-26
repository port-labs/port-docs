---
sidebar_position: 7
title: Send Slack reminders for scorecards
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Slack reminders for scorecards

This guide takes 7 minutes to complete, and aims to demonstrate:
* How to initiate changes in the organization using scorecards
* How to automate Slack reminders using Port's self service actions

:::tip Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/quickstart).
- You will need a Github repository in which you can place a workflow that we will use in this guide. If you don't have one, we recommend [creating a new repository](https://docs.github.com/en/get-started/quickstart/create-a-repo) named `Port-actions`.
:::


### The goal of this guide

In this guide we will create an action that sends a Slack reminder using Github workflows. In reality, such an action can be used by R&D managers / Platform engineers to remind developers of unmet standards.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be notified about policies set by the platform engineer that need to be fixed.
- R&D managers & Platform engineers will be able to remind developers about unmet requirements in the services.

### Setup the action's frontend

1. To get started, head to the [Self-service tab](https://app.getport.io/self-serve) in your Port application, and click on `New action`:

<img src='/img/guides/actionsCreateNew.png' width='50%' />

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Since we are sending a reminder for a service, we will use the `Service` blueprint we created in the [quickstart guide](/quickstart) from the dropdown.

3. Fill in the basic details of the action like this, then click `Next`:

<img src='/img/guides/actionReminderBasicDetails.png' width='60%' />

4. Click `Next` again, since we won't need inputs from the user in this action.

5. Now we'll define the backend of the action. Port supports multiple invocation types, for this tutorial we will use a `Github workflow`.
   - Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
   - Name the workflow `portSlackReminder.yaml`.
   - Fill out the rest of the form like this, then click `Next`:

<img src='/img/guides/slackReminderBackend.png' width=' %' />

1. The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

The action's frontend is now ready 🥳

### Setup the action's backend

Now we want to write the logic that our action will trigger.

1. First, let's create the necessary token and secrets:

   - Go to your desired Slack channel and [setup incoming webhooks](https://api.slack.com/messaging/webhooks). Make sure you copy the webhook URL, we will use it in the Github workflow.

   - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In the repository where your workflow will reside, create 3 new secrets under `Settings -> Secrets and variables -> Actions`:

- `SLACK_WEBHOOK_URL` - the Slack Webhook URL of the destination channel.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecretSlack.png' width='80%' />

3. Now let's create the workflow file that contains our logic. Under `.github/workflows`, create a new file named `portSlackReminder.yaml` and use the following snippet as its content:

<details>
<summary><b>Github workflow (click to expand)</b></summary>

```yaml showLineNumbers
# portSlackReminder.yaml

name: Generate Scorecards Reminders
on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        type: string
jobs:
    generate-scorecards-reminders:
        runs-on: ubuntu-latest
        steps:
            - name: Generate Scorecards Reminders
              uses: port-labs/port-sender@v0.2.3
              with:
                operation_kind: scorecard_reminder
                port_client_id: ${{ secrets.PORT_CLIENT_ID }}
                port_client_secret: ${{ secrets.PORT_CLIENT_SECRET }}
                slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
                blueprint: service
                scorecard: ProductionReadiness
                target_kind: slack
            - name: Report status to Port
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_payload).context.runId }}
                logMessage: |
                    Slack reminder sent successfully 🚀
```

</details>

:::tip Port Initiatives
This workflow uses Port's [Initiatives Sender GitHub Action](https://github.com/marketplace/actions/port-sender) to send a Slack message.
:::

<br/>

All done! The action is ready to be used 🚀

### Execute the action

After creating an action, it will appear under the `Self-service` tab of your Port application:

<img src='/img/guides/selfServiceAfterReminderCreation.png' width='75%' />

1. Click on `Create` to begin executing the action.

2. Click `Execute`. A small popup will appear, click on `View details`:

<img src='/img/guides/executionDetails.png' width='45%' />

3. This page provides details about the action run. As you can see, the backend returned `Success` and the repo was successfully created:

<img src='/img/guides/runStatusReminder.png' width='90%' />

:::tip Logging action progress
💡 Note the `Log stream` at the bottom, this can be used to report progress, results and errors. Click [here](https://docs.getport.io/create-self-service-experiences/reflect-action-progress/) to learn more.
:::

4. You can now enter your Slack channel and view the scorecard reminder:
<img src='/img/guides/slackReminderExample.png' width='50%' />


Congratulations! You can now send send Slack reminders easily from Port 💪🏽

### Conclusion
Creating scorecards is the first step in setting standards in our development lifecycle. However, to make sure these standards are met, we need to ensure the scorecards gaps are becoming a live action item by using Slack reminders, or creating Jira tasks. By doing that you can easily drive change, across the entire organization.

### More Examples
- [Open/Close JIRA issues based on scorecards](/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Send a scorecard report on Slack](/promote-scorecards/manage-using-3rd-party-apps/slack#slack-scorecard-report-example)
