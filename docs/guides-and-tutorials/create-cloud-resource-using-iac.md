---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Create cloud resources using IaC

This guide takes 8 minutes to complete, and aims to demonstrate:

- A complete flow to create a resource using IaC.
- The simplicity of communicating with Port from a self-service action backend.

<br/>

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- You will need a Git repository (Github, GitLab, or Bitbucket) in which you can place a workflow/pipeline that we will use in this guide. If you don't have one, we recommend creating a new repository named `Port-actions`.

:::

### The goal of this guide

In this guide we will open a pull-request in our Git repository from within Port to create a new cloud resource using gitops.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Platform engineers will be able to define powerful actions that developers can use within controlled permission boundaries.
- Developers will be able to easily create and track cloud resources from Port.

### Add a URL to your new resource's definition

In this guide we will add a new property to our `service` <PortTooltip id="blueprint">blueprint</PortTooltip>, which we can use to access our cloud resource definitions.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model).
2. Click on your `service` <PortTooltip id="blueprint">blueprint</PortTooltip>, then click on `New property`.
3. Choose `URL` as the type, fill it like this and click `Save`:

<img src='/img/guides/iacPropertyForm.png' width='40%' />

This property is empty for now in all services, we will fill it as part of the action we're about to create 😎

### Setup the action's frontend

1. Head to the [Self-service tab](https://app.getport.io/self-serve) in your Port application, and click on `+ New action`.

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Our action creates a resource that is associated with a service and will be provisioned as part of the service's CD process.  
   Choose `Service` from the dropdown list.

3. This action does not create/delete entities, but rather performs an operation on an existing <PortTooltip id="entity">entity</PortTooltip>. Therefore, we will choose `Day-2` as the action type.  
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

6. Now we'll define the backend of the action. Port supports multiple invocation types, one of them should be selected for you depending on the Git provider you selected in the beginning of the onboarding process.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"}
]}>

<!-- {label: "Bitbucket (Jenkins)", value: "bitbucket"} -->

<TabItem value="github">

Fill out the form with your values:
- Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
- Name the workflow `portCreateBucket.yaml`.
- Set `Omit user inputs` to `Yes`.
- Fill out the rest of the form like this, then click `Next`:

:::tip Important

In our workflow, the payload is used as the input. We omit the user inputs in order to avoid sending additional inputs to the workflow.

:::

<img src='/img/guides/createBucketGHBackend.png' width='75%' />

</TabItem>

<TabItem value="gitlab">

