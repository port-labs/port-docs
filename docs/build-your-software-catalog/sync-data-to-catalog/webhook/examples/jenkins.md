---
sidebar_position: 7
description: Ingest Jenkins build and job events into your catalog
---

import JenkinsBuildBlueprint from './resources/jenkins/\_example_jenkins_build_blueprint.mdx'
import JenkinsBuildWebhookConfig from './resources/jenkins/\_example_jenkins_build_webhook_configuration.mdx'
import JenkinsJobBlueprint from './resources/jenkins/\_example_jenkins_job_blueprint.mdx'
import JenkinsJobWebhookConfig from './resources/jenkins/\_example_jenkins_job_webhook_configuration.mdx'

# Jenkins

In this example you are going to create a webhook integration between [Jenkins](https://www.jenkins.io/) and Port, which will ingest job and build entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Jenkins job blueprint</summary>

<JenkinsJobBlueprint/>

</details>

<details>

<summary>Jenkins build blueprint (including the jenkinsJob relation)</summary>
<JenkinsBuildBlueprint/>

</details>

<details>

<summary>Jenkins job and build webhook configuration</summary>
<JenkinsBuildWebhookConfig/>

</details>

## Create the Jenkins webhook

1. Go to your Jenkins dashboard;
2. At the sidebar on the left side of the page select **Manage Jenkins** and click on **Manage Plugins**;
3. Navigate to the **Available Plugins** tab and search for **Generic Event** in the search bar. Install the [Generic Event](https://plugins.jenkins.io/generic-event/) or a suitable plugin that can notify some endpoints about all events that happen in Jenkins;
4. Go back to your Jenkins dashboard and click on **Manage Jenkins** at the left side menu;
5. Click on the **Configure System** tab and scroll down to the **Event Dispatcher** section;
6. Enter the value of the `url` key you received after creating the webhook configuration in the textbox;
7. Click on **Save** at the buttom of the page;

:::tip
In order to view the different payloads and events available in Jenkins webhooks, [look here](https://plugins.jenkins.io/generic-event/)
:::

Done! any changes to a job or build process (queued, started, completed, finalized etc.) will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

In this section, we'll explore the webhook event data that is sent from Jenkins whenever a job is created. We'll also delve into how the entity is finally created in Port by using the webhook configuration.

### Payload

The **Generic Event** plugin tracks two main objects: `item` and `run`. Below is an example of the payload structure sent to the webhook URL after a Jenkins item (job) is created:

<details>
<summary>Jenkins job payload</summary>

```json showLineNumbers
{
  "data": {
    "_class": "hudson.model.FreeStyleProject",
    "actions": [
      {},
      {},
      {
        "_class": "org.jenkinsci.plugins.displayurlapi.actions.JobDisplayAction"
      },
      {
        "_class": "com.cloudbees.plugins.credentials.ViewCredentialsAction"
      }
    ],
    "description": "None",
    "displayName": "Port Webhook Test Project",
    "displayNameOrNull": "None",
    "fullDisplayName": "Port Webhook Test Project",
    "fullName": "Port Webhook Test Project",
    "name": "Port Webhook Test Project",
    "buildable": true,
    "builds": [],
    "color": "notbuilt",
    "firstBuild": "None",
    "healthReport": [],
    "inQueue": false,
    "keepDependencies": false,
    "lastBuild": "None",
    "lastCompletedBuild": "None",
    "lastFailedBuild": "None",
    "lastStableBuild": "None",
    "lastSuccessfulBuild": "None",
    "lastUnstableBuild": "None",
    "lastUnsuccessfulBuild": "None",
    "nextBuildNumber": 1,
    "property": [],
    "queueItem": "None",
    "concurrentBuild": false,
    "disabled": false,
    "downstreamProjects": [],
    "labelExpression": "None",
    "scm": {
      "_class": "hudson.scm.NullSCM"
    },
    "upstreamProjects": []
  },
  "dataType": "hudson.model.FreeStyleProject",
  "id": "25185f88-92bc-499c-bfd1-5f17a297ce3a",
  "source": "",
  "time": "2023-06-14T16:14:37.915+0000",
  "type": "item.created",
  "url": "job/Port%20Webhook%20Test%20Project/"
}
```

</details>

After the Jenkins job is created, the event dispatcher will track and report the `run` (build) stages from initiated, started, completed to finalized. Below is a sample payload sent to the webhook URL after the build is complete.

<details>

<summary>Jenkins build payload </summary>

```json showLineNumbers
{
  "data": {
    "_class": "hudson.model.FreeStyleBuild",
    "actions": [
      {
        "_class": "hudson.model.CauseAction",
        "causes": [
          {
            "_class": "hudson.model.Cause$UserIdCause",
            "shortDescription": "Started by user Username",
            "userId": "admin",
            "userName": "Name"
          }
        ]
      },
      {},
      {
        "_class": "org.jenkinsci.plugins.displayurlapi.actions.RunDisplayAction"
      }
    ],
    "artifacts": [],
    "building": false,
    "description": "None",
    "displayName": "#1",
    "duration": 5774,
    "estimatedDuration": 5774,
    "executor": {},
    "fullDisplayName": "Port Webhook Test Project #1",
    "id": "1",
    "inProgress": true,
    "keepLog": false,
    "number": 1,
    "queueId": 9,
    "result": "SUCCESS",
    "timestamp": 1686759877596,
    "builtOn": "",
    "changeSet": {
      "_class": "hudson.scm.EmptyChangeLogSet",
      "items": [],
      "kind": "None"
    },
    "culprits": []
  },
  "dataType": "hudson.model.FreeStyleBuild",
  "id": "806dd823-f59b-4549-ae91-735d17127745",
  "source": "job/Port%20Webhook%20Test%20Project/",
  "time": "2023-06-14T16:24:43.433+0000",
  "type": "run.completed",
  "url": "job/Port%20Webhook%20Test%20Project/1/"
}
```

</details>

### Mapping Result

Using the mappings defined in the webhook configuration, Port will extract the necessary properties from the Jenkins webhook payload and use the resulting data to create the job and build entities. Here is an example of the job mappings JSON data:

```json showLineNumbers
{
  "identifier": "job-Port-Webhook-Test-Project",
  "title": "Port Webhook Test Project",
  "blueprint": "jenkinsJob",
  "properties": {
    "jobName": "Port Webhook Test Project",
    "url": "job/Port%20Webhook%20Test%20Project/",
    "jobStatus": "created",
    "timestamp": "2023-06-14T16:40:16.957Z"
  },
  "relations": {}
}
```

Additionally, the Jenkins build entity will be created using the below mapping data:

```json showLineNumbers
{
  "identifier": "Port-Webhook-Test-Project-1",
  "title": "#1",
  "blueprint": "jenkinsBuild",
  "properties": {
    "buildUrl": "job/Port%20Webhook%20Test%20Project/1/",
    "buildDuration": 5774,
    "timestamp": "2023-06-14T16:40:00.783Z",
    "buildStatus": "SUCCESS"
  },
  "relations": {
    "jenkinsJob": ["job-Port-Webhook-Test-Project"]
  }
}
```
