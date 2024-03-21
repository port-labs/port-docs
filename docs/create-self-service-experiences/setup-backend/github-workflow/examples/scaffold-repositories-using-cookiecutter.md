---
sidebar_position: 2
---

# Scaffold Repositories Using Cookiecutter

[This GitHub action](https://github.com/port-labs/cookiecutter-gha) allows you to quickly scaffold repositories using any selected [Cookiecutter Template](https://www.cookiecutter.io/templates) via Port Actions.

In addition, as cookiecutter is an open-source project you can make your own project template, learn more about it [here](https://cookiecutter.readthedocs.io/en/2.0.2/tutorials.html#create-your-very-own-cookiecutter-project-template).

## Example - scaffolding golang template

Follow these steps to get started with the Golang template:

1. Create the following GitHub action secrets:

   1. `ORG_TOKEN` - a [fine-grained PAT](https://github.com/settings/tokens?type=beta) with permissions to create repositories.
   2. `PORT_CLIENT_ID` - Port Client ID [learn more](../../../../build-your-software-catalog/custom-integration/api/#get-api-token).
   3. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](../../../../build-your-software-catalog/custom-integration/api/#get-api-token).

2. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).

3. Create a Port blueprint with the following properties:

:::note
Keep in mind this can be any blueprint you would like and this is just an example.
:::

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string"
      },
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

4. Create Port action using the following JSON definition:

:::note
Keep in mind that any input that starts with `cookiecutter_` will automatically be injected into the cookiecutter action as a variable. He we are using the `cookiecutter_app_name` input of the [Golang Template](https://github.com/lacion/cookiecutter-golang).
:::

```json showLineNumbers
[
  {
    "identifier": "scaffold",
    "title": "Scaffold Golang Microservice",
    "icon": "Go",
    "userInputs": {
      "properties": {
        "name": {
          "title": "Repo Name",
          "type": "string"
        },
        "cookiecutter_app_name": {
          "type": "string",
          "title": "Application Name"
        }
      },
      "required": ["name"]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "port-cookiecutter-example",
      "repo": "gha-templater",
      "workflow": "scaffold-golang.yml",
      "omitUserInputs": true
    },
    "trigger": "CREATE",
    "description": "Scaffold a new Microservice from a Cookiecutter teplate"
  }
]
```

5. Create a workflow file under `.github/workflows/scaffold-golang.yml` with the following content:

```yml showLineNumbers
on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string
    secrets:
      ORG_TOKEN:
        required: true
      PORT_CLIENT_ID:
        required: true
      PORT_CLIENT_SECRET:
        required: true
jobs:
  scaffold:
    runs-on: ubuntu-latest
    steps:
      - uses: port-labs/cookiecutter-gha@v1.1
        with:
          portClientId: ${{ secrets.PORT_CLIENT_ID }}
          portClientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          token: ${{ secrets.ORG_TOKEN }}
          portRunId: ${{ fromJson(inputs.port_payload).context.runId }}
          repositoryName: ${{ fromJson(inputs.port_payload).payload.properties.name }}
          portUserInputs: ${{ fromJson(inputs.port_payload).payload.properties }}
          cookiecutterTemplate: https://github.com/lacion/cookiecutter-golang
          blueprintIdentifier: "microservice"
          organizationName: INSERT_ORG_NAME
```

6. Trigger the action from Port's UI.

![gif](../../../../../static/img/self-service-actions/ScaffoldGolang.gif)

## Next steps

- [Connect Port's GitHub exporter](../../../../build-your-software-catalog/sync-data-to-catalog/git/github/github.md)
  to make sure all of the properties (like URL, readme etc..) are automatically ingested from GitHub.
  - You can learn how to setup Port's GitHub exporter [here](../../../../build-your-software-catalog/sync-data-to-catalog/git/github/github.md#ingesting-git-objects).
  - You can see example configurations and use cases [here](../../../../build-your-software-catalog/sync-data-to-catalog/git/github/examples/examples.md).
