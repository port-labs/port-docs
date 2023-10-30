---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Create cloud resources using IaC

This guide takes 8 minutes to complete, and aims to demonstrate:

- A complete flow to create a resource using IaC.
- The simplicity of communicating with Port from a self-service action backend.

:::tip Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/quickstart).

- You will need a Github repository in which you can place a workflow that we will use in this guide. If you don't have one, we recommend [creating a new repository](https://docs.github.com/en/get-started/quickstart/create-a-repo) named `Port-actions`.

- You will need to have [Port's Github app](https://github.com/apps/getport-io) installed in your Github organization (the one that contains the repository you'll work with).

:::

### The goal of this guide

In this guide we will open a pull-request in our Github repository from within Port to create a new cloud resource using gitops.

After completing it, you will get a sense of how your organization's daily routine could look like:

- Platform engineers will be able to define powerful actions that developers can use within controlled permission boundaries.
- Developers will be able to easily create and track cloud resources from Port.

### Add a URL to your new resource's definition

In this guide we will add a new property to our `service` blueprint, which we can use to access our cloud resource definitions.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model).
2. Click on your `service` blueprint, then click on `New property`.
3. Choose `URL` as the type, fill it like this and click `Save`:

<img src='/img/guides/iacPropertyForm.png' width='40%' />

This property is empty for now in all services, we will fill it as part of the action we're about to create 😎

### Setup the action's frontend

