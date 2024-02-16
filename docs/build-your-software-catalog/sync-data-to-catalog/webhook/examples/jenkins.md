---
sidebar_position: 6
description: Ingest Jenkins build and job events into your catalog
---

import JenkinsBuildBlueprint from './resources/jenkins/\_example_jenkins_build_blueprint.mdx'
import JenkinsBuildWebhookConfig from './resources/jenkins/\_example_jenkins_build_webhook_configuration.mdx'
import JenkinsJobBlueprint from './resources/jenkins/\_example_jenkins_job_blueprint.mdx'
import JenkinsJobWebhookConfig from './resources/jenkins/\_example_jenkins_job_webhook_configuration.mdx'

# Jenkins

In this example you are going to create a webhook integration between [Jenkins](https://www.jenkins.io/) and Port, which will ingest job and build entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Jenkins job blueprint</summary>

<JenkinsJobBlueprint/>

</details>

<details>

<summary>Jenkins build blueprint (including the Jenkins job relation)</summary>
<JenkinsBuildBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Jenkins job and build webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Jenkins Mapper`;
   2. Identifier : `jenkins_mapper`;
   3. Description : `A webhook configuration to map Jenkins builds and jobs to Port`;
   4. Icon : `Jenkins`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <JenkinsBuildWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Jenkins

1. Go to your Jenkins dashboard;
2. At the sidebar on the left side of the page select **Manage Jenkins** and click on **Manage Plugins**;
3. Navigate to the **Available Plugins** tab and search for **Generic Event** in the search bar. Install the [Generic Event](https://plugins.jenkins.io/generic-event/) or a suitable plugin that can notify some endpoints about all events that happen in Jenkins;
4. Go back to your Jenkins dashboard and click on **Manage Jenkins** at the left side menu;
5. Click on the **Configure System** tab and scroll down to the **Event Dispatcher** section;
6. Enter the value of the `url` key you received after creating the webhook configuration in the textbox;
7. Click on **Save** at the buttom of the page;

:::tip
In order to view the different payloads and events available in Jenkins webhooks, [click here](https://plugins.jenkins.io/generic-event/)
:::

Done! any changes to a job or build process (queued, started, completed, finalized etc.) will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample response data from Jenkins. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Jenkins:

<details>
<summary>Job response data</summary>
  
```json showLineNumbers
{
  "_class" : "hudson.model.FreeStyleProject",
  "displayName" : "Hello Job",
  "fullName" : "Hello Job",
  "name" : "Hello Job",
  "url" : "http://localhost:8080/job/Hello%20Job/",
  "buildable" : true,
  "builds" : [
    {
      "_class" : "hudson.model.FreeStyleBuild",
      "displayName" : "#2",
      "duration" : 221,
      "fullDisplayName" : "Hello Job #2",
      "id" : "2",
      "number" : 2,
      "result" : "SUCCESS",
      "timestamp" : 1700569094576,
      "url" : "http://localhost:8080/job/Hello%20Job/2/"
    },
    {
      "_class" : "hudson.model.FreeStyleBuild",
      "displayName" : "#1",
      "duration" : 2214,
      "fullDisplayName" : "Hello Job #1",
      "id" : "1",
      "number" : 1,
      "result" : "SUCCESS",
      "timestamp" : 1700567994163,
      "url" : "http://localhost:8080/job/Hello%20Job/1/"
    }
  ],
  "color" : "blue"
}
```

</details>

<details>
<summary>Build response data</summary>
  
```json showLineNumbers
{
  "_class" : "hudson.model.FreeStyleBuild",
  "displayName" : "#2",
  "duration" : 221,
  "fullDisplayName" : "Hello Job #2",
  "id" : "2",
  "number" : 2,
  "result" : "SUCCESS",
  "timestamp" : 1700569094576,
  "url" : "http://localhost:8080/job/Hello%20Job/2/"
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Job entity</summary>
  
```json showLineNumbers
{
  "identifier": "hello-job",
  "title": "Hello Job",
  "blueprint": "jenkinsJob",
  "properties": {
    "jobName": "Hello Job",
    "url": "http://localhost:8080/job/Hello%20Job/",
    "jobStatus": "passing",
    "timestamp": "2023-09-08T14:58:14Z"
  },
  "relations": {},
  "createdAt": "2023-12-18T08:37:21.637Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-18T08:37:21.637Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary>Build entity</summary>
  
```json showLineNumbers
{
  "identifier": "hello-job-2",
  "title": "Hello Job #2",
  "blueprint": "jenkinsBuild",
  "properties": {
    "buildStatus": "SUCCESS",
    "buildUrl": "http://localhost:8080/job/Hello%20Job/2/",
    "buildDuration": 221,
    "timestamp": "2023-09-08T14:58:14Z"
  },
  "relations": {
    "parentJob": "hello-job"
  },
  "createdAt": "2023-12-18T08:37:21.637Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-18T08:37:21.637Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>
