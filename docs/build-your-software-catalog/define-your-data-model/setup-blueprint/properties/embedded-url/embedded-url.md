import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Embedded URL

The `embedded URL` property is used to embed and display a webpage within an <PortTooltip id="entity">entity</PortTooltip> in Port.  
Using this property will automatically create an additional tab in each [entity page](/customize-pages-dashboards-and-plugins/page/entity-page.md), displaying the embedded content.

In the following example, we see the `Shipping` entity page, which is an instance on the `Domain` blueprint.  
The blueprint has an `embedded URL` property named `Architecture`, which is automatically displayed in a dedicated tab:

<img src='/img/software-catalog/blueprint/embeddedUrlExample.png' width='85%' />

## URL type

Port supports the following URL types:

- **Public link** - A link to a public webpage, which does not require authentication.
- **Private link** - A link to a webpage that is protected by SSO authentication. To use this type, you'll need to provide the required parameters, see the [authentication](./authentication) section for more information and examples.

## 💡 Common embedded URL usage

- Display a service's architecture
- Display & track a service's Datadog dashboard
- Display charts and diagrams from external tools

## Schema definition

<Tabs groupId="definition" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "myEmbeddedUrl": {
    "title": "My Embedded URL",
    // highlight-start
    "type": "string",
    "format": "url",
    "spec": "embedded-url",
    // highlight-end
    "description": "embedded-url Prop",
    // specAuthentication is needed only when using a protected/private URL
    "specAuthentication": {
        "authorizationUrl": "https://app.com",
        "tokenUrl": "https://app.com",
        "clientId": "1234",
        "authorizationScope": [
          "api://xxxx-xxxx-xxxx-xxxx-xxxx/user.read"
        ]
      }

  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myEmbeddedUrl"
    title      = "My Embedded URL"
    required   = false
    type       = "string"
    format     = "url"
    spec       = "embedded-url"
  }
  # highlight-end
}
```

</TabItem>

</Tabs>

## Examples

### Datadog dashboard

In this example we are embedding a [Datadog](https://docs.datadoghq.com/dashboards/sharing/) dashboard in order to get application metrics directly inside Port.

Add the `embedded-URL` property to a Blueprint:

<details>
<summary>Blueprint property definition</summary>

```json showLineNumbers
{
  "datadog": {
    "title": "Datadog",
    "type": "string",
    "format": "url",
    "spec": "embedded-url"
  }
}
```

</details>

Create or edit an Entity of the Blueprint you added the `Datadog` property to, and specify the URL to the Datadog dashboard:

![Datadog Entity edit example](/img/software-catalog/widgets/editEntityDatadog.png)

Now go to the specific entity page of your Entity and the Datadog dashboard will be visible in a dedicated tab:

![Datadog dashboard example](/img/software-catalog/widgets/datadog.png)

### New Relic Chart

In this example we are embedding a CPU usage [New Relic Chart](https://one.eu.newrelic.com/) to get infrastructure metrics directly inside Port.

Add the `embedded-URL` property to a Blueprint:

<details>
<summary>Blueprint property definition</summary>

```json showLineNumbers
{
  "cpuUsage": {
    "type": "string",
    "title": "CPU usage",
    "spec": "embedded-url",
    "format": "url"
  }
}
```

</details>
Go to new relic and extract the chart URL of a specific chart

![New Relic get embed URL](/img/software-catalog/widgets/GetEmbedUrlNewRelic.png)

Create or edit an Entity of the Blueprint you added the `cpuUsage` property to, and specify the URL to the CPU Usage chart:

![New Relic Entity edit example](/img/software-catalog/widgets/editEntityNewRelic.png)

Now go to the specific entity page of your Entity and the CPU Usage chart will be visible in a dedicated tab:

![New Relic dashboard example](/img/software-catalog/widgets/new-relic.png)
