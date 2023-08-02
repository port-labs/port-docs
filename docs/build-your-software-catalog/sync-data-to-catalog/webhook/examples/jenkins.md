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

Create the following webhook configuration [using Port UI](../../?operation=ui#configuring-webhook-endpoints)

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
