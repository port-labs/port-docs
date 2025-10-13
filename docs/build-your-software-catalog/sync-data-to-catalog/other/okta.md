import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/_ocean_helm_prerequisites_block.mdx"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import ScheduledCiInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_scheduled_ci_installation.mdx"
import DockerParameters from "./_okta_docker_parameters.mdx"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Okta

Port's Okta integration allows you to model Okta identity and access management resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Okta resources and their metadata in Port (see supported resources below).
- Watch for Okta object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Track user and group relationships for better access management visibility.

### Supported Resources

The resources that can be ingested from Okta into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Users`](https://developer.okta.com/docs/reference/api/users/) - User accounts and their profile information
- [`Groups`](https://developer.okta.com/docs/reference/api/groups/) - User groups and their memberships

## Prerequisites

### Create an Okta API token

1. Log in to your Okta admin console.
2. Navigate to **Security** > **API** > **Tokens**.
3. Click **Create Token**.
4. Provide a name for your token (e.g., "Port Integration").
5. Click **Create Token**.
6. Copy the generated token and save it securely.

:::warning Token Security
Store your API token securely and never share it. The token provides access to your Okta data.
:::

### Okta Domain

Your Okta domain is the subdomain of your Okta organization URL. For example, if your Okta URL is `https://dev-123456.okta.com`, your domain would be `dev-123456.okta.com`.

## Setup

Choose one of the following installation methods:  
Not sure which method is right for your use case? Check the available [installation methods](/build-your-software-catalog/sync-data-to-catalog/#installation-methods).

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port (Recommended)" default>

<OceanSaasInstallation integration="Okta" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Self-hosted">

<IntegrationVersion integration="okta" />

Using this installation method means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>
 
<Prerequisites/>

<OceanRealtimeInstallation integration="Okta" />

For details about the available parameters for the installation, see the table below.

This table summarizes the parameters used for the installation.  
Note the parameters specific to this integration, they are last in the table. 

| Parameter                                | Description                                                                                                                         | Required |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                          | Your Port client id, used to identify your account                                                                                  | ✅        |
| `port.clientSecret`                      | Your Port client secret, used to identify your account                                                                              | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `initializePortResources`                | Default: `true`. When `true`, the integration will create default blueprints and configuration mapping                              | ❌        |
| `sendRawDataExamples`                    | Default: `true`. Enable sending raw data examples from the third party API to Port for testing and managing the integration mapping | ❌        |
| `integration.identifier`                 | The integration's identifier, used to reference the integration when using Port's API                                               | ✅        |
| `integration.type`                       | The integration type, used to denote the integrated tool/platform                                                                   | ✅        |
| `integration.eventListener.type`         | The method used to listen to events from the 3rd party tool (`POLLING` or `KAFKA`)                                                  | ✅        |
| **`integration.secrets.oktaApiToken`**   | The Okta API token used to authenticate Port to Okta                                                                                | ✅        |
| **`integration.config.oktaDomain`**      | Your Okta domain (e.g., dev-123456.okta.com)                                                                                        | ✅        |
| **`integration.secrets.oktaWebhookSecret`** | Optional secret used to verify incoming webhook requests                                                                             | ❌        |

</TabItem>

<TabItem value="one-time-ci" label="CI">

This workflow/pipeline will run the Okta integration once and then exit, this is useful for scheduled ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time you should use the [Self-hosted](?installation-methods=real-time-self-hosted#setup) installation option.
:::

<Tabs groupId="cicd-method" queryString="cicd-method">
<TabItem value="github" label="GitHub">

Make sure to configure the following [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `okta-integration.yml` workflow file:

```yaml showLineNumbers
name: Okta Exporter Workflow
on:
  workflow_dispatch:
  schedule:
    - cron: '0 */1 * * *' # Determines the scheduled interval for this workflow. This example runs every hour.
jobs:
  run-integration:
    runs-on: ubuntu-latest
    timeout-minutes: 30 # Set a time limit for the job
    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'okta'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            okta_domain: ${{ secrets.OCEAN__INTEGRATION__CONFIG__OKTA_DOMAIN }}
            okta_api_token: ${{ secrets.OCEAN__INTEGRATION__SECRETS__OKTA_API_TOKEN }}
```

</TabItem>

<TabItem value="jenkins" label="Jenkins">

:::tip Jenkins Docker Requirements
Your Jenkins agent should be able to run docker commands.
:::

<br />

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

<DockerParameters />

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Okta Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__OKTA_DOMAIN', variable: 'OCEAN__INTEGRATION__CONFIG__OKTA_DOMAIN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__SECRETS__OKTA_API_TOKEN', variable: 'OCEAN__INTEGRATION__SECRETS__OKTA_API_TOKEN'),
                    ]) {
                        sh('''
                            # Set Docker image and run the container
                            integration_type="okta"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__OKTA_DOMAIN=$OCEAN__INTEGRATION__CONFIG__OKTA_DOMAIN \
                                -e OCEAN__INTEGRATION__SECRETS__OKTA_API_TOKEN=$OCEAN__INTEGRATION__SECRETS__OKTA_API_TOKEN \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
                                -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
                                $image_name

                            exit $?
                        ''')
                    }
                }
            }
        }
    }
}
```

</TabItem>

<TabItem value="azure" label="Azure Devops">

:::tip Azure DevOps Docker Requirements
Your Azure DevOps agent should be able to run docker commands.
:::

<br />

Make sure to configure the following [Azure DevOps Variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch)
as secret variables:

<DockerParameters />

<br/>

Here is an example for `okta-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
- main
pool:
  vmImage: "ubuntu-latest"
