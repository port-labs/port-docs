import ExampleImageBlueprint from "../\_ci_example_image_blueprint.mdx";
import ExampleCiJobBlueprint from "../\_ci_example_ci_job_blueprint.mdx";

# Examples

## Basic create/update example

In this example we create blueprints for `ciJob` and `image`, and a relation between them. Using Port's GitHub action we will create new entities every time the GitHub workflow runs:

<ExampleImageBlueprint />

<ExampleCiJobBlueprint />

After creating the blueprints, you can add the following snippet to your GitHub workflow `yml` file to create the `ciJob` entity in your GitHub workflow:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: new-cijob-run
    icon: GithubActions
    blueprint: ciJob
    properties: |
      {
        "commitHash": "${{ env.GITHUB_SHA }}",
        "jobBranch": "${{ env.GITHUB_SERVER_URL }}/${{ env.GITHUB_REPOSITORY }}/tree/${{ env.GITHUB_REF_NAME }}",
        "runLink": "${{ env.GITHUB_SERVER_URL }}/${{ env.GITHUB_REPOSITORY }}/actions/runs/${{ env.GITHUB_RUN_ID }}",
        "triggeredBy": "${{ env.GITHUB_ACTOR }}"
      }
```

:::tip
For security reasons it is recommended to save the `CLIENT_ID` and `CLIENT_SECRET` as [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), and access them as shown in the example above.
:::

## Basic get example

The following example gets the `ciJob` entity from the previous example. This can be useful if your CI process needs to reference data from the ciJob (for example, the user who triggered the last job) when deploying the latest version of your service.

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
        identifier: new-cijob-run
        blueprint: ciJob

use-entity:
  runs-on: ubuntu-latest
  needs: get-entity
  steps:
    - run: echo '${{needs.get-entity.outputs.entity}}' | jq .properties.triggeredBy
```

The first job `get-entity`, uses the GitHub action to get the `new-cijob-run` entity.
The second job `use-entity`, uses the output from the first job, and prints the `triggeredBy` property of the entity.

## Relation example

The following example adds a `image` entity, in addition to the `ciJob` entity shown in the previous example. The `image` entity represents a byproduct of the ciJob run.

Add the following snippet to your GitHub workflow `yml` file:

```yaml showLineNumbers
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: example-image
    title: Example Image
    icon: Docker
    blueprint: image
    properties: |
      {
        "version": "v1",
        "committedBy": "${{ github.actor }}",
        "commitHash": "${{ github.sha }}",
        "actionJob": "${{ github.job }}",
        "repoPushedAt": "${{ github.event.repository.pushed_at}}",
        "runLink": "${{ format('{0}/actions/runs/{1}', github.event.repository.html_url, github.run_id) }}"
      }
```

All that is left is to update the `ciJob` entity of his new `image` relation, which in turn will document which image was created by the ciJob.

```yaml
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: new-cijob-run
    icon: GithubActions
    blueprint: ciJob
    relations: |
      {
        "image": ["example-image"]
      }
```

That's it! The entities are updated and visible in the UI.
