## Limitations

### Input limit

A GitHub workflow can have **up to 10** input parameters. Note this when defining your payloads.  
If you need more than 10 inputs, you can use a JSON object as a single parameter.

### Workflow chains

A workflow triggered using the `workflow_dispatch` trigger is self-contained. This means its actions and effects over the repository cannot trigger other automatic workflows.  

For example, take the following scenario:

1. A developer executes a "Create a new microservice in a monorepo" workflow.
2. The workflow opens a new pull request in the target repository based on a pre-defined template.
3. The repository also has a workflow which is automatically triggered using the `on: pull_request: types: "opened"` trigger.
4. In this instance, the automatic PR workflow **will not** be triggered.

