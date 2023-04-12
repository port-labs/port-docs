---
sidebar_position: 7
description: Ingest Jenkins build and job events into your catalog
---

import JenkinsBuildBlueprint from './resources/jenkins/\_example_jenkins_build_blueprint.mdx'
import JenkinsBuildWebhookConfig from './resources/jenkins/\_example_jenkins_build_webhook_configuration.mdx'

# Jenkins

In this example you are going to create a webhook integration between [Jenkins](https://www.jenkins.io/) and Port, which will ingest build entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Build blueprint</summary>

<JenkinsBuildBlueprint/>

</details>

<details>
<summary>Build webhook configuration</summary>

<JenkinsBuildWebhookConfig/>

</details>

## Create the Jenkins webhook

1. Go to your Jenkins dashboard;
2. At the sidebar on the left side of the page select **Manage Jenkins** and click on **Manage Plugins**;
3. Navigate to the **Available Plugins** tab and search for **Notifications** in the search bar. Install the [Extreme Notification Plugin](https://plugins.jenkins.io/notification/) or a suitable plugin that can notify some endpoints about events that occur in Jenkins;
4. Go back to your Jenkins dashboard and select your desired project;
5. Click on the **Configure** tab and scroll down to the **Job Notifications** section;
6. Click on **Add Endpoint** and input the following details:
   1. `Format` - choose JSON;
   2. `Protocol` - choose HTTP;
   3. `Event` - Be sure to choose the appropriate event you want to catalog. Or you can use the default value which notifies your webhook with **All Events**;
   4. `URL` - Choose **Plain Text** and enter the value of the `url` key you received after creating the webhook configuration;
7. Scroll down to the **Build Triggers** section and select your preferred trigger type;
8. Click on **Save** at the buttom of the page;

Done! any changes to a build process (queued, started, completed, finalized etc.) will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
