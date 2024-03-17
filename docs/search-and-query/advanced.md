---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Advanced

### Search route query parameters

The search route also supports several query parameters that affect the returned output:

| Parameter                       | Description                                                                                                                                                                                                                                                                                                                             | Available values | Default value |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- |
| `attach_title_to_relation`      | `true`: Both the identifier and the title of the related Entity will appear under the Relation key <br></br><br></br> `false`: Only the identifier of the related Entity will appear under the Relation key                                                                                                                             | `true`/`false`   | `false`       |
| `exclude_calculated_properties` | Should [mirror properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property) and [calculation properties](//build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/calculation-property.md) be returned with the result | `true`/`false`   | `false`       |

#### `attach_title_to_relation` example

Here are examples outputs based on the value of the `attach_title_to_relation` parameter:

<Tabs groupId="attach-title" defaultValue="true" values={[
{label: "True", value: "true"},
{label: "False", value: "false"},
]}>

<TabItem value="true">

Here is a search response with `attach_title_to_relation=true`:

```json showLineNumbers
{
  "ok": true,
  "matchingBlueprints": [
    "region",
    "deployment",
    "vm",
    "microservice",
    "k8sCluster",
    "permission",
    "runningService"
  ],
  "entities": [
    {
      "identifier": "e_vb9EPyW1zOamcbT1",
      "title": "cart-deployment",
      "blueprint": "deployment",
      "team": ["Team BE"],
      "properties": {
        "version": "1.4",
        "user": "yonatan",
        "status": "failed",
        "github-action-url": "https://a.com",
        "Region": "AWS"
      },
      // highlight-start
      "relations": {
        "microservice": {
          "identifier": "e_47MwTvQj03MpVyBx",
          "title": "admin-test"
        }
      },
      // highlight-end
      "createdAt": "2022-07-27T17:11:04.344Z",
      "createdBy": "auth0|6278b02000955c006f9132d3",
      "updatedAt": "2022-07-27T17:11:04.344Z",
      "updatedBy": "auth0|6278b02000955c006f9132d3"
    }
  ]
}
```

</TabItem>

<TabItem value="false">

Here is the same search response with `attach_title_to_relation=false`:

```json showLineNumbers
{
  "ok": true,
  "matchingBlueprints": [
    "region",
    "deployment",
    "vm",
    "microservice",
    "k8sCluster",
    "permission",
    "runningService"
  ],
  "entities": [
    {
      "identifier": "e_vb9EPyW1zOamcbT1",
      "title": "cart-deployment",
      "blueprint": "deployment",
      "team": ["Team BE"],
      "properties": {
        "version": "1.4",
        "user": "yonatan",
        "status": "failed",
        "github-action-url": "https://a.com",
        "Region": "AWS"
      },
      // highlight-start
      "relations": {
        "microservice": "e_47MwTvQj03MpVyBx"
      },
      // highlight-end
      "createdAt": "2022-07-27T17:11:04.344Z",
      "createdBy": "auth0|6278b02000955c006f9132d3",
      "updatedAt": "2022-07-27T17:11:04.344Z",
      "updatedBy": "auth0|6278b02000955c006f9132d3"
    }
  ]
}
```

</TabItem>

</Tabs>
