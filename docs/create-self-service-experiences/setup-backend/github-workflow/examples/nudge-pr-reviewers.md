---
sidebar_position: 4
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Nudge Pull Request Reviewers

In the following guide, we are going to create a self-service action in Port that executes a GitHub workflow to nudge PR reviewers with a kind message.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. This guide assumes the presence of a blueprint representing your repositories and pull requests. If you haven't done so yet, initiate the setup of your GitHub data model by referring to this [guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/examples/#mapping-repositories-file-contents-and-pull-requests)) first.
3. A repository to contain your action resources i.e. the github workflow file.


## Guide

Follow these steps to get started:

1. Head to your [Slack apps](https://api.slack.com/apps) page and create a new app (or select one of your existing apps). Next, navigate to the Incoming Webhooks page and create a new webhook. This webhook will determine which channel on your server receives messages sent through the Slack webhook. Copy the webhook URL for later use.

2. Create the following GitHub Action secrets:
    - Create the following Port credentials:
        - `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#get-api-token).
        - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#get-api-token).
    - `SLACK_WEBHOOK_URL` - the webhook URL you obtained from slack.

<br />

3. Create a Port action in the [self-service page](https://app.getport.io/self-serve) or with the following JSON definition:

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


<img src='/img/self-service-actions/setup-backend/github-workflow/nudgePRBlueprint.png' width='45%' />
<img src='/img/self-service-actions/setup-backend/github-workflow/nudgePRDefn.png' width='45%' />

<br />
<br />

4. Create a workflow file under `.github/workflows/nudge-pr-reviewers.yml` with the following content:

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
<br />

5. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.


<img src='/img/self-service-actions/setup-backend/github-workflow/nudgeSlack.png' width='85%' />

<br />
<br />

Done! 🎉 You can now send a reminder to PR reviewers.