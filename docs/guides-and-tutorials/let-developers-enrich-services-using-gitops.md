---
sidebar_position: 5
title: Let developers enrich services using Gitops
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Let developers enrich services using Gitops

This guide takes 10 minutes to complete, and aims to demonstrate Port's flexibility when working with Gitops.

:::tip Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/quickstart).
- You will need a Github repository in which you can place a workflow that we will use in this guide. If you don't have one, we recommend [creating a new repository](https://docs.github.com/en/get-started/quickstart/create-a-repo) named `Port-actions`.
- You will need to have [Port's Github app](https://github.com/apps/getport-io) installed in your Github organization (the one that contains the repository you'll work with).

:::

### The goal of this guide

In this guide we will enrich a service in Port using Gitops. In reality, this can be used by developers to independently add additional valuable data about their services to Port.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to enrich their services without needing to nag devops engineers.
- Platform engineers will be able to create RBAC-controlled actions for developers, empowering their independence.
- R&D managers will be able to track additional, valuable data about services in the organization.

### Add new properties to your `Service` blueprint

Let's start by adding two new properties to the `Service` blueprint, that we will later populate using Gitops.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` blueprint, and click on `New property`.

2. The first property will be the service's type, chosen from a predefined list of options. Fill out the form like this, then click `Create`:

<img src='/img/guides/gitopsServicePropType.png' width='50%' />

<br/><br/>

3. The second property will be the lifecycle state of the service, also chosen from a predefined list of options. Fill out the form like this, then click `Create`:

_Note the colors of the inputs, this will make it easier to see a service's lifecycle in your catalog_ 😎

<img src='/img/guides/gitopsServicePropLifecycle.png' width='50%' />

### Model domains for your services

Services that share a business purpose (e.g. payments, shipping) are often grouped together using domains. Let's create a blueprint to represent a domain in Port:

