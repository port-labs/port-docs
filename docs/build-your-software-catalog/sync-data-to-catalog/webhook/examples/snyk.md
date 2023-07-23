---
sidebar_position: 9
description: Ingest Snyk vulnerabilities into your catalog
---

import SnykBlueprint from "./resources/snyk/\_example_snyk_vulnerability_blueprint.mdx";
import SnykConfiguration from "./resources/snyk/\_example_snyk_vulnerability_webhook_configuration.mdx";

# Snyk

In this example you are going to create a webhook integration between [Snyk](https://snyk.io/) and Port, which will ingest Snyk code and infrastructure vulnerability entities into Port.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Snyk vulnerability blueprint</summary>

<SnykBlueprint/>

</details>

Create the following webhook configuration [using Port UI](../../?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Snyk vulnerability webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Snyk Mapper`;
   2. Identifier : `snyk_mapper`;
   3. Description : `A webhook configuration to map Snyk vulnerability to Port`;
   4. Icon : `Snyk`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SnykConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:
   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `X-Hub-Signature`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Signature Prefix : `sha256=`
   5. Click **Save** at the bottom of the page.

Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in Snyk.

</details>

## Create a webhook in Snyk

1. Go to [Snyk](https://snyk.io/) and select an account you want to configure the webhook for;
2. Click on **Settings** at the left of the page and copy your organization ID under the **Organization ID** section;
3. Navigate to your [Snyk accounts page](https://snyk.io/account/) and copy your API token. You will use this value to authorize the REST API;
4. Open any REST API client such as POSTMAN and make the following API call to create your webhook:
   1. `API URL` - use https://api.snyk.io/v1/org/<YOUR_ORG_ID>/webhooks;
   2. `Method` - select POST
   3. `Authorization` - The API token should be supplied in an Authorization header as `Authorization: token YOUR_API_KEY`;
   4. `Request Body` - The body of your request should be in a JSON format. Past the following information in the body text
   ```json
   {
     "url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>",
     "secret": "WEBHOOK_SECRET"
   }
   ```
5. Click **Send** to create your Snyk webhook;

:::note
You can also create the Snyk webhook using the `curl` command below:

```curl showLineNumbers
curl -X POST \
     -H "Authorization: token YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>", "secret": "WEBHOOK_SECRET"}' \
     https://api.snyk.io/v1/org/<YOUR_ORG_ID>/webhooks
```

:::

Done! Any vulnerability detected on your source code will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
