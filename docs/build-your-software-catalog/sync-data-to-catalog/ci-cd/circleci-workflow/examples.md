import ExampleMSBuildBlueprint from "../\_ci_example_microservice_build_blueprint.mdx";
import ExamplePackageBlueprint from "../\_ci_example_package_blueprint.mdx";

# Examples

## Basic create/update example

In this example we create a blueprint for `microserviceBuild` and then add code that uses Python to create a new entity in Port every time the CircleCI workflow is triggered:

<ExampleMSBuildBlueprint />

After creating the blueprint, you can add create a Python script for updating your Port entity:

```python showLineNumber
import os
import requests
import json

# Env vars passed by the CircleCI context
CLIENT_ID = os.environ['PORT_CLIENT_ID']
CLIENT_SECRET = os.environ['PORT_CLIENT_SECRET']
API_URL = 'https://api.getport.io/v1'

credentials = {
    'clientId': CLIENT_ID,
    'clientSecret': CLIENT_SECRET
}
token_response = requests.post(f"{API_URL}/auth/access_token", json=credentials)
access_token = token_response.json()['accessToken']

headers = {
	'Authorization': f'Bearer {access_token}'
}

entity_json = {
  "identifier": "new-ms-build",
  "team": [],
  "properties": {
    "buildNumber": 1,
    "buildVersion": "1.1.0",
    "imageTag": "new-ms-build:latest"
  },
  "relations": {},
  "icon": "Microservice"
}

create_response = requests.post(f'{API_URL}/blueprints/{blueprint_id}/entities?upsert=true', json=entity_json, headers=headers)
```

After creating your new Python script to your repository, add the following to your CircleCI workflow `yml` file to create the new build entity:

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

The following example gets the `new-ms-build` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of it's data (for example, the image tag when deploying the latest version of your service).

Add the following jobs to your Python code:

```python showLineNumbers
entity_id = "new-ms-build"
blueprint_id = "microserviceBuild"

get_response = requests.get(f"{API_URL}/blueprints/{blueprint_id}/entities/{entity_id}",
                        headers=headers)
entity = get_response.json()['entity']
print(f"Image tag is: {entity['properties']['imageTag']}")

```

## Relation example

The following example adds a `package` entity, in addition to the `microserviceBuild` entity shown in the previous example. In addition, it also adds a `microserviceBuild` relation. The build will create or update the relation between the 2 existing entities, allowing you to map the package to the microservice build that uses it:

<ExamplePackageBlueprint />

Add the following snippet to your GitHub workflow `yml` file:

```python showLineNumbers
import datetime
...

package_entity_json = {
  "identifier": "example-package",
  "team": [],
  "properties": {
    "version": "v1",
    "committedBy": os.environ['CIRCLE_USERNAME'],
    "commitHash": os.environ['CIRCLE_SHA1'],
    "actionJob": os.environ['CIRCLE_JOB'],
    "repoPushedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "runLink": os.environ['CIRCLE_BUILD_URL']
  },
  "relations": {},
  "icon": "Microservice"
}

create_package_response = requests.post(f'{API_URL}/blueprints/package/entities?upsert=true', json=package_entity_json, headers=headers)
print(create_package_response.json())

```

That's it! The entity is created or updated and is visible in the UI.
