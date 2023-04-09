---
sidebar_position: 2
---

# Scaffold Repositories Using Cookiecutter

[This GitHub action](https://github.com/port-labs/cookiecutter-gha) allows you to quickly scaffold repositories using any selected [Cookiecutter Template](https://www.cookiecutter.io/templates) via Port Actions.

In addition, as cookiecutter is an open source project you can make your own project template, learn more about it [here](https://cookiecutter.readthedocs.io/en/2.0.2/tutorials.html#create-your-very-own-cookiecutter-project-template)

## Example - scaffolding golang template

Follow these steps to get started with the Golang template:

1. Create the following GitHub action secrets
* `ORG_TOKEN` - a PAT (Personal Access Token) with permissions to create repositories
* `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token) 

2. Install the Ports GitHub app from [here](https://github.com/apps/getport-io/installations/new).
3. Create a blueprint at Port with the following properties:
>**Note** Keep in mind this can be any blueprint you would like and this is just an example
```json
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

4. Create an action at Port with the following JSON file:
>**Note** Keep in mind that any field started with `cookiecutter` will automtically be injected into the cookiecutter inputs as a variable here for example we  are using the `cookiecutter_app_name` input of the [Golang Template](https://github.com/lacion/cookiecutter-golang)


```json
[
  {
    "identifier": "scaffold",
    "title": "Scaffold Golang Microservice",
    "icon": "Git",
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
      "required": [
        "name"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "port-cookiecutter-example",
      "repo": "gha-templater",
      "workflow": "scaffold-golang.yml",
      "omitUserInputs": true
    },
    "trigger": "CREATE",
    "description": "Scaffolding a new Microservice from a set of templates using Cookiecutter"
  }
]
```
5. Create a workflow file under .github/workflows/scaffold-golang.yml with the following content:
```yml
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
      - uses: port-labs/cookiecutter-gha@v1
        with:
          portClientId: ${{ secrets.PORT_CLIENT_ID }}
          portClientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          token: ${{ secrets.ORG_TOKEN }}
          portRunId: ${{ fromJson(inputs.port_payload).context.runId }}
          repositoryName: ${{ fromJson(inputs.port_payload).payload.properties.name }}
          portUserInputs: ${{ toJson(fromJson(inputs.port_payload).payload.properties) }} 
          cookiecutterTemplate: https://github.com/lacion/cookiecutter-golang
          blueprintIdentifier: 'microservice'
          organizationName: INSERT_ORG_NAME
```
6. Trigger the action from Port's UI.
![gif](https://user-images.githubusercontent.com/51213812/230777057-081adf0c-f792-447e-bdec-35c99d73ba02.gif)

## Next steps 
- [Connecting Port's GitHub exporter](.././../../build-your-software-catalog/sync-data-to-catalog/git/github/examples#mapping-repositories-and-issues)
To make sure all of the properties (like url, readme etc..) come directly from Github in a seamless way, you can connect our GitHub exporter next [here](https://docs.getport.io/) you can find more information about it.