1. Head to the [Self-service tab](https://app.getport.io/self-serve) in your Port application, and click on `+ New action`.

2. Each action in Port is directly tied to a blueprint. Our action creates a resource that is associated with a service and will be provisioned as part of the service's CD process.  
   Choose `Service` from the dropdown list.

3. This action does not create/delete entites, but rather performs an operation on an existing entity. Therefore, we will choose `Day-2` as the action type.  
   Fill out the form like this and click `Next`:

<img src='/img/guides/iacActionDetails.png' width='50%' />

<br/><br/>

4. We want the developer who uses this action to specify simple inputs and not be overwhelmed with all the configurations available for an S3 bucket. For this action, we will define a name and a public/private visibility.  
   Click on `+ New input`, fill out the form like this and click `Create`:

<img src='/img/guides/iacActionInputName.png' width='50%' />

<br/><br/>

5. Now let's create the visibility input, which will later serve as the `acl` of our resource.  
   Click on `+ New input`, fill out the form like this and click `Create`:

<img src='/img/guides/iacActionInputVisibility.png' width='50%' />

<br/><br/>

6. Now we'll define the backend of the action. Port supports multiple invocation types, for this tutorial we will use a `Github workflow`.
   - Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
   - Name the workflow `portCreateBucket.yaml`.
   - Fill out the rest of the form like this, then click `Next`:

<img src='/img/guides/iacActionBackend.png' width='75%' />

<br/><br/>

6. The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

The action's frontend is now ready 🥳

### Setup the action's backend

Now we want to write the logic that our action will trigger.

1. First, let's create the necessary token and secrets. If you've already completed the [scaffold a new service guide](/guides-and-tutorials/scaffold-a-new-service), you should already have these configured and you can skip this step.

- Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our workflow).

  <img src='/img/guides/personalAccessToken.png' width='80%' />

  - Go to your [Port application](https://app.getport.io/), hover over the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In the repository where your workflow will reside, create 3 new secrets under `Settings->Secrets and variables->Actions`:

- `ORG_ADMIN_TOKEN` - the personal access token you created in the previous step.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecret.png' width='60%' />

<br/><br/>

3. We will now create a simple `.tf` file that will serve as a template for our new resource:

- In your Github repository, create a file named `cloudResource.tf` under `/templates/` (it's path should be `/templates/cloudResource.tf`).
- Copy the following snippet and paste it in the file's contents:

<details>
<summary><b>cloudResource.tf (click to expand)</b></summary>

```hcl
# cloudResource.tf

resource "aws_s3_bucket" "example" {
provider = aws.bucket_region
name = "{{ bucket_name }}"
acl = "{{ bucket_acl }}"
}
```

</details>
  
4. Now let's create the workflow file that contains our logic. Our workflow will consist of 3 steps:

<br/><br/>

- Creating a copy of the template file in the selected service's repository and replacing its variables with the data from the action's input.
- Creating a pull request in the selected service's repository to add the new resource.
- Reporting & logging the action result back to Port, and updating the relevant service's `Resource definitions` property with the URL of the service's resources directory.

Under ".github/workflows", create a new file named `portCreateBucket.yaml` and use the following snippet as its content:

<details>
<summary><b>Github workflow (click to expand)</b></summary>

```yaml showLineNumbers
name: Create cloud resource
on:
  workflow_dispatch:
    inputs:
      name:
        type: string
      visibility:
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and general context
        type: string
jobs:
  createResource:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/checkout@v3
        with:
          repository: "${{ github.repository_owner }}/${{fromJson(inputs.port_payload).context.entity}}"
          path: ./targetRepo
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
      - name: Copy template file
        run: |
          mkdir -p ./targetRepo/resources
          cp templates/cloudResource.tf ./targetRepo/resources/${{ inputs.name }}.tf
      - name: Update new file data
        run: |
          sed -i 's/{{ bucket_name }}/${{ inputs.name }}/' ./targetRepo/resources/${{ inputs.name }}.tf
          sed -i 's/{{ bucket_acl }}/${{ inputs.visibility }}/' ./targetRepo/resources/${{ inputs.name }}.tf
      - name: Open a pull request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          path: ./targetRepo
          commit-message: Create new resource - ${{ inputs.name }}
          committer: GitHub <noreply@github.com>
          author: ${{ github.actor }} <${{ github.actor }}@users.noreply.github.com>
          signoff: false
          branch: new-resource-${{ inputs.name }}
          delete-branch: true
          title: Create new resource - ${{ inputs.name }}
          body: |
            Create new ${{ inputs.visibility }} resource - ${{ inputs.name }}
          draft: false
  create-entity-in-port-and-update-run:
    runs-on: ubuntu-latest
    needs: createResource
    steps:
      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{fromJson(inputs.port_payload).context.entity}}
          blueprint: service
          properties: |-
            {
              "resource_definitions": "${{ github.server_url }}/${{ github.repository_owner }}/${{fromJson(inputs.port_payload).context.entity}}/blob/main/resources/"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}
      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Pull request created successfully for "${{ inputs.name }}" 🚀
```

</details>

All done! The action is ready to be executed 🚀

### Execute the action

After creating an action, it will appear under the `Self-service` tab of your Port application:

<img src='/img/guides/iacActionAfterCreation.png' width='35%' />

1. Click on `Execute`.

2. Enter a name for your s3 bucket and choose a visibility, select any service from the list and click `Execute`. A small popup will appear, click on `View details`:

<img src='/img/guides/iacActionExecutePopup.png' width='40%' />

3. This page provides details about the action run. We can see that the backend returned `Success` and the pull-request was created successfully:

<img src='/img/guides/iacActionRunAfterExecution.png' width='90%' />

#### Access the bucket's definition from Port

You may have noticed that even though we updated the service's `Resource definitions` URL, it still leads to a non-existent page. This is because we do not have any resources in the repository yet, let's take care of that:

1. Merge the pull-request.
2. Go to the entity page of the service that you executed the action for:

<img src='/img/guides/iacEntityAfterAction.png' width='50%' />

3. Click on the `Resource definitions` link to access the service's resources.

All done! You can now create resources for your services directly from Port 💪🏽

### Possible daily routine integrations

- Send a slack message to relevant people in the organization, notifying about the new resource.
- Send a weekly/monthly report for managers/devops showing the new resources created in this timeframe and their owners.

### Conclusion

Developer portals need to support and integrate with git-ops practices seamlessly. Developers should be able to perform routine tasks independently, without having to create bottlenecks within the organization.  
With Port, platform engineers can design precise and flexible self-service actions for their developers, while integrating with many different backends to suit your specific needs.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).
