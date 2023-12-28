---
sidebar_position: 1
title: Scaffold a new service
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Scaffold a new service

This guide takes 7 minutes to complete, and aims to demonstrate the power of self-service actions in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- You will need a Git repository in which you can place a workflow/pipeline that we will use in this guide. If you don't have one, we recommend creating a new repository named `Port-actions`.

:::

### The goal of this guide

In this guide we will create an action that initializes a new Git repository. In reality, such an action can be used by developers to scaffold new services.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to scaffold new services easily.
- R&D managers will be able to get an overview of new services - how many were created and by who.
- Platform engineers will be able to control permissions to ensure only the relevant people can create new services.

### Setup the action's frontend

:::tip Onboarding

As part of the onboarding process, you should already have an action named `Scaffold a new service` in your [self-service tab](https://app.getport.io/self-serve). In that case, you can skip to the [Define action type](#define-backend-type) step.  

If you **skipped** the onboarding, or you want to create the action from scratch, complete steps 1-4 below.

:::

<details>
<summary>Create the action's frontend</summary>

1. Click on `New action`:

<img src='/img/guides/actionsCreateNew.png' width='50%' />

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Since we are creating a repository, let's use the `Service` blueprint that was created for us as part of the [onboarding](/quickstart) process. Choose it from the dropdown.

3. Fill in the basic details of the action like this, then click `Next`:

<img src='/img/guides/actionBasicDetails.png' width='60%' />

4. The next step is to define the action's inputs. When someone uses this action, all we want them to enter is the new repository's name. Click on `New input`, fill in the form like this, then click on `Create`:

<img src='/img/guides/actionInputName.png' width='50%' />

:::info notes

- We set the `Required` field to `true` to ensure that a name is always provided when using this action.
- We set the type to `Text` since this is a name, but note all of the different types of input that Port allows.
- When using `Text` inputs, you can set constraints and limitations to enforce certain patterns.

:::

</details>

#### Define backend type

Now we'll define the backend of the action. Port supports multiple invocation types, one of them should be selected for you depending on the Git provider you selected in the beginning of the onboarding process.  

Fill out the form with your values. For example, when using a Github backend:
   - Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
   - Name the workflow `portCreateRepo.yaml`.
   - Set `Omit user inputs` to `Yes`.
   - Fill out the rest of the form like this, then click `Next`:

:::tip Important

In our workflow, the cookiecutter uses the payload for the inputs. We omit the user inputs in order to avoid sending additional inputs to the workflow.

:::

<img src='/img/guides/scaffoldBackend.png' width='75%' />

<br/><br/>

The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

The action's frontend is now ready 🥳

### Setup the action's backend

Now we want to write the logic that our action will trigger.

:::info Important
If the Github organization which will house your workflow is not the same as the one you'll create the new repository in, install Port's [Github app](https://github.com/apps/getport-io) in the other organization as well.
:::

1. First, let's create the necessary token and secrets:

- Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token (classic) with `repo`, `admin:repo_hook` and `admin:org` scope, and copy it (this token is needed to create a repo from our workflow).

  <img src='/img/guides/personalAccessToken.png' width='80%' />

:::info SAML SSO
If your organization uses SAML SSO, you will need to authorize your token. Follow [these instructions](https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on) and then continue this guide.
:::

- Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In the repository where your workflow will reside, create 3 new secrets under `Settings->Secrets and variables->Actions`:

- `ORG_ADMIN_TOKEN` - the personal access token you created in the previous step.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecret.png' width='80%' />

3. Now let's create the workflow file that contains our logic. Under ".github/workflows", create a new file named `portCreateRepo.yaml` and use the following snippet as its content:

Change `<YOUR-ORG-NAME>` to the name of the organization in which you want to create the new repository.

<details>
<summary><b>Github workflow (click to expand)</b></summary>

```yaml showLineNumbers
# portCreateRepo.yaml

name: Scaffold a new service
on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string
    secrets:
      ORG_ADMIN_TOKEN:
        required: true
      PORT_CLIENT_ID:
        required: true
      PORT_CLIENT_SECRET:
        required: true
jobs:
  scaffold-service:
    env:
      ORG_NAME: <YOUR-ORG-NAME>
    runs-on: ubuntu-latest
    steps:
      - uses: port-labs/cookiecutter-gha@v1.1.1
        id: scaff
        with:
          portClientId: ${{ secrets.PORT_CLIENT_ID }}
          portClientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          portRunId: ${{ fromJson(inputs.port_payload).context.runId }}
          repositoryName: ${{ fromJson(inputs.port_payload).payload.properties.service_name }}
          portUserInputs: '{"cookiecutter_app_name": "${{ fromJson(inputs.port_payload).payload.properties.service_name }}" }'
          cookiecutterTemplate: https://github.com/lacion/cookiecutter-golang
          blueprintIdentifier: "service"
          organizationName: ${{ env.ORG_NAME }}
```

</details>

:::tip
This workflow uses Port's [cookiecutter Github action](https://github.com/port-labs/cookiecutter-gha) to scaffold the new repository.
:::

<br/>

All done! The action is ready to be used 🚀

### Execute the action

After creating an action, it will appear under the `Self-service` tab of your Port application:

<img src='/img/guides/selfServiceAfterCreation.png' width='75%' />

1. Click on `Create` to begin executing the action.

2. Enter a name for your new repository, then click `Execute`. A small popup will appear, click on `View details`:

<img src='/img/guides/executionDetails.png' width='45%' />

3. This page provides details about the action run. As you can see, the backend returned `Success` and the repo was successfully created:

<img src='/img/guides/runStatus.png' width='90%' />

:::tip Logging action progress
💡 Note the `Log stream` at the bottom, this can be used to report progress, results and errors. Click [here](https://docs.getport.io/create-self-service-experiences/reflect-action-progress/) to learn more.
:::

Congratulations! You can now create services easily from Port 💪🏽

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new service was created.
- Send a weekly/monthly report for managers showing all the new services created in this timeframe and their owners.

### Conclusion

Creating a service is not just a periodic task developers undertake, but a vital step that can occur on a monthly basis. However, it's crucial to recognize that this is only a fragment of the broader experience that we're striving to create for developers.  
Our ultimate goal is to facilitate a seamless transition from ideation to production. In doing so, we aim to eliminate the need for developers to navigate through a plethora of tools, reducing friction and accelerating the time-to-production.  
In essence, we're not just building a tool, but sculpting an ecosystem that empowers developers to bring new features to life with utmost efficiency.

More scaffolding examples can be found here:

- [Scaffold Gitlab repositories](/create-self-service-experiences/setup-backend/gitlab-pipeline/examples/scaffold-repositories-using-cookiecutter)
- [Scaffold BitBucket repositories](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/scaffold-bitbucket-using-cookiecutter)
