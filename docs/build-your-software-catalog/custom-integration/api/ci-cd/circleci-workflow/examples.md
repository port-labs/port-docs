import ExampleImageBlueprint from "../\_ci_example_image_blueprint.mdx";
import ExampleCiJobBlueprint from "../\_ci_example_ci_job_blueprint.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Examples

## Basic create/update example

In this example you will create blueprints for `ciJob` and `image` entities, and a relation between them. Then you will add some Python code to create new entities in Port every time the CircleCI workflow is triggered:

<ExampleImageBlueprint />

<ExampleCiJobBlueprint />

After creating the blueprint, you can add a Python script for creating/updating a Port entity:

```python showLineNumber
import os
import requests
import json

# Env vars passed by the CircleCI context
# highlight-start
CLIENT_ID = os.environ['PORT_CLIENT_ID']
CLIENT_SECRET = os.environ['PORT_CLIENT_SECRET']
# highlight-end
API_URL = 'https://api.getport.io/v1'

credentials = {
    'clientId': CLIENT_ID,
    'clientSecret': CLIENT_SECRET
}
token_response = requests.post(f"{API_URL}/auth/access_token", json=credentials)
# use this access token + header for all http requests to Port
# highlight-start
access_token = token_response.json()['accessToken']
headers = {
	'Authorization': f'Bearer {access_token}'
}
# highlight-end

entity_json = {
  "identifier": "new-cijob-run",
  "properties": {
    "triggeredBy": os.environ['CIRCLE_USERNAME'],
    "commitHash": os.environ['CIRCLE_SHA1'],
    "actionJob": os.environ['CIRCLE_JOB'],
    "runLink": os.environ['CIRCLE_BUILD_URL']
  },
  "relations": {
      "image": ["example-image"]
  }
}

create_response = requests.post(f'{API_URL}/blueprints/{blueprint_id}/entities?upsert=true&create_missing_related_entities=true', json=entity_json, headers=headers)
```

<PortApiRegionTip/>

:::note
Please notice that you have also created the `image` relation, and added a related image entity called `example-image`. This is the artifact of the ciJob, and you will update it later.
The creation was done using the `create_missing_related_entities=true` flag in the API url, allowing the relation to be created even though the `example-image` entity doesn't exist yet.
:::

After adding your new Python script to your repository, add the following code to your CircleCI workflow `yml` file to call your script and update/create a new `ciJob` entity:

```yaml showLineNumbers
  jobs:
  # ... other jobs
  report-to-port:
    docker:
      - image: cimg/python:3.11
    environment:
      API_URL: https://api.getport.io
    steps:
      - checkout
      - run: pip install -r port_requirements.txt
      - run: python update_deployment_port.py

workflows:
  # ... other workflows
  deploy-production-service:
    jobs:
      # ... other jobs
      - report-to-port:
          context:
            - port
```

## Basic get example

The following example gets the `new-cijob-run` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of its data (for example, the run link of the latest `ciJob`).

Add the following snippet to your Python code:

```python showLineNumbers
entity_id = "new-cijob-run"
blueprint_id = "ciJob"

get_response = requests.get(f"{API_URL}/blueprints/{blueprint_id}/entities/{entity_id}",
                        headers=headers)
entity = get_response.json()['entity']
print(f"Run link is: {entity['properties']['runLink']}")

```

## Relation example

In the following example you will update the `example-image` entity that was automatically created when creating the `ciJob` entity shown in the previous example.

Add the following snippet to your Python code:

```python showLineNumbers

image_entity_json = {
  "identifier": "example-image",
  "team": [],
  "properties": {
    "imageTag": "v1",
    "synkHighVulnerabilities": "0",
    "synkMediumVulnerabilities": "0",
    "gitRepoUrl": "https://github.com/my-org/my-cool-repo",
    "imageRegistry": "docker.io/cool-image",
    "size": "0.71",
    "unitTestCoverage": "20",
    "unitTestCoverage": "50"
  },
  "relations": {}
}

create_image_response = requests.post(f'{API_URL}/blueprints/image/entities?upsert=true', json=image_entity_json, headers=headers)
print(create_image_response.json())

```

That's it! The entity is created or updated and is visible in the UI.
