---
sidebar_position: 4
---

# Setting up a basic change log listener using AWS Lambda

In this guide, we will show how to deploy a new `AWS Lambda function` that will subscribe to the `change.log` topic and react to changes in our infrastructure as reported by Port.

## Prerequisites

- AWS CLI installed and configured to your desired AWS account
- A Port API `CLIENT_ID` and `CLIENT_SECRET`
- Connection credentials to the Kafka topic provided to you by Port, should look similar to this:

```json showLineNumbers
KAFKA_BROKERS=b-1-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196,b-2-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196,b-3-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196
KAFKA_RUNS_TOPIC=YOUR_ORG_ID.change.log
KAFKA_AUTHENTICATION_MECHANISM=scram-sha-512
KAFKA_ENABLE_SSL=true
KAFKA_USERNAME=YOUR_KAFKA_USERNAME
KAFKA_PASSWORD=YOUR_KAFKA_PASSWORD
```

You can always refer to our examples [code repository](https://github.com/port-labs/port-serverless-examples) to view the example shown here, and also other similar examples you can use to get started quickly

:::note
This repo is `Private` at the moment, so you’ll get a 404.
Please contact us with your GitHub user for access.
:::

Interaction with Port will be performed primarily using the API in this example, but of course every action can be performed using the web UI as well.

## Scenario

You want to learn about Port’s change log capabilities, In order to do that, you want to create a new execution function that frees up or extends the storage in your VM, whenever the amount of free storage gets too low

## Creating the VM blueprint

Let’s configure a `VM` blueprint, the blueprint base structure is:

```json showLineNumbers
{
  "identifier": "vm",
  "title": "VM",
  "icon": "Server",
  "schema": {
    "properties": {
      "region": {
        "title": "Region",
        "type": "string",
        "description": "Region of the VM"
      },
      "cpu_cores": {
        "title": "CPU Cores",
        "type": "number",
        "description": "Number of allocated CPU cores"
      },
      "memory_size": {
        "title": "Memory Size ",
        "type": "number",
        "description": "Amount of allocated memory (GB)"
      },
      "storage_size": {
        "title": "Storage Size",
        "type": "number",
        "description": "Amount of allocated storage (GB)"
      },
      "free_storage" :{
        "title": "Free Storage",
        "type": "number",
        "description": "Amount of free storage (GB)"
      },
      "deployed": {
        "title": "Deploy Status",
        "type": "string",
        "description": "The deployment status of this VM"
      }
    },
    "required": []
  },
  "dataSource": "Port",
  "disableEditing": false,
  "enableResponsibleTeamEdit": false,
  "disabledProperties": [],
  "disabledRelations": [],
  "formulaProperties": {}
}
```

Here is code in `python` to create this blueprint (remember to insert your `CLIENT_ID` and `CLIENT_SECRET` in order to get an access token)

<details>
<summary>Click here to see the code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v0.1'

credentials = {'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET}

token_response = requests.get(f'{API_URL}/auth/access_token', params=credentials)

access_token = token_response.json()['accessToken']

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint = {
    "identifier": "vm",
    "title": "VM",
    "icon": "Server",
    "schema": {
        "properties": {
            "region": {
                "title": "Region",
                "type": "string",
                "description": "Region of the VM"
            },
            "cpu_cores": {
                "title": "CPU Cores",
                "type": "number",
                "description": "Number of allocated CPU cores"
            },
            "memory_size": {
                "title": "Memory Size ",
                "type": "number",
                "description": "Amount of allocated memory (GB)"
            },
            "storage_size": {
                "title": "Storage Size",
                "type": "number",
                "description": "Amount of allocated storage (GB)"
            },
            "free_storage": {
                "title": "Free Storage",
                "type": "number",
                "description": "Amount of free storage"
            },
            "deployed": {
                "title": "Deploy Status",
                "type": "string",
                "description": "The deployment status of this VM"
            }
        },
        "required": []
    },
    "dataSource": "Port",
    "disableEditing": False,
    "enableResponsibleTeamEdit": False,
    "disabledProperties": [],
    "disabledRelations": [],
    "formulaProperties": {}
}

response = requests.post(f'{API_URL}/blueprints', json=blueprint, headers=headers)

print(response.json())
```

</details>

Now that we have a blueprint for our VM, we need to deploy our AWS Lambda listener, that will fix the storage on our VM whenever an issue occurs

## Setting up our AWS resources

In this example, we will deploy an AWS Lambda function written in python

Our AWS setup will require the following resources:

- A secret stored in Secrets Manager with the Kafka authentication credentials
- An AWS Lambda execution role with access to the new secret
- An AWS Lambda layer for our extra python libraries
- Our AWS Lambda configured with our example python code, the code layer and execution role we created. Configured with a Kafka Trigger

### Creating a secret for our Lambda

Our Lambda function will use a `secret` configured in AWS Secret Manager to authenticate with the personal Kafka topic provided by Port, let’s go ahead and create that secret in the AWS CLI:

```bash showLineNumbers
# Remember to replace YOUR_KAFKA_USERNAME and YOUR_KAFKA_PASSWORD with the real username and password provided to you by Port
# You can change the secret name to any name that works for you
aws secretsmanager create-secret --name "PortKafkaAuthCredentials" --secret-string '{"username":"YOUR_KAFKA_USERNAME", "password":"YOUR_KAFKA_PASSWORD"}'
```

You should see output similar to the following:

```json showLineNumbers
{
    "ARN": "arn:aws:secretsmanager:eu-west-1:1111111111:secret:PortKafkaAuthCredentials-aaaaaa",
    "Name": "PortKafkaAuthCredentials",
    "VersionId": "aaaaa00a-00aa-0000-00a0-00000aa00a0a"
}
```

:::info saving the `ARN`
Make sure to save the `ARN` value, we will need it to create an execution role for our Lambda function which can access the newly created secret.
:::

### Creating an execution role

Before we deploy our Lambda function, it needs an [execution role](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html) with access to the Kafka username and password secret we created, let’s create a [basic execution role](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html#with-userapp-walkthrough-custom-events-create-iam-role) with `assumeRole` permission and basic permissions for `cloudWatch`

```bash showLineNumbers
aws iam create-role --role-name lambda-port-execution-role --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

You should see output similar to the following:

```json showLineNumbers
{
    "Role": {
        "Path": "/",
        "RoleName": "lambda-port-execution-role",
        "RoleId": "AROAQFOXMPL6TZ6ITKWND",
        "Arn": "arn:aws:iam::123456789012:role/lambda-port-execution-role",
        "CreateDate": "2020-01-17T23:19:12Z",
        "AssumeRolePolicyDocument": {
				    "Version": "2012-10-17",
				    "Statement": [
				        {
				            "Effect": "Allow",
				            "Action": [
				                "secretsmanager:GetResourcePolicy",
				                "secretsmanager:GetSecretValue",
				                "secretsmanager:DescribeSecret",
				                "secretsmanager:ListSecretVersionIds"
				            ],
				            "Resource": [
				                "arn:aws:secretsmanager:eu-west-1:1111111111:secret:PortKafkaAuthCredentials-aaaaaa",
				            ]
				        },
				        {
				            "Effect": "Allow",
				            "Action": "secretsmanager:ListSecrets",
				            "Resource": "*"
				        }
				    ]
				}
    }
}
```

:::info saving the `ARN`
Again, make sure to save the `Arn` value, we will use it when deploying our Lambda function
:::

Let’s attach basic Lambda execution permissions to this role with the following command:

```bash showLineNumbers
aws iam attach-role-policy --role-name lambda-port-execution-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

Now let’s add the following policy (You can refer to this [AWS document](https://docs.aws.amazon.com/mediaconnect/latest/ug/iam-policy-examples-asm-secrets.html) for more information), we’ll create a file called `execution-policy.json` and paste the following content:

:::note
Remember to replace `ARN` value listed under `Resource` with the `ARN` you received as output when creating the **secret**
:::


```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetResourcePolicy",
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecretVersionIds"
            ],
            "Resource": [
                "arn:aws:secretsmanager:eu-west-1:1111111111:secret:PortKafkaAuthCredentials-aaaaaa"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "secretsmanager:ListSecrets",
            "Resource": "*"
        }
    ]
}
```

Now let’s create the execution role (we’re assuming the `execution-policy.json` file is in the same directory as the terminal you are running the command from:

```bash showLineNumbers
aws iam put-role-policy --role-name lambda-port-execution-role --policy-name managed-kafka-secret-access-policy --policy-document file://execution-policy.json
```

### Creating an AWS Lambda layer

Now let’s create a [Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) that will include the extra libraries our Lambda will use.

Our Lambda only needs the [requests](https://pypi.org/project/requests/) library, but we also threw in [jsonpickle](https://pypi.org/project/jsonpickle/0.3.0/) for some of the log output to make the Lambda logs more verbose and easier to understand when getting started modifying the code.

Let’s just run all of the commands to both create the layer zip and deploy it to AWS (be sure to specify the region that you want the layer and lambda to be available in):

```bash showLineNumbers
# Create layer directory and specify requests as a required library
mkdir lambda_layer
cd lambda_layer
echo requests==2.28.1 > requirements.txt
echo jsonpickle==2.2.0 >> requirements.txt

