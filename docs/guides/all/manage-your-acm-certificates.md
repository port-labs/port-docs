---
displayed_sidebar: null
description: Learn how to monitor and manage your AWS ACM certificates using self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Manage your ACM certificates

This guide demonstrates how to bring your AWS ACM certificate management experience into Port. You will learn how to:

- Ingest ACM certificate data into Port's software catalog using **Port's AWS** integration.
- Set up **self-service actions** to manage ACM certificates (request new certificates, renew certificates, and delete certificates).


## Common use cases

- Monitor the status and expiration of all ACM certificates across accounts from a single view.
- Empower platform teams to automate certificate lifecycle management via GitHub workflows.
- Streamline certificate requests and renewals through self-service actions.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.
<GithubDedicatedRepoHint/>


## Set up data model

When installing the AWS integration in Port, the `AWS Account` blueprint is created by default.  
However, the `ACM Certificate` blueprint is not created automatically so we will need to create it manually.


### Create the ACM certificate blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>AWS ACM Certificate blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "acmCertificate",
      "description": "This blueprint represents an SSL/TLS certificates for your Amazon Web Services-based websites and applications",
      "title": "ACM Certificate",
      "icon": "AWS",
      "schema": {
        "properties": {
          "createdAt": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Created At",
            "format": "date-time"
          },
          "inUse": {
            "icon": "DefaultProperty",
            "type": "boolean",
            "title": "In Use"
          },
          "keyAlgorithm": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Key Algorithm"
          },
          "expirationDate": {
            "type": "string",
            "title": "Expiration Date",
            "format": "date-time"
          },
          "renewalEligibility": {
            "icon": "DefaultProperty",
            "title": "Renewal Eligibility",
            "type": "string",
            "enum": [
              "ELIGIBLE",
              "INELIGIBLE"
            ],
            "enumColors": {
              "ELIGIBLE": "green",
              "INELIGIBLE": "red"
            }
          },
          "status": {
            "icon": "DefaultProperty",
            "title": "Status",
            "type": "string",
            "enum": [
              "ISSUED",
              "EXPIRED",
              "PENDING_VALIDATION",
              "INACTIVE",
              "FAILED",
              "REVOKED",
              "VALIDATION_TIMED_OUT"
            ],
            "enumColors": {
              "ISSUED": "green",
              "EXPIRED": "red",
              "PENDING_VALIDATION": "lightGray",
              "INACTIVE": "red",
              "FAILED": "red",
              "REVOKED": "gold",
              "VALIDATION_TIMED_OUT": "gold"
            }
          },
          "type": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Type"
          },
          "arn": {
            "type": "string",
            "title": "Arn"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "account": {
          "title": "Account",
          "target": "awsAccount",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Update the integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the AWS integration.
3. Add the following YAML block into the editor to ingest ACM certificates from your AWS account:

    <details>
    <summary><b>AWS integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    deleteDependentEntities: true
    createMissingRelatedEntities: true
    enableMergeEntity: true
    resources:
      - kind: AWS::Organizations::Account
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .Id
              title: .Name
              blueprint: '"awsAccount"'
              properties:
                arn: .Arn
                email: .Email
                status: .Status
                joined_method: .JoinedMethod
                joined_timestamp: .JoinedTimestamp | sub(" "; "T")
      - kind: AWS::ACM::Certificate
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .CertificateArn
              title: .DomainName
              blueprint: '"acmCertificate"'
              properties:
                status: .Status
                type: .Type
                arn: .CertificateArn
                renewalEligibility: .RenewalEligibility
                keyAlgorithm: .KeyAlgorithm
                inUse: .InUse
                createdAt: .CreatedAt
                expirationDate: .NotAfter
              relations:
                account: .__AccountId
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

Now let us create self-service actions to manage your ACM certificates directly from Port using GitHub Actions. You will implement workflows to:

1. Request a new ACM certificate.
2. Renew an eligible ACM certificate.
3. Delete an ACM certificate.

To implement these use-cases, follow the steps below:

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `AWS_ACCESS_KEY_ID` - AWS IAM user's access key.
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user's secret access key.
- `AWS_REGION` - AWS region (e.g., `us-east-1`).

:::caution Required permissions
The AWS IAM user must have the following permissions to manage ACM certificates:
- `acm:RequestCertificate`
- `acm:RenewCertificate`
- `acm:DeleteCertificate`
:::


### Request a new ACM certificate

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/request-acm-cert.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Request ACM Certificate GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Request ACM Certificate

on:
  workflow_dispatch:
    inputs:
      domain_name:
        required: true
        description: 'The fully qualified domain name (FQDN) that you want to secure with an ACM certificate'
        type: string
      validation_method:
        required: true
        description: 'The method you want to use to validate that you own or control domain'
        type: string
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  request-acm:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to request public ACM cert with domain name ${{ inputs.domain_name }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Request ACM certificate
        run: aws acm request-certificate --domain-name ${{ inputs.domain_name }} --validation-method ${{ inputs.validation_method }}

      - name: Inform Port about ACM certificate success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ ACM certificate for domain ${{ inputs.domain_name }} requested successfully
          summary: ACM certificate requested successfully

      - name: Inform Port about ACM certificate failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to request ACM certificate for domain ${{ inputs.domain_name }}
          summary: ACM certificate request failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Request ACM Certificate action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "request_acm_certificate",
      "title": "Request ACM Certificate",
      "icon": "AWS",
      "description": "Requests an ACM certificate for use with other Amazon Web Services services",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "domain_name": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "Domain Name",
              "description": "The fully qualified domain name (FQDN), such as www.example.com, that you want to secure with an ACM certificate"
            },
            "validation_method": {
              "icon": "DefaultProperty",
              "title": "Validation Method",
              "description": "The method you want to use if you are requesting a public certificate to validate that you own or control domain",
              "type": "string",
              "default": "DNS",
              "enum": [
                "EMAIL",
                "DNS"
              ],
              "enumColors": {
                "EMAIL": "lightGray",
                "DNS": "lightGray"
              }
            }
          },
          "required": [
            "domain_name",
            "validation_method"
          ],
          "order": [
            "domain_name",
            "validation_method"
          ]
        }
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "request-acm-cert.yaml",
        "workflowInputs": {
          "{{ spreadValue() }}": "{{ .inputs }}",
          "port_context": {
            "runId": "{{ .run.id }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Request ACM Certificate` action in the self-service page. 🎉


### Renew an ACM certificate

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/renew-acm-cert.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Renew ACM Certificate GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Renew ACM Certificate

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  renew-acm-cert:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to Renew ACM certificate with domain ${{ fromJson(inputs.port_context).entity.title }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Renew ACM certificate
        run: aws acm renew-certificate --certificate-arn ${{ fromJson(inputs.port_context).entity.properties.arn }}

      - name: Inform Port about ACM certificate renewal success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ ACM certificate with domain name ${{ fromJson(inputs.port_context).entity.title }} renewed successfully
          summary: ACM certificate renewal completed successfully

      - name: Inform Port about ACM certificate renewal failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to Renew ACM certificate with domain name ${{ fromJson(inputs.port_context).entity.title }}
          summary: ACM certificate renewal failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Renew ACM Certificate action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "renew_acm_certificate",
      "title": "Renew ACM Certificate",
      "icon": "AWS",
      "description": "Renews an eligible ACM certificate",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "condition": {
          "type": "SEARCH",
          "rules": [
            {
              "property": "renewalEligibility",
              "operator": "=",
              "value": "ELIGIBLE"
            }
          ],
          "combinator": "and"
        },
        "blueprintIdentifier": "acmCertificate"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "renew-acm-cert.yaml",
        "workflowInputs": {
          "port_context": {
            "runId": "{{ .run.id }}",
            "entity": "{{ .entity }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Renew ACM Certificate` action in the self-service page. 🎉

:::tip Conditional visibility
The renew action will only be visible for certificates that have `renewalEligibility` set to `ELIGIBLE`. This ensures users can only renew certificates that are actually eligible for renewal.
:::


### Delete an ACM certificate

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/delete-acm-cert.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Delete ACM Certificate GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Delete ACM Certificate

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  delete-acm-cert:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to delete ACM certificate with domain ${{ fromJson(inputs.port_context).entity.title }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Delete ACM certificate
        run: aws acm delete-certificate --certificate-arn ${{ fromJson(inputs.port_context).entity.properties.arn }}

      - name: Inform Port about ACM certificate deletion success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ ACM certificate with domain name ${{ fromJson(inputs.port_context).entity.title }} deleted successfully
          summary: ACM certificate deletion completed successfully

      - name: Inform Port about ACM certificate deletion failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to delete ACM certificate with domain name ${{ fromJson(inputs.port_context).entity.title }}
          summary: ACM certificate deletion failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Delete ACM Certificate action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "delete_acm_certification",
      "title": "Delete ACM Certification",
      "icon": "AWS",
      "description": "Deletes a certificate and its associated private key.",
      "trigger": {
        "type": "self-service",
        "operation": "DELETE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "acmCertificate"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "delete-acm-cert.yaml",
        "workflowInputs": {
          "port_context": {
            "runId": "{{ .run.id }}",
            "entity": "{{ .entity }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Delete ACM Certification` action in the self-service page. 🎉

:::warning Data loss risk
The delete action permanently removes the certificate and its associated private key. This operation cannot be undone, so use it carefully.
:::
