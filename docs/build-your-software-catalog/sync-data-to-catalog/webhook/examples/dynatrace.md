---
sidebar_position: 8
description: Ingest Dynatrace problems into your catalog
---

import DynatraceProblemBlueprint from "./resources/dynatrace/\_example_dynatrace_problem_blueprint.mdx";
import DynatraceProblemConfiguration from "./resources/dynatrace/\_example_dynatrace_problem_webhook_configuration.mdx"
import DynatraceMicroserviceBlueprint from "./resources/dynatrace/\_example_dynatrace_microservice_blueprint.mdx"

# Dynatrace

In this example you are going to create a webhook integration between [Dynatrace](https://www.dynatrace.com/) and Port, which will ingest problem entities to Port and map them to your microservice entities.

## Port configuration

Create the following blueprint definitions:

<details>
<summary>Dynatrace microservice blueprint</summary>
<DynatraceMicroserviceBlueprint/>
</details>

<details>
<summary>Dynatrace problem blueprint</summary>
<DynatraceProblemBlueprint/>
</details>

Create the following webhook configuration [using Port UI](../../?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Dynatrace problem webhook configuration</summary>

1. **Basic details** tab - fill the following details:

   1. Title : `Dynatrace Problem Mapper`;
   2. Identifier : `dynatrace_problem_mapper`;
   3. Description : `A webhook configuration for problem events from Dynatrace`;
   4. Icon : `Dynatrace`;

2. **Integration configuration** tab - fill the following JQ mapping:

   <DynatraceProblemConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

:::note
The webhook configuration's relation mapping will function properly only when the identifiers of the Port microservice entities match the names of the entities in your Dynatrace.

If there is a mismatch, you can utilize [Dynatrace Tags](https://www.dynatrace.com/support/help/manage/tags-and-metadata) to align the actual identifier in Port.

To do this, create a tag with the key proj and value <microservice_identifier>.

Then, update the relation JQ syntax to establish a connection between the Dynatrace problem and the Port microservice. Here is the updated JQ Mappings:

```json showLineNumbers
{
    "blueprint": "dynatraceProblem",
    "entity": {
     ...Properties mappings
      "relations": {
         "microservice": ".body.ProblemTags | split(\", \") | map(select(test(\"proj:\")) | sub(\"proj:\";\"\"))"
      }
    }
}
```

<details>
<summary>JQ expression explained</summary>
The above JQ expression will split the tags by comma and space, then filter the tags that start with `proj:` and remove the `proj:` prefix from the tag value.
</details>
:::

## Create a webhook in Dynatrace

1. Log in to Dynatrace with your credentials;
2. Click on **Settings** at the left sidebar of the page;
3. Choose **Integration** and click on **Problem notifications**;
4. Select **Add notification**;
5. Select **Custom integration** from the available intregration types;
6. Input the following details:
   1. `Display name` - use a meaningful name such as Port Webhook;
   2. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Overview` - you can add an optional HTTP header to your webhook request;
   4. `Custom payload` - When a problem is detected or resolved on your entity, this payload will be sent to the webhook URL. You can enter this JSON placeholder in the textbox;
      ```json showLineNumbers
      {
         "State":"{State}",
         "PID":"{PID}",
         "ProblemTitle":"{ProblemTitle}",
         "ImpactedEntity": "{ImpactedEntity}",
         "ProblemDetailsText": "{ProblemDetailsText}",
         "ProblemImpact": "{ProblemImpact}",
         "ProblemSeverity": "{ProblemSeverity}",
         "ProblemURL": "{ProblemURL}",
         "ProblemTags": "{Tags}",
         "ImpactedEntities": {ImpactedEntities}
      }
      ```
   5. `Alerting profile` - configure your preferred alerting rule or use the default one;
7. Click **Save changes** at the bottom of the page;

:::tip
In order to view the different payloads and events available in Dynatrace webhooks, [look here](https://www.dynatrace.com/support/help/observe-and-explore/notifications-and-alerting/problem-notifications/webhook-integration)
:::

Done! any problem detected on your Dynatrace entity will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.