# Create layer based on requirements.txt in python/ directory
pip install -r requirements.txt --platform manylinux2014_x86_64 --target ./python --only-binary=:all:
# Create a zip of the layer
zip -r layer.zip python
# Upload a new layer version to AWS
aws lambda publish-layer-version --layer-name lambda_port_execution_package_layer --description "Python pacakges layer for lambda Port execution example" --compatible-runtimes python3.6 python3.7 python3.8 python3.9 --zip-file fileb://layer.zip --region eu-west-1
```

You should see output similar to the following:

```json showLineNumbers
{
    "Content": {
        "Location": "https://awslambda-eu-west-1-layers.s3.eu-west-1.amazonaws.com/snapshots/123456789012/my-layer-4aaa2fbb-ff77-4b0a-ad92-5b78a716a96a?versionId=27iWyA73cCAYqyH...",
        "CodeSha256": "tv9jJO+rPbXUUXuRKi7CwHzKtLDkDRJLB3cC3Z/ouXo=",
        "CodeSize": 169
    },
    "LayerArn": "arn:aws:lambda:eu-west-1:123456789012:layer:lambda_port_execution_package_layer",
    "LayerVersionArn": "arn:aws:lambda:eu-west-1:123456789012:layer:lambda_port_execution_package_layer:1",
    "Description": "Python pacakges layer for lambda Port execution example",
    "CreatedDate": "2018-11-14T23:03:52.894+0000",
    "Version": 1,
    "CompatibleArchitectures": [
        "x86_64"
     ],
    "LicenseInfo": "MIT",
    "CompatibleRuntimes": [
        "python3.6",
        "python3.7",
        "python3.8",
				"python3.9"
    ]
}
```

:::info
Again, make sure to save the `LayerVersionArn` value, we will use it when deploying our Lambda function
:::

### Creating the Lambda function

Now we can get to creating our Lambda function, the function is very basic and has specific comments where your actual execution runner logic should go.

<details>
<summary>Click here to see the function code</summary>

```python showLineNumbers
# file: lambda_function.py
# lambda entrypoint: lambda_handler