variables:
  - group: port-ocean-credentials
steps:
- script: |
    # Set Docker image and run the container
    integration_type="okta"
    version="latest"
    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
      -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
      -e OCEAN__INTEGRATION__CONFIG__OKTA_DOMAIN=$(OCEAN__INTEGRATION__CONFIG__OKTA_DOMAIN) \
      -e OCEAN__INTEGRATION__SECRETS__OKTA_API_TOKEN=$(OCEAN__INTEGRATION__SECRETS__OKTA_API_TOKEN) \
      -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
      -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
      -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
      $image_name

    exit $?
  displayName: 'Ingest Data into Port'
```

</TabItem>
</Tabs>

</TabItem>

</Tabs>

<AdvancedConfig/>

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: okta-user
  selector:
    query: 'true'
    include_groups: true
    include_applications: true
    fields: "id,status,created,activated,lastLogin,lastUpdated,profile:(login,firstName,lastName,displayName,email,title,department,employeeNumber,mobilePhone,primaryPhone,streetAddress,city,state,zipCode,countryCode)"
  port:
    entity:
      mappings:
        identifier: .id
        title: .profile.displayName // .profile.firstName + " " + .profile.lastName // .profile.login
        blueprint: '"okta-user"'
        properties:
          login: .profile.login
          email: .profile.email
          firstName: .profile.firstName
          lastName: .profile.lastName
          displayName: .profile.displayName
          title: .profile.title
          department: .profile.department
          employeeNumber: .profile.employeeNumber
          mobilePhone: .profile.mobilePhone
          primaryPhone: .profile.primaryPhone
          streetAddress: .profile.streetAddress
          city: .profile.city
          state: .profile.state
          zipCode: .profile.zipCode
          countryCode: .profile.countryCode
          status: .status
          created: .created
          activated: .activated
          lastLogin: .lastLogin
          lastUpdated: .lastUpdated
        relations:
          groups: .groups[]?.id
- kind: okta-group
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .profile.name
        blueprint: '"okta-group"'
        properties:
          name: .profile.name
          description: .profile.description
          type: .type
          created: .created
          lastUpdated: .lastUpdated
        relations:
          members: .users[]?.id
```

</details>

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations:

### User

