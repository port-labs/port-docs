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

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- You will need a Git repository in which you can place a workflow/pipeline that we will use in this guide. If you don't have one, we recommend creating a new repository named `Port-actions`.
:::

<br/>

### The goal of this guide

In this guide we will create a self-service action that sends a Slack reminder for uncompleted [scorecard rules](https://docs.getport.io/promote-scorecards/#what-is-a-scorecard). In reality, such an action can be used by R&D managers / Platform engineers to remind developers of unmet standards.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be notified about policies set by the platform engineer that need to be fixed.
- R&D managers & Platform engineers will be able to remind developers about unmet requirements in the services.

<br/>

### Setup the action's frontend

Let's start by creating the action's frontend. This is the part that will be used by developers to trigger the action:

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "GitLab", value: "gitlab"}
]}>

<TabItem value="github" label="Github">

:::tip Onboarding

As part of the onboarding process, you should already have an action named `Send scorecard reminder` in your [self-service tab](https://app.getport.io/self-serve). In that case, you can skip to the [Define action type](#define-backend-type) step.  

If you **skipped** the onboarding, or you want to create the action from scratch, complete steps 1-4 below.

:::

<details>
<summary><b>Create the action's frontend (steps 1-4)</b></summary>

1. To get started, head to the [Self-service tab](https://app.getport.io/self-serve) in your Port application, and click on `New action`:

<img src='/img/guides/actionsCreateNew.png' width='50%' />

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Since we are sending a reminder for a service, we will use the `Service` blueprint we created in the [quickstart guide](/quickstart) from the dropdown.

3. Fill in the basic details of the action like this, then click `Next`:

<img src='/img/guides/actionReminderBasicDetails.png' width='60%' />

4. Click `Next` again, since we won't need inputs from the user in this action.

</details>

#### Define backend type

Now we'll define the backend of the action:
  
  - Choose `Github workflow` as the invocation type.
  - Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
  - Name the workflow `port-slack-reminder.yml`.
  - Fill out the rest of the form like this, then click `Next`:

<img src='/img/guides/slackReminderBackend.png' width='70%' />

<br/><br/>

The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

</TabItem>

<TabItem value="gitlab" label="GitLab">

:::tip Onboarding

As part of the onboarding process, you should already have an action named `Send scorecard reminder` in your [self-service tab](https://app.getport.io/self-serve). In that case, you can skip to the [Define action type](#define-backend-type) step.  

If you **skipped** the onboarding, or you want to create the action from scratch, complete steps 1-4 below.

:::

<details>
<summary><b>Create the action's frontend (steps 1-4)</b></summary>

1. To get started, head to the [Self-service tab](https://app.getport.io/self-serve) in your Port application, and click on `New action`:

<img src='/img/guides/actionsCreateNew.png' width='50%' />

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Since we are sending a reminder for a service, we will use the `Service` blueprint we created in the [quickstart guide](/quickstart) from the dropdown.

3. Fill in the basic details of the action like this, then click `Next`:

<img src='/img/guides/actionReminderBasicDetails.png' width='60%' />

4. Click `Next` again, since we won't need inputs from the user in this action.

</details>

Now we'll define the backend of the action:

  - Choose `Trigger Webhook URL` as the `Invocation type`.
  - Leave `Endpoint URL` blank for now, we will create it in the next section and come back to update it.
  - Fill the rest of the form out like this, then click `Next`:

<img src='/img/guides/slackReminderBackendGitLab.png' width='70%' />

<br/><br/>

The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

</TabItem>

</Tabs>

The action's frontend is now ready 🥳

<br/>

### Setup the action's backend

Now we want to write the logic that our action will trigger:

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "GitLab", value: "gitlab"}
]}>

<TabItem value="github" label="Github">

1. First, let's create the necessary token and secrets:

   - Go to your desired Slack channel and [setup incoming webhooks](https://api.slack.com/messaging/webhooks). Make sure you copy the webhook URL, we will use it in the Github workflow.

   - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In the repository where your workflow will reside, create 3 new secrets under `Settings -> Secrets and variables -> Actions`:

- `SLACK_WEBHOOK_URL` - the Slack Webhook URL of the destination channel.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecretSlack.png' width='80%' />

<br/><br/>

3. Now let's create the workflow file that contains our logic. Under `.github/workflows`, create a new file named `port-slack-reminder.yml` and use the following snippet as its content:

<details>
<summary><b>Github workflow (click to expand)</b></summary>

```yaml showLineNumbers
# port-slack-reminder.yml

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

:::tip Port Initiatives sender Github action
This workflow uses Port's [Initiatives Sender GitHub Action](https://github.com/marketplace/actions/port-sender) to send a Slack message.
:::

</TabItem>

<TabItem value="gitlab" label="GitLab">

1. First, let's create the required webhooks and variables:

  - Go to your desired Slack channel and [setup incoming webhooks](https://api.slack.com/messaging/webhooks). Make sure you copy the webhook URL, we will use it in the Github workflow.
  
  - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In the GitLab project where your pipeline will reside, create 3 new variables under `Settings->CI/CD->Variables`:

- `SLACK_WEBHOOK_URL` - the Slack Webhook URL of the destination channel.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecretSlackGitLab.png' width='75%' />

3. Create a webhook in GitLab for triggering your GitLab:
  - Create a [pipeline trigger token](https://docs.gitlab.com/ee/ci/triggers);
  - Construct the [pipeline trigger webhook URL](https://docs.gitlab.com/ee/ci/triggers/#use-a-webhook) with your project details.
  - Back in Port, edit your action and in its `backend` step paste the webhook URL in the `Endpoint URL` field.

4. Now let's create the pipeline file that contains our logic. In your GitLab project create a new file named `gitlab-ci.yaml` and use the following snippet as its content:

<details>
<summary><b>GitLab pipeline (click to expand)</b></summary>

```yaml showLineNumbers
image: python:3.10.0-alpine

stages:
  - fetch-port-access-token
  - send_reminders
  - post-run-logs
  - update-run-status

fetch-port-access-token: # Example - get the Port API access token and RunId
  stage: fetch-port-access-token
  except:
    - pushes
  before_script:
    - apk update
    - apk add jq curl -q
  script:
    - |
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')
      echo "RUN_ID=$runId" >> data.env
  artifacts:
    reports:
      dotenv: data.env

generate-scorecards-reminders:
  stage: send_reminders
  image: docker:24.0.7
  services:
    - docker:24.0.7-dind
  script:
    - image_name="ghcr.io/port-labs/port-sender:$VERSION"
    - echo "Generate Scorecards Reminders"
    - |
      docker run -i --rm --platform="linux/arm64/v8" \
      -e INPUT_PORT_CLIENT_ID=$PORT_CLIENT_ID \
      -e INPUT_PORT_CLIENT_SECRET=$PORT_CLIENT_SECRET \
      -e INPUT_SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
      -e INPUT_OPERATION_KIND="scorecard_reminder" \
      -e INPUT_BLUEPRINT="service" \
      -e INPUT_SCORECARD="ProductionReadiness" \
      -e INPUT_TARGET_KIND="slack" \
      $image_name
    - echo "Report status to Port"

post-run-logs:
  stage: post-run-logs
  except:
    - pushes
  image: curlimages/curl:latest
  script:
    - |
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message": "Slack reminder sent successfully 🚀"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
update-run-status:
  stage: update-run-status
  except:
    - pushes
  image: curlimages/curl:latest
  script:
    - |
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"status":"SUCCESS", "message": {"run_status": "Created Merge Request for '"$bucket_name"' successfully! Merge Request URL: '"$MR_URL"'"}}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID"
    
variables:
  PORT_CLIENT_ID: $PORT_CLIENT_ID
  PORT_CLIENT_SECRET: $PORT_CLIENT_SECRET
  SLACK_WEBHOOK_URL: $SLACK_WEBHOOK_URL
  VERSION: "0.2.3"

```

</details>

</TabItem>

</Tabs>

<br/>

All done! The action is ready to be used 🚀

<br/>

### Execute the action

After creating an action, it will appear under the `Self-service` tab of your Port application:

<img src='/img/guides/selfServiceAfterReminderCreation.png' width='75%' />

1. Click on `Create` to begin executing the action.

2. Click `Execute`. A small popup will appear, click on `View details`:

<img src='/img/guides/executionDetails.png' width='45%' />

<br/><br/>

3. This page provides details about the action run. As you can see, the backend returned `Success` and the repo was successfully created:

<img src='/img/guides/runStatusReminder.png' width='90%' />

:::tip Logging action progress
💡 Note the `Log stream` at the bottom, this can be used to report progress, results and errors. Click [here](https://docs.getport.io/create-self-service-experiences/reflect-action-progress/) to learn more.
:::

<br/>

4. You can now enter your Slack channel and view the scorecard reminder:
<img src='/img/guides/slackReminderExample.png' width='50%' />


Congratulations! You can now send send Slack reminders easily from Port 💪🏽

### Conclusion
Creating scorecards is the first step in setting standards in our development lifecycle. However, to ensure these standards are met, we need to turn rule violations into action items. By automating Slack reminders and the creation of Jira tasks, we can drive change across the entire organization using familiar tools to combine it natively within our delievery lifecycle.

### More Examples
- [Open/Close JIRA issues based on scorecards](/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Send a scorecard report on Slack](/promote-scorecards/manage-using-3rd-party-apps/slack#slack-scorecard-report-example)
