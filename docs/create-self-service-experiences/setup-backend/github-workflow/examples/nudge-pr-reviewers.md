---
sidebar_position: 4
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Nudge Pull Request Reviewers

In the following guide, we are going to create a self-service action in Port that executes a GitHub workflow to nudge PR reviewers with a kind message.

:::tip Usecases
- **Faster Merges**: Remind reviewers of open PRs to reduce delays.
- **Better Code**: Encourage timely reviews for quicker feedback.
- **Smoother Workflow**: Prevent bottlenecks that hinder development progress.
:::

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. A repository to contain your action resources i.e. the github workflow file.
3. Set up a slack app:
    - Go to your [slack apps page](https://api.slack.com/apps).
    - Create a new app or use an existing one.
    - Enable Incoming Webhooks and create a new webhook.
    - Choose the target Slack channel for notifications.
    - Copy the generated webhook URL for use as the `SLACK_WEBHOOK_URL`.
4. Create the following GitHub Action secrets:
    - Create the following Port credentials:
        - `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#get-api-token).
        - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#get-api-token).
    - `SLACK_WEBHOOK_URL` - the webhook URL you obtained from slack.


## Port configuration

1. To create the Port action, go to the [self-service page](https://app.getport.io/self-serve):
    - Click on the `+ New Action` button.
    - Choose the `Pull Request` blueprint and click `Next`.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.
    - Click `Save`

<details>

  <summary>Port Action: Nudge Pull Request Reviewers</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "nudge_reviewers",
  "title": "Nudge Reviewers",
  "userInputs": {
    "properties": {},
    "required": []
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "nudge-pr-reviewers.yml",
    "omitUserInputs": true,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Remind reviewers about PR",
  "requiredApproval": false
}
```

</details>


<img src='/img/self-service-actions/setup-backend/github-workflow/nudgePRBlueprint.png' width='45%' border="1px" />
<img src='/img/self-service-actions/setup-backend/github-workflow/nudgePRDefn.png' width='45%' border="1px" />

## GitHub workflow

Create a workflow file under `.github/workflows/nudge-pr-reviewers.yml` with the following content:

:::tip
We recommend creating a dedicated repository for the workflows that are used by Port actions.
:::

<details>

<summary>GitHub workflow script</summary>

:::tip Using Block Kit to design the message layout
Whereas you can simply send a message with the *text* field, the [block kit framework](https://api.slack.com/block-kit) provides a rich pool of components and layouts to design your message and allows you to add interactivity. Try it out [here](https://app.slack.com/block-kit-builder/) to compose your own blocks. You can then replace the `blocks` field in the request below.
:::

```yaml showLineNumbers title="nudge-pr-reviewers.yml"
name: Nudge Pull Request Reviewers

on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string

jobs:
  manage-pr:
    runs-on: ubuntu-latest

    steps:
      - name: Extract Repository and PR Number
        id: extract_info
        run: |
          link="${{ fromJson(inputs.port_payload).payload.entity.properties.link }}"
          repo_info=$(echo "$link" | sed 's|https://github.com/||' | awk -F'/' '{print $1 "/" $2}')
          pr_number=$(echo "$link" | awk -F'/' '{print $NF}')

          echo "REPO_INFO=$repo_info" >> $GITHUB_ENV
          echo "PR_NUMBER=$pr_number" >> $GITHUB_ENV

      - name: Get GitHub Pull Request Reviewers
        id: get_reviewers
        uses: LiamPerson/get-reviews-action@v1.1.2
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPOSITORY: ${{ env.REPO_INFO }}
          PULL_REQUEST_ID: ${{ env.PR_NUMBER }}

      - name: Send Slack Notification
        env:
          PR_TITLE: ${{ fromJson(inputs.port_payload).payload.entity.title }}
        run: |
          reviews_json="${{ steps.get_reviewers.outputs.reviews_file_path }}"
          reviewers=$(jq -r '.[].user.login' $reviews_json | sort -u)

          pr_title="${{ fromJson(inputs.port_payload).payload.entity.title }}"
          
          echo "Reviewers: $reviewers"
          
          pr_link="https://github.com/${{ env.REPO_INFO }}/pull/${{ env.PR_NUMBER }}"
          
          # Construct Block Kit message
          message_payload=$(cat <<EOF
          {
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Reminder: Pending Pull Request Review*\nThis PR needs your attention!"
                }
              },
              {
                "type": "section",
                "fields": [
                  {
                    "type": "mrkdwn",
                    "text": "*PR:* <$pr_link|$pr_title>" 
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*Reviewers:*\n$reviewers" 
                  }
                ]
              },
              {
                "type": "actions",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Review PR",
                      "emoji": true
                    },
                    "url": "$pr_link" 
                  }
                ]
              }
            ]
          }
          EOF
          )
          
          curl -X POST -H 'Content-type: application/json' --data "$message_payload" ${{ secrets.SLACK_WEBHOOK_URL }}
          
      - name: Notify Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          baseUrl: https://api.getport.io
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
            GitHub Action completed! Sent slack message to PR reviewers for PR https://github.com/${{ env.REPO_INFO }}/pull/${{ env.PR_NUMBER }} ✅
```

</details>

## Let's test it!

Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.


<img src='/img/self-service-actions/setup-backend/github-workflow/nudgeSlack.png' width='85%' border="1px" />

<br />
<br />

Done! 🎉 You can now send a reminder to PR reviewers.