import base64
import os
import logging
from typing import Union
import jsonpickle
import json
import requests
import traceback

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CLIENT_ID = os.environ['PORT_CLIENT_ID']
CLIENT_SECRET = os.environ['PORT_CLIENT_SECRET']

CREATE_TRIGGER = 'CREATE'

API_URL = 'https://api.getport.io/v0.1'

def get_port_api_token():
    '''
    Get a Port API access token

    This function uses a global ``CLIENT_ID`` and ``CLIENT_SECRET``
    '''
    credentials = {'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET}

    token_response = requests.get(f'{API_URL}/auth/access_token', params=credentials)
    access_token = token_response.json()['accessToken']

    return access_token

def update_entity_prop_value(blueprint_identifier: str, identifier: str, property_name: str, property_value: Union[str, int]):
    '''
    Patches a Port entity based on ``entity_props``
    '''
    logger.info('Fetching token')
    token = get_port_api_token()

    headers = {
        'Authorization': f'Bearer {token}'
    }

    entity = {
        'properties': {
            property_name: property_value
        }
    }

    logger.info('Updating entity property values:')
    logger.info(json.dumps(entity))
    response = requests.patch(f'{API_URL}/blueprints/{blueprint_identifier}/entities/{identifier}', json=entity, headers=headers)
    logger.info(response.status_code)
    logger.info(json.dumps(response.json()))

def lambda_handler(event, context):
    '''
    Receives an event from AWS, if configured with a Kafka Trigger, the event includes an array of base64 encoded messages from the different topic partitions
    '''
    logger.info('## ENVIRONMENT VARIABLES\r' + jsonpickle.encode(dict(**os.environ)))
    logger.info('## EVENT\r' + jsonpickle.encode(event))
    logger.info('## CONTEXT\r' + jsonpickle.encode(context))
    for messages in event['records'].values():
        for encoded_message in messages:
            try:
                message_json_string = base64.b64decode(encoded_message['value']).decode('utf-8')
                logger.info('Received message:')
                logger.info(message_json_string)
                message = json.loads(message_json_string)

                change_type = message['action']
                resource_type = message['resourceType']

                # "message" includes one change that occurred in the service catalog
                # since all changes that happen in the catalog will trigger this Lambda, it would be a good idea to add separate handler
                # functions to keep code maintainable

                # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
                # Your handler code for the changes in the catalog comes here #
                # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

                # Here is sample code to find the change in VM free storage space
                if change_type == 'UPDATE' and resource_type == 'entity':
                    blueprint_identifier = message['context']['blueprint']
                    entity_after_change_state = message['diff']['after']
                    entity_identifier = entity_after_change_state["identifier"]
                    entity_title = entity_after_change_state["title"]
                    entity_props_after_change = entity_after_change_state['properties']
                    entity_total_storage = entity_props_after_change['storage_size']
                    entity_free_storage = entity_props_after_change['free_storage']

                    if entity_total_storage * 0.1 > entity_free_storage:
                        logger.warning(f'Entity {entity_title} free storage is too low, fixing...')
                        # Assume a call to direct storage extensions using cloud provider SDK
                        # Or a call to some scheduled task that frees up storage on the VM
                        logger.info(f'Entity {entity_title} Storage freed up, updating in Port')
                        free_storage_after_cleanup = 4
                        update_entity_prop_value(blueprint_identifier, entity_identifier, 'free_storage', free_storage_after_cleanup)
            except Exception as e:
                traceback.print_exc()
                logger.warn(f'Error: {e}')
    return {"message": "ok"}
```

</details>    

### Deploying the Lambda function

In order to deploy our Lambda function, we will run the following commands from the terminal.

:::info using our saved `ARN`s
Be sure to replace `ROLE_ARN` with the ARN we received an output when we created an execution role for the Lambda (Note the comment where you need to paste in the Lambda code to the new file):
:::


```python showLineNumbers
mkdir port_execution_lambda
cd port_execution_lambda
touch lambda_function.py
# Open lambda_function.py in your favorite editor or IDE and paste
# in the python code written above
# Once the code is in, we can package the lambda and deploy it
zip -FSr function.zip lambda_function.py
# Now let's deploy the Lambda to AWS
aws lambda create-function --function-name port-changelog-lambda \
--zip-file fileb://function.zip --handler lambda_function.lambda_handler --runtime python3.9 \
--role ROLE_ARN --timeout 30
```

You should see output similar to the following:

```json showLineNumbers
{
    "FunctionName": "port-execution-lambda",
    "FunctionArn": "arn:aws:lambda:us-east-2:123456789012:function:port-changelog-lambda",
    "Runtime": "python3.9",
    "Role": "arn:aws:iam::123456789012:role/lambda-port-execution-role",
    "Handler": "lambda_function.lambda_handler",
    "CodeSha256": "FpFMvUhayLkOoVBpNuNiIVML/tuGv2iJQ7t0yWVTU8c=",
    "Version": "$LATEST",
    "TracingConfig": {
        "Mode": "PassThrough"
    },
    "RevisionId": "88ebe1e1-bfdf-4dc3-84de-3017268fa1ff",
    ...
}
```

We are just a few steps away from a complete execution flow!

### Putting everything together

There are just a few more steps left:

- Add our layer to the Lambda function
- Add the Port `CLIENT_ID` and `CLIENT_SECRET` as environment variables to our Lambda
- Add the Kafka trigger

In order to add the layer, we just need to run a simple CLI command:

```bash showLineNumbers
# Be sure to replace the LAYER_VERSION_ARN with the value you saved 
# from the layer creation output
aws lambda update-function-configuration --function-name port-changelog-lambda \
--layers LAYER_VERSION_ARN
```

You should see output showing that the `Layers` array of the Lambda now includes our layer

Now let’s add the client_id and secret variables:

```bash showLineNumbers
# Be sure to replace YOUR_CLIENT_ID and YOUR_CLIENT_SECRET with real values
aws lambda update-function-configuration --function-name port-changelog-lambda --environment "Variables={PORT_CLIENT_ID=YOUR_CLIENT_ID,PORT_CLIENT_SECRET=YOUR_CLIENT_SECRET}" --query "Environment"
```

You should see as output all of the environment variables configured for your Lambda

:::note
If your function needs multiple other environment variables, it would be easier to put them all in a JSON file (for example `environment.json`) and run the following command:

```bash showLineNumbers
aws lambda update-function-configuration --function-name port-changelog-lambda --environment file://environment.json --query "Environment"
```
:::

Time to add our Kafka trigger

```bash showLineNumbers
# Remember to replace YOUR_ORG_ID and SECRET_ARN
aws lambda create-event-source-mapping --topics YOUR_ORG_ID.change.log --source-access-configuration Type=SASL_SCRAM_512_AUTH,URI=SECRET_ARN \
          --function-name port-changelog-lambda \
          --batch-size 1 --starting-position LATEST \
          --self-managed-event-source '{"Endpoints":{"KAFKA_BOOTSTRAP_SERVERS":["b-1-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196", "b-2-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196", "b-3-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196"]}}'
```

## Reacting to changes

Now that we have our Lambda configured with a Kafka trigger, every change we make in our **Service Catalog** will generate a new message in the dedicated Kafka topic we specified in the trigger, that message will be sent to the Lambda function we deployed, with all of the input data required to understand what change occurred exactly, so we can act accordingly.

For more information on the data format of managed Apache Kafka triggers, refer to the [AWS docs](https://docs.aws.amazon.com/lambda/latest/dg/with-kafka.html), the code we wrote in the `lambda_handler` function already goes over all of the new messages, parses them, decodes and converts to a python dictionary for ease of use.

Let’s go ahead and create a VM entity and specify the total storage as 10 GB, and also specify that the initial free storage is 6 GB

Here is the JSON for this `VM` entity:

```json showLineNumbers
{
    "title": "Storage Example VM",
    "team": "",
    "blueprint": "vm",
    "properties": {
        "region": "eu-west-1",
        "cpu_cores": 2,
        "memory_size": 4,
        "storage_size": 10,
        "deployed": "Deployed",
        "free_storage": 6
    },
    "relations": {},
    "identifier": "storage-example"
}
```

Here is code in `python` to create this VM (remember to insert your `CLIENT_ID` and `CLIENT_SECRET` in order to get an access token)

<details>
<summary>Click here to see the code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v0.1'

credentials = {'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET}

token_response = requests.get(f'{API_URL}/auth/access_token', params=credentials)

access_token = token_response.json()['accessToken']

blueprint_identifier = 'vm'

headers = {
    'Authorization': f'Bearer {access_token}'
}

entity = {
    "title": "Storage Example VM",
    "team": "",
    "properties": {
        "region": "eu-west-1",
        "cpu_cores": 2,
        "memory_size": 4,
        "storage_size": 10,
        "deployed": "Deployed",
        "free_storage": 6
    },
    "relations": {},
    "identifier": "storage-example"
}

response = requests.post(f'{API_URL}/blueprints/{blueprint_identifier}/entities', json=entity, headers=headers)

print(response.json())
```

</details>
    
Now let’s simulate an instance where the free storage in our VM has dropped below 10% of the total available storage. We will do that using python code that sends a PATCH request that will update the `free_storage` property on our VM:

<details>
<summary>Click here to see the API call code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v0.1'

credentials = {'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET}

token_response = requests.get(f'{API_URL}/auth/access_token', params=credentials)

access_token = token_response.json()['accessToken']

blueprint_identifier = 'vm'

headers = {
    'Authorization': f'Bearer {access_token}'
}

entity_identifier = "storage-example"

patch_body = {
    "properties": {
        "free_storage": 0.5
    }
}

response = requests.patch(f'{API_URL}/blueprints/{blueprint_identifier}/entities/{entity_identifier}', json=patch_body, headers=headers)

print(response.json())
```

</details>
    
This **change** will automatically send a message to our Kafka topic.

Now if we go to the CloudWatch logs for our Lambda function (Accessible in the AWS console through Lambda→functions→port-changelog-lambda→Monitor→Logs→View logs in CloudWatch), we should see a log of the latest execution of our Lambda, which also includes the actual message received, and a log of the actions taken by our python code:

![Cloudwatch logs example](../../../static/img/platform-overview/self-service-actions/basic-changelog-aws-lambda-example/exampleCloudwatchlogsWithTopicMessage.png)

Here is an example of the request payload received from Port, inside the Kafka message (Note the `before` and `after` keys showing the difference in our VM entity properties):

```json showLineNumbers
{
    "action": "UPDATE",
    "resourceType": "entity",
    "status": "SUCCESS",
    "trigger": {
        "by": {
            "orgId": "org_sYG4DOJZNGy8bYnt",
            "userId": "h2Mf13aRSCYQCUPIcqufoP4XRLwAt8Od@clients"
        },
        "at": "2022-07-15T16:44:56.288Z",
        "origin": "API"
    },
    "context": {
        "entity": "storage-example",
        "blueprint": "vm"
    },
    "diff": {
        "before": {
            "identifier": "storage-example",
            "title": "Storage Example VM",
            "blueprint": "vm",
            "properties": {
                "region": "eu-west-1",
                "cpu_cores": 2,
                "memory_size": 4,
                "storage_size": 10,
                "deployed": "Deployed",
                "free_storage": 6
            },
            "relations": {},
            "createdAt": "2022-07-15T16:34:47.385Z",
            "createdBy": "h2Mf13aRSCYQCUPIcqufoP4XRLwAt8Od@clients",
            "updatedAt": "2022-07-15T16:34:47.385Z",
            "updatedBy": "h2Mf13aRSCYQCUPIcqufoP4XRLwAt8Od@clients"
        },
        "after": {
            "identifier": "storage-example",
            "title": "Storage Example VM",
            "blueprint": "vm",
            "properties": {
                "region": "eu-west-1",
                "cpu_cores": 2,
                "memory_size": 4,
                "storage_size": 10,
                "deployed": "Deployed",
                "free_storage": 0.5
            },
            "relations": {},
            "createdAt": "2022-07-15T16:34:47.385Z",
            "createdBy": "h2Mf13aRSCYQCUPIcqufoP4XRLwAt8Od@clients",
            "updatedAt": "2022-07-15T16:34:47.385Z",
            "updatedBy": "h2Mf13aRSCYQCUPIcqufoP4XRLwAt8Od@clients"
        }
    }
}
```

In addition to seeing the topic message in Cloudwatch, our Lambda function code should also update the VM entity, and give it a new free storage value.

## Next steps

This was just a very basic example on how to listen and react to changes in the Software Catalog, we left placeholder code for you to insert your own custom logic that fits your infrastructure.

Now that you have a changelog runner, maybe try exploring our [service pipeline example](./execution-service-pipeline-example), or dive deeper into our [execution topics](./port-execution-topics)