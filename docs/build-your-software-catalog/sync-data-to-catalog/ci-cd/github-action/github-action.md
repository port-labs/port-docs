---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# GitHub Action

Our [GitHub action](https://github.com/marketplace/actions/port-github-action) allows you to interact with entities in Port directly from your GitHub workflows.

:::tip public repository
Our GitHub action is open source - see it [**here**](https://github.com/port-labs/port-github-action)
:::

## Use cases

Port's GitHub action provides a native way to integrate Port with your GitHub workflows, for example:

- Create new entities of existing blueprints;
- Update existing entities with new information (title, properties, relations, etc...).
- Get existing entities.

## Installation

To install Port's GitHub action you will need to add the following line as a step in your GitHub workflow:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
```

## Usage

:::note Prerequisites

- In order to authenticate with Port when using the GitHub action, you will need to provide a `CLIENT_ID` and `CLIENT_SECRET`.
- In order to make use of the GitHub action, you will need an existing blueprint(s) in your Port installation.
  - Moreover, if you want to update related entities, you will also need existing relations in your Port installation.

:::

When using Port's GitHub action you provide it with a desired method, and information to either use when creating/updating an entity, or when retrieving an existing entity and exposing it to your CI.

Port's GitHub action supports the following methods:

- Create/Update
- Get

<Tabs groupId="usage" defaultValue="upsert" values={[
{label: "Create/Update", value: "upsert"},
{label: "Get", value: "get"}
]}>

<TabItem value="upsert">

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: myEntity
    icon: myIcon
    blueprint: myBlueprint
    properties: |
      {
        "myStringProp": "My value",
        "myNumberProp": 1,
        "myBooleanProp": true,
        "myArrayProp": ["myVal1", "myVal2"],
        "myObjectProp": {"myKey": "myVal", "myExtraKey": "myExtraVal"}
      }
```

</TabItem>
<TabItem value="get">

```yaml showLineNumbers
get-entity:
  runs-on: ubuntu-latest
  outputs:
    entity: ${{ steps.port-github-action.outputs.entity }}
  steps:
    - id: port-github-action
      uses: port-labs/port-github-action@v1
      with:
        clientId: ${{ secrets.CLIENT_ID }}
        clientSecret: ${{ secrets.CLIENT_SECRET }}
        operation: GET
        identifier: myEntity
        blueprint: myBlueprint
use-entity:
  runs-on: ubuntu-latest
  needs: get-entity
  steps:
    - run: echo '${{needs.get-entity.outputs.entity}}' | jq .properties.myProp
```

</TabItem>
</Tabs>
