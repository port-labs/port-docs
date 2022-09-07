---
sidebar_position: 2
---

# Action

Our GitHub Action allows you to create/update entities in Port, straight from your GitHub Workflows.

Here you'll find a step-by-step guide for Port's GitHub Action.

## What does our GitHub Action give you?

- Create new entities of existing blueprints and relations.
- Update existing entities with new information (title, properties, relations, etc...).

## Usage

:::note Prerequisites

- In order to authenticate with Port when using the Github Action, you will need a `CLIENT_ID` and `CLIENT_SECRET` which need to be provided when using the action.
- In order to make use of the GitHub Action, you will need an existing blueprint(s) in your Port installation.
  - Moreover, if you want to update related entities, you will also need existing relations in your Port installation.

:::

### Basic Example

In this example we create a basic Blueprint and then add code that uses Port's Github Action to create/update an entity that belongs to the blueprint:

<details>
<summary> Example microservice blueprint </summary>

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
  "formulaProperties": {}
}
```

</details>

After creating the blueprint, you can add the to your workflow `yml` file to make use of the Github Action:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
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
For security reasons it is recommend saving the `CLIENT_ID` and `CLIENT_SECRET` as [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) and accessing them like in the example above.

:::

### Complete Example

The following example adds another `package` blueprint, in addition to the `microservice` blueprint shown in the previous example. In addition, it adds a `package-microservice` relation and then the Github Action creates or updates the relation between existing entities:

<details>
<summary> A package blueprint </summary>

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
    "package-microservice": {
      "target": "microservice",
      "title": "Used In",
      "required": false
    }
  },
  "formulaProperties": {}
}
```

</details>

Add the following to your workflow `yml` file:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
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
        "package-microservice": "example-microservice"
      }
```

That's it! The entity is created or updated, and is visible in the UI.

![Entity](../../../static/img/integrations/github-action/CreatedEntity.png)

For more information, checkout the [public repository](https://github.com/port-labs/port-github-action).
