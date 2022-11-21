---
sidebar_position: 2
---

# GitHub Action

Our GitHub action allows you to interact with Entities in Port directly from your GitHub workflows.

Here you'll find a step-by-step guide for Port's GitHub action.

## GitHub Action Benefits​

- Create new Entities of existing Blueprints and Relations;
- Update existing Entities with new information (title, properties, relations, etc...).
- Get existing Entities.

## Usage

:::note Prerequisites

- In order to authenticate with Port when using the GitHub action, you will need to provide a `CLIENT_ID` and `CLIENT_SECRET`.
- In order to make use of the GitHub action, you will need an existing Blueprint(s) in your Port installation.
  - Moreover, if you want to update related Entities, you will also need existing Relations in your Port installation.

:::

### Basic Upsert Example

In this example we create a basic Blueprint and then add code that uses Port's GitHub action to create/update an Entity that belongs to the Blueprint:

<details>
<summary> Example microservice Blueprint </summary>

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description"
      },
      "buildNumber": {
        "type": "number",
        "title": "Build Number"
      },
      "isActive": {
        "type": "boolean",
        "title": "Is Active"
      },
      "languages": {
        "type": "array",
        "title": "Languages"
      },
      "versionInEnv": {
        "type": "object",
        "title": "Version In Env"
      }
    },
    "required": ["description"]
  },
  "formulaProperties": {},
  "calculationProperties": {}
}
```

</details>

After creating the Blueprint, you can add the following to your workflow `yml` file to make use of the GitHub action:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: example-microservice
    blueprint: microservice
    properties: |
      {
        "description": "example microservice",
        "buildNumber": 1,
        "isActive": true,
        "languages": ["TypeScript", "Shell"],
        "versionInEnv": {"prod": "v1.0.0", "staging": "v1.0.1"}
      }
```

:::tip
For security reasons it is recommended to save the `CLIENT_ID` and `CLIENT_SECRET` as [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), and access them as shown in the example above.

:::

### Basic Get Example

The following example gets the `example-microservice` entity from the previous example.

Add the following jobs to your workflow `yml` file:

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
        identifier: example-microservice
        blueprint: microservice
use-entity:
  runs-on: ubuntu-latest
  needs: get-entity
  steps:
    - run: echo '${{needs.get-entity.outputs.entity}}' | jq .properties.versionInEnv.prod
```

The first job `get-entity`, uses the GitHub action to get the `example-microservice` entity.
The second job `use-entity`, uses the output from the first job, and prints `versionInEnv.prod` property of the entity.

### Complete Example

The following example adds another `package` Blueprint, in addition to the `microservice` Blueprint shown in the previous example. In addition, it also adds a `microservice` Relation. The GitHub action will create or update the Relation between the 2 existing Entities:

<details>
<summary> A package Blueprint (including the `microservice` Relation) </summary>

```json showLineNumbers
{
  "identifier": "package",
  "title": "Package",
  "icon": "Package",
  "schema": {
    "properties": {
      "version": {
        "type": "string",
        "title": "Version"
      },
      "committedBy": {
        "type": "string",
        "title": "Committed By"
      },
      "commitHash": {
        "type": "string",
        "title": "Commit Hash"
      },
      "actionJob": {
        "type": "string",
        "title": "Action Job"
      },
      "repoPushedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Repository Pushed At"
      },
      "runLink": {
        "type": "string",
        "format": "url",
        "title": "Action Run Link"
      }
    },
    "required": []
  },
  "relations": {
    "microservice": {
      "title": "Used In",
      "target": "microservice",
      "required": false,
      "many": false
    }
  },
  "formulaProperties": {}
  "calculationProperties": {},
}
```

</details>

Add the following to your workflow `yml` file:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: example-package
    title: Example Package
    blueprint: package
    properties: |
      {
        "version": "v1",
        "committedBy": "${{ github.actor }}",
        "commitHash": "${{ github.sha }}",
        "actionJob": "${{ github.job }}",
        "repoPushedAt": "${{ github.event.repository.pushed_at}}",
        "runLink": "${{ format('{0}/actions/runs/{1}', github.event.repository.html_url, github.run_id) }}"
      }
    relations: |
      {
        "microservice": "example-microservice"
      }
```

That's it! The Entity is created or updated and is visible in the UI.

![Entity](../../static/img/integrations/github-action/CreatedEntity.png)

For more information, checkout the [public repository](https://github.com/port-labs/port-github-action).
