# Azure pipeline

The Azure backend can trigger [Azure pipelines](https://azure.microsoft.com/en-us/products/devops/pipelines) for both self-service actions and automations, using [incoming webhook triggers](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/resources?view=azure-devops&tabs=schema#define-a-webhooks-resource).

<img src="/img/self-service-actions/portAzurePipelineArchitecture.png" width="90%" border='1px' />
<br/><br/>

The steps shown in the image above are as follows:

1. A self-service action or automation is invoked in Port.
2. Port signs the action payload using SHA-1 with your Port [`clientSecret`](/build-your-software-catalog/custom-integration/api/api.md#find-your-port-credentials) value and puts it in the `x-port-signature` request header.

   :::info Webhook security
   Verifying the webhook request using the request headers provides the following benefits:

   - Ensures that the request payload has not been tampered with.
   - Ensures that the sender of the message is Port.
   - Ensures that the received message is not a replay of an older message.

   :::

3. Port publishes an invoked `WEBHOOK` via a `POST` request to `https://dev.azure.com/{org_name}/_apis/public/distributedtask/webhooks/{webhook_name}?api-version=6.0-preview`

An example flow would be:

1. A developer asks to run an Azure pipeline, using a self-service action.
2. Port sends a `POST` request with the action payload to the Azure webhook `URL`.
3. The Azure webhook receives the new action request.
4. The Azure webhook triggers the pipeline.

## Define Incoming Webhook in Azure

To define an incoming webhook in Azure, follow the steps below:

1. **Create the Service Connection**
    - In your Azure DevOps project, go to **Project Settings**.
    - Under Pipelines, click on **Service connections**.
    - Click the Create service connection button.
    - Choose **Incoming WebHook** as the type.
    - Fill in the following fields:
        - **Webhook Name**: The webhook name e.g. "port_trigger"
        - **Service connection name**: The name of the service connection (e.g., "port_trigger").
        - **Secret key**: Enter your Port `clientSecret` value.
        - **Headers**: Type in `x-port-signature`.
    - Check `Grant access to all pipelines`
    - Click `Save`.

2. **Use the Webhook in Your Pipeline**
    - Add the service connection resources in the Azure pipeline yaml:
      ```yaml
      resources:
        webhooks:
          - webhook: { webhookName }
            connection: { Service connection name }
      ```
      The complete documentation showing how to configure Azure incoming webhooks can be found [here](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/resources?view=azure-devops&tabs=schema#define-a-webhooks-resource).

## Configuration

When using this backend, you need to provide the following:

- **ADO organization name** - can be found in your URL: `https://dev.azure.com/{AZURE-DEVOPS-ORG}`.
- **Webhook name** - the name you gave to the webhook resource in the Azure yaml pipeline file.

## Examples

For complete examples of self-service actions using Azure pipelines as the backend, check out the [guides section](/guides?tags=Azure&tags=Actions).