1. In your [Builder](https://app.getport.io/dev-portal/data-model), click on the `Add` button in the top right corner, then choose `Custom blueprint`:

<img src='/img/quickstart/builderAddCustomBlueprint.png' width='30%' />

<br/><br/>

2. Click on the `Edit JSON` button in the top right corner, replace the content with the following definition, then click `Create`:

<details>
<summary><b>Blueprint JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "domain",
  "title": "Domain",
  "icon": "TwoUsers",
  "schema": {
    "properties": {
      "architecture": {
        "title": "Architecture",
        "type": "string",
        "format": "url",
        "spec": "embedded-url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

### Connect your services to their domains

Now that we have a blueprint to represent a domain, let's connect it to our services. We will do this by adding a relation to the `Service` blueprint:

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` blueprint, and click on `New relation`:

<img src='/img/guides/serviceCreateRelation.png' width='30%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/gitopsDomainRelationForm.png' width='50%' />

### Create domains via Gitops

Now that we have a `Domain` blueprint, we can create some domains in Port. This can be done manually from the UI, or via Gitops which is the method we will use in this guide.

1. In your `Port-actions` (or equivalent) Github repository, create a new file named `port.yml` in the root directory, and use the following snippet as its content:

<details>
<summary><b>port.yml (click to expand)</b></summary>

```yaml showLineNumbers
- identifier: payment
  title: Payment
  blueprint: domain
  properties:
    architecture: https://lucid.app/documents/embedded/533f05ad-aa68-43ce-9499-c5f767dc8ea5
- identifier: shipping
  title: Shipping
  blueprint: domain
  properties:
    architecture: https://lucid.app/documents/embedded/533f05ad-aa68-43ce-9499-c5f767dc8ea5
```

</details>

2. Head back to your [software catalog](https://app.getport.io/domains), you will see that Port has created two new `domain` entities:

<img src='/img/guides/gitopsDomainEntities.png' width='50%' />

The `architecture` property is a URL to a Lucidchart diagram. This is a handy way to track a domain's architecture in your software catalog.

### Create an action to enrich services

As platform engineers, we want to enable our developers to perform certain actions on their own. Let's create an action that developers can use to add data to a service, and allocate it to a domain.

#### Create the action's frontend

1. Go to your [Self-service page](https://app.getport.io/self-serve), then click on the `+ New action` button in the top right corner.

2. From the dropdown, choose the `Service` blueprint.

3. Fill out the basic details like this, then click `Next`:

<img src='/img/guides/gitopsActionBasicDetails.png' width='50%' />

<br/><br/>

4. We want our developers to be able to choose the domain to which the service will be assigned. Click on `Add input`, fill out the form like this, then click `Next`:

<img src='/img/guides/gitopsActionInputDomain.png' width='50%' />

<br/><br/>

5. Let's add two more inputs for our new service properties - `type` and `lifecycle`. Create two new inputs, fill out their forms like this, then click `Next`:

<img src='/img/guides/gitopsActionInputType.png' width='50%' />

<img src='/img/guides/gitopsActionInputLifecycle.png' width='50%' />

<br/><br/>

6. Now we'll define the backend of the action. Port supports multiple invocation types, for this tutorial we will use a `Github workflow`.
   - Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
   - Name the workflow `portEnrichService.yaml`.
   - Fill out the rest of the form like this, then click `Next`:

<img src='/img/guides/gitopsActionBackendForm.png' width='75%' />

<br/><br/>

7. The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

#### Create the action's backend

Our action will create a pull-request in the service's repository, containing a `port.yml` file that will add data to the service in Port. We will use a Github workflow to implement the action's backend.

1. First, let's create the necessary token and secrets. If you've already completed the [`scaffold a new service guide`](/guides-and-tutorials/scaffold-a-new-service), you should already have these configured and you can skip this step.

- Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our workflow).

  <img src='/img/guides/personalAccessToken.png' width='80%' />

- Go to your [Port application](https://app.getport.io/), hover over the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In your `Port-actions` (or equivalent) Github repository, create 3 new secrets under `Settings->Secrets and variables->Actions`:

- `ORG_ADMIN_TOKEN` - the personal access token you created in the previous step.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecret.png' width='60%' />

<br/><br/>

3. We will now create a YML file that will serve as a template for our services' `port.yml` configuration file.

- In your Github repository, create a file named `enrichService.yml` under `/templates/` (it's path should be `/templates/enrichService.yml`).
- Copy the following snippet and paste it in the file's contents:

<details>
<summary><b>enrichService.yml (click to expand)</b></summary>

```yaml showLineNumbers
# enrichService.yml

- identifier: "{{ service_identifier }}"
  blueprint: service
  properties:
    type: "{{ service_type }}"
    lifecycle: "{{ service_lifecycle }}"
  relations:
    domain: "{{ domain_identifier }}"
```

</details>

4. Now let's create the workflow file that contains our logic. In the same repository, under ".github/workflows", create a new file named `portEnrichService.yaml` and use the following snippet as its content:

<details>
<summary><b>Github workflow (click to expand)</b></summary>

```yaml showLineNumbers
name: Enrich service
on:
  workflow_dispatch:
    inputs:
      domain:
        required: true
        description: The domain to which the service will be assigned
        type: string
      type:
        required: true
        description: The service's type
        type: string
      lifecycle:
        required: true
        description: The service's lifecycle
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and general context
        type: string
jobs:
  enrichService:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/checkout@v3
        with:
          repository: "${{ github.repository_owner }}/${{fromJson(inputs.port_payload).context.entity}}"
          path: ./targetRepo
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
      - name: Copy template yml file
        run: |
          cp templates/enrichService.yml ./targetRepo/port.yml
      - name: Update new file data
        run: |
          sed -i 's/{{ service_identifier }}/${{fromJson(inputs.port_payload).context.entity}}/' ./targetRepo/port.yml
          sed -i 's/{{ domain_identifier }}/${{ inputs.domain }}/' ./targetRepo/port.yml
          sed -i 's/{{ service_type }}/${{ inputs.type }}/' ./targetRepo/port.yml
          sed -i 's/{{ service_lifecycle }}/${{ inputs.lifecycle }}/' ./targetRepo/port.yml
      - name: Open a pull request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          path: ./targetRepo
          commit-message: Enrich service - ${{fromJson(inputs.port_payload).context.entity}}
          committer: GitHub <noreply@github.com>
          author: ${{ github.actor }} <${{ github.actor }}@users.noreply.github.com>
          signoff: false
          branch: add-port-yml
          delete-branch: true
          title: Create port.yml - ${{fromJson(inputs.port_payload).context.entity}}
          body: |
            Add port.yaml to enrich service in Port.
          draft: false
      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Pull request to add port.yml created successfully for service "${{fromJson(inputs.port_payload).context.entity}}" 🚀
```

</details>

The action is ready to be executed 🚀

#### Execute the action

1. After creating an action, it will appear under the [Self-service page](https://app.getport.io/self-serve). Find your new `Enrich service` action, and click on `Execute`.

2. Choose a service from the dropdown, a domain to assign it to, and any values for its type and lifecycle, then click `Execute`:

<img src='/img/guides/gitopsEnrichActionExecute.png' width='50%' />

<br/><br/>

3. A small popup will appear, click on `View details`:

<img src='/img/guides/gitopsActionExecutePopup.png' width='40%' />

<br/><br/>

This page provides details about the action run. We can see that the backend returned `Success` and the pull-request was created successfully.

4. Head over to your service's Github repository, you will see that a new pull-request was created:

<img src='/img/guides/gitopsActionRepoPullRequest.png' width='70%' />

<br/>

5. Merge the pull-request, then head back to your [software catalog](https://app.getport.io/services).

6. Find your service, and click on its identifier. This will take you to the service's catalog page, where you can see your new properties populated with data:

<img src='/img/guides/gitopsServicePageAfterAction.png' width='80%' />

<br/><br/>

All done! 💪🏽

### Possible daily routine integrations

- Fetch data from a Sentry project and reflect it in your software catalog.
- Create and onboard services with a few clicks from your developer portal.

### Conclusion

Gitops is a common practice in modern software development, as it ensures that the state of your infrastructure is always in sync with your codebase.  
Port allows you to easily integrate your Gitops practices with your software catalog, reflecting the state of your infrastructure, and allowing you to empower your developers with controlled actions.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).
