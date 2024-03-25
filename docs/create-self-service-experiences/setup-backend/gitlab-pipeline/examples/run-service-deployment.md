# Run a deployment for a service

In the following guide, you are going to build a self-service action in Port, that executes a GitLab pipeline behind the scenes.

The GitLab pipeline in this example, will run a new deployment and report back the action run status and the deployment entity to Port.

## Prerequisites

- A Port API `CLIENT_ID` and `CLIENT_SECRET`.

## Create a GitLab pipeline

First, we need to set up a GitLab pipeline for our CI/CD flow.

You can use this example of using [Port's API](../../../../build-your-software-catalog/custom-integration/api/api.md) from GitLab CI/CD:

<details>
<summary>Click here to see the code</summary>

```yaml showLineNumbers
stages: # List of stages for jobs, and their order of execution
  - save-port-data
  - deploy
  - report-deployment
  - send-logs
  - update-status

save-port-data: # Example - get the Port API access token and RunId
  stage: save-port-data
  before_script:
    - apt-get -qq update
    - apt-get install -y jq
  script:
    - |
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.port_payload.context.runId')
      echo "RUN_ID=$runId" >> data.env
  artifacts:
    reports:
      dotenv: data.env

deploy-job:
  stage: deploy
  script:
    - echo "Deploying application..."
    ## Enter your deploy logic here

report-deployment: # Example - create a deployment entity
  stage: report-deployment
  script:
    - |
      curl --location --request POST "https://api.getport.io/v1/blueprints/deployment/entities?upsert=true" \
        --header "Authorization: Bearer $ACCESS_TOKEN" \
        --header "Content-Type: application/json" \
        --data-raw '{
          "identifier": "'"$service-$environment"'",
          "properties": {"jobUrl":"'"$CI_JOB_URL"'","imageTag":"latest"},
          "relations": {}
        }'

send-logs: # Example - send Logs of the action run to Port
  stage: send-logs
  script:
    - |
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message": "this is a log test message example"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"

update-status: # Example - update the Action run status as success
  stage: update-status
  image: curlimages/curl:latest
  script:
    - |
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"status":"SUCCESS", "message": {"run_status": "GitLab CI/CD Run completed successfully!"}}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID"
```

</details>

:::important IMPORTANT
In order to trigger GitLab Pipelines through the Port agent, you'll need to [create a GitLab Pipeline trigger token](https://docs.gitlab.com/ee/ci/triggers/).

You can trigger pipelines accross multiple GitLab projects, as long as you have a trigger token with the required permissions.

Trigger tokens are loaded to the Port agent as environment variables.
:::

## Create a Blueprint

Let’s configure a new blueprint, named `Deployment`, its base structure is:

```json showLineNumbers
{
  "identifier": "deployment",
  "title": "Deployment",
  "icon": "Deployment",
  "schema": {
    "properties": {
      "jobUrl": {
        "type": "string",
        "format": "url",
        "title": "Job URL"
      },
      "deployingUser": {
        "type": "string",
        "title": "Deploying User"
      },
      "imageTag": {
        "type": "string",
        "title": "Image Tag"
      },
      "commitSha": {
        "type": "string",
        "title": "Commit SHA"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

## Create a Port action

Now let’s configure a self-service action. Add a `CREATE` action that will be triggered every time a developer wants to initiate a new deployment for a service.

Here is the JSON of the action:

```json showLineNumbers
{
  "identifier": "runGitLabPipline",
  "title": "Trigger Gitlab Pipeline",
  "icon": "DeployedAt",
  "userInputs": {
    "properties": {
      "ref": {
        "type": "string",
        "title": "Ref"
      },
      "pipelineVariable1": {
        "type": "string",
        "title": "First Pipeline Variable "
      },
      "pipelineVariable2": {
        "type": "string",
        "title": "Second Pipeline Variable"
      }
    }
  },
  "invocationMethod": {
    "type": "GITLAB",
    "projectName": "project",
    "groupName": "group",
    "defaultRef": "main",
    "agent": true,
    "omitPayload": false,
    "omitUserInputs": false
  },
  "trigger": "CREATE",
  "description": "Trigger a GitLab Pipeline through the Port Agent",
  "requiredApproval": false
}
```

### Invocation method properties

| Field            | Type      | Description                                                                                                                                                                                                                                                                                                                                                 | Example values                       |
| ---------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `type`           | `string`  | Defines the self-service action destination type                                                                                                                                                                                                                                                                                                            | `GITLAB`                             |
| `agent`          | `boolean` | Defines whether to use [Port Agent](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/port-execution-agent.md) for execution or not.                                                                                                                                                                                                                                               | must be `true` in GitLab action type |
| `projectName`    | `string`  | Defines the GitLab project name                                                                                                                                                                                                                                                                                                                             | `port`                               |
| `groupName`      | `string`  | Defines the GitLab group name                                                                                                                                                                                                                                                                                                                               | `port-labs`                          |
| `defaultRef`     | `string`  | The default ref (branch / tag name) we want the action to use. <br></br> `defaultRef` can be overriden dynamically,<br></br> by adding `ref` as user input. <br></br> If not set, the agent triggers `main` branch                                                                                                                                          | `main`                               |
| `omitPayload`    | `boolean` | Flag to control whether to add [`port_payload`](/create-self-service-experiences/reflect-action-progress/#action-run-json-structure) JSON string to the GitLab pipeline trigger payload (default: `false`). If set to true, the payload will not be sent as part of the body.                                                                | `true` or `false`                    |
| `omitUserInputs` | `boolean` | Flag to control whether to send the user inputs of the Port action as [GitLab CI/CD variables](https://docs.gitlab.com/ee/ci/variables/) to the GitLab pipeline. <br></br> By default, the user inputs are passed as variables (default: `false`). <br></br> When disabled, you can still get the user inputs from the `port_payload` (unless omitted too). | `true` or `false`                    |