<details>
<summary><b>User blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta-user",
  "title": "Okta User",
  "icon": "Okta",
  "schema": {
    "properties": {
      "login": {
        "title": "Login",
        "type": "string"
      },
      "email": {
        "title": "Email",
        "type": "string",
        "format": "email"
      },
      "firstName": {
        "title": "First Name",
        "type": "string"
      },
      "lastName": {
        "title": "Last Name",
        "type": "string"
      },
      "displayName": {
        "title": "Display Name",
        "type": "string"
      },
      "title": {
        "title": "Job Title",
        "type": "string"
      },
      "department": {
        "title": "Department",
        "type": "string"
      },
      "employeeNumber": {
        "title": "Employee Number",
        "type": "string"
      },
      "mobilePhone": {
        "title": "Mobile Phone",
        "type": "string"
      },
      "primaryPhone": {
        "title": "Primary Phone",
        "type": "string"
      },
      "streetAddress": {
        "title": "Street Address",
        "type": "string"
      },
      "city": {
        "title": "City",
        "type": "string"
      },
      "state": {
        "title": "State",
        "type": "string"
      },
      "zipCode": {
        "title": "ZIP Code",
        "type": "string"
      },
      "countryCode": {
        "title": "Country Code",
        "type": "string"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": ["ACTIVE", "INACTIVE", "PASSWORD_EXPIRED", "LOCKED_OUT", "SUSPENDED", "DEPROVISIONED"]
      },
      "created": {
        "title": "Created Date",
        "type": "string",
        "format": "date-time"
      },
      "activated": {
        "title": "Activated Date",
        "type": "string",
        "format": "date-time"
      },
      "lastLogin": {
        "title": "Last Login",
        "type": "string",
        "format": "date-time"
      },
      "lastUpdated": {
        "title": "Last Updated",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": ["login", "email"]
  },
  "calculationProperties": {},
  "relations": {
    "groups": {
      "title": "Groups",
      "target": "okta-group",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary><b>Mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: okta-user
    selector:
      query: "true"
      include_groups: true
      include_applications: true
    port:
      entity:
        mappings:
          identifier: .id
          title: .profile.displayName // .profile.firstName + " " + .profile.lastName // .profile.login
          blueprint: '"okta-user"'
          properties:
            login: .profile.login
            email: .profile.email
            firstName: .profile.firstName
            lastName: .profile.lastName
            displayName: .profile.displayName
            title: .profile.title
            department: .profile.department
            employeeNumber: .profile.employeeNumber
            mobilePhone: .profile.mobilePhone
            primaryPhone: .profile.primaryPhone
            streetAddress: .profile.streetAddress
            city: .profile.city
            state: .profile.state
            zipCode: .profile.zipCode
            countryCode: .profile.countryCode
            status: .status
            created: .created
            activated: .activated
            lastLogin: .lastLogin
            lastUpdated: .lastUpdated
          relations:
            groups: .groups[]?.id
```

</details>

### Group

<details>
<summary><b>Group blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta-group",
  "title": "Okta Group",
  "icon": "Okta",
  "schema": {
    "properties": {
      "name": {
        "title": "Name",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "type": {
        "title": "Type",
        "type": "string",
        "enum": ["BUILT_IN", "OKTA_GROUP", "APP_GROUP"]
      },
      "created": {
        "title": "Created Date",
        "type": "string",
        "format": "date-time"
      },
      "lastUpdated": {
        "title": "Last Updated",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": ["name"]
  },
  "calculationProperties": {},
  "relations": {
    "members": {
      "title": "Members",
      "target": "okta-user",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary><b>Mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: okta-group
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .profile.name
          blueprint: '"okta-group"'
          properties:
            name: .profile.name
            description: .profile.description
            type: .type
            created: .created
            lastUpdated: .lastUpdated
          relations:
            members: .users[]?.id
```

</details>

## Webhook Configuration

The Okta integration supports real-time updates through webhooks. When using the self-hosted installation method, the integration will automatically:

1. Create an Event Hook in your Okta organization
2. Configure the webhook to send user and group change events
3. Process incoming webhook events to update Port entities in real-time

:::info Webhook Events
The integration listens for the following Okta events:
- `user.lifecycle.create`
- `user.lifecycle.activate`
- `user.lifecycle.deactivate`
- `user.lifecycle.suspend`
- `user.lifecycle.unsuspend`
- `user.lifecycle.delete`
- `user.account.update_profile`
- `group.user_membership.add`
- `group.user_membership.remove`
- `group.lifecycle.create`
- `group.lifecycle.delete`
- `group.lifecycle.update`
:::

## Limitations

- The integration currently supports users and groups only
- Custom Okta attributes are not automatically mapped but can be added to the configuration
- Webhook verification is optional but recommended for production environments

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify your Okta API token has the correct permissions and is not expired
2. **Domain Issues**: Ensure your Okta domain is correctly formatted (e.g., `dev-123456.okta.com`)
3. **Webhook Failures**: Check that your self-hosted integration is accessible from the internet for webhook delivery
4. **Rate Limiting**: Okta has API rate limits; the integration handles this automatically with retries

