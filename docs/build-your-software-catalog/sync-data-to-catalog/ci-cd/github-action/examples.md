# Examples

## Basic create/update example

In this example we create a blueprint for `microserviceBuild` and then add code that uses Port's GitHub action to create a new entity every time the GitHub workflow that creates a new build runs:

<details>
<summary> Example microserviceBuild blueprint </summary>

```json showLineNumbers
{
  "identifier": "microserviceBuild",
  "title": "Microservice Build",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "buildNumber": {
        "type": "number",
        "title": "Build Number"
      },
      "buildVersion": {
        "type": "string",
        "title": "Build Version"
      },
      "imageTag": {
        "type": "string",
        "title": "Image Tag"
      }
    },
    "required": []
  },
  "calculationProperties": {}
}
```

</details>

After creating the blueprint, you can add the following snippet to your GitHub workflow `yml` file to create the new build entity in your GitHub workflow:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: new-ms-build
    icon: GithubActions
    blueprint: microserviceBuild
    properties: |
      {
        "buildNumber": 1,
        "buildVersion": "1.1.0",
        "imageTag": "new-ms-build:latest"
      }
```

:::tip
For security reasons it is recommended to save the `CLIENT_ID` and `CLIENT_SECRET` as [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), and access them as shown in the example above.
:::

## Basic get example

The following example gets the `new-ms-build` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of it's data (for example, the image tag when deploying the latest version of your service).

Add the following jobs to your GitHub workflow `yml` file:

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
        identifier: new-ms-build
        blueprint: microserviceBuild
use-entity:
  runs-on: ubuntu-latest
  needs: get-entity
  steps:
    - run: echo '${{needs.get-entity.outputs.entity}}' | jq .properties.imageTag
```

The first job `get-entity`, uses the GitHub action to get the `new-ms-build` entity.
The second job `use-entity`, uses the output from the first job, and prints the `imageTag` property of the entity.

## Complete example

The following example adds another `package` blueprint, in addition to the `microserviceBuild` blueprint shown in the previous example. In addition, it also adds a `microserviceBuild` relation. The GitHub action will create or update the relation between the 2 existing entities, allowing you to map the package to the microservice build that uses it:

<details>
<summary> A package blueprint (including the `microserviceBuild` relation) </summary>

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
    "microserviceBuild": {
      "title": "Used In",
      "target": "microserviceBuild",
      "required": false,
      "many": false
    }
  },
  "calculationProperties": {}
}
```

</details>

Add the following snippet to your GitHub workflow `yml` file:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: example-package
    title: Example Package
    icon: GithubActions
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
        "microserviceBuild": "new-ms-build"
      }
```

That's it! The entity is created or updated and is visible in the UI.
