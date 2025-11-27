Important notes:

- The workflow must reside in the repository's `.github/workflows/` directory.

- The workflow must use the [workflow_dispatch](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/manually-running-a-workflow) trigger.  
  For example, see the workflow implementation in [this guide](/guides/all/manage-pull-requests#guide).

### Specify a branch

By default, the integration will look for the workflow in the `main` branch of the repository.  

To use a different branch, simply pass the `ref` key in the `Configure the invocation payload` section (or `invocationMethod.workflowInputs` in the JSON object) with the desired branch name as the value:

```json
{
  "ref": "my-branch-name"
}
```

:::info Workflow file must exist in the default branch
Due to [GitHub's behavior](https://github.com/github/docs/issues/31007), to trigger a workflow that uses the `workflow_dispatch` event from a non-default branch using the `ref` key, the same workflow file must exist in the **default branch**.

TIP: If you prefer not to include the full workflow file in the **default branch**, placing a workflow file with the **same name** is enough for the correct workflow in the non-branch to run successfully.
:::