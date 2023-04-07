import ExampleMSBuildBlueprint from "../\_ci_example_microservice_build_blueprint.mdx";
import ExamplePackageBlueprint from "../\_ci_example_package_blueprint.mdx";

# Examples

## Basic create/update example

In this example we create a blueprint for `microserviceBuild` and then add code that uses Python to create a new entity in Port every time the Gitlab pipeline is triggered:

<ExampleMSBuildBlueprint />

After creating the blueprint, you can add a Python script for creating/updating a Port entity:

```python showLineNumber
import os
import requests
import json

# Env vars passed by the pipeline variables
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

After adding your new Python script to your repository, add the following code to your Gitlab pipeline `yml` file to call your script and update/create a new `microserviceBuild` entity:

```yaml showLineNumbers
variables:
  PORT_CLIENT_ID: $(PORT_CLIENT_ID) # The variable name for your Port clientId
  PORT_CLIENT_SECRET: $(PORT_CLIENT_SECRET) # The variable name for your Port clientSecret
  CI_COMMIT_AUTHOR: $(Build.QueuedBy)
  CI_COMMIT_SHA: $(Build.SourceVersion)
  CI_PROJECT_ID: $(Build.DefinitionName)
stage:
  - build
task:
  image: cimg/python:3.11
  stage: build
  script:
    - pip install -r port_requirements.txt
    - python main.py
```

## Basic get example

The following example gets the `new-ms-build` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of it's data (for example, the image tag when deploying the latest version of your service).

Add the following snippet to your Python code:

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

Add the following snippet to your Python code:

```python showLineNumbers
import datetime
...

package_entity_json = {
  "identifier": "example-package",
  "team": [],
  "properties": {
    "version": "v1",
    "committedBy": os.environ['QUEUED_BY'],
    "commitHash": os.environ['CI_COMMIT_SHA'],
    "actionJob": os.environ['CI_JOB_NAME'],
    "repoPushedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "runLink": buildUrl
  },
  "relations": {},
  "icon": "Package"
}

create_package_response = requests.post(f'{API_URL}/blueprints/package/entities?upsert=true', json=package_entity_json, headers=headers)
print(create_package_response.json())

```

That's it! The entity is created or updated and is visible in the UI.