:::tip
You will need a few parameters for this part that are generated in the [setup the action's backend](#setup-the-actions-backend) section, it is recommended to complete the steps there and then follow the instructions here with all of the required information in hand.
:::

Fill out the form with your values:
- For the `Endpoint URL` you need to add a URL in the following format:
  ```text showLineNumbers
  https://gitlab.com/api/v4/projects/{GITLAB_PROJECT_ID}/ref/main/trigger/pipeline?token={GITLAB_TRIGGER_TOKEN}
  ```
    - The value for `{GITLAB_PROJECT_ID}` is the ID of the GitLab group that you create in the [setup the action's backend](#setup-the-actions-backend) section which stores the `.gitlab-ci.yml` pipeline file.
      - To find the project ID, browse to the GitLab page of the group you created, at the top right corner of the page, click on the vertical 3 dots button (next to `Fork`) and select `Copy project ID`
    - The value for `{GITLAB_TRIGGER_TOKEN}` is the trigger token you create in the [setup the action's backend](#setup-the-actions-backend) section.
- Set `HTTP method` to `POST`.
- Set `Request type` to `Async`.
- Set `Use self-hosted agent` to `No`.

<img src='/img/guides/gitlabActionBackendForm.png' width='75%' />

</TabItem>

<!-- <TabItem value="bitbucket">

:::tip
You will need a few parameters for this part that are generated in the [setup the action's backend](#setup-the-actions-backend) section, it is recommended to complete the steps there and then follow the instructions here with all of the required information in hand.
:::

Fill out the form with your values:
- For the `Endpoint URL` you need to add a URL in the following format:
  ```text showLineNumbers
  https://{JENKINS_URL}/generic-webhook-trigger/invoke?token={JOB_TOKEN}
  ```
    - The value for `{JENKINS_URL}` is the URL of your Jenkins server.
    - The value for `{JOB_TOKEN}` is the unique token used to trigger the pipeline you create in the [setup the action's backend](#setup-the-actions-backend) section.
- Set `HTTP method` to `POST`.
- Set `Request type` to `Async`.
- Set `Use self-hosted agent` to `No`.

<img src='/img/guides/bitbucketActionBackendForm.png' width='75%' />

</TabItem> -->

</Tabs>
<br/><br/>

7. The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

The action's frontend is now ready 🥳

### Setup the action's backend

Now we want to write the logic that our action will trigger.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"}  
]}>
<!-- {label: "Bitbucket (Jenkins)", value: "bitbucket"} -->

<TabItem value="github">
1. First, let's create the necessary token and secrets. If you've already completed the [scaffold a new service guide](/guides-and-tutorials/scaffold-a-new-service), you should already have these configured and you can skip this step.

- Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our workflow).

  <img src='/img/guides/personalAccessToken.png' width='80%' />

  - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

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

- Creating a copy of the template file in the selected service's repository and replacing its variables with the data from the action's input.
- Creating a pull request in the selected service's repository to add the new resource.
- Reporting & logging the action result back to Port, and updating the relevant service's `Resource definitions` property with the URL of the service's resources directory.

Under `.github/workflows/`, create a new file named `portCreateBucket.yaml` and use the following snippet as its content:

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

</TabItem>

<TabItem value="gitlab">

1. First, let's create a GitLab project that will store our new bucket creation pipeline - Go to your GitLab account and create a new project.

2. Next, let's create the necessary token and secrets:

- Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.
- Go to your [project](https://gitlab.com/), and follow the steps [here](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#create-a-project-access-token) to create a new project access token with the following permission scopes: `write_repository`, then save its value as it will be required in the next step.
  <img src='/img/guides/gitlabProjectAccessTokenPerms.png' width='80%' />
- Go to the new GitLab project you created in step 1, from the `Settings` menu at the sidebar on the left, select `CI/CD`.
- Expand the `Variables` section and save the following secrets:
  - `PORT_CLIENT_ID` - Your Port client ID.
  - `PORT_CLIENT_SECRET` - Your Port client secret.
  - `GITLAB_ACCESS_TOKEN` - The GitLab group access token you created in the previous step.
  <br/>
  <img src='/img/guides/gitlabPipelineVariables.png' width='80%' />
- Expand the `Pipeline trigger tokens` section and add a new token, give it a meaningful description such as `Bucket creator token` and save its value
  - This is the `{GITLAB_TRIGGER_TOKEN}` that you need for the defining the backend of the Action.

<br/>

  <img src='/img/guides/gitlabPipelineTriggerToken.png' width='80%' />

<br/><br/>

3. Now let's create the pipeline file that contains our logic. In the new GitLab project you created at step 1, at the root of the project, create a new file named `.gitlab-ci.yml` and use the following snippet as its content:

<details>
<summary><b>GitLab pipeline (click to expand)</b></summary>

```yaml showLineNumbers title=".gitlab-ci.yml"
image: python:3.10.0-alpine

stages: # List of stages for jobs, and their order of execution
  - fetch-port-access-token
  - create-tf-resource-pr
  - create-entity
  - update-run-status

fetch-port-access-token: # Example - get the Port API access token and RunId
  stage: fetch-port-access-token
  except:
    - pushes
  before_script:
    - apk update
    - apk add jq curl -q
  script:
    - |
      echo "Getting access token from Port API"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')
      echo "RUN_ID=$runId" >> data.env
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Starting S3 bucket creation process..."}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$runId"
  artifacts:
    reports:
      dotenv: data.env

create-tf-resource-pr:
  before_script: |
    apk update
    apk add jq curl git -q
  stage: create-tf-resource-pr
  except:
    - pushes
  script:
    - | 
      git config --global user.email "bucketCreator@email.com"
      git config --global user.name "Bucket Creator"
      git config --global init.defaultBranch "main"
      git clone https://:${GITLAB_ACCESS_TOKEN}@gitlab.com/${CI_PROJECT_NAMESPACE}/${CI_PROJECT_NAME}.git sourceRepo
      cat $TRIGGER_PAYLOAD
      git clone https://:${GITLAB_ACCESS_TOKEN}@gitlab.com/${CI_PROJECT_NAMESPACE}/$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity').git targetRepo
    - |
      bucket_name=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.name')
      visibility=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.visibility')
      echo "BUCKET_NAME=${bucket_name}" >> data.env
      echo "Creating a new S3 bucket Terraform resource file"
      mkdir -p targetRepo/resources/
      cp sourceRepo/templates/cloudResource.tf targetRepo/resources/${bucket_name}.tf
      sed -i "s/{{ bucket_name }}/${bucket_name}/" ./targetRepo/resources/${bucket_name}.tf
      sed -i "s/{{ bucket_acl }}/${visibility}/" ./targetRepo/resources/${bucket_name}.tf
    - |
      cd ./targetRepo
      git add resources/${bucket_name}.tf
      git commit -m "Added ${bucket_name} resource file"
      git checkout -b new-bucket-branch-${bucket_name}
      git push origin new-bucket-branch-${bucket_name}
      PROJECT_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity | @uri')
      PROJECTS=$(curl --header "PRIVATE-TOKEN: $GITLAB_ACCESS_TOKEN" "https://gitlab.com/api/v4/groups/$CI_PROJECT_NAMESPACE_ID/projects?search=$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity')")
      PROJECT_ID=$(echo ${PROJECTS} | jq '.[] | select(.name=="'$PROJECT_NAME'") | .id' | head -n1)

      PR_RESPONSE=$(curl --request POST --header "PRIVATE-TOKEN: ${GITLAB_ACCESS_TOKEN}" "https://gitlab.com/api/v4/projects/${PROJECT_ID}/merge_requests?source_branch=new-bucket-branch-${bucket_name}&target_branch=main&title=New-Bucket-Request")
      PR_URL=$(echo ${PR_RESPONSE} | jq -r '.web_url')
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{\"message\":\"📡 Opened pull request with new bucket resource!\nPR Url: ${PR_URL}\"}" \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"

  artifacts:
    reports:
      dotenv: data.env

create-entity:
  stage: create-entity
  except:
    - pushes
  before_script:
    - apk update
    - apk add jq curl -q
  script:
    - |
      echo "Creating Port entity to match new S3 bucket"
      SERVICE_ID=$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity')
      PROJECT_URL="https://gitlab.com/${CI_PROJECT_NAMESPACE_ID}/${SERVICE_ID}/-/blob/main/resources/"
      echo "SERVICE_ID=${SERVICE_ID}" >> data.env
      echo "PROJECT_URL=${PROJECT_URL}" >> data.env
      curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -d '{"message":"🚀 Updating the service with the new resource definition!"}' \
          "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
      curl --location --request POST "https://api.getport.io/v1/blueprints/service/entities?upsert=true&run_id=$RUN_ID&create_missing_related_entities=true" \
        --header "Authorization: Bearer $ACCESS_TOKEN" \
        --header "Content-Type: application/json" \
        -d '{"identifier": "'"$SERVICE_ID"'","title": "'"$SERVICE_ID"'","properties": {"resource_definitions": "'"$PROJECT_URL"'"}, "relations": {}}'

update-run-status:
  stage: update-run-status
  except:
    - pushes
  image: curlimages/curl:latest
  script:
    - |
      echo "Updating Port action run status and final logs"
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message":"✅ PR Opened for bucket '"$BUCKET_NAME"'!"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"status":"SUCCESS",  "message": {"run_status": "Run completed successfully!"}}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID"
```

</details>
</TabItem>

<!-- <TabItem value="bitbucket">
TODO: Add bitbucket
</TabItem> -->


</Tabs>


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
2. Go to the <PortTooltip id="entity">entity</PortTooltip> page of the service that you executed the action for:

<img src='/img/guides/iacEntityAfterAction.png' width='50%' />

3. Click on the `Resource definitions` link to access the service's resources.

All done! You can now create resources for your services directly from Port 💪🏽

### Possible daily routine integrations

- Send a slack message to relevant people in the organization, notifying about the new resource.
- Send a weekly/monthly report for managers/devops showing the new resources created in this timeframe and their owners.

### Conclusion

Developer portals need to support and integrate with git-ops practices seamlessly. Developers should be able to perform routine tasks independently, without having to create bottlenecks within the organization.  
With Port, platform engineers can design precise and flexible self-service actions for their developers, while integrating with many different backends to suit your specific needs.

More relevant guides and examples:

- [Deploy AWS resources using AWS CloudFormation
  ](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/deploy-cloudformation-template)
- [Create an S3 bucket using Self-Service Actions](https://docs.getport.io/create-self-service-experiences/setup-backend/webhook/examples/s3-using-webhook/)
