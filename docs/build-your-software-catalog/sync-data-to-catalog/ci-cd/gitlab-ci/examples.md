import ExampleMSBuildBlueprint from "../\_ci_example_microservice_build_blueprint.mdx";
import ExamplePackageBlueprint from "../\_ci_example_package_blueprint.mdx";

# Examples

## Basic create/update example

In this example we create a blueprint for `microserviceBuild` and then add code that uses Python to create a new entity in Port every time the Azure pipeline is triggered:

<ExampleMSBuildBlueprint />

After creating the blueprint, you can add a Python script for creating/updating a Port entity:

```python showLineNumber
import os, requests, json, uuid
from decouple import config


CLIENT_ID = os.environ['PORT_CLIENT_ID']
CLIENT_SECRET = os.environ['PORT_CLIENT_SECRET']
API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

# You can now use the value in access_token when making further requests

headers = {
	'Authorization': f'Bearer {access_token}'
}

blueprint_id = 'gitlab_ci'

COMMIT_BY = config('COMMIT_BY')
COMMIT_HASH = config('COMMIT_HASH')
ACTION_JOB= config('ACTION_JOB')
PUSHED_AT = config('PUSHED_AT')
RUN_LINK = config('RUN_LINK')

identifier_id = uuid.uuid4().hex

entity = {
  "identifier": identifier_id,
  "title": "Stream Gitlab Commits",
  "properties": {
    "version": "0.01",
    "committedBy": COMMIT_BY,
    "commitHash": COMMIT_HASH,
    "actionJob": ACTION_JOB,
    "repoPushedAt": PUSHED_AT,
    "runLink": RUN_LINK
  },
  "relations": {}
}


response = requests.post(f'{API_URL}/blueprints/{blueprint_id}/entities?upsert=true', json=entity, headers=headers)

# response.json() contains the content of the resulting entity
```

After adding your new Python script to your repository, add the following code to your Azure pipeline `yml` file to call your script and update/create a new `microserviceBuild` entity:

```yaml showLineNumbers
workflow:
  rules:
    - if: $CI_COMMIT_BRANCH != "main" && $CI_PIPELINE_SOURCE != "merge_request_event"
      when: never
    - when: always

variables:
  API_URL: https://api.getport.io
  PORT_API_KEY: $PORT_API_KEY
  COMMIT_BY: $CI_COMMIT_AUTHOR
  COMMIT_HASH: $CI_COMMIT_SHA
  ACTION_JOB: $CI_JOB_NAME
  PUSHED_AT: $CI_COMMIT_TIMESTAMP
  RUN_LINK: $CI_PIPELINE_URL


stages:
  - build

deploy_get_port:
  image: cimg/python:3.11
  stage: build
  script:
    - ls
    # - pip install -r port_requirements.txt && 
    - python -m pip install --upgrade pip
    - pip install --upgrade setuptools
    - pip install --no-cache-dir -r port_requirements.txt
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
    "committedBy": os.environ['CI_COMMIT_AUTHOR'],
    "commitHash": os.environ['CI_COMMIT_SHA'],
    "actionJob": os.environ['CI_JOB_NAME'],
    "repoPushedAt": 
 datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "runLink": buildUrl
  },
  "relations": {},
  "icon": "Package"
}

create_package_response = requests.post(f'{API_URL}/blueprints/package/entities?upsert=true', json=package_entity_json, headers=headers)
print(create_package_response.json())

```

That's it! The entity is created or updated and is visible in the UI.

