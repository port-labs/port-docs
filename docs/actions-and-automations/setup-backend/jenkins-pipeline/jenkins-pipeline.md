import Image from "@theme/IdealImage";

# Jenkins pipeline

The Jenkins backend allows you to trigger Jenkins pipelines for your self-service actions and automations, using webhooks.

<img src="/img/self-service-actions/setup-backend/jenkins-pipeline/jenkins-illustration.png" width="90%" border='1px' />
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

3. Port publishes an invoked `WEBHOOK` via a `POST` request to `https://{JENKINS_URL}/generic-webhook-trigger/invoke`

   An example flow would be:

   - A developer asks to run a Jenkins pipeline.
   - Port sends a `POST` request with the action payload to the Jenkins webhook `URL`.
   - The Jenkins webhook receives the new action request.
   - The Jenkins webhook triggers the pipeline.

## Prerequisites

Jenkins required plugins:

- [Generic webhook trigger](https://plugins.jenkins.io/generic-webhook-trigger/) - Allows triggering Jenkins pipelines using webhook calls.

## Setting up the webhook

### Enabling webhook trigger for a pipeline

To enable triggering a Jenkins pipeline using a webhook invocation, you will need to add "Generic Webhook Trigger" as a build trigger to your pipeline.

In your job's page, enter the **Configuration** tab, and scroll down to the **Build Triggers** section. Check the `Generic Webhook Trigger` box:

<img src="/img/self-service-actions/setup-backend/jenkins-pipeline/check-generic-webhook-option.png" width="50%" border='1px' />
<br/><br/>

By default, when enabling the webhook trigger for a job, it can be triggered by sending an event to `http://JENKINS_URL/generic-webhook-trigger/invoke`.  
This means that, if not configured otherwise, all jobs will be triggered when sending an event to this route. It is recommended to set up a [job token](jenkins-pipeline.md#token-setup) to avoid running unwanted jobs.

### Defining variables

After checking the box, look for the **Post content parameters** section. This is where you will define the variables which will be passed to your pipeline run.

- The `Variable` field value should match the name of the variable that is defined in your job configuration and expected by the job run.
- The `Expression` field should be set to `JSONPath` and be directed to the relevant property sent by the Port action.


<img src="/img/self-service-actions/setup-backend/jenkins-pipeline/define-variables.png" width="60%" border='1px' />

### Token setup

The [token parameter](https://plugins.jenkins.io/generic-webhook-trigger/#plugin-content-token-parameter) allows triggering a specific job (or group of jobs).

To set up a token for you job, scroll down to the **Token** section, and provide a job token:

<img src="/img/self-service-actions/setup-backend/jenkins-pipeline/configure-token.png" width="90%" border='1px' />

After saving, you will be able to specifically trigger this job job, using the following URL:

```text showLineNumbers
http://JENKINS_URL/generic-webhook-trigger/invoke?token=<JOB_TOKEN>
```

:::tip Advanced configuration
For advanced configuration of your Jenkins webhook trigger, check out the [Generic webhook trigger](https://plugins.jenkins.io/generic-webhook-trigger/) plugin page.
:::

### Securing your webhook

It is possible to add a protection layer to your exposed pipelines by [configuring whitelisting](https://plugins.jenkins.io/generic-webhook-trigger/#plugin-content-whitelist-hosts).

Whitelisting gives you the following security options:

- Limit the list of IP addresses that can send a request that triggers the pipeline.
- Add [validation](/actions-and-automations/setup-backend/webhook/signature-verification) for the webhook payload content to verify that it really originated from Port.

Here is an example of the required configuration:

<img src="/img/self-service-actions/setup-backend/jenkins-pipeline/validate-webhook.png" width="100%" border='1px' />
<br/><br/>

:::info Important

- The IP field should be set to one of our hosted outbound WEBHOOK Gateway addresses: `44.221.30.248`, `44.193.148.179`, `34.197.132.205`, `3.251.12.205`, `34.252.219.131` or `54.75.236.107`.
  - For more information about Port's outbound calls, check out Port's [actions security](/actions-and-automations/create-self-service-experiences/security/security.md) page.
- In the **HMAC Secret** field, choose a secret containing your `port-client-secret`.

If this secret doesn't already exist, create a `secret text` type secret using [this guide](https://www.jenkins.io/doc/book/using/using-credentials/). The value of the secret should be your `Port Client Secret` which can be found by following the guide [here](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
:::

## Configuration

Once you have set up the webhook trigger in Jenkins, use your new webhook URL in the configuration of your self-service action or automation.

### Use Port agent

The [Port execution agent](/actions-and-automations/setup-backend/webhook/port-execution-agent/) provides you with a secure and convenient way to act upon webhook invocations of self-Service actions and automations.  
The agent pulls the new invocation event from your dedicated Kafka topic, and sends it to the URL you specified.  

If you prefer to send a webhook without using the agent, you can [validate the webhook signature](https://docs.port.io/create-self-service-experiences/setup-backend/webhook/signature-verification) for increased security.

To use the agent, set the `agent` field to `true` in the `invocationMethod` object, or set the `Use self-hosted agent` toggle to `Yes` if using the UI.

## Examples

For guides and examples of self-service actions using a Jenkins pipeline as the backend, check out the [**guides section**](/guides?tags=Jenkins&tags=Actions).