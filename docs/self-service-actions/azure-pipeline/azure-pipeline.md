# Azure Pipeline Self-Service Actions

Port can trigger Azure pipeline based on a customer incoming webhook provided and the organization name.

![Port Azure pipeline Architecture](../../../static/img/self-service-actions/portAzurePipelineArchitecture.png)

The steps shown in the image above are as follows:

1. Port generates an invocation of Action.
2. Port signs the payload using SHA-1 with the `clientSecret` value and puts it in the request header called `X-Port-Signature`.

   :::info WEBHOOK SECURITY
   Verifying the webhook request using the request headers provides the following benefits:

   - Ensures that the request payload has not been tampered with
   - Ensures that the sender of the message is Port
   - Ensures that the received message is not a replay of an older message

   :::

3. Port publishes an invoked `WEBHOOK` via a `POST` request to `https://dev.azure.com/{org_name}/_apis/public/distributedtask/webhooks/{webhook_name}?api-version=6.0-preview`

An example flow would be:

4. A developer asks to run a azure pipeline by triggering a webhook;
5. The action is sent a `POST` request to the azure webhook `URL`;
6. An Azure webhook is triggered by this new action message;
7. The Azure webhook runs the pipeline;

:::info triggering workflow chains
A workflow triggered using the `workflow_dispatch` trigger is self-contained. This means its actions and effects over the repository cannot trigger other automatic workflows.

1. A developer invokes a "provision new microservice in monorepo" workflow;
2. The workflow opens a new PR in the target repository based on a pre-defined template;
3. The repository also has a workflow which is automatically triggered using the `on: pull_request: types: "opened"` trigger;
4. In this instance, the automatic PR workflow will not be triggered.

:::

## Define Incoming Webhook in Azure

To define an incoming webhook in Azure, follow the steps below:

1. Create Service connection Incoming WebHook;
2. Put `clientSecret` value the Secret key field;
3. Put the header `X-Port-Signature` in the `Headers` field;
4. Enter the service connection name in the `Service connection name` field;
5. Add service connection resources in the Azure yaml pipeline:
   ```yaml
    resources:
      webhooks:
        - webhook: {webhookName}
        connection: {Service connection name}
   ```
   The full docs of setting Azure incoming webhook can be found [here](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/resources?view=azure-devops&tabs=schema#define-a-webhooks-resource).
