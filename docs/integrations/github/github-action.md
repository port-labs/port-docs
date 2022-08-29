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

In order to make use of the GitHub Action, you will need an existing blueprint(s) in your Port installation.

Moreover, if you want to update related entities, you will also need existing relations in your Port installation.

:::


### Basic Example

<details>
<summary> A microservice blueprint </summary>
In this example, you can see how a microservice blueprint is defined.

#### Microservice blueprint

```json showLineNumbers
{
    "identifier": "microservice",
    "title": "Microservice",
    "icon": "Github",
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
:::
</details>

Add the following to your workflow `yml` file:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    identifier: reporting
    title: Reporting
    blueprint: microservice
    properties: |
      {
        "description": "reporting service",
        "buildNumber": 1,
        "isActive": true,
        "languages": ["TypeScript", "Shell"],
        "versionInEnv": {"prod": "v1.0.0", "staging": "v1.0.1"}
      }
```

:::note

`CLIENT_ID` and `CLIENT_SECRET` are required. We recommend to save it as [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) like in the example.

:::

### Complete Example

<details>
<summary> A package blueprint </summary>
In this example, you can see how a package blueprint is defined.

#### Package blueprint

```json showLineNumbers
{
    "identifier": "Package",
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
    "formulaProperties": {}
}
```
</details>

<details>
<summary> A package-microservice relation </summary>
In this example, you can see how a package-microservice relation is defined.

#### Relation package-microservice

```json showLineNumbers
{
    "title": "Used In",
    "identifier": "package-microservice",
    "source": "Package",
    "target": "Microservice",
    "required": false,
    "many": false
}
```
:::
</details>

Add the following to your workflow `yml` file:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    identifier: example-package
    title: Example Package
    blueprint: Package
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
        "package-microservice": "reporting"
      }
```


That's it! The entity is created or updated, and is visible in the UI.

![Entity](../../../static/img/integrations/github-action/CreatedEntity.png)

For more information, checkout the [public repository](https://github.com/port-labs/port-github-action